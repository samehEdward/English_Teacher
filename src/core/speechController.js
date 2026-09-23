// speechController — the single source of truth for microphone and voice.
//
// Nothing outside src/core/ may touch speech synthesis, speech recognition,
// AudioContext or getUserMedia. This is the only door.
//
// Guarantees:
//   I1  One owner of the microphone: speech recognition. The app records no
//       audio of its own (the MediaRecorder path left with Shadowing), so no
//       second consumer can collide with the recognizer on Android.
//   I2  Entering IDLE or LISTENING always tears down speech output first.
//   I3  Every async callback is generation-checked; a late event from a
//       cancelled session cannot mutate current state.
//   I4  speak() requires provenance. No gesture and no open turn means no
//       sound — which is what kills the rogue auto-TTS on load/view change.

import { StateMachine } from './stateMachine.js';
import { audioEngine } from './audioEngine.js';
import { permissionGate, MicPermission } from './permissionGate.js';
import { createSttAdapter, toBcp47 } from './sttAdapters.js';
import { createTtsAdapter } from './ttsAdapters.js';

export const SpeechState = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  SPEAKING: 'SPEAKING'
};

const TRANSITIONS = {
  [SpeechState.IDLE]:       [SpeechState.LISTENING, SpeechState.SPEAKING, SpeechState.PROCESSING],
  [SpeechState.LISTENING]:  [SpeechState.PROCESSING, SpeechState.IDLE],
  [SpeechState.PROCESSING]: [SpeechState.SPEAKING, SpeechState.LISTENING, SpeechState.IDLE],
  [SpeechState.SPEAKING]:   [SpeechState.IDLE, SpeechState.LISTENING, SpeechState.PROCESSING]
};

// Long enough to survive an awaited permission check or storage read; far too
// short to survive module construction, DOMContentLoaded or a tab change.
const USER_GESTURE_WINDOW_MS = 3000;

// How long to wait for a recognizer to honour stop() before forcing IDLE.
// Generous: a recognizer flushing buffered audio can take a while, and cutting
// it short discards a valid transcript. The native Android recognizer only
// starts its (often network) recognition after stop(), so it gets longer.
const STOP_WATCHDOG_MS = { default: 4000, capacitor: 8000 };

export const SpeakIntent = {
  USER: 'user',  // direct result of a user gesture
  TURN: 'turn'   // scripted reply to a turn the user just submitted
};

class SpeechController {
  constructor() {
    this.fsm = new StateMachine({
      name: 'speech',
      initial: SpeechState.IDLE,
      transitions: TRANSITIONS
    });

    this.lang = 'en';
    this.stt = createSttAdapter();
    this.tts = createTtsAdapter();
    this._ttsIssueListeners = new Set();

    this.stats = { blockedSpeakCalls: 0, micCollisionsPrevented: 0 };

    this._stopWatchdog = null;


    // TTS provenance
    this._lastGestureAt = 0;
    this._openTurn = null;


    this._installGestureTracker();
    this._installLifecycleGuards();
  }

  // == public state =========================================================

  get state() { return this.fsm.state; }
  get generation() { return this.fsm.generation; }

  is(...states) { return this.fsm.is(...states); }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(fn) { return this.fsm.subscribe(fn); }

  get sttSupported() { return this.stt.supported; }
  get sttBackend() { return this.stt.id; }
  get ttsSupported() { return this.tts.supported; }
  get ttsBackend() { return this.tts.id; }

  /**
   * What the UI should offer on this device. The mic FAB is hidden entirely
   * when STT is absent, rather than presented and then failing.
   */
  capabilities() {
    return {
      stt: this.stt.supported,
      sttBackend: this.stt.id,
      tts: this.tts.supported,
      ttsBackend: this.tts.id,
      audio: audioEngine.supported
    };
  }

  setLanguage(lang) {
    this.lang = lang === 'de' ? 'de' : 'en';
    this.tts.setLanguage(this.lang);
  }

  recognitionLang() { return toBcp47(this.lang); }

  // == user gesture tracking ================================================

  _installGestureTracker() {
    if (typeof window === 'undefined') return;

    const mark = () => {
      this._lastGestureAt = Date.now();
      // First gesture is also when the AudioContext must be born.
      audioEngine.unlock();
    };

    // Capture phase so we see the gesture before any handler can stop it.
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach((evt) => {
      window.addEventListener(evt, mark, { capture: true, passive: true });
    });
  }

  /** Manually extend the gesture window. Rarely needed; prefer real events. */
  noteUserGesture() {
    this._lastGestureAt = Date.now();
    audioEngine.unlock();
  }

  _inGestureWindow() {
    return (Date.now() - this._lastGestureAt) < USER_GESTURE_WINDOW_MS;
  }

  // == turn handshake =======================================================

  /**
   * Open a one-shot permission for the app to speak a scripted reply. Call
   * this when the learner submits a response; pass the returned id to speak().
   * The id is burned after one use and voided by any reset.
   */
  openTurn() {
    this._openTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now()
    };
    return this._openTurn.id;
  }

  closeTurn() { this._openTurn = null; }

  // == TTS ==================================================================
  // Engine specifics (chunking, Android WebView quirks, native TextToSpeech)
  // live in ttsAdapters.js. The controller owns only policy: provenance, the
  // state machine, and never talking over the microphone.

  /** Voices the learner may pick from (web only; native uses system voice). */
  availableVoices() { return this.tts.voices(); }
  get selectedVoiceId() { return this.tts.selectedVoiceId; }
  setVoiceById(id) { return this.tts.selectVoice(id); }
  onVoicesChanged(fn) { return this.tts.onVoicesChanged(fn); }

  /**
   * Subscribe to speech-output problems the learner can act on - chiefly
   * "no German voice installed" on Android. Returns an unsubscribe function.
   */
  onTtsIssue(fn) {
    this._ttsIssueListeners.add(fn);
    return () => this._ttsIssueListeners.delete(fn);
  }

  /** Open the OS voice-data installer (native only). */
  installVoiceData() { return this.tts.installVoiceData(); }

  /**
   * Speak text. PROVENANCE IS MANDATORY.
   *
   *   speak({ text, intent: 'user' })           inside a user-gesture window
   *   speak({ text, intent: 'turn', turnId })   reply to a submitted turn
   *
   * Anything else is refused: returns false, warns with a stack trace, and
   * increments stats.blockedSpeakCalls. This is what makes rogue auto-TTS on
   * load / view change / language switch impossible to write.
   *
   * @returns {boolean} whether speech was accepted
   */
  speak({
    text,
    intent = null,
    turnId = null,
    rate = 1.0,
    pitch = 1.0,
    onStart = null,
    onBoundary = null,
    onEnd = null,
    onError = null
  } = {}) {
    if (!text || !String(text).trim()) return false;

    if (!this.tts.supported) {
      if (onError) onError({ error: 'not-supported', message: 'Speech output is not available on this device.' });
      return false;
    }

    if (!this._authorizeSpeak(intent, turnId, text)) return false;

    // Never talk over the microphone.
    if (this.fsm.is(SpeechState.LISTENING)) {
      this.stats.micCollisionsPrevented += 1;
      console.warn('[speech] speak() refused: microphone is active');
      return false;
    }

    this.tts.cancel();

    const gen = this.fsm.transition(SpeechState.SPEAKING, { reason: 'speak' });
    if (gen === null) return false;

    this.tts.speak({
      text: String(text),
      lang: this.recognitionLang(),
      rate,
      pitch,
      onStart: () => {
        if (this.fsm.isStale(gen)) return;
        if (onStart) onStart();
      },
      onBoundary: onBoundary
        ? (e) => { if (!this.fsm.isStale(gen)) onBoundary(e); }
        : null,
      onEnd: () => {
        if (this.fsm.isStale(gen)) return;
        this.fsm.transition(SpeechState.IDLE, { reason: 'tts-complete' });
        if (onEnd) onEnd();
      },
      onError: (err) => {
        if (this.fsm.isStale(gen)) return;
        this.fsm.transition(SpeechState.IDLE, { reason: 'tts-error' });
        this._ttsIssueListeners.forEach((fn) => {
          try { fn(err); } catch (e) { console.error(e); }
        });
        if (onError) onError(err);
      }
    });

    return true;
  }

  _authorizeSpeak(intent, turnId, text) {
    if (intent === SpeakIntent.USER) {
      if (this._inGestureWindow()) return true;
      this._blockSpeak('intent "user" outside the user-gesture window', text);
      return false;
    }

    if (intent === SpeakIntent.TURN) {
      if (this._openTurn && turnId && turnId === this._openTurn.id) {
        this._openTurn = null; // one-shot: burn it
        return true;
      }
      this._blockSpeak('intent "turn" without a matching open turn', text);
      return false;
    }

    this._blockSpeak(`missing or unknown intent "${intent}"`, text);
    return false;
  }

  _blockSpeak(reason, text) {
    this.stats.blockedSpeakCalls += 1;
    const preview = String(text || '').slice(0, 60);
    console.warn(
      `[speech] BLOCKED speak(): ${reason}.\n` +
      `  text: "${preview}${preview.length >= 60 ? '…' : ''}"\n` +
      '  TTS requires { intent: "user" } inside a gesture, or ' +
      '{ intent: "turn", turnId } from openTurn().',
      new Error('speak() call site').stack
    );
  }

  _hardStopTts() {
    this.tts.cancel();
  }

  /** Stop any speech immediately and return to IDLE. */
  stopSpeaking() {
    this._hardStopTts();
    if (this.fsm.is(SpeechState.SPEAKING)) {
      this.fsm.transition(SpeechState.IDLE, { reason: 'stop-speaking' });
    }
  }

  isSpeaking() { return this.fsm.is(SpeechState.SPEAKING); }

  // == STT ==================================================================

  /**
   * Start listening. Must be called from a user gesture (it may need to raise
   * the OS permission prompt).
   *
   * @returns {Promise<{ok: boolean, reason?: string, permission?: string}>}
   */
  async listen({
    lang = null,
    continuous = true,
    interimResults = true,
    onStart = null,
    onInterim = null,
    onResult = null,
    onError = null,
    onEnd = null
  } = {}) {
    if (!this.stt.supported) {
      return { ok: false, reason: 'stt-unsupported' };
    }

    // I2: entering the mic state always kills speech output first.
    this._hardStopTts();

    if (this.fsm.is(SpeechState.SPEAKING)) {
      this.fsm.transition(SpeechState.IDLE, { reason: 'barge-in' });
    }

    const perm = await permissionGate.check();
    if (perm !== MicPermission.GRANTED) {
      const asked = await permissionGate.request();
      if (asked.state !== MicPermission.GRANTED) {
        if (onError) {
          onError({
            error: asked.state,
            message: permissionGate.message(asked.state, this.lang),
            fatal: true,
            permission: asked.state
          });
        }
        return { ok: false, reason: 'permission', permission: asked.state };
      }
    }

    const gen = this.fsm.transition(SpeechState.LISTENING, { reason: 'listen' });
    if (gen === null) return { ok: false, reason: 'illegal-transition' };

    let delivered = false;

    await this.stt.start({
      lang: lang || this.recognitionLang(),
      continuous,
      interimResults,

      onStart: () => {
        if (this.fsm.isStale(gen)) return;
        if (onStart) onStart();
      },

      onInterim: (payload) => {
        if (this.fsm.isStale(gen)) return;
        if (onInterim) onInterim(payload);
      },

      onFinal: (transcript) => {
        if (this.fsm.isStale(gen)) return;
        delivered = true;
        // Hardware is already released by the adapter at this point; move to
        // PROCESSING so the UI can show a spinner without holding the mic.
        this.fsm.transition(SpeechState.PROCESSING, { reason: 'transcript' });
        if (onResult) onResult(transcript);
      },

      onError: (err) => {
        if (this.fsm.isStale(gen)) return;
        if (onError) onError(err);
      },

      onEnd: () => {
        if (this.fsm.isStale(gen)) return;
        // If a transcript arrived, the module owns the PROCESSING state and
        // decides what happens next. Otherwise fall back to IDLE.
        if (!delivered && this.fsm.is(SpeechState.LISTENING)) {
          this.fsm.transition(SpeechState.IDLE, { reason: 'listen-end' });
        }
        if (onEnd) onEnd();
      }
    });

    return { ok: true };
  }

  /**
   * Graceful stop: flushes audio so a final transcript is still delivered.
   *
   * Two ways this could stand the UI up in a permanent "listening" state, both
   * guarded here:
   *   1. The adapter has no live session (it already ended, or the state is
   *      stale). stop() would be a silent no-op and nothing would ever move
   *      the machine out of LISTENING.
   *   2. The adapter accepts stop() but never fires onend - a documented
   *      Android WebView failure. The watchdog aborts and forces IDLE.
   */
  stopListening() {
    if (!this.fsm.is(SpeechState.LISTENING)) return;

    if (!this.stt.active) {
      this.fsm.transition(SpeechState.IDLE, { reason: 'stop-listen-no-session' });
      return;
    }

    this.stt.stop();
    this._armStopWatchdog();
  }

  _armStopWatchdog() {
    this._clearStopWatchdog();
    const gen = this.fsm.generation;

    this._stopWatchdog = setTimeout(() => {
      this._stopWatchdog = null;
      // A transition since stop() means the recognizer answered normally.
      if (this.fsm.isStale(gen)) return;
      if (!this.fsm.is(SpeechState.LISTENING)) return;

      console.warn('[speech] recognizer did not end after stop(); forcing IDLE');
      this.stt.abort();
      this.fsm.transition(SpeechState.IDLE, { reason: 'stop-watchdog' });
    }, STOP_WATCHDOG_MS[this.stt.id] || STOP_WATCHDOG_MS.default);
  }

  _clearStopWatchdog() {
    if (this._stopWatchdog) {
      clearTimeout(this._stopWatchdog);
      this._stopWatchdog = null;
    }
  }

  /** Immediate stop: transcript discarded, state forced to IDLE. */
  abortListening() {
    this._clearStopWatchdog();
    this.stt.abort();
    if (this.fsm.is(SpeechState.LISTENING)) {
      this.fsm.transition(SpeechState.IDLE, { reason: 'abort-listen' });
    }
  }

  isListening() { return this.fsm.is(SpeechState.LISTENING); }

  // == global teardown ======================================================

  /**
   * THE teardown call. Modules and the router use this instead of the
   * stopSpeaking() / stopListening() / stopRecording() incantation that v1
   * repeated at six call sites.
   *
   * Releases the mic, cancels TTS, voids any open turn, and forces IDLE.
   */
  reset(reason = 'reset') {
    this._clearStopWatchdog();
    this._hardStopTts();
    this.stt.abort();
    this._openTurn = null;

    if (!this.fsm.is(SpeechState.IDLE)) {
      // force(): legality is irrelevant during teardown, and every in-flight
      // callback is invalidated by the generation bump anyway.
      this.fsm.force(SpeechState.IDLE, { reason });
    }
  }

  /** Leave PROCESSING once a module has finished scoring. */
  finishProcessing() {
    if (this.fsm.is(SpeechState.PROCESSING)) {
      this.fsm.transition(SpeechState.IDLE, { reason: 'processing-complete' });
    }
  }

  _installLifecycleGuards() {
    if (typeof document === 'undefined') return;

    // Backgrounding the app must release the mic; Android will not do it for
    // us and the recording indicator stays in the status bar.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.reset('page-hidden');
    });

    window.addEventListener('pagehide', () => this.reset('pagehide'));
    window.addEventListener('beforeunload', () => this.reset('unload'));
  }
}

export const speechController = new SpeechController();

// Handy for on-device debugging over adb: echoSpeech.stats, echoSpeech.fsm.history()
if (typeof window !== 'undefined') {
  window.echoSpeech = speechController;
}
