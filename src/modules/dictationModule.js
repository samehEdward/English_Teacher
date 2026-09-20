// Dictation & Articulation Studio Module
import { DICTATION_LESSONS } from '../data/lessonsData.js';
import { GERMAN_DICTATION_LESSONS } from '../data/lessonsData_de.js';
import { speechService } from '../services/speechService.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class DictationModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.loadLessons();
    this.currentIndex = 0;
    this.hasChecked = false;
    this.isSpeakingVerification = false;

    this.render();
    this.bindEvents();
  }

  loadLessons() {
    this.lessons = this.currentLang === 'de' ? GERMAN_DICTATION_LESSONS : DICTATION_LESSONS;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.loadLessons();
    this.currentIndex = 0;
    this.hasChecked = false;
    this.isSpeakingVerification = false;
    this.render();
    this.bindEvents();
  }

  getCurrent() {
    return this.lessons[this.currentIndex];
  }

  render() {
    const isDe = this.currentLang === 'de';
    const item = this.getCurrent();

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${isDe ? 'Diktat- & Artikulations-Studio' : 'Dictation & Articulation Studio'}</h2>
          <p class="section-subtitle">${isDe ? 'Blind zuhören, Gehörtes tippen und Gelerntes durch lautes Sprechen im Langzeitgedächtnis verankern.' : 'Listen blindly, write what you hear, and lock in muscle memory by speaking it aloud.'}</p>
        </div>
        <div class="section-actions">
          <span class="badge badge-level">${isDe ? `Übung ${this.currentIndex + 1} von ${this.lessons.length}` : `Exercise ${this.currentIndex + 1} of ${this.lessons.length}`}</span>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Dictation Practice Area -->
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge ${item.level.includes('Easy') || item.level.includes('Leicht') ? 'badge-level' : item.level.includes('Medium') || item.level.includes('Mittel') ? 'badge-cat' : 'badge-level'}">
                ${item.level} ${isDe ? 'Schwierigkeit' : 'Difficulty'}
              </span>
              <span style="font-size: 13px; color: var(--text-muted);">${isDe ? 'Aufmerksam zuhören vor dem Tippen' : 'Listen attentively before typing'}</span>
            </div>
            <button id="dictationHintBtn" class="btn btn-secondary btn-sm">
              ${isDe ? '💡 Tipp anzeigen' : '💡 Reveal Hint'}
            </button>
          </div>

          <!-- Hint display (hidden by default) -->
          <div id="hintBox" style="display: none; padding: 12px 16px; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.12); color: #c7d2fe; font-size: 14px;">
            <strong>${isDe ? 'Tipp:' : 'Hint:'}</strong> ${item.hint}
          </div>

          <!-- Audio Listening Player -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; padding: 30px; background: rgba(10, 15, 26, 0.6); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <button id="playAudioBtn" class="btn btn-accent btn-lg" style="gap: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>${isDe ? 'Satz anhören' : 'Play Sentence Audio'}</span>
            </button>
            <button id="playSlowDictBtn" class="btn btn-secondary" title="${isDe ? 'Bei 0.75x Tempo abspielen' : 'Play at 0.75x speed'}">
              🐢 ${isDe ? 'Langsam' : 'Play Slow'}
            </button>
          </div>

          <!-- User Writing Input Area -->
          <div class="form-group">
            <label style="font-size: 14px; font-weight: 600; color: #cbd5e1;">${isDe ? 'Tippen Sie, was Sie hören:' : 'Type what you hear:'}</label>
            <textarea id="dictationTextarea" class="dictation-input" placeholder="${isDe ? 'Tippen Sie den deutschen Satz, den Sie gehört haben... (Enter drücken)' : 'Type the English sentence you heard... (Press Enter or click Check Writing)'}" rows="3" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off"></textarea>
          </div>

          <!-- Action Controls -->
          <div class="control-bar mobile-app-bar">
            <button id="checkWritingBtn" class="btn btn-primary" title="${isDe ? 'Rechtschreibung prüfen' : 'Check Writing'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>
                <span class="btn-short-text">${isDe ? 'Prüfen' : 'Check'}</span>
                <span class="btn-long-text">${isDe ? ' (Rechtschreibung)' : ' Writing'}</span>
              </span>
            </button>
            <button id="revealAnswerBtn" class="btn btn-secondary btn-sm" title="${isDe ? 'Lösung anzeigen' : 'Show Solution'}">
              <span>${isDe ? 'Lösung' : 'Solution'}</span>
            </button>
            <div style="display: flex; gap: 6px;">
              <button id="prevDictBtn" class="btn btn-secondary btn-sm" ${this.currentIndex === 0 ? 'disabled' : ''} title="${isDe ? 'Vorheriger Satz' : 'Previous sentence'}">
                <span class="btn-short-text">←</span>
                <span class="btn-long-text">${isDe ? ' Zurück' : ' Prev'}</span>
              </button>
              <button id="nextDictBtn" class="btn btn-secondary btn-sm" ${this.currentIndex === this.lessons.length - 1 ? 'disabled' : ''} title="${isDe ? 'Nächster Satz' : 'Next sentence'}">
                <span class="btn-short-text">→</span>
                <span class="btn-long-text">${isDe ? ' Weiter' : ' Next'}</span>
              </button>
            </div>
          </div>

          <!-- Diff Results Box (Appears after checking) -->
          <div id="diffResultsWrap" style="display: none; display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 14px; font-weight: 600; color: #cbd5e1;">${isDe ? 'Detaillierter Abgleich:' : 'Detailed Comparison:'}</div>
            <div id="diffDisplay" class="dictation-diff-display"></div>
          </div>
        </div>

        <!-- Right Vocal Reinforcement Studio -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Step 2: Vocal Articulation Challenge -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🎙️</span>
              <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${isDe ? 'Mündliche Festigung' : 'Oral Reinforcement'}</h4>
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">
              ${isDe ? 'Verankern Sie den Satz im Gedächtnis! Sprechen Sie ihn nach dem Tippen laut ins Mikrofon.' : 'Lock in your memory! After typing the sentence, speak it aloud into your mic to master mouth coordination and speech cadence.'}
            </p>

            <button id="speakVerifyBtn" class="mic-action-btn" style="width: 100%; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="speakVerifyBtnText">${isDe ? 'Sprechen' : 'Speak'}</span>
            </button>

            <div id="speakVerifyFeedback" style="display: none; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glass);">
              <span id="speakVerifyScore" style="font-weight: 700; color: #34d399;"></span>
              <div id="speakVerifySpoken" style="color: var(--text-muted); margin-top: 4px;"></div>
            </div>
          </div>

          <!-- Quick Tip Card -->
          <div class="glass-panel" style="padding: 20px; font-size: 13px; color: var(--text-muted);">
            <strong style="color: #cbd5e1; display: block; margin-bottom: 6px;">🧠 ${isDe ? 'Kognitiver Lerntipp:' : 'Cognitive Retention Tip:'}</strong>
            ${isDe ? 'Das Tippen schult Grammatik und Rechtschreibung, während lautes Sprechen die Sprachmuskulatur aktiviert. Beides zusammen beschleunigt den Spracherwerb dreimal schneller!' : 'Writing forces your brain to dissect phonemes and grammar, while speaking aloud engages motor memory. Combining both accelerates fluency 3x faster than reading alone!'}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('#playAudioBtn').addEventListener('click', () => {
      this.playSentence(1.0);
    });

    this.container.querySelector('#playSlowDictBtn').addEventListener('click', () => {
      this.playSentence(0.75);
    });

    this.container.querySelector('#dictationHintBtn').addEventListener('click', () => {
      const hintBox = this.container.querySelector('#hintBox');
      hintBox.style.display = hintBox.style.display === 'none' ? 'block' : 'none';
    });

    const textarea = this.container.querySelector('#dictationTextarea');
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        this.checkWriting();
      }
    });

    this.container.querySelector('#checkWritingBtn').addEventListener('click', () => {
      this.checkWriting();
    });

    this.container.querySelector('#revealAnswerBtn').addEventListener('click', () => {
      textarea.value = this.getCurrent().sentence;
      this.checkWriting();
    });

    this.container.querySelector('#prevDictBtn').addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.render();
        this.bindEvents();
      }
    });

    this.container.querySelector('#nextDictBtn').addEventListener('click', () => {
      if (this.currentIndex < this.lessons.length - 1) {
        this.currentIndex++;
        this.render();
        this.bindEvents();
      }
    });

    this.container.querySelector('#speakVerifyBtn').addEventListener('click', () => {
      this.toggleSpeakVerification();
    });
  }

  playSentence(rate = 1.0) {
    speechService.speak({
      text: this.getCurrent().sentence,
      rate
    });
  }

  checkWriting() {
    const isDe = this.currentLang === 'de';
    const inputVal = this.container.querySelector('#dictationTextarea').value;
    if (!inputVal.trim()) {
      const diffWrap = this.container.querySelector('#diffResultsWrap');
      const diffDisplay = this.container.querySelector('#diffDisplay');
      if (diffWrap && diffDisplay) {
        diffWrap.style.display = 'flex';
        diffDisplay.innerHTML = `<span style="color: #f59e0b; font-size: 14px;">${isDe ? '⚠️ Bitte tippen Sie zuerst, was Sie gehört haben.' : '⚠️ Please type what you heard first.'}</span>`;
      }
      return;
    }

    const groundTruth = this.getCurrent().sentence;
    const result = DiffEngine.diffDictation(groundTruth, inputVal);

    const diffWrap = this.container.querySelector('#diffResultsWrap');
    const diffDisplay = this.container.querySelector('#diffDisplay');
    diffWrap.style.display = 'flex';

    // Format diff tags
    let html = '';
    result.diff.forEach(item => {
      if (item.type === 'correct') {
        html += `<span class="diff-tag correct" title="${isDe ? 'Korrekt' : 'Accurate'}">${item.word}</span> `;
      } else if (item.type === 'mismatch') {
        html += `<span class="diff-tag mismatch" title="${isDe ? `Erwartet: ${item.word}` : `Expected: ${item.word}`}">${isDe ? `Erwartet: ${item.word} (Sie schrieben: "${item.userInput}")` : `Expected: ${item.word} (You wrote: "${item.userInput}")`}</span> `;
      } else if (item.type === 'missing') {
        html += `<span class="diff-tag missing" title="${isDe ? 'Fehlt' : 'Missing word'}">${isDe ? `Fehlt: ${item.word}` : `Missing: ${item.word}`}</span> `;
      } else if (item.type === 'extra') {
        html += `<span class="diff-tag extra" title="${isDe ? 'Überflüssig' : 'Extra word'}">${isDe ? `Zusatz: "${item.word}"` : `Extra: "${item.word}"`}</span> `;
      }
    });

    diffDisplay.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>${isDe ? 'Schreibgenauigkeit' : 'Writing Accuracy'}: ${result.accuracy}%</strong></div>
      <div>${html}</div>
    `;

    if (result.isExact || result.accuracy >= 90) {
      audioRecorder.playChime('success');
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } else {
      audioRecorder.playChime('tap');
    }

    storageService.recordActivity({
      words: groundTruth.split(' ').length,
      accuracy: result.accuracy
    });
  }

  toggleSpeakVerification() {
    const isDe = this.currentLang === 'de';
    const btn = this.container.querySelector('#speakVerifyBtn');
    const btnText = this.container.querySelector('#speakVerifyBtnText');
    const feedbackBox = this.container.querySelector('#speakVerifyFeedback');
    const scoreText = this.container.querySelector('#speakVerifyScore');
    const spokenEl = this.container.querySelector('#speakVerifySpoken');

    if (this.isSpeakingVerification) {
      this.isSpeakingVerification = false;
      btn.classList.remove('recording');
      btnText.textContent = isDe ? 'Sprechen' : 'Speak';
      speechService.stopListening();
      return;
    }

    this.isSpeakingVerification = true;
    btn.classList.add('recording');
    btnText.textContent = isDe ? 'Stop' : 'Stop';
    feedbackBox.style.display = 'none';

    let captured = '';
    speechService.startListening({
      lang: speechService.getDefaultRecognitionLang(),
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        captured = full;
      },
      onResult: (finalText) => {
        const spoken = finalText || captured;
        this.isSpeakingVerification = false;
        btn.classList.remove('recording');
        btnText.textContent = isDe ? 'Sprechen' : 'Speak';

        const evalResult = DiffEngine.evaluateSpeech({
          referenceText: this.getCurrent().sentence,
          spokenText: spoken
        });

        feedbackBox.style.display = 'block';
        scoreText.textContent = `${isDe ? 'Gesprochene Genauigkeit' : 'Spoken Accuracy'}: ${evalResult.accuracy}%`;
        spokenEl.textContent = `${isDe ? 'Gesprochen' : 'Spoken'}: "${spoken}"`;

        if (evalResult.accuracy >= 85) {
          audioRecorder.playChime('success');
        }
      },
      onError: () => {
        this.isSpeakingVerification = false;
        btn.classList.remove('recording');
        btnText.textContent = isDe ? 'Jetzt laut sprechen' : 'Speak Aloud Now';
      }
    });
  }
}
