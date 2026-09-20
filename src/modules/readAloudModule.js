// Read & Speak Aloud Module
import { READING_LESSONS } from '../data/lessonsData.js';
import { speechService } from '../services/speechService.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class ReadAloudModule {
  constructor(container) {
    this.container = container;
    this.lessons = [...READING_LESSONS];
    this.currentLesson = this.lessons[0];
    this.speechRate = 1.0;
    this.isRecording = false;
    this.recordStartTime = null;
    this.spokenTranscript = '';
    this.selectedWordInfo = null;

    this.render();
    this.bindEvents();
  }

  refreshCustomLessons() {
    const custom = storageService.getCustomTexts();
    this.lessons = [...READING_LESSONS, ...custom];
    this.updateLessonDropdown();
  }

  render() {
    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">Read & Speak Aloud Studio</h2>
          <p class="section-subtitle">Read along with native pronunciation, track speech accuracy, and build vocal fluency.</p>
        </div>
        <div class="section-actions">
          <select id="lessonSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.getLessonOptionsHtml()}
          </select>
          <button id="openImportModalBtn" class="btn btn-secondary btn-sm">
            <span>+ Import Custom Text</span>
          </button>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Practice Column -->
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div class="lesson-meta">
              <span class="badge badge-level" id="lessonLevelBadge">${this.currentLesson.level}</span>
              <span class="badge badge-cat" id="lessonCatBadge">${this.currentLesson.category}</span>
              <span style="font-size: 13px; color: var(--text-dim);" id="wordCountBadge">${this.getWordCount()} words</span>
            </div>
            <div class="speed-slider-wrap">
              <label for="readSpeedSlider">Coach Speed:</label>
              <input type="range" id="readSpeedSlider" min="0.6" max="1.3" step="0.1" value="1.0">
              <span id="speedValueLabel">1.0x</span>
            </div>
          </div>

          <h3 id="lessonTitle" style="font-size: 20px; font-weight: 700; color: #fff;">${this.currentLesson.title}</h3>

          <!-- Text Viewport with individual word spans -->
          <div class="reading-text-viewport" id="readingTextViewport">
            ${this.buildWordSpans(this.currentLesson.text)}
          </div>

          <!-- Spoken transcription interim feedback -->
          <div class="live-speech-feedback" id="liveSpeechFeedback">
            <div class="spoken-indicator"></div>
            <span class="spoken-text" id="interimTranscriptText">Click "Start Speaking" and read the text aloud clearly...</span>
          </div>

          <!-- Waveform Canvas -->
          <canvas id="readWaveformCanvas" class="waveform-canvas" width="600" height="60"></canvas>

          <!-- Control Bar -->
          <div class="control-bar">
            <div class="playback-controls">
              <button id="listenCoachBtn" class="btn btn-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                <span id="listenCoachBtnText">Listen to Coach</span>
              </button>
              <button id="resetReadBtn" class="btn btn-secondary btn-sm" title="Clear highlights">
                Reset
              </button>
            </div>

            <button id="micRecordBtn" class="mic-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="micRecordBtnText">Start Speaking</span>
            </button>
          </div>
        </div>

        <!-- Right Evaluation & Word Inspector Column -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Evaluation Score Card -->
          <div class="score-card glass-panel" id="scorePanel">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff;">Speech Pronunciation</h4>
            <div class="score-hero">
              <div class="score-circle" id="scoreCircle" style="--score-angle: 0deg;">
                <div class="score-number" id="scoreNumber">--</div>
              </div>
              <div class="score-grade" id="scoreGrade">Ready to Practice</div>
              <div style="font-size: 13px; color: var(--text-muted);" id="scoreFeedback">Read the text aloud to receive your AI speech assessment.</div>
            </div>

            <div class="score-breakdown-grid">
              <div class="metric-item">
                <span class="metric-label">Fluency Rate</span>
                <span class="metric-val" id="metricWpm">-- WPM</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Completeness</span>
                <span class="metric-val" id="metricCompleteness">-- %</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Accurate Words</span>
                <span class="metric-val" style="color: #34d399;" id="metricCorrect">--</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Need Polish</span>
                <span class="metric-val" style="color: #fbbf24;" id="metricHesitant">--</span>
              </div>
            </div>
          </div>

          <!-- Word Inspector / Vocabulary Card -->
          <div class="glass-panel" style="padding: 20px;" id="wordInspectorPanel">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #fff;">Word Inspector</h4>
              <span style="font-size: 12px; color: var(--text-dim);">Click any word in text</span>
            </div>
            <div id="inspectorContent" style="color: var(--text-muted); font-size: 13px;">
              Click any word above to hear isolated pronunciation, inspect phonetic IPA, and save it to your Vocabulary Vault.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getLessonOptionsHtml() {
    return this.lessons.map(lesson => `
      <option value="${lesson.id}" ${lesson.id === this.currentLesson.id ? 'selected' : ''}>
        ${lesson.level.split(' - ')[0]} - ${lesson.title}
      </option>
    `).join('');
  }

  updateLessonDropdown() {
    const select = this.container.querySelector('#lessonSelect');
    if (select) {
      select.innerHTML = this.getLessonOptionsHtml();
    }
  }

  getWordCount() {
    return this.currentLesson.text.trim().split(/\s+/).length;
  }

  buildWordSpans(text) {
    const words = text.trim().split(/\s+/);
    return words.map((w, index) => `<span class="word-token" data-index="${index}" data-word="${w}">${w}</span>`).join(' ');
  }

  bindEvents() {
    // Lesson selection
    const lessonSelect = this.container.querySelector('#lessonSelect');
    lessonSelect.addEventListener('change', (e) => {
      this.switchLesson(e.target.value);
    });

    // Speed slider
    const speedSlider = this.container.querySelector('#readSpeedSlider');
    const speedLabel = this.container.querySelector('#speedValueLabel');
    speedSlider.addEventListener('input', (e) => {
      this.speechRate = parseFloat(e.target.value);
      speedLabel.textContent = `${this.speechRate.toFixed(1)}x`;
    });

    // Listen to coach button
    const listenBtn = this.container.querySelector('#listenCoachBtn');
    listenBtn.addEventListener('click', () => {
      this.toggleListenCoach();
    });

    // Reset button
    const resetBtn = this.container.querySelector('#resetReadBtn');
    resetBtn.addEventListener('click', () => {
      this.resetHighlights();
    });

    // Mic recording button
    const micBtn = this.container.querySelector('#micRecordBtn');
    micBtn.addEventListener('click', () => {
      this.toggleSpeaking();
    });

    // Word token click listener (Event delegation)
    const textViewport = this.container.querySelector('#readingTextViewport');
    textViewport.addEventListener('click', (e) => {
      const token = e.target.closest('.word-token');
      if (token) {
        const rawWord = token.dataset.word.replace(/[^\w]/g, '');
        this.inspectWord(rawWord);
      }
    });

    // Import modal button
    const importBtn = this.container.querySelector('#openImportModalBtn');
    importBtn.addEventListener('click', () => {
      const modal = document.querySelector('#customTextModal');
      if (modal) modal.classList.add('open');
    });
  }

  switchLesson(lessonId) {
    speechService.stopSpeaking();
    speechService.stopListening();
    const found = this.lessons.find(l => l.id === lessonId);
    if (!found) return;

    this.currentLesson = found;
    this.container.querySelector('#lessonLevelBadge').textContent = found.level;
    this.container.querySelector('#lessonCatBadge').textContent = found.category;
    this.container.querySelector('#lessonTitle').textContent = found.title;
    this.container.querySelector('#wordCountBadge').textContent = `${this.getWordCount()} words`;
    this.container.querySelector('#readingTextViewport').innerHTML = this.buildWordSpans(found.text);
    this.resetHighlights();
  }

  resetHighlights() {
    speechService.stopSpeaking();
    const tokens = this.container.querySelectorAll('.word-token');
    tokens.forEach(t => {
      t.className = 'word-token';
    });
    this.container.querySelector('#interimTranscriptText').textContent = 'Click "Start Speaking" and read the text aloud clearly...';
    this.updateScoreView({
      accuracy: null,
      wpm: null,
      completeness: null,
      correct: 0,
      hesitant: 0
    });
  }

  toggleListenCoach() {
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
      this.container.querySelector('#listenCoachBtnText').textContent = 'Listen to Coach';
      this.container.querySelectorAll('.word-token').forEach(t => t.classList.remove('speaking-active'));
      return;
    }

    this.resetHighlights();
    this.container.querySelector('#listenCoachBtnText').textContent = 'Stop Listening';

    const tokens = Array.from(this.container.querySelectorAll('.word-token'));
    let currentIdx = 0;

    speechService.speak({
      text: this.currentLesson.text,
      rate: this.speechRate,
      onBoundary: (event) => {
        if (event.name === 'word') {
          tokens.forEach(t => t.classList.remove('speaking-active'));
          if (tokens[currentIdx]) {
            tokens[currentIdx].classList.add('speaking-active');
            currentIdx++;
          }
        }
      },
      onEnd: () => {
        this.container.querySelector('#listenCoachBtnText').textContent = 'Listen to Coach';
        tokens.forEach(t => t.classList.remove('speaking-active'));
      },
      onError: () => {
        this.container.querySelector('#listenCoachBtnText').textContent = 'Listen to Coach';
        tokens.forEach(t => t.classList.remove('speaking-active'));
      }
    });
  }

  async toggleSpeaking() {
    const micBtn = this.container.querySelector('#micRecordBtn');
    const micBtnText = this.container.querySelector('#micRecordBtnText');
    const interimSpan = this.container.querySelector('#interimTranscriptText');
    const canvas = this.container.querySelector('#readWaveformCanvas');

    if (this.isRecording) {
      // Stop recording and process
      this.isRecording = false;
      micBtn.classList.remove('recording');
      micBtnText.textContent = 'Start Speaking';
      speechService.stopListening();
      await audioRecorder.stopRecording();
      return;
    }

    // Start speaking
    speechService.stopSpeaking();
    this.resetHighlights();
    this.isRecording = true;
    this.recordStartTime = Date.now();
    this.spokenTranscript = '';
    micBtn.classList.add('recording');
    micBtnText.textContent = 'Stop & Evaluate';
    interimSpan.textContent = 'Listening... Speak now.';

    try {
      await audioRecorder.startRecording(canvas);
    } catch (e) {
      alert('Microphone access is required to analyze speaking. Please allow mic permission in your browser.');
      this.isRecording = false;
      micBtn.classList.remove('recording');
      micBtnText.textContent = 'Start Speaking';
      return;
    }

    speechService.startListening({
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        this.spokenTranscript = full;
        interimSpan.textContent = full || 'Listening... Speak clearly.';
      },
      onResult: (finalText) => {
        const fullSpoken = finalText || this.spokenTranscript;
        this.finishEvaluation(fullSpoken);
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        if (this.isRecording) {
          this.finishEvaluation(this.spokenTranscript);
        }
      }
    });
  }

  finishEvaluation(spokenText) {
    this.isRecording = false;
    const micBtn = this.container.querySelector('#micRecordBtn');
    const micBtnText = this.container.querySelector('#micRecordBtnText');
    micBtn.classList.remove('recording');
    micBtnText.textContent = 'Start Speaking';

    const durationSec = Math.max(1, (Date.now() - (this.recordStartTime || Date.now())) / 1000);

    const result = DiffEngine.evaluateSpeech({
      referenceText: this.currentLesson.text,
      spokenText: spokenText || '',
      durationSec
    });

    // Update tokens color coding
    const tokens = this.container.querySelectorAll('.word-token');
    result.words.forEach((w, i) => {
      if (tokens[i]) {
        tokens[i].className = `word-token status-${w.status}`;
        tokens[i].title = `Spoken: "${w.spoken || 'omitted'}" (${w.similarity}% match)`;
      }
    });

    this.updateScoreView({
      accuracy: result.accuracy,
      wpm: result.wordsPerMinute,
      completeness: result.completeness,
      correct: result.correctCount,
      hesitant: result.hesitantCount
    });

    // Save activity in stats
    storageService.recordActivity({
      words: result.correctCount,
      minutes: Math.ceil(durationSec / 60),
      accuracy: result.accuracy
    });

    // Confetti on outstanding performance
    if (result.accuracy >= 85) {
      audioRecorder.playChime('success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      audioRecorder.playChime('tap');
    }
  }

  updateScoreView({ accuracy, wpm, completeness, correct, hesitant }) {
    const scoreCircle = this.container.querySelector('#scoreCircle');
    const scoreNumber = this.container.querySelector('#scoreNumber');
    const scoreGrade = this.container.querySelector('#scoreGrade');
    const scoreFeedback = this.container.querySelector('#scoreFeedback');
    const wpmEl = this.container.querySelector('#metricWpm');
    const compEl = this.container.querySelector('#metricCompleteness');
    const corEl = this.container.querySelector('#metricCorrect');
    const hesEl = this.container.querySelector('#metricHesitant');

    if (accuracy === null) {
      scoreCircle.style.setProperty('--score-angle', '0deg');
      scoreNumber.textContent = '--';
      scoreGrade.textContent = 'Ready to Practice';
      scoreFeedback.textContent = 'Read the text aloud to receive your AI speech assessment.';
      wpmEl.textContent = '-- WPM';
      compEl.textContent = '-- %';
      corEl.textContent = '--';
      hesEl.textContent = '--';
      return;
    }

    const angle = (accuracy / 100) * 360;
    scoreCircle.style.setProperty('--score-angle', `${angle}deg`);
    scoreNumber.textContent = `${accuracy}%`;

    let grade = 'Needs Practice';
    let feedback = 'Try reading at a steady pace and pronouncing each consonant clearly.';
    if (accuracy >= 90) {
      grade = '🌟 Native-Like Fluency!';
      feedback = 'Exceptional pronunciation, cadence, and word clarity.';
    } else if (accuracy >= 75) {
      grade = '👍 Great Flow!';
      feedback = 'Solid pronunciation. Focus on the underlined words to reach 90%+.';
    } else if (accuracy >= 55) {
      grade = 'Good Effort';
      feedback = 'Listen to the Coach once at 0.8x speed, then shadow along.';
    }

    scoreGrade.textContent = grade;
    scoreFeedback.textContent = feedback;
    wpmEl.textContent = `${wpm} WPM`;
    compEl.textContent = `${completeness}%`;
    corEl.textContent = `${correct}`;
    hesEl.textContent = `${hesitant}`;
  }

  inspectWord(word) {
    const clean = word.toLowerCase();
    const vocabList = this.currentLesson.vocabulary || [];
    const foundVocab = vocabList.find(v => v.word.toLowerCase() === clean);

    const ipa = foundVocab ? foundVocab.ipa : '';
    const def = foundVocab ? foundVocab.def : 'Practice reading and articulating this word clearly.';
    const isSaved = storageService.isWordSaved(clean);

    const inspector = this.container.querySelector('#inspectorContent');
    inspector.innerHTML = `
      <div class="inspector-card">
        <div class="inspector-header">
          <div>
            <div class="inspector-word">${word}</div>
            <div class="inspector-ipa">${ipa || 'IPA available in vault'}</div>
          </div>
          <button id="inspectAudioBtn" class="btn btn-accent btn-sm" title="Listen to pronunciation">
            🔊 Listen
          </button>
        </div>
        <p style="font-size: 13px; color: #cbd5e1;">${def}</p>
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <button id="saveWordVaultBtn" class="btn ${isSaved ? 'btn-secondary' : 'btn-primary'} btn-sm">
            ${isSaved ? '✓ Saved in Vault' : '+ Save to Vault'}
          </button>
        </div>
      </div>
    `;

    inspector.querySelector('#inspectAudioBtn').addEventListener('click', () => {
      speechService.speak({ text: word, rate: 0.85 });
    });

    const saveBtn = inspector.querySelector('#saveWordVaultBtn');
    saveBtn.addEventListener('click', () => {
      storageService.saveToVault({
        word,
        ipa,
        def,
        example: `From "${this.currentLesson.title}"`
      });
      saveBtn.textContent = '✓ Saved in Vault';
      saveBtn.classList.replace('btn-primary', 'btn-secondary');
      audioRecorder.playChime('tap');
    });

    // Also speak word immediately on click
    speechService.speak({ text: word, rate: 0.9 });
  }
}
