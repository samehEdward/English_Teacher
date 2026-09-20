// EchoSpeak Main Coordinator & Router
import { speechService } from './services/speechService.js';
import { storageService } from './services/storageService.js';
import { audioRecorder } from './services/audioRecorder.js';

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

    this.init();
  }

  init() {
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
    this.setupVoicePicker();
    this.setupCustomTextModal();
    this.updateHeaderStats();

    // Check SpeechRecognition support warning
    if (!speechService.isSpeechRecognitionSupported()) {
      this.showBrowserNotice();
    }
  }

  showBrowserNotice() {
    const banner = document.createElement('div');
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
      <span>⚠️ <strong>Browser Tip:</strong> For real-time spoken evaluation and microphone speech recognition, we recommend using <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>. All text-to-speech audio and visual exercises work in all modern browsers.</span>
    `;
    document.querySelector('.app-container').insertBefore(banner, document.getElementById('mainNavTabs'));
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

    const populateVoices = () => {
      const voices = speechService.getAvailableVoices();
      if (!voices || voices.length === 0) return;

      select.innerHTML = voices.map(v => `
        <option value="${v.voiceURI}" ${speechService.selectedVoice && speechService.selectedVoice.voiceURI === v.voiceURI ? 'selected' : ''}>
          ${v.name.replace(/Microsoft |Google /g, '')} (${v.lang})
        </option>
      `).join('');
    };

    populateVoices();
    // Voices might load asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      speechService.initVoices();
      populateVoices();
    };

    select.addEventListener('change', (e) => {
      speechService.setVoiceByUri(e.target.value);
      storageService.saveSettings({ preferredVoice: e.target.value });
    });
  }

  updateHeaderStats() {
    const streak = storageService.getStreak();
    const stats = storageService.getStats();

    const streakVal = document.getElementById('headerStreakVal');
    const wordsVal = document.getElementById('headerWordsVal');

    if (streakVal) streakVal.textContent = `${streak.currentStreak} Day${streak.currentStreak === 1 ? '' : 's'}`;
    if (wordsVal) wordsVal.textContent = `${stats.wordsSpoken} Spoken`;
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
      const title = titleInput.value.trim() || 'My Custom Practice Article';

      if (!text) {
        alert('Please paste some English text to practice.');
        return;
      }

      const newEntry = storageService.saveCustomText({ title, text });
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
