// Dictation & Articulation Studio Module
import { DICTATION_LESSONS } from '../data/lessonsData.js';
import { speechService } from '../services/speechService.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class DictationModule {
  constructor(container) {
    this.container = container;
    this.lessons = DICTATION_LESSONS;
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
    const item = this.getCurrent();

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">Dictation & Articulation Studio</h2>
          <p class="section-subtitle">Listen blindly, write what you hear, and lock in muscle memory by speaking it aloud.</p>
        </div>
        <div class="section-actions">
          <span class="badge badge-level">Exercise ${this.currentIndex + 1} of ${this.lessons.length}</span>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Dictation Practice Area -->
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge ${item.level === 'Easy' ? 'badge-level' : item.level === 'Medium' ? 'badge-cat' : 'badge-level'}">
                ${item.level} Difficulty
              </span>
              <span style="font-size: 13px; color: var(--text-muted);">Listen attentively before typing</span>
            </div>
            <button id="dictationHintBtn" class="btn btn-secondary btn-sm">
              💡 Reveal Hint
            </button>
          </div>

          <!-- Hint display (hidden by default) -->
          <div id="hintBox" style="display: none; padding: 12px 16px; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.12); color: #c7d2fe; font-size: 14px;">
            <strong>Hint:</strong> ${item.hint}
          </div>

          <!-- Audio Listening Player -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; padding: 30px; background: rgba(10, 15, 26, 0.6); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <button id="playAudioBtn" class="btn btn-accent btn-lg" style="gap: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Play Sentence Audio</span>
            </button>
            <button id="playSlowDictBtn" class="btn btn-secondary" title="Play at 0.75x speed">
              🐢 Play Slow
            </button>
          </div>

          <!-- User Writing Input Area -->
          <div class="form-group">
            <label style="font-size: 14px; font-weight: 600; color: #cbd5e1;">Type what you hear:</label>
            <textarea id="dictationTextarea" class="dictation-input" placeholder="Type the English sentence you heard... (Press Enter or click Check Writing)" rows="3"></textarea>
          </div>

          <!-- Action Controls -->
          <div class="control-bar">
            <button id="checkWritingBtn" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Check Writing</span>
            </button>
            <button id="revealAnswerBtn" class="btn btn-secondary btn-sm">
              Show Solution
            </button>
            <div style="display: flex; gap: 8px;">
              <button id="prevDictBtn" class="btn btn-secondary btn-sm" ${this.currentIndex === 0 ? 'disabled' : ''}>← Prev</button>
              <button id="nextDictBtn" class="btn btn-secondary btn-sm" ${this.currentIndex === this.lessons.length - 1 ? 'disabled' : ''}>Next →</button>
            </div>
          </div>

          <!-- Diff Results Box (Appears after checking) -->
          <div id="diffResultsWrap" style="display: none; display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 14px; font-weight: 600; color: #cbd5e1;">Detailed Comparison:</div>
            <div id="diffDisplay" class="dictation-diff-display"></div>
          </div>
        </div>

        <!-- Right Vocal Reinforcement Studio -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Step 2: Vocal Articulation Challenge -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🎙️</span>
              <h4 style="font-size: 16px; font-weight: 700; color: #fff;">Oral Reinforcement</h4>
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">
              Lock in your memory! After typing the sentence, speak it aloud into your mic to master mouth coordination and speech cadence.
            </p>

            <button id="speakVerifyBtn" class="mic-action-btn" style="width: 100%; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="speakVerifyBtnText">Speak Aloud Now</span>
            </button>

            <div id="speakVerifyFeedback" style="display: none; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glass);">
              <span id="speakVerifyScore" style="font-weight: 700; color: #34d399;"></span>
              <div id="speakVerifySpoken" style="color: var(--text-muted); margin-top: 4px;"></div>
            </div>
          </div>

          <!-- Quick Tip Card -->
          <div class="glass-panel" style="padding: 20px; font-size: 13px; color: var(--text-muted);">
            <strong style="color: #cbd5e1; display: block; margin-bottom: 6px;">🧠 Cognitive Retention Tip:</strong>
            Writing forces your brain to dissect phonemes and grammar, while speaking aloud engages motor memory. Combining both accelerates fluency 3x faster than reading alone!
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
      if (e.key === 'Enter' && !e.shiftKey) {
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
    const inputVal = this.container.querySelector('#dictationTextarea').value;
    if (!inputVal.trim()) {
      alert('Please type what you heard first!');
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
        html += `<span class="diff-tag correct" title="Accurate">${item.word}</span> `;
      } else if (item.type === 'mismatch') {
        html += `<span class="diff-tag mismatch" title="Expected: ${item.word}">Expected: ${item.word} (You wrote: "${item.userInput}")</span> `;
      } else if (item.type === 'missing') {
        html += `<span class="diff-tag missing" title="Missing word">Missing: ${item.word}</span> `;
      } else if (item.type === 'extra') {
        html += `<span class="diff-tag extra" title="Extra word">Extra: "${item.word}"</span> `;
      }
    });

    diffDisplay.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>Writing Accuracy: ${result.accuracy}%</strong></div>
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
    const btn = this.container.querySelector('#speakVerifyBtn');
    const btnText = this.container.querySelector('#speakVerifyBtnText');
    const feedbackBox = this.container.querySelector('#speakVerifyFeedback');
    const scoreText = this.container.querySelector('#speakVerifyScore');
    const spokenEl = this.container.querySelector('#speakVerifySpoken');

    if (this.isSpeakingVerification) {
      this.isSpeakingVerification = false;
      btn.classList.remove('recording');
      btnText.textContent = 'Speak Aloud Now';
      speechService.stopListening();
      return;
    }

    this.isSpeakingVerification = true;
    btn.classList.add('recording');
    btnText.textContent = 'Listening... Speak now';
    feedbackBox.style.display = 'none';

    let captured = '';
    speechService.startListening({
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        captured = full;
      },
      onResult: (finalText) => {
        const spoken = finalText || captured;
        this.isSpeakingVerification = false;
        btn.classList.remove('recording');
        btnText.textContent = 'Speak Aloud Now';

        const evalResult = DiffEngine.evaluateSpeech({
          referenceText: this.getCurrent().sentence,
          spokenText: spoken
        });

        feedbackBox.style.display = 'block';
        scoreText.textContent = `Spoken Accuracy: ${evalResult.accuracy}%`;
        spokenEl.textContent = `Spoken: "${spoken}"`;

        if (evalResult.accuracy >= 85) {
          audioRecorder.playChime('success');
        }
      },
      onError: () => {
        this.isSpeakingVerification = false;
        btn.classList.remove('recording');
        btnText.textContent = 'Speak Aloud Now';
      }
    });
  }
}
