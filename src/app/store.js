// Persisted app state: settings, scenario progress, quiz results.
//
// One versioned localStorage key instead of v1's six. Every read and write is
// guarded: storage can be unavailable (private mode, cleared site data) and
// the app must still work, just without remembering anything.

import { verdictRank } from './scoring.js';

const KEY = 'echospeak.v2';
const LEGACY_SETTINGS_KEY = 'echospeak_settings_v1';

const DEFAULTS = {
  settings: {
    lang: 'de',          // German workplace register ("Sie") is the default track
    domain: 'it_support',
    showArabic: true,    // the coaching notes are written in Arabic
    autoPlayPartner: true,
    rate: 0.95,
    voiceId: null
  },
  // scenarioKey -> { done: bool, best: verdict, steps: {i: verdict}, at: ms }
  progress: {},
  // questionId -> true if last answered correctly
  quiz: {}
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        settings: { ...DEFAULTS.settings, ...(data.settings || {}) },
        progress: data.progress || {},
        quiz: data.quiz || {}
      };
    }
  } catch (e) { /* fall through to defaults */ }

  // First run of v2: carry the language choice over from v1.
  // JSON clone rather than structuredClone: minSdk 24 devices can run
  // WebView builds that predate it.
  const fresh = JSON.parse(JSON.stringify(DEFAULTS));
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_SETTINGS_KEY) || 'null');
    if (legacy && (legacy.language === 'en' || legacy.language === 'de')) {
      fresh.settings.lang = legacy.language;
    }
  } catch (e) { /* no legacy settings */ }
  return fresh;
}

class Store {
  constructor() {
    this.state = read();
    this._listeners = new Set();
  }

  get settings() { return this.state.settings; }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { /* storage unavailable */ }
    this._listeners.forEach((fn) => { try { fn(this.state); } catch (e) { console.error(e); } });
  }

  setSetting(key, value) {
    this.state.settings[key] = value;
    this._save();
  }

  progressFor(scenarioKey) {
    return this.state.progress[scenarioKey] || null;
  }

  /** Record one answered step; keeps the best verdict ever reached. */
  recordStep(scenarioKey, stepIdx, verdict) {
    const p = this.state.progress[scenarioKey] || { done: false, best: null, steps: {}, at: 0 };
    const prev = p.steps[stepIdx];
    if (!prev || verdictRank(verdict) > verdictRank(prev)) p.steps[stepIdx] = verdict;
    p.at = Date.now();
    this.state.progress[scenarioKey] = p;
    this._save();
  }

  completeScenario(scenarioKey, verdicts) {
    const p = this.state.progress[scenarioKey] || { done: false, best: null, steps: {}, at: 0 };
    p.done = true;
    const worst = verdicts.reduce((acc, v) => (verdictRank(v) < verdictRank(acc) ? v : acc), 'strong');
    if (!p.best || verdictRank(worst) > verdictRank(p.best)) p.best = worst;
    p.at = Date.now();
    this.state.progress[scenarioKey] = p;
    this._save();
  }

  recordQuiz(questionId, correct) {
    this.state.quiz[questionId] = !!correct;
    this._save();
  }

  quizStats(ids) {
    let answered = 0;
    let correct = 0;
    ids.forEach((id) => {
      if (id in this.state.quiz) {
        answered += 1;
        if (this.state.quiz[id]) correct += 1;
      }
    });
    return { answered, correct, total: ids.length };
  }
}

export const store = new Store();
