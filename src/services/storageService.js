// LocalStorage and state persistence for EchoSpeak

const STORAGE_KEYS = {
  STREAK: 'echospeak_streak_v1',
  STATS: 'echospeak_stats_v1',
  VAULT: 'echospeak_vault_v1',
  CUSTOM_TEXTS: 'echospeak_custom_texts_v1',
  SETTINGS: 'echospeak_settings_v1',
  COMPLETED: 'echospeak_completed_v1'
};

class StorageService {
  constructor() {
    this.initDefaults();
  }

  initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.saveSettings({
        language: 'en',
        preferredVoice: '',
        speechRate: 1.0,
        pitch: 1.0,
        soundEffects: true,
        highContrast: false
      });
    }

    if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
      this.saveStats({
        wordsSpoken: 0,
        totalSessions: 0,
        practiceMinutes: 0,
        accuracySum: 0,
        assessmentsCount: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      });
    }

    this.checkAndUpdateStreak();
  }

  // Streak logic
  checkAndUpdateStreak() {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    const today = new Date().toISOString().split('T')[0];
    let streakData = raw ? JSON.parse(raw) : { currentStreak: 1, lastActiveDate: today, bestStreak: 1 };

    const lastDate = streakData.lastActiveDate;
    if (lastDate !== today) {
      const last = new Date(lastDate);
      const now = new Date(today);
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakData.currentStreak += 1;
        streakData.bestStreak = Math.max(streakData.bestStreak, streakData.currentStreak);
      } else if (diffDays > 1) {
        streakData.currentStreak = 1;
      }
      streakData.lastActiveDate = today;
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));
    }
    return streakData;
  }

  getStreak() {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    return raw ? JSON.parse(raw) : { currentStreak: 1, bestStreak: 1 };
  }

  // Stats
  getStats() {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    const stats = raw ? JSON.parse(raw) : { wordsSpoken: 0, totalSessions: 0, practiceMinutes: 0, accuracySum: 0, assessmentsCount: 0 };
    const avgAccuracy = stats.assessmentsCount > 0 ? Math.round(stats.accuracySum / stats.assessmentsCount) : 100;
    return { ...stats, avgAccuracy };
  }

  saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  recordActivity({ words = 0, minutes = 1, accuracy = null }) {
    const stats = this.getStats();
    stats.wordsSpoken += words;
    stats.practiceMinutes += minutes;
    stats.totalSessions += 1;
    if (accuracy !== null) {
      stats.accuracySum += accuracy;
      stats.assessmentsCount += 1;
    }
    this.saveStats(stats);
    this.checkAndUpdateStreak();
  }

  // Vocabulary Vault
  getVault() {
    const raw = localStorage.getItem(STORAGE_KEYS.VAULT);
    return raw ? JSON.parse(raw) : [];
  }

  saveToVault(wordObj) {
    const vault = this.getVault();
    const existingIndex = vault.findIndex(item => item.word.toLowerCase() === wordObj.word.toLowerCase());
    const item = {
      word: wordObj.word,
      ipa: wordObj.ipa || '',
      def: wordObj.def || 'Saved from practice session',
      example: wordObj.example || '',
      dateAdded: new Date().toLocaleDateString(),
      mastery: wordObj.mastery || 1 // 1 to 5
    };

    if (existingIndex >= 0) {
      vault[existingIndex] = { ...vault[existingIndex], ...item };
    } else {
      vault.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(vault));
    return vault;
  }

  removeFromVault(word) {
    let vault = this.getVault();
    vault = vault.filter(item => item.word.toLowerCase() !== word.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(vault));
    return vault;
  }

  isWordSaved(word) {
    const vault = this.getVault();
    return vault.some(item => item.word.toLowerCase() === word.toLowerCase());
  }

  // Custom User Texts
  getCustomTexts() {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEXTS);
    return raw ? JSON.parse(raw) : [];
  }

  saveCustomText({ title, text, level = 'Custom' }) {
    const customTexts = this.getCustomTexts();
    const newEntry = {
      id: 'custom_' + Date.now(),
      title: title.trim() || 'My Custom Article',
      level,
      category: 'Imported',
      text: text.trim(),
      vocabulary: []
    };
    customTexts.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TEXTS, JSON.stringify(customTexts));
    return newEntry;
  }

  deleteCustomText(id) {
    let customTexts = this.getCustomTexts();
    customTexts = customTexts.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TEXTS, JSON.stringify(customTexts));
    return customTexts;
  }

  // Settings
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = { language: 'en', speechRate: 1.0, pitch: 1.0, preferredVoice: '', soundEffects: true };
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  }

  saveSettings(settings) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  getLanguage() {
    return this.getSettings().language || 'en';
  }

  setLanguage(lang) {
    return this.saveSettings({ language: lang });
  }
}

export const storageService = new StorageService();
