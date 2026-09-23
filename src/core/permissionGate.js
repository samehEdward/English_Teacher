// Microphone permission, Android WebView edition.
//
// Rules this file exists to enforce:
//   1. Never throw at the caller. Return a STATE. A thrown getUserMedia error
//      propagating into a render path is how v1 latched the UI red.
//   2. Never cache `denied` permanently. The user can grant permission in
//      Android settings and come back; a permanent cache means the app stays
//      broken until a cold restart.
//   3. Never call navigator.permissions.query() unguarded — the 'microphone'
//      descriptor throws TypeError in Android System WebView.

import { getNativePlugin, isNativePlatform } from './nativeBridge.js';

export const MicPermission = {
  GRANTED: 'granted',        // proceed
  PROMPT: 'prompt',          // not asked yet; needs a user gesture
  DENIED: 'denied',          // refused; actionable, retryable
  BUSY: 'busy',              // NotReadableError, another app owns the mic
  UNAVAILABLE: 'unavailable' // no device or no getUserMedia at all
};

const DENIED_CACHE_MS = 60000;
const GRANTED_CACHE_MS = 300000;

const MESSAGES = {
  en: {
    [MicPermission.PROMPT]: 'Tap the microphone to allow speech input.',
    [MicPermission.DENIED]: 'Microphone access is blocked. Enable it in your device settings, then tap the microphone again.',
    [MicPermission.BUSY]: 'The microphone is in use by another app. Close it and try again.',
    [MicPermission.UNAVAILABLE]: 'No microphone was found. You can still type your answers.'
  },
  de: {
    [MicPermission.PROMPT]: 'Tippen Sie auf das Mikrofon, um die Spracheingabe zu erlauben.',
    [MicPermission.DENIED]: 'Der Mikrofonzugriff ist blockiert. Bitte in den Geräteeinstellungen freigeben und erneut auf das Mikrofon tippen.',
    [MicPermission.BUSY]: 'Das Mikrofon wird von einer anderen App verwendet. Bitte schließen Sie diese und versuchen Sie es erneut.',
    [MicPermission.UNAVAILABLE]: 'Kein Mikrofon gefunden. Sie können Ihre Antworten weiterhin eintippen.'
  }
};

class PermissionGate {
  constructor() {
    this._cached = null;
    this._cachedAt = 0;
    this._inflight = null;
  }

  get hasGetUserMedia() {
    return typeof navigator !== 'undefined' &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Native permission plugin from MainActivity, when running in the APK.
   * Resolved through registerPlugin() - reading window.Capacitor.Plugins
   * directly would always be undefined (see core/nativeBridge.js).
   */
  get _nativePlugin() {
    return getNativePlugin('EchoMicPermission');
  }

  get isNative() {
    return isNativePlatform();
  }

  message(state, lang = 'en') {
    const dict = MESSAGES[lang] || MESSAGES.en;
    return dict[state] || '';
  }

  /** Drop the cache — call after returning from the OS settings screen. */
  invalidate() {
    this._cached = null;
    this._cachedAt = 0;
  }

  _cache(state) {
    this._cached = state;
    this._cachedAt = Date.now();
    return state;
  }

  _cacheValid() {
    if (!this._cached) return false;
    const age = Date.now() - this._cachedAt;
    if (this._cached === MicPermission.GRANTED) return age < GRANTED_CACHE_MS;
    if (this._cached === MicPermission.DENIED) return age < DENIED_CACHE_MS;
    // busy / prompt / unavailable are always re-probed
    return false;
  }

  /**
   * Non-invasive check. Never shows a prompt, never opens the mic.
   * @returns {Promise<string>} a MicPermission value
   */
  async check() {
    if (!this.hasGetUserMedia) return MicPermission.UNAVAILABLE;
    if (this._cacheValid()) return this._cached;

    const native = this._nativePlugin;
    if (native && typeof native.check === 'function') {
      try {
        const res = await native.check();
        if (res && res.state) return this._cache(res.state);
      } catch (err) {
        console.debug('[permissionGate] native check failed, falling back', err);
      }
    }

    // Permissions API: Firefox and Safari lack the 'microphone' descriptor and
    // Android System WebView throws outright. Guarded on both sides.
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'microphone' });
        if (status && status.state) {
          if (status.state === 'granted') return this._cache(MicPermission.GRANTED);
          if (status.state === 'denied') return this._cache(MicPermission.DENIED);
          return MicPermission.PROMPT;
        }
      }
    } catch (err) {
      // Expected in WebView. Fall through.
    }

    return MicPermission.PROMPT;
  }

  /**
   * Request access. MUST be called from a user gesture.
   * Opens the mic briefly to force the OS prompt, then releases it immediately
   * so the device is free for SpeechRecognition or MediaRecorder.
   *
   * @returns {Promise<{state: string, error: Error|null}>}
   */
  async request() {
    if (!this.hasGetUserMedia) {
      return { state: MicPermission.UNAVAILABLE, error: null };
    }

    // Collapse concurrent requests — a double-tap on the FAB must not open two
    // getUserMedia calls, which is itself a source of NotReadableError.
    if (this._inflight) return this._inflight;

    this._inflight = (async () => {
      const native = this._nativePlugin;
      if (native && typeof native.request === 'function') {
        try {
          const res = await native.request();
          if (res && res.state === MicPermission.GRANTED) {
            // Stop here. Falling through to getUserMedia would open a WebView
            // audio track and release it milliseconds before the native
            // SpeechRecognizer grabs the mic - an audio-HAL race that shows
            // up on phones as sporadic "Audio recording error".
            return { state: this._cache(MicPermission.GRANTED), error: null };
          }
          if (res && res.state === MicPermission.DENIED) {
            this._cache(MicPermission.DENIED);
            return { state: MicPermission.DENIED, error: null };
          }
        } catch (err) {
          console.debug('[permissionGate] native request failed, falling back', err);
        }
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this._cache(MicPermission.GRANTED);
        return { state: MicPermission.GRANTED, error: null };
      } catch (err) {
        return { state: this._classify(err), error: err };
      } finally {
        if (stream) {
          stream.getTracks().forEach((t) => {
            try { t.stop(); } catch (e) { /* already stopped */ }
          });
        }
      }
    })();

    try {
      const result = await this._inflight;
      if (result.state !== MicPermission.GRANTED && result.state !== MicPermission.DENIED) {
        // busy / unavailable must be re-probed on the next attempt
        this.invalidate();
      }
      return result;
    } finally {
      this._inflight = null;
    }
  }

  /**
   * Acquire a real stream for recording. Assumes permission is already granted;
   * still classifies failures rather than throwing.
   * @returns {Promise<{stream: MediaStream|null, state: string, error: Error|null}>}
   */
  async acquireStream(constraints = {}) {
    if (!this.hasGetUserMedia) {
      return { stream: null, state: MicPermission.UNAVAILABLE, error: null };
    }

    const audio = Object.assign({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }, constraints);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio });
      this._cache(MicPermission.GRANTED);
      return { stream, state: MicPermission.GRANTED, error: null };
    } catch (err) {
      const state = this._classify(err);
      if (state !== MicPermission.DENIED) this.invalidate();
      return { stream: null, state, error: err };
    }
  }

  /** Open the OS app-settings screen (native only). */
  async openSettings() {
    const native = this._nativePlugin;
    if (native && typeof native.openSettings === 'function') {
      try {
        await native.openSettings();
        this.invalidate();
        return true;
      } catch (err) {
        console.warn('[permissionGate] openSettings failed', err);
      }
    }
    return false;
  }

  _classify(err) {
    const name = (err && err.name) || '';

    switch (name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
      case 'SecurityError':
        return this._cache(MicPermission.DENIED);

      case 'NotReadableError':
      case 'TrackStartError':
      case 'AbortError':
        // Device exists but is held by another app or the OS audio stack.
        return MicPermission.BUSY;

      case 'NotFoundError':
      case 'DevicesNotFoundError':
      case 'OverconstrainedError':
        return MicPermission.UNAVAILABLE;

      default:
        console.warn('[permissionGate] unclassified getUserMedia error', name, err);
        return MicPermission.DENIED;
    }
  }
}

export const permissionGate = new PermissionGate();
