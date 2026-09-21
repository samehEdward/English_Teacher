// The single AudioContext for the whole application.
//
// v1 created two (audioRecorder.audioContext for the visualiser, _chimeCtx for
// chimes). Mobile Chrome / Android WebView cap hardware AudioContexts at ~6 and
// an unreleased one is permanent, so a few tab switches silently killed all
// audio. Nothing outside this file may construct an AudioContext.
//
// The context is created lazily on the FIRST USER GESTURE. One constructed
// before a gesture is born `suspended` and on Android frequently never resumes.
// It is never close()d: a closed context cannot be reopened and the browser's
// count never drops.

const IDLE_SUSPEND_MS = 30000;

const CHIMES = {
  success: [
    { freq: 523.25, to: 659.25, t: 0.00, dur: 0.10, gain: 0.15 },
    { freq: 659.25, to: 783.99, t: 0.10, dur: 0.30, gain: 0.15 }
  ],
  tap:   [{ freq: 440,    to: null,   t: 0, dur: 0.08, gain: 0.07 }],
  alert: [{ freq: 880,    to: 660,    t: 0, dur: 0.22, gain: 0.11 }],
  error: [{ freq: 280,    to: 200,    t: 0, dur: 0.28, gain: 0.12 }]
};

class AudioEngine {
  constructor() {
    this._ctx = null;
    this._master = null;
    this._idleTimer = null;
    this._unlocked = false;
    this._muted = false;
    this._activeAnalysers = new Set();
    this._supported = typeof window !== 'undefined' &&
      !!(window.AudioContext || window.webkitAudioContext);
  }

  get supported() {
    return this._supported;
  }

  get state() {
    return this._ctx ? this._ctx.state : 'uninitialised';
  }

  setMuted(muted) {
    this._muted = !!muted;
    if (this._master) {
      this._master.gain.value = this._muted ? 0 : 1;
    }
  }

  /**
   * Create-or-resume the context. Safe to call on every user gesture; cheap
   * after the first. Must be called from within a gesture handler the first
   * time or Android will hand back a context stuck in `suspended`.
   */
  unlock() {
    if (!this._supported) return null;

    if (!this._ctx) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        this._ctx = new Ctor();
        this._master = this._ctx.createGain();
        this._master.gain.value = this._muted ? 0 : 1;
        this._master.connect(this._ctx.destination);
        this._unlocked = true;
      } catch (err) {
        console.warn('[audioEngine] AudioContext unavailable', err);
        this._supported = false;
        return null;
      }
    }

    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => { /* resumed on a later gesture */ });
    }

    this._touch();
    return this._ctx;
  }

  /** The raw context, for internal use only. Returns null before unlock(). */
  _context() {
    if (!this._ctx) return this.unlock();
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    this._touch();
    return this._ctx;
  }

  /**
   * Short synthesised UI feedback.
   * @param {'success'|'tap'|'alert'|'error'} type
   */
  playChime(type = 'tap') {
    if (this._muted) return;

    const spec = CHIMES[type];
    if (!spec) return;

    const ctx = this._context();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;

      spec.forEach((part) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this._master);

        const start = now + part.t;
        const end = start + part.dur;

        osc.frequency.setValueAtTime(part.freq, start);
        if (part.to) {
          osc.frequency.exponentialRampToValueAtTime(part.to, end);
        }

        gain.gain.setValueAtTime(part.gain, start);
        gain.gain.exponentialRampToValueAtTime(0.001, end);

        osc.start(start);
        osc.stop(end + 0.02);
        osc.onended = () => {
          try { osc.disconnect(); gain.disconnect(); } catch (e) { /* already gone */ }
        };
      });
    } catch (err) {
      // An AudioContext restricted before user activation is expected, not fatal.
      console.debug('[audioEngine] chime suppressed', err && err.name);
    }
  }

  /**
   * Analyser node for a live MediaStream. Callers never see the context.
   * @returns {{analyser: AnalyserNode, release: Function}|null}
   */
  createAnalyser(stream, { fftSize = 256 } = {}) {
    const ctx = this._context();
    if (!ctx || !stream) return null;

    try {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = 0.75;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const handle = {
        analyser,
        release: () => {
          this._activeAnalysers.delete(handle);
          try { source.disconnect(); } catch (e) { /* already gone */ }
          try { analyser.disconnect(); } catch (e) { /* already gone */ }
          this._touch();
        }
      };

      this._activeAnalysers.add(handle);
      this._clearIdleTimer(); // never suspend while an analyser is live
      return handle;
    } catch (err) {
      console.warn('[audioEngine] createAnalyser failed', err);
      return null;
    }
  }

  /** Release every analyser. Called by speechController on hard stop. */
  releaseAllAnalysers() {
    Array.from(this._activeAnalysers).forEach((h) => h.release());
  }

  // -- idle suspension ------------------------------------------------------
  // Keeping a running context alive costs battery on Android. Suspend after a
  // period of silence; _context() resumes transparently on next use.

  _touch() {
    this._clearIdleTimer();
    if (this._activeAnalysers.size > 0) return;

    this._idleTimer = setTimeout(() => {
      this._idleTimer = null;
      if (!this._ctx || this._activeAnalysers.size > 0) return;
      if (this._ctx.state === 'running') {
        this._ctx.suspend().catch(() => {});
      }
    }, IDLE_SUSPEND_MS);
  }

  _clearIdleTimer() {
    if (this._idleTimer) {
      clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }
  }
}

export const audioEngine = new AudioEngine();
