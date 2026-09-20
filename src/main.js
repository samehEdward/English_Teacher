// EchoSpeak Main Coordinator & Router
import { speechService } from './services/speechService.js';
import { storageService } from './services/storageService.js';
import { audioRecorder } from './services/audioRecorder.js';
import { I18N } from './data/i18n.js';

import { ReadAloudModule } from './modules/readAloudModule.js';
import { ShadowingModule } from './modules/shadowingModule.js';
import { DictationModule } from './modules/dictationModule.js';
import { RoleplayModule } from './modules/roleplayModule.js';
import { PhoneticsModule } from './modules/phoneticsModule.js';
import { VaultModule } from './modules/vaultModule.js';

class App {
  constructor() {
    this.modules = {};
    this.activeTab = 'readModule';
    this.currentLang = storageService.getLanguage();

    this.init();
  }

  init() {
    // Configure speech service language
    speechService.setLanguage(this.currentLang);

    // Initialize feature modules
    const readContainer = document.getElementById('readModule');
    const shadowContainer = document.getElementById('shadowModule');
    const dictContainer = document.getElementById('dictModule');
    const roleplayContainer = document.getElementById('roleplayModule');
    const phoneticsContainer = document.getElementById('phoneticsModule');
    const vaultContainer = document.getElementById('vaultModule');

    this.modules.read = new ReadAloudModule(readContainer);
    this.modules.shadow = new ShadowingModule(shadowContainer);
    this.modules.dict = new DictationModule(dictContainer);
    this.modules.roleplay = new RoleplayModule(roleplayContainer);
    this.modules.phonetics = new PhoneticsModule(phoneticsContainer);
    this.modules.vault = new VaultModule(vaultContainer);

    this.setupNavigation();
    this.setupLanguageSwitcher();
    this.setupVoicePicker();
    this.setupCustomTextModal();
    this.applyLanguageUI(this.currentLang);
    this.updateHeaderStats();

    // Check SpeechRecognition support warning
    if (!speechService.isSpeechRecognitionSupported()) {
      this.showBrowserNotice();
    }
  }

  showBrowserNotice() {
    const isDe = this.currentLang === 'de';
    const banner = document.createElement('div');
    banner.id = 'browserWarningBanner';
    banner.style.cssText = `
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fcd34d;
      padding: 10px 18px;
      border-radius: 12px;
      margin-bottom: 16px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    banner.innerHTML = `
      <span>⚠️ <strong>${isDe ? 'Browser-Hinweis:' : 'Browser Tip:'}</strong> ${isDe 
        ? 'Für die Echtzeit-Sprachbewertung und das Mikrofon-Feedback empfehlen wir <strong>Google Chrome</strong> oder <strong>Microsoft Edge</strong>. Sämtliche Audio-Ausgaben und Textübungen funktionieren in allen modernen Browsern.' 
        : 'For real-time spoken evaluation and microphone speech recognition, we recommend using <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>. All text-to-speech audio and visual exercises work in all modern browsers.'}</span>
    `;
    document.querySelector('.app-container').insertBefore(banner, document.getElementById('mainNavTabs'));
  }

  setupLanguageSwitcher() {
    const btnEn = document.getElementById('btnLangEn');
    const btnDe = document.getElementById('btnLangDe');

    const updateBtns = (lang) => {
      if (btnEn) btnEn.classList.toggle('active', lang === 'en');
      if (btnDe) btnDe.classList.toggle('active', lang === 'de');
    };

    updateBtns(this.currentLang);

    if (btnEn) {
      btnEn.addEventListener('click', () => {
        if (this.currentLang !== 'en') {
          this.switchLanguage('en');
          updateBtns('en');
        }
      });
    }

    if (btnDe) {
      btnDe.addEventListener('click', () => {
        if (this.currentLang !== 'de') {
          this.switchLanguage('de');
          updateBtns('de');
        }
      });
    }
  }

  switchLanguage(lang) {
    this.currentLang = lang;
    storageService.setLanguage(lang);

    // Stop active audio or recognition
    speechService.stopSpeaking();
    speechService.stopListening();
    audioRecorder.stopRecording();

    // Reconfigure speech service
    speechService.setLanguage(lang);
    this.populateVoices();

    // Broadcast language update to all modules
    if (this.modules.read) this.modules.read.setLanguage(lang);
    if (this.modules.shadow) this.modules.shadow.setLanguage(lang);
    if (this.modules.dict) this.modules.dict.setLanguage(lang);
    if (this.modules.roleplay) this.modules.roleplay.setLanguage(lang);
    if (this.modules.phonetics) this.modules.phonetics.setLanguage(lang);
    if (this.modules.vault) this.modules.vault.setLanguage(lang);

    // Update UI shell
    this.applyLanguageUI(lang);
    this.updateHeaderStats();

    // Update browser warning banner if present
    const warning = document.getElementById('browserWarningBanner');
    if (warning) {
      warning.remove();
      this.showBrowserNotice();
    }

    audioRecorder.playChime('tap');
  }

  applyLanguageUI(lang) {
    const dict = I18N[lang] || I18N.en;

    // Header strings
    const subtitle = document.getElementById('brandSubtitle');
    if (subtitle) subtitle.textContent = dict.brandSubtitle;

    const voiceLabel = document.getElementById('voiceSelectLabel');
    if (voiceLabel) voiceLabel.textContent = dict.voiceLabel;

    // Nav tabs
    const tabRead = document.querySelector('#navTabRead .tab-label');
    if (tabRead) tabRead.textContent = dict.nav.read;

    const tabShadow = document.querySelector('#navTabShadow .tab-label');
    if (tabShadow) tabShadow.textContent = dict.nav.shadow;

    const tabDict = document.querySelector('#navTabDict .tab-label');
    if (tabDict) tabDict.textContent = dict.nav.dict;

    const tabRoleplay = document.querySelector('#navTabRoleplay .tab-label');
    if (tabRoleplay) tabRoleplay.textContent = dict.nav.roleplay;

    const tabPhonetics = document.querySelector('#navTabPhonetics .tab-label');
    if (tabPhonetics) tabPhonetics.textContent = dict.nav.phonetics;

    const tabVault = document.querySelector('#navTabVault .tab-label');
    if (tabVault) tabVault.textContent = dict.nav.vault;

    // Custom Text Modal
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = dict.modal.title;

    const modalDesc = document.getElementById('modalDesc');
    if (modalDesc) modalDesc.textContent = dict.modal.desc;

    const modalTitleLabel = document.getElementById('modalTitleLabel');
    if (modalTitleLabel) modalTitleLabel.textContent = dict.modal.articleTitleLabel;

    const titleInput = document.getElementById('customTextTitleInput');
    if (titleInput) titleInput.placeholder = dict.modal.articleTitlePlaceholder;

    const modalTextLabel = document.getElementById('modalTextLabel');
    if (modalTextLabel) modalTextLabel.textContent = dict.modal.textLabel;

    const textarea = document.getElementById('customTextareaInput');
    if (textarea) textarea.placeholder = dict.modal.textPlaceholder;

    const cancelBtn = document.getElementById('cancelModalBtn');
    if (cancelBtn) cancelBtn.textContent = dict.modal.cancelBtn;

    const saveBtn = document.getElementById('saveCustomTextBtn');
    if (saveBtn) saveBtn.textContent = dict.modal.saveBtn;
  }

  setupNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const moduleViews = document.querySelectorAll('.module-view');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;
        if (targetId === this.activeTab) return;

        // Stop any running speech audio or mic
        speechService.stopSpeaking();
        speechService.stopListening();
        audioRecorder.stopRecording();

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        moduleViews.forEach(view => {
          if (view.id === targetId) {
            view.classList.add('active');
          } else {
            view.classList.remove('active');
          }
        });

        this.activeTab = targetId;

        // If switching to vault, refresh vault table & stats
        if (targetId === 'vaultModule' && this.modules.vault) {
          this.modules.vault.render();
          this.modules.vault.bindEvents();
        }

        this.updateHeaderStats();
      });
    });
  }

  setupVoicePicker() {
    const select = document.getElementById('globalVoiceSelect');

    this.populateVoices = () => {
      const voices = speechService.getAvailableVoices();
      if (!voices || voices.length === 0) return;

      select.innerHTML = voices.map(v => `
        <option value="${v.voiceURI}" ${speechService.selectedVoice && speechService.selectedVoice.voiceURI === v.voiceURI ? 'selected' : ''}>
          ${v.name.replace(/Microsoft |Google /g, '')} (${v.lang})
        </option>
      `).join('');
    };

    this.populateVoices();

    // Voices might load asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        speechService.initVoices();
        this.populateVoices();
      };
    }

    select.addEventListener('change', (e) => {
      speechService.setVoiceByUri(e.target.value);
      storageService.saveSettings({ preferredVoice: e.target.value });
    });
  }

  updateHeaderStats() {
    const streak = storageService.getStreak();
    const stats = storageService.getStats();
    const isDe = this.currentLang === 'de';

    const streakVal = document.getElementById('headerStreakVal');
    const wordsVal = document.getElementById('headerWordsVal');

    if (streakVal) {
      const streakSuffix = isDe ? (streak.currentStreak === 1 ? 'Tag Serie' : 'Tage Serie') : (streak.currentStreak === 1 ? 'Day Streak' : 'Day Streak');
      streakVal.textContent = `${streak.currentStreak} ${streakSuffix}`;
    }
    if (wordsVal) {
      const wordsSuffix = isDe ? 'Gesprochen' : 'Spoken';
      wordsVal.textContent = `${stats.wordsSpoken} ${wordsSuffix}`;
    }
  }

  setupCustomTextModal() {
    const modal = document.getElementById('customTextModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveCustomTextBtn');
    const titleInput = document.getElementById('customTextTitleInput');
    const textarea = document.getElementById('customTextareaInput');

    const closeModal = () => {
      modal.classList.remove('open');
      titleInput.value = '';
      textarea.value = '';
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    saveBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      const defaultTitle = this.currentLang === 'de' ? 'Mein eigener Übungstext' : 'My Custom Practice Article';
      const title = titleInput.value.trim() || defaultTitle;

      if (!text) {
        const alertMsg = this.currentLang === 'de' ? 'Bitte fügen Sie einen Text zum Üben ein.' : 'Please paste some text to practice.';
        alert(alertMsg);
        return;
      }

      const newEntry = storageService.saveCustomText({ title, text, lang: this.currentLang });
      closeModal();

      // Refresh Read Aloud module lessons
      if (this.modules.read) {
        this.modules.read.refreshCustomLessons();
        this.modules.read.switchLesson(newEntry.id);
      }

      // Switch to Read module tab
      document.querySelector('[data-target="readModule"]').click();
      audioRecorder.playChime('success');
    });
  }
}

// Bootstrap application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.echoSpeakApp = new App();
});
