// Speech-to-text adapters.
//
// WHY THIS FILE EXISTS
// Android System WebView — what a Capacitor app actually runs in — does NOT
// implement webkitSpeechRecognition. That API is a Chrome-branded feature
// backed by Google's servers, not part of the WebView platform surface.
// Verified for this repo: capacitor.plugins.json is [] and no speech plugin is
// installed, so every STT call in the current APK fails silently.
//
// v1 assumed webkitSpeechRecognition always exists, so the app showed its
// "please use Chrome" banner on its own primary target. Here, STT is a
// capability probed at runtime and satisfied by whichever backend is present.
//
// To enable STT in the APK, with no application code change:
//   npm i @capacitor-community/speech-recognition && npx cap sync android
//
// ---------------------------------------------------------------------------
// SttAdapter interface
//
//   get supported(): boolean
//   get id(): string
//   get active(): boolean   true only while a session is live; lets the
//                           controller detect a stale LISTENING state
//   async start(opts): void
//       opts = { lang, continuous, interimResults,
//                onStart, onInterim, onFinal, onError, onEnd }
//       - onInterim({ final, interim, full })   may fire many times
//       - onFinal(transcript)                   at most once, before onEnd
//       - onError({ error, message, fatal })    non-fatal errors do not end it
//       - onEnd()                               exactly once per start()
//   stop(): void     graceful; flushes pending audio, yields a final result
//   abort(): void    immediate; discards the transcript
//
// Every adapter guarantees exactly one onEnd per successful start(), and no
// callbacks at all after abort().
// ---------------------------------------------------------------------------

import { getNativePlugin } from './nativeBridge.js';

const BCP47 = { de: 'de-DE', en: 'en-US' };

export function toBcp47(lang) {
  if (!lang) return BCP47.en;
  if (lang.includes('-')) return lang;
  return BCP47[lang] || BCP47.en;
}

// --- Null adapter -----------------------------------------------------------
// Not an error state. STT is simply absent; the UI hides the mic and promotes
// typed input, and every other exercise keeps working.

class NullSttAdapter {
  get id() { return 'none'; }
  get supported() { return false; }
  get active() { return false; }

  async start(opts = {}) {
    if (opts.onError) {
      opts.onError({
        error: 'not-supported',
        message: 'Speech recognition is not available on this platform.',
        fatal: true
      });
    }
    if (opts.onEnd) opts.onEnd();
  }

  stop() {}
  abort() {}
}

// --- Web Speech API (Chrome / Edge, desktop and Android Chrome) --------------

class WebSpeechAdapter {
  constructor(Ctor) {
    this._Ctor = Ctor;
    this._rec = null;
    this._session = 0;
  }

  get id() { return 'webspeech'; }
  get supported() { return true; }
  /** True only while a recognizer instance is live. */
  get active() { return !!this._rec; }

  async start({
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    onStart = null,
    onInterim = null,
    onFinal = null,
    onError = null,
    onEnd = null
  } = {}) {
    this.abort();

    const session = ++this._session;
    const alive = () => session === this._session;

    const rec = new this._Ctor();
    this._rec = rec;

    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = interimResults;
    rec.maxAlternatives = 1;

    let finalText = '';
    let lastFull = '';
    let fatal = false;
    let aborted = false;
    let ended = false;

    rec.onstart = () => {
      if (!alive()) return;
      if (onStart) onStart();
    };

    rec.onresult = (event) => {
      if (!alive()) return;

      let finals = '';
      let interims = '';

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (!res || !res[0]) continue;
        const text = res[0].transcript;
        if (res.isFinal) {
          finals += (finals ? ' ' : '') + text;
        } else {
          interims += (interims ? ' ' : '') + text;
        }
      }

      finalText = finals;
      lastFull = (finals + (finals && interims ? ' ' : '') + interims).trim();

      if (onInterim) onInterim({ final: finals, interim: interims, full: lastFull });
    };

    rec.onerror = (event) => {
      if (!alive()) return;

      const code = event.error || event.message || 'unknown';

      // 'aborted' is our own abort() landing. Not a user-visible error.
      if (code === 'aborted') {
        aborted = true;
        return;
      }

      // 'no-speech' is routine on mobile — the user hesitated. Keep the
      // session alive and let onend deliver whatever was captured.
      if (code === 'no-speech') {
        if (onError) onError({ error: code, message: 'No speech detected.', fatal: false });
        return;
      }

      fatal = true;
      if (onError) {
        onError({
          error: code,
          message: this._describe(code),
          fatal: true
        });
      }
    };

    rec.onend = () => {
      if (!alive()) return;
      if (ended) return;
      ended = true;

      if (this._rec === rec) this._rec = null;

      const captured = (finalText || lastFull || '').trim();
      if (!fatal && !aborted && captured && onFinal) onFinal(captured);
      if (onEnd) onEnd();
    };

    try {
      rec.start();
    } catch (err) {
      // InvalidStateError: a previous recognizer has not fully released the
      // device yet. One retry on the next macrotask clears it in practice.
      if (err && err.name === 'InvalidStateError') {
        setTimeout(() => {
          if (!alive()) return;
          try {
            rec.start();
          } catch (retryErr) {
            fatal = true;
            if (onError) onError({ error: 'start-failed', message: String(retryErr), fatal: true });
            if (!ended) { ended = true; if (onEnd) onEnd(); }
          }
        }, 0);
        return;
      }

      fatal = true;
      if (onError) onError({ error: 'start-failed', message: String(err), fatal: true });
      if (!ended) { ended = true; if (onEnd) onEnd(); }
    }
  }

  stop() {
    const rec = this._rec;
    if (!rec) return;
    try {
      rec.stop(); // flushes pending audio, fires a final result then onend
    } catch (err) {
      try { rec.abort(); } catch (e) { /* already dead */ }
    }
  }

  abort() {
    const rec = this._rec;
    this._session += 1; // invalidate every pending callback from this session
    this._rec = null;
    if (!rec) return;
    try { rec.abort(); } catch (e) { /* already dead */ }
  }

  _describe(code) {
    switch (code) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone access was refused.';
      case 'audio-capture':
        return 'No microphone could be opened.';
      case 'network':
        return 'Speech recognition needs a network connection.';
      case 'language-not-supported':
        return 'This language is not supported by the recognizer.';
      default:
        return `Speech recognition error: ${code}`;
    }
  }
}

// --- Capacitor community plugin (native Android recognizer) -----------------
// Activated automatically if @capacitor-community/speech-recognition is
// installed. Referenced through window.Capacitor.Plugins so this file carries
// no build-time dependency on the plugin.

class CapacitorSpeechAdapter {
  constructor(plugin) {
    this._plugin = plugin;
    this._session = 0;
    this._listener = null;
    this._active = false;
  }

  get id() { return 'capacitor'; }
  get supported() { return true; }
  get active() { return this._active; }

  async start({
    lang = 'en-US',
    interimResults = true,
    onStart = null,
    onInterim = null,
    onFinal = null,
    onError = null,
    onEnd = null
  } = {}) {
    this.abort();

    const session = ++this._session;
    const alive = () => session === this._session;

    let lastFull = '';
    let ended = false;

    const finish = () => {
      if (!alive() || ended) return;
      ended = true;
      this._active = false;
      this._detach();
      const captured = lastFull.trim();
      if (captured && onFinal) onFinal(captured);
      if (onEnd) onEnd();
    };

    try {
      const avail = await this._plugin.available();
      if (avail && avail.available === false) {
        if (onError) onError({ error: 'not-supported', message: 'Recognizer unavailable.', fatal: true });
        if (onEnd) onEnd();
        return;
      }

      const perm = await this._plugin.checkPermissions();
      if (perm && perm.speechRecognition !== 'granted') {
        const asked = await this._plugin.requestPermissions();
        if (asked && asked.speechRecognition !== 'granted') {
          if (onError) onError({ error: 'not-allowed', message: 'Microphone access was refused.', fatal: true });
          if (onEnd) onEnd();
          return;
        }
      }

      if (!alive()) return;

      if (interimResults && typeof this._plugin.addListener === 'function') {
        this._listener = await this._plugin.addListener('partialResults', (data) => {
          if (!alive()) return;
          const text = (data && data.matches && data.matches[0]) || '';
          if (!text) return;
          lastFull = text;
          if (onInterim) onInterim({ final: '', interim: text, full: text });
        });
      }

      // listeningState tells us when the native recognizer closed on its own
      // (silence timeout), which the start() promise does not report.
      if (typeof this._plugin.addListener === 'function') {
        this._stateListener = await this._plugin.addListener('listeningState', (data) => {
          if (!alive()) return;
          if (data && data.status === 'stopped') finish();
        });
      }

      this._active = true;
      if (onStart) onStart();

      const result = await this._plugin.start({
        language: lang,
        maxResults: 1,
        partialResults: interimResults,
        popup: false
      });

      if (!alive()) return;

      const best = (result && result.matches && result.matches[0]) || '';
      if (best) lastFull = best;
      finish();
    } catch (err) {
      if (!alive()) return;
      this._active = false;
      this._detach();
      if (!ended) {
        ended = true;
        if (onError) onError({ error: 'start-failed', message: String(err), fatal: true });
        if (onEnd) onEnd();
      }
    }
  }

  stop() {
    if (!this._active) return;
    try {
      const r = this._plugin.stop();
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch (e) { /* already stopped */ }
  }

  abort() {
    this._session += 1;
    this._active = false;
    this._detach();
    try {
      const r = this._plugin.stop();
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch (e) { /* already stopped */ }
  }

  _detach() {
    [this._listener, this._stateListener].forEach((l) => {
      if (l && typeof l.remove === 'function') {
        try { l.remove(); } catch (e) { /* already removed */ }
      }
    });
    this._listener = null;
    this._stateListener = null;
  }
}

/**
 * Pick the best available backend. Native plugin wins over Web Speech, because
 * in the APK the plugin is the only one that actually works.
 */
export function createSttAdapter() {
  if (typeof window === 'undefined') return new NullSttAdapter();

  // Must go through registerPlugin(): window.Capacitor.Plugins is only
  // populated by that call, never by the native bridge on its own.
  const native = getNativePlugin('SpeechRecognition');
  if (native) return new CapacitorSpeechAdapter(native);

  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (Ctor) return new WebSpeechAdapter(Ctor);

  return new NullSttAdapter();
}

export { NullSttAdapter, WebSpeechAdapter, CapacitorSpeechAdapter };
