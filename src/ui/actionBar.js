// The single bottom action bar.
//
// v1 had every module render its own .control-bar.mobile-app-bar AND kept the
// seven-tab nav at the bottom, so two fixed bars fought for the thumb zone and
// ~370 lines of !important media queries tried to referee. Here there is one
// bar in index.html; the active module declares what goes in it.
//
// The FAB is owned by the speech state machine, not by the module. A module
// cannot show "listening" when the controller is idle, because the module
// never sets that attribute.

import { speechController, SpeechState } from '../core/speechController.js';
import { icon } from './icons.js';

const MAX_SLOTS = 4;

const FAB_LABEL = {
  en: { idle: 'Start speaking', listening: 'Stop', speaking: 'Stop audio', busy: 'Working', off: 'Microphone unavailable' },
  de: { idle: 'Sprechen starten', listening: 'Stopp', speaking: 'Audio stoppen', busy: 'Verarbeitung', off: 'Mikrofon nicht verfügbar' }
};

class ActionBar {
  constructor() {
    this.root = null;
    this.fab = null;
    this.slots = [];
    this.lang = 'de';

    this._mic = null;      // { onStart, onStop } or null to hide the FAB
    this._buttons = [];
    this._unsubscribe = null;
  }

  init({ lang = 'de' } = {}) {
    this.root = document.getElementById('actionBar');
    this.fab = document.getElementById('fabMic');
    this.lang = lang;

    if (!this.root || !this.fab) {
      console.warn('[actionBar] shell markup missing');
      return;
    }

    this.slots = Array.from(this.root.querySelectorAll('.bar-btn[data-slot]'));

    this.slots.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const action = this._buttons[index];
        if (!action || action.disabled) return;
        // Every bar press is a user gesture: unlock audio and let TTS through.
        speechController.noteUserGesture();
        try {
          action.onClick();
        } catch (err) {
          console.error('[actionBar] action threw', err);
        }
      });
    });

    this.fab.addEventListener('click', () => this._onFabClick());

    // The FAB mirrors the state machine, always.
    this._unsubscribe = speechController.subscribe(() => this._syncFab());
    this._syncFab();
  }

  setLanguage(lang) {
    this.lang = lang === 'de' ? 'de' : 'en';
    this._syncFab();
    this._renderButtons();
  }

  /**
   * Declare the active module's controls.
   *
   * @param {object|null} config
   * @param {{onStart: Function, onStop?: Function}|null} config.mic
   *        null hides the FAB entirely (e.g. the vocabulary vault).
   * @param {Array<{icon: string, label: string, onClick: Function, disabled?: boolean}>} config.buttons
   *        Max 4; anything beyond is dropped with a warning.
   */
  setActions(config) {
    if (!this.root) return;

    if (!config) {
      this.root.hidden = true;
      this._mic = null;
      this._buttons = [];
      this._applyViewportReserve(false);
      return;
    }

    this.root.hidden = false;
    this._applyViewportReserve(true);

    this._mic = config.mic || null;

    const buttons = config.buttons || [];
    if (buttons.length > MAX_SLOTS) {
      console.warn(`[actionBar] ${buttons.length} buttons declared; only ${MAX_SLOTS} fit a thumb bar`);
    }
    this._buttons = buttons.slice(0, MAX_SLOTS);

    this._renderButtons();
    this._syncFab();
  }

  /** Update one button's disabled state without re-rendering the bar. */
  setButtonDisabled(index, disabled) {
    const action = this._buttons[index];
    const btn = this.slots[this._slotFor(index)];
    if (!action || !btn) return;
    action.disabled = !!disabled;
    btn.disabled = !!disabled;
    btn.setAttribute('aria-disabled', String(!!disabled));
  }

  /**
   * Buttons fill outward around the FAB: slots 0,1 sit left of it and 2,3
   * right. With fewer than four, keep them adjacent to the FAB so the layout
   * stays visually balanced rather than drifting to the edges.
   */
  _slotFor(index) {
    const n = this._buttons.length;
    if (n <= 2) return index === 0 ? 1 : 2;  // inner slots only
    if (n === 3) return [0, 1, 2][index];
    return index;
  }

  _renderButtons() {
    if (!this.slots.length) return;

    this.slots.forEach((btn) => {
      btn.hidden = true;
      btn.innerHTML = '';
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
    });

    this._buttons.forEach((action, index) => {
      const btn = this.slots[this._slotFor(index)];
      if (!btn) return;

      btn.hidden = false;
      btn.disabled = !!action.disabled;
      if (action.disabled) btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-label', action.ariaLabel || action.label);
      btn.innerHTML = `${icon(action.icon)}<span class="bar-label">${action.label}</span>`;
    });
  }

  _onFabClick() {
    // Reading the machine, not a local flag, is what stopped the v1 races
    // where the button and the recognizer disagreed about who was listening.
    const state = speechController.state;

    if (state === SpeechState.LISTENING) {
      // Delegate to the module when it supplied onStop: several modules do
      // real work on stop (flush an interim transcript, score it, reset their
      // own view state). Calling stopListening() behind their back would leave
      // that undone. Fall back to a plain stop when no handler was given.
      if (this._mic && this._mic.onStop) this._mic.onStop();
      else speechController.stopListening();
      return;
    }

    if (state === SpeechState.SPEAKING) {
      speechController.stopSpeaking();
      return;
    }

    if (state === SpeechState.RECORDING) {
      if (this._mic && this._mic.onStop) this._mic.onStop();
      return;
    }

    if (state === SpeechState.PROCESSING) return;

    if (this._mic && this._mic.onStart) {
      speechController.noteUserGesture();
      this._mic.onStart();
    }
  }

  _syncFab() {
    if (!this.fab) return;

    const state = speechController.state;
    const labels = FAB_LABEL[this.lang] || FAB_LABEL.en;
    const hasMic = !!this._mic;
    const supported = speechController.sttSupported;

    // No STT backend on this platform: hide the FAB rather than offer a
    // control that cannot work. Modules keep their typed-input path.
    if (!hasMic || !supported) {
      this.fab.style.visibility = 'hidden';
      this.fab.setAttribute('aria-hidden', 'true');
      this.fab.disabled = true;
      this.fab.dataset.state = 'UNSUPPORTED';
      return;
    }

    this.fab.style.visibility = '';
    this.fab.removeAttribute('aria-hidden');
    this.fab.disabled = false;
    this.fab.dataset.state = state;

    const showStop = state === SpeechState.LISTENING ||
                     state === SpeechState.RECORDING ||
                     state === SpeechState.SPEAKING;

    const micIcon = this.fab.querySelector('.fab-icon-mic');
    const stopIcon = this.fab.querySelector('.fab-icon-stop');
    if (micIcon) micIcon.classList.toggle('hidden', showStop);
    if (stopIcon) stopIcon.classList.toggle('hidden', !showStop);

    let label = labels.idle;
    if (state === SpeechState.LISTENING || state === SpeechState.RECORDING) label = labels.listening;
    else if (state === SpeechState.SPEAKING) label = labels.speaking;
    else if (state === SpeechState.PROCESSING) label = labels.busy;

    this.fab.setAttribute('aria-label', label);
    this.fab.setAttribute('aria-pressed', String(state === SpeechState.LISTENING));
  }

  _applyViewportReserve(hasBar) {
    const viewport = document.getElementById('appViewport');
    if (viewport) viewport.classList.toggle('no-action-bar', !hasBar);
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    this._unsubscribe = null;
  }
}

export const actionBar = new ActionBar();
