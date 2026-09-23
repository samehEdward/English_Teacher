// EchoSpeak v2 — application shell and router.
//
// Responsibilities, and nothing else:
//   - own the module lifecycle (mount / unmount)
//   - call speechController.reset() at EVERY boundary (tab change, language
//     switch, modal open). v1 repeated stopSpeaking/stopListening/stopRecording
//     at six call sites, each free to drift out of sync; there is now one call
//     in one place.
//   - own the voice picker. v1 assigned speechSynthesis.onvoiceschanged in two
//     files and the second assignment silently discarded the first.
//
// This file never calls speak(), never opens the mic, and never touches
// speechSynthesis. Modules do that through speechController.

import { speechController } from './core/speechController.js';
import { audioEngine } from './core/audioEngine.js';
import { permissionGate } from './core/permissionGate.js';
import { actionBar } from './ui/actionBar.js';
import { statusStrip } from './ui/statusStrip.js';

import { storageService } from './services/storageService.js';
import { I18N } from './data/i18n.js';

import { VocationalModule } from './modules/vocationalModule.js';
import { RoleplayModule } from './modules/roleplayModule.js';
import { ReadAloudModule } from './modules/readAloudModule.js';
import { ShadowingModule } from './modules/shadowingModule.js';
import { DictationModule } from './modules/dictationModule.js';
import { PhoneticsModule } from './modules/phoneticsModule.js';
import { VaultModule } from './modules/vaultModule.js';

const MODULE_SPECS = [
  { id: 'vocationalModule', key: 'vocational', Ctor: VocationalModule },
  { id: 'roleplayModule',   key: 'roleplay',   Ctor: RoleplayModule },
  { id: 'readModule',       key: 'read',       Ctor: ReadAloudModule },
  { id: 'shadowModule',     key: 'shadow',     Ctor: ShadowingModule },
  { id: 'dictModule',       key: 'dict',       Ctor: DictationModule },
  { id: 'phoneticsModule',  key: 'phonetics',  Ctor: PhoneticsModule },
  { id: 'vaultModule',      key: 'vault',      Ctor: VaultModule }
];

const CHIP_LABELS = {
  de: { vocationalModule: 'Beruf', roleplayModule: 'Dialog', readModule: 'Lesen', shadowModule: 'Echo', dictModule: 'Diktat', phoneticsModule: 'Phonetik', vaultModule: 'Vokabeln' },
  en: { vocationalModule: 'Career', roleplayModule: 'Dialogue', readModule: 'Read', shadowModule: 'Echo', dictModule: 'Dictation', phoneticsModule: 'Phonetics', vaultModule: 'Vocab' }
};

const SHELL_TEXT = {
  de: {
    settings: 'Einstellungen', voice: 'Stimme', done: 'Fertig',
    importText: 'Text importieren', importTitle: 'Eigenen Text importieren',
    cancel: 'Abbrechen', save: 'Speichern',
    titleLabel: 'Titel', textLabel: 'Text',
    emptyText: 'Bitte fügen Sie zuerst einen Text ein.',
    saved: 'Text gespeichert.',
    noStt: 'Spracherkennung ist auf diesem Gerät nicht verfügbar. Alle Übungen funktionieren weiterhin — Antworten können getippt werden.',
    defaultVoice: 'Standardstimme'
  },
  en: {
    settings: 'Settings', voice: 'Voice', done: 'Done',
    importText: 'Import text', importTitle: 'Import your own text',
    cancel: 'Cancel', save: 'Save',
    titleLabel: 'Title', textLabel: 'Text',
    emptyText: 'Please paste some text first.',
    saved: 'Text saved.',
    noStt: 'Speech recognition is not available on this device. Every exercise still works — you can type your answers.',
    defaultVoice: 'Default voice'
  }
};

class App {
  constructor() {
    this.modules = {};
    this.activeId = 'vocationalModule';
    this.lang = storageService.getLanguage() === 'en' ? 'en' : 'de';

    this.init();
  }

  init() {
    speechController.setLanguage(this.lang);

    actionBar.init({ lang: this.lang });
    statusStrip.init({ lang: this.lang });

    this.buildModules();
    this.bindNav();
    this.bindLanguage();
    this.bindSettings();
    this.bindCustomText();
    this.bindVoicePicker();
    this.renderCapabilityNotice();
    this.applyShellText();

    // Mount the initial module. Nothing has spoken up to this point and
    // nothing will: the gesture window is closed and no turn is open, so any
    // speak() from a module's first render is refused by the controller.
    this.mount(this.activeId, { initial: true });

    this.restoreVoicePreference();
    this.registerServiceWorker();
  }

  /**
   * Offline support. v1 registered this from pwaInstaller.js, which v2 no
   * longer imports (it drove a QR-code / localtunnel panel that has been
   * removed). Without this, existing PWA installs keep serving the v1 service
   * worker and its cache, and never see this build.
   */
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    // file:// in the Capacitor shell has no SW scope, and registration throws.
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          // Take over from a v1 worker as soon as the new one is ready.
          reg.addEventListener('updatefound', () => {
            const incoming = reg.installing;
            if (!incoming) return;
            incoming.addEventListener('statechange', () => {
              if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('[app] a new version is available; it activates on next launch');
              }
            });
          });
        })
        .catch((err) => console.warn('[app] service worker registration failed', err));
    });
  }

  buildModules() {
    MODULE_SPECS.forEach(({ id, key, Ctor }) => {
      const container = document.getElementById(id);
      if (!container) {
        console.warn(`[app] missing container #${id}`);
        return;
      }
      try {
        this.modules[key] = new Ctor(container);
        this.modules[key]._containerId = id;
      } catch (err) {
        console.error(`[app] module "${key}" failed to construct`, err);
        container.innerHTML =
          `<div class="notice notice-warn">This module failed to load. ${String(err.message || err)}</div>`;
      }
    });
  }

  moduleFor(containerId) {
    const spec = MODULE_SPECS.find((s) => s.id === containerId);
    return spec ? this.modules[spec.key] : null;
  }

  // == routing =============================================================

  bindNav() {
    const rail = document.getElementById('navRail');
    if (!rail) return;

    rail.addEventListener('click', (event) => {
      const chip = event.target.closest('.nav-chip');
      if (!chip) return;

      const target = chip.dataset.target;
      if (!target || target === this.activeId) return;

      this.navigate(target);
    });
  }

  navigate(targetId) {
    const chip = document.querySelector(`.nav-chip[data-target="${targetId}"]`);

    this.unmount(this.activeId);

    document.querySelectorAll('.nav-chip').forEach((c) => {
      c.setAttribute('aria-selected', String(c.dataset.target === targetId));
    });

    document.querySelectorAll('.module-view').forEach((view) => {
      view.classList.toggle('active', view.id === targetId);
    });

    this.activeId = targetId;
    this.mount(targetId);

    const viewport = document.getElementById('appViewport');
    if (viewport) viewport.scrollTop = 0;

    if (chip && chip.scrollIntoView) {
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    audioEngine.playChime('tap');
  }

  mount(containerId, { initial = false } = {}) {
    const module = this.moduleFor(containerId);
    if (!module) return;

    try {
      if (typeof module.mount === 'function') {
        module.mount();
      } else {
        // Modules not yet migrated to the mount/unmount contract.
        if (typeof module.render === 'function') module.render();
        if (typeof module.bindEvents === 'function') module.bindEvents();
      }
    } catch (err) {
      console.error(`[app] mount(${containerId}) failed`, err);
    }

    // Modules that publish bar actions do so inside mount(). Anything else
    // must leave the bar hidden, or the previous module's buttons stay on
    // screen and act on a view that is no longer displayed.
    if (typeof module.publishActions !== 'function') actionBar.setActions(null);

    if (!initial) this.updateStats();
  }

  unmount(containerId) {
    // THE teardown. One call, one place.
    speechController.reset('navigate');
    statusStrip.hide();
    actionBar.setActions(null);

    const module = this.moduleFor(containerId);
    if (module && typeof module.unmount === 'function') {
      try {
        module.unmount();
      } catch (err) {
        console.error(`[app] unmount(${containerId}) failed`, err);
      }
    }
  }

  // == language ============================================================

  bindLanguage() {
    ['btnLangDe', 'btnLangEn'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang !== this.lang) this.switchLanguage(lang);
      });
    });

    this.syncLanguageButtons();
  }

  switchLanguage(lang) {
    // Same teardown as navigation. v1 switched language while a scenario was
    // mid-flight and re-ran initRoleplay(), which auto-spoke the new opening
    // line — a rogue TTS path distinct from the tab-change one.
    speechController.reset('language-switch');
    statusStrip.hide();

    this.lang = lang;
    storageService.setLanguage(lang);
    speechController.setLanguage(lang);

    actionBar.setLanguage(lang);
    statusStrip.setLanguage(lang);

    Object.values(this.modules).forEach((module) => {
      if (module && typeof module.setLanguage === 'function') {
        try {
          module.setLanguage(lang);
        } catch (err) {
          console.error('[app] setLanguage failed', err);
        }
      }
    });

    this.syncLanguageButtons();
    this.applyShellText();
    this.populateVoices();
    this.renderCapabilityNotice();

    // Re-mount the active module so it re-declares its action bar in the new
    // language. Still no speech: no gesture window survives this path.
    this.mount(this.activeId);

    audioEngine.playChime('tap');
  }

  syncLanguageButtons() {
    ['btnLangDe', 'btnLangEn'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', String(btn.dataset.lang === this.lang));
    });
    document.documentElement.lang = this.lang;
  }

  applyShellText() {
    const t = SHELL_TEXT[this.lang] || SHELL_TEXT.en;
    const dict = I18N[this.lang] || I18N.en;
    const labels = CHIP_LABELS[this.lang] || CHIP_LABELS.en;

    document.querySelectorAll('.nav-chip').forEach((chip) => {
      const label = chip.querySelector('.chip-label');
      if (label && labels[chip.dataset.target]) label.textContent = labels[chip.dataset.target];
    });

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el && text) el.textContent = text;
    };

    set('brandSubtitle', dict.brandSubtitle);
    set('settingsTitle', t.settings);
    set('voiceSelectLabel', t.voice);
    set('closeSettingsBtn2', t.done);
    set('importTextBtn', t.importText);
    set('customTextTitle', t.importTitle);
    set('cancelCustomTextBtn', t.cancel);
    set('saveCustomTextBtn', t.save);
  }

  // == settings & voices ===================================================

  bindSettings() {
    const modal = document.getElementById('settingsModal');
    const open = document.getElementById('btnSettings');
    const closers = ['closeSettingsBtn', 'closeSettingsBtn2'];

    if (!modal || !open) return;

    const close = () => {
      modal.classList.remove('open');
      open.setAttribute('aria-expanded', 'false');
    };

    open.addEventListener('click', () => {
      // Opening a sheet is a boundary too: whatever was playing stops.
      speechController.reset('settings-open');
      this.updateStats();
      this.renderDiagnostics();
      modal.classList.add('open');
      open.setAttribute('aria-expanded', 'true');
    });

    closers.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', close);
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
  }

  bindVoicePicker() {
    const select = document.getElementById('voiceSelect');
    if (!select) return;

    // Single owner for voice loading. speechController owns
    // speechSynthesis.onvoiceschanged; everyone else subscribes.
    speechController.onVoicesChanged(() => this.populateVoices());
    this.populateVoices();

    select.addEventListener('change', (event) => {
      if (speechController.setVoiceById(event.target.value)) {
        storageService.saveSettings({ preferredVoice: event.target.value });
      }
    });
  }

  populateVoices() {
    const select = document.getElementById('voiceSelect');
    if (!select) return;

    const voices = speechController.availableVoices();
    const t = SHELL_TEXT[this.lang] || SHELL_TEXT.en;

    if (!voices.length) {
      select.innerHTML = `<option value="">${t.defaultVoice}</option>`;
      return;
    }

    const current = speechController.selectedVoiceId;
    select.innerHTML = voices
      .map((v) => {
        const name = v.name.replace(/Microsoft |Google |Android /g, '');
        const selected = current === v.id ? ' selected' : '';
        return `<option value="${v.id}"${selected}>${name} (${v.lang})</option>`;
      })
      .join('');
  }

  restoreVoicePreference() {
    const preferred = storageService.getSettings().preferredVoice;
    if (!preferred) return;

    // Voices may not have arrived yet on a cold WebView start.
    const apply = () => {
      if (speechController.setVoiceById(preferred)) {
        this.populateVoices();
        return true;
      }
      return false;
    };

    if (!apply()) {
      const stop = speechController.onVoicesChanged(() => {
        if (apply()) stop();
      });
    }
  }

  updateStats() {
    const streak = storageService.getStreak();
    const stats = storageService.getStats();

    const streakEl = document.getElementById('statStreak');
    const wordsEl = document.getElementById('statWords');

    if (streakEl) streakEl.textContent = String(streak.currentStreak || 0);
    if (wordsEl) wordsEl.textContent = String(stats.wordsSpoken || 0);
  }

  renderDiagnostics() {
    const el = document.getElementById('diagnostics');
    if (!el) return;

    const caps = speechController.capabilities();
    const rows = [
      ['state', speechController.state],
      ['stt', caps.stt ? caps.sttBackend : 'unavailable'],
      ['tts', caps.tts ? 'ok' : 'unavailable'],
      ['recorder', caps.recording ? 'ok' : 'unavailable'],
      ['audioctx', audioEngine.state],
      ['native', permissionGate.isNative ? 'capacitor' : 'web'],
      ['blocked tts', speechController.stats.blockedSpeakCalls],
      ['mic conflicts', speechController.stats.micCollisionsPrevented]
    ];

    el.innerHTML = rows.map(([k, v]) => `<div>${k}: <strong>${v}</strong></div>`).join('');
  }

  renderCapabilityNotice() {
    const host = document.getElementById('capabilityNotice');
    if (!host) return;

    if (speechController.sttSupported) {
      host.innerHTML = '';
      return;
    }

    // Informational, not an error. Every exercise still works without STT;
    // only live scoring is unavailable. v1 showed a scary orange warning here
    // on its own primary target (the APK).
    const t = SHELL_TEXT[this.lang] || SHELL_TEXT.en;
    host.innerHTML = `<div class="notice notice-info"><span aria-hidden="true">⌨️</span><span>${t.noStt}</span></div>`;
  }

  // == custom text import ==================================================

  bindCustomText() {
    const modal = document.getElementById('customTextModal');
    const openBtn = document.getElementById('importTextBtn');
    const closeBtn = document.getElementById('closeCustomTextBtn');
    const cancelBtn = document.getElementById('cancelCustomTextBtn');
    const saveBtn = document.getElementById('saveCustomTextBtn');
    const titleInput = document.getElementById('customTextTitleInput');
    const textarea = document.getElementById('customTextareaInput');

    if (!modal) return;

    const close = () => {
      modal.classList.remove('open');
      if (titleInput) titleInput.value = '';
      if (textarea) textarea.value = '';
    };

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        const settings = document.getElementById('settingsModal');
        if (settings) settings.classList.remove('open');
        modal.classList.add('open');
      });
    }

    [closeBtn, cancelBtn].forEach((btn) => {
      if (btn) btn.addEventListener('click', close);
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const t = SHELL_TEXT[this.lang] || SHELL_TEXT.en;
        const text = (textarea && textarea.value.trim()) || '';

        if (!text) {
          statusStrip.error(t.emptyText);
          return;
        }

        const fallback = this.lang === 'de' ? 'Eigener Übungstext' : 'My practice text';
        const title = (titleInput && titleInput.value.trim()) || fallback;

        const entry = storageService.saveCustomText({ title, text, lang: this.lang });
        close();

        const read = this.modules.read;
        if (read) {
          if (typeof read.refreshCustomLessons === 'function') read.refreshCustomLessons();
          if (typeof read.switchLesson === 'function') read.switchLesson(entry.id);
        }

        this.navigate('readModule');
        audioEngine.playChime('success');
        statusStrip.success(t.saved);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.echoSpeakApp = new App();
});
