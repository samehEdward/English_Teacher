// The one place mic state, permission problems and errors surface.
//
// Design rule: this strip NEVER latches. Every message either auto-dismisses
// or is cleared by the next state change. v1's failure mode was a permanent
// red error banner that survived the user fixing the problem in Android
// settings — the UI said "blocked" long after permission had been granted.

import { speechController, SpeechState } from '../core/speechController.js';
import { permissionGate, MicPermission } from '../core/permissionGate.js';

const TONE_ICON = {
  info: '💬',
  listening: '🎙️',
  speaking: '🔊',
  working: '⏳',
  success: '✅',
  warn: '⚠️',
  error: '⚠️'
};

const STATE_TEXT = {
  en: {
    [SpeechState.LISTENING]: 'Listening… tap stop when you finish.',
    [SpeechState.RECORDING]: 'Recording…',
    [SpeechState.PROCESSING]: 'Checking your answer…',
    [SpeechState.SPEAKING]: 'Playing audio…'
  },
  de: {
    [SpeechState.LISTENING]: 'Ich höre zu… Zum Beenden auf Stopp tippen.',
    [SpeechState.RECORDING]: 'Aufnahme läuft…',
    [SpeechState.PROCESSING]: 'Antwort wird geprüft…',
    [SpeechState.SPEAKING]: 'Audio wird abgespielt…'
  }
};

const ACTION_TEXT = {
  en: { settings: 'Settings', retry: 'Retry', dismiss: 'OK' },
  de: { settings: 'Einstellungen', retry: 'Erneut', dismiss: 'OK' }
};

class StatusStrip {
  constructor() {
    this.root = null;
    this.iconEl = null;
    this.textEl = null;
    this.actionEl = null;
    this.lang = 'de';

    this._hideTimer = null;
    this._pinned = false;     // a message the user must act on outranks state
    this._unsubscribe = null;
  }

  init({ lang = 'de' } = {}) {
    this.root = document.getElementById('statusStrip');
    this.iconEl = document.getElementById('statusIcon');
    this.textEl = document.getElementById('statusText');
    this.actionEl = document.getElementById('statusAction');
    this.lang = lang;

    if (!this.root) {
      console.warn('[statusStrip] shell markup missing');
      return;
    }

    this._unsubscribe = speechController.subscribe(({ to }) => this._onState(to));
    this._unsubscribeTts = speechController.onTtsIssue((err) => this._onTtsIssue(err));
  }

  /**
   * Speech output failed. The actionable case is a phone with no voice data
   * for the target language: Android's engine then refuses to speak German
   * at all, which the learner experiences as "no voice" or an English voice
   * mangling German. Offer the OS installer instead of failing silently.
   */
  _onTtsIssue(err) {
    const de = this.lang === 'de';
    if (err && err.error === 'lang-unsupported') {
      const langName = /^de/i.test(err.lang || '') ? (de ? 'Deutsch' : 'German') : (de ? 'Englisch' : 'English');
      this._pinned = true;
      this.show({
        text: de
          ? `Auf diesem Gerät ist keine Stimme für ${langName} installiert.`
          : `No ${langName} voice is installed on this device.`,
        tone: 'warn',
        sticky: true,
        action: {
          label: de ? 'Installieren' : 'Install',
          onClick: () => speechController.installVoiceData()
        }
      });
      return;
    }
    if (err && err.error !== 'not-supported') {
      this.show({
        text: de ? 'Die Sprachausgabe ist fehlgeschlagen. Bitte erneut versuchen.' : 'Speech output failed. Please try again.',
        tone: 'warn',
        duration: 3500
      });
    }
  }

  setLanguage(lang) {
    this.lang = lang === 'de' ? 'de' : 'en';
  }

  _onState(state) {
    // A pinned actionable message (permission blocked) stays until the user
    // deals with it or the mic successfully starts.
    if (this._pinned) {
      if (state === SpeechState.LISTENING || state === SpeechState.RECORDING) {
        this._pinned = false;
      } else {
        return;
      }
    }

    const dict = STATE_TEXT[this.lang] || STATE_TEXT.en;
    const text = dict[state];

    if (!text) {
      this.hide();
      return;
    }

    const tone = state === SpeechState.LISTENING || state === SpeechState.RECORDING
      ? 'listening'
      : (state === SpeechState.SPEAKING ? 'speaking' : 'working');

    this.show({ text, tone, sticky: true });
  }

  /**
   * @param {object} opts
   * @param {string} opts.text
   * @param {string} [opts.tone]    info | listening | speaking | working | success | warn | error
   * @param {boolean} [opts.sticky] stay until state changes (no auto-hide)
   * @param {number} [opts.duration]
   * @param {{label: string, onClick: Function}} [opts.action]
   */
  show({ text, tone = 'info', sticky = false, duration = 3200, action = null }) {
    if (!this.root) return;

    this._clearTimer();

    this.textEl.textContent = text;
    this.iconEl.textContent = TONE_ICON[tone] || TONE_ICON.info;
    this.root.dataset.tone = tone;
    this.root.classList.add('visible');

    if (action) {
      this.actionEl.textContent = action.label;
      this.actionEl.classList.remove('hidden');
      this.actionEl.onclick = () => {
        this._pinned = false;
        this.hide();
        try {
          action.onClick();
        } catch (err) {
          console.error('[statusStrip] action threw', err);
        }
      };
    } else {
      this.actionEl.classList.add('hidden');
      this.actionEl.onclick = null;
    }

    if (!sticky) {
      this._hideTimer = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    this._clearTimer();
    if (!this.root) return;
    this.root.classList.remove('visible');
    this._pinned = false;
  }

  /**
   * Render a microphone permission outcome with the right escape hatch.
   * Called by modules when listen()/startRecording() reports a permission
   * problem. Every branch is recoverable — none of them is a dead end.
   */
  showPermission(state, { onRetry = null } = {}) {
    const actions = ACTION_TEXT[this.lang] || ACTION_TEXT.en;
    const text = permissionGate.message(state, this.lang);

    if (state === MicPermission.DENIED) {
      this._pinned = true;
      this.show({
        text,
        tone: 'error',
        sticky: true,
        action: permissionGate.isNative
          ? {
              label: actions.settings,
              onClick: async () => {
                await permissionGate.openSettings();
                // Cache is dropped on return so the next tap re-probes and
                // the UI cannot stay stuck on a stale "denied".
                permissionGate.invalidate();
              }
            }
          : { label: actions.dismiss, onClick: () => this.hide() }
      });
      return;
    }

    if (state === MicPermission.BUSY) {
      this.show({
        text,
        tone: 'warn',
        sticky: false,
        duration: 5000,
        action: onRetry ? { label: actions.retry, onClick: onRetry } : null
      });
      return;
    }

    if (state === MicPermission.UNAVAILABLE) {
      this.show({ text, tone: 'warn', duration: 5000 });
      return;
    }

    this.show({ text, tone: 'info', duration: 3500 });
  }

  error(text) { this.show({ text, tone: 'error', duration: 4500 }); }
  success(text) { this.show({ text, tone: 'success', duration: 2400 }); }
  info(text) { this.show({ text, tone: 'info', duration: 3000 }); }

  _clearTimer() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    if (this._unsubscribeTts) this._unsubscribeTts();
    this._unsubscribe = null;
    this._unsubscribeTts = null;
  }
}

export const statusStrip = new StatusStrip();
