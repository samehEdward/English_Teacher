// Read & Speak Aloud Module
import { READING_LESSONS } from '../data/lessonsData.js';
import { GERMAN_READING_LESSONS } from '../data/lessonsData_de.js';
import { I18N } from '../data/i18n.js';
import { speechController, SpeakIntent } from '../core/speechController.js';
import { audioEngine } from '../core/audioEngine.js';
import { actionBar } from '../ui/actionBar.js';
import { statusStrip } from '../ui/statusStrip.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class ReadAloudModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.loadLessons();
    this.speechRate = 1.0;
    this.isRecording = false;
    this.recordStartTime = null;
    this.spokenTranscript = '';
    this.selectedWordInfo = null;

    this.render();
    this.bindEvents();
  }

  loadLessons() {
    const base = this.currentLang === 'de' ? GERMAN_READING_LESSONS : READING_LESSONS;
    const custom = storageService.getCustomTexts().filter(t => !t.lang || t.lang === this.currentLang);
    this.lessons = [...base, ...custom];
    this.currentLesson = this.lessons[0] || base[0];
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.loadLessons();
    this.selectedWordInfo = null;
    this.spokenTranscript = '';
    this.render();
    this.bindEvents();
  }

  // == module lifecycle ====================================================
  // Minimal contract (ARCHITECTURE.md section 9). This module still renders
  // its own inline control bar rather than publishing to the shared bottom
  // bar, so it does not define publishActions() yet - see MIGRATION.md.

  mount() {
    this.render();
    this.bindEvents();
    this.publishActions();
  }

  unmount() {
    // main.js already called speechController.reset(); clear the view-local
    // mirrors so a re-mount starts from a clean state.
    this.isRecording = false;
    this.pendingStopEval = false;
    actionBar.setActions(null);
  }

  /**
   * Bottom-bar controls. The inline .control-bar this module still renders is
   * hidden by legacy-modules.css - these are the same actions moved into the
   * thumb zone, with the mic promoted to the shared FAB.
   */
  publishActions() {
    const isDe = this.currentLang === 'de';

    actionBar.setActions({
      mic: {
        onStart: () => this.toggleSpeaking(),
        // toggleSpeaking() does the stop-side work too (flushes the interim
        // transcript and scores it), which is why the FAB delegates here
        // rather than calling stopListening() directly.
        onStop: () => this.toggleSpeaking()
      },
      buttons: [
        {
          icon: 'volume',
          label: isDe ? 'Hören' : 'Listen',
          ariaLabel: isDe ? 'Text vorlesen lassen' : 'Hear the text read aloud',
          onClick: () => this.toggleListenCoach()
        },
        {
          icon: 'reset',
          label: isDe ? 'Neu' : 'Reset',
          onClick: () => this.resetHighlights()
        },
        {
          icon: 'book',
          label: 'Import',
          ariaLabel: isDe ? 'Eigenen Text importieren' : 'Import your own text',
          onClick: () => {
            const modal = document.querySelector('#customTextModal');
            if (modal) modal.classList.add('open');
          }
        }
      ]
    });
  }

  refreshCustomLessons() {
    this.loadLessons();
    this.updateLessonDropdown();
  }

  render() {
    const isDe = this.currentLang === 'de';

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${isDe ? 'Lesen & Laut Sprechen Studio' : 'Read & Speak Aloud Studio'}</h2>
          <p class="section-subtitle">${isDe ? 'Mit nativer Aussprache mitlesen, Sprechgenauigkeit erfassen und Sprachgewandtheit aufbauen.' : 'Read along with native pronunciation, track speech accuracy, and build vocal fluency.'}</p>
        </div>
        <div class="section-actions">
          <select id="lessonSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.getLessonOptionsHtml()}
          </select>
          <button id="openImportModalBtn" class="btn btn-secondary btn-sm">
            <span>${isDe ? '+ Eigenen Text importieren' : '+ Import Custom Text'}</span>
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
              <span style="font-size: 13px; color: var(--text-dim);" id="wordCountBadge">${this.getWordCount()} ${isDe ? 'Wörter' : 'words'}</span>
            </div>
            <div class="speed-slider-wrap">
              <label for="readSpeedSlider">${isDe ? 'Coach-Tempo:' : 'Coach Speed:'}</label>
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
            <span class="spoken-text" id="interimTranscriptText">${isDe ? 'Klicken Sie auf "Sprechen starten" und lesen Sie laut vor...' : 'Click "Start Speaking" and read the text aloud clearly...'}</span>
          </div>

          <!-- Waveform Canvas -->
          <canvas id="readWaveformCanvas" class="waveform-canvas" width="600" height="60"></canvas>

          <!-- Control Bar -->
          <div class="control-bar mobile-app-bar">
            <div class="playback-controls">
              <button id="listenCoachBtn" class="btn btn-accent" title="${isDe ? 'Coach anhören' : 'Listen to Coach'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                <span id="listenCoachBtnText">
                  <span class="btn-short-text">${isDe ? 'Anhören' : 'Listen'}</span>
                  <span class="btn-long-text">${isDe ? ' (Coach)' : ' to Coach'}</span>
                </span>
              </button>
              <button id="resetReadBtn" class="btn btn-secondary btn-sm" title="Clear highlights">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                <span>Reset</span>
              </button>
            </div>

            <button id="micRecordBtn" class="mic-action-btn mobile-fab-mic" title="${isDe ? 'Sprechen starten' : 'Start Speaking'}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="micRecordBtnText">${isDe ? 'Sprechen' : 'Speak'}</span>
            </button>
          </div>
        </div>

        <!-- Right Evaluation & Word Inspector Column -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Evaluation Score Card -->
          <div class="score-card glass-panel" id="scorePanel">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${isDe ? 'Aussprache-Auswertung' : 'Speech Pronunciation'}</h4>
            <div class="score-hero">
              <div class="score-circle" id="scoreCircle" style="--score-angle: 0deg;">
                <div class="score-number" id="scoreNumber">--</div>
              </div>
              <div class="score-grade" id="scoreGrade">${isDe ? 'Bereit zum Üben' : 'Ready to Practice'}</div>
              <div style="font-size: 13px; color: var(--text-muted);" id="scoreFeedback">${isDe ? 'Lesen Sie den Text laut vor für Ihre KI-Ausspracheauswertung.' : 'Read the text aloud to receive your AI speech assessment.'}</div>
            </div>

            <div class="score-breakdown-grid">
              <div class="metric-item">
                <span class="metric-label">${isDe ? 'Sprechtempo' : 'Fluency Rate'}</span>
                <span class="metric-val" id="metricWpm">-- WPM</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">${isDe ? 'Vollständigkeit' : 'Completeness'}</span>
                <span class="metric-val" id="metricCompleteness">-- %</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">${isDe ? 'Korrekte Wörter' : 'Accurate Words'}</span>
                <span class="metric-val" style="color: #34d399;" id="metricCorrect">--</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">${isDe ? 'Verbesserungswürdig' : 'Need Polish'}</span>
                <span class="metric-val" style="color: #fbbf24;" id="metricHesitant">--</span>
              </div>
            </div>
          </div>

          <!-- Word Inspector / Vocabulary Card -->
          <div class="glass-panel" style="padding: 20px;" id="wordInspectorPanel">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #fff;">${isDe ? 'Wort-Inspektor' : 'Word Inspector'}</h4>
              <span style="font-size: 12px; color: var(--text-dim);">${isDe ? 'Klicken Sie auf ein Wort' : 'Click any word in text'}</span>
            </div>
            <div id="inspectorContent" style="color: var(--text-muted); font-size: 13px;">
              ${isDe ? 'Klicken Sie oben auf ein beliebiges Wort, um die Aussprache isoliert zu hören, IPA-Lautschrift anzuzeigen und es im Wortschatz-Tresor zu speichern.' : 'Click any word above to hear isolated pronunciation, inspect phonetic IPA, and save it to your Vocabulary Vault.'}
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
        const rawWord = token.dataset.word.replace(/[^\p{L}\p{N}]/gu, '');
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
    speechController.stopSpeaking();
    speechController.stopListening();
    const found = this.lessons.find(l => l.id === lessonId);
    if (!found) return;

    const isDe = this.currentLang === 'de';
    this.currentLesson = found;
    this.container.querySelector('#lessonLevelBadge').textContent = found.level;
    this.container.querySelector('#lessonCatBadge').textContent = found.category;
    this.container.querySelector('#lessonTitle').textContent = found.title;
    this.container.querySelector('#wordCountBadge').textContent = `${this.getWordCount()} ${isDe ? 'Wörter' : 'words'}`;
    this.container.querySelector('#readingTextViewport').innerHTML = this.buildWordSpans(found.text);
    this.resetHighlights();
  }

  resetHighlights() {
    speechController.stopSpeaking();
    const isDe = this.currentLang === 'de';
    const tokens = this.container.querySelectorAll('.word-token');
    tokens.forEach(t => {
      t.className = 'word-token';
    });
    this.container.querySelector('#interimTranscriptText').textContent = isDe 
      ? 'Klicken Sie auf "Sprechen starten" und lesen Sie laut vor...' 
      : 'Click "Start Speaking" and read the text aloud clearly...';
    this.updateScoreView({
      accuracy: null,
      wpm: null,
      completeness: null,
      correct: 0,
      hesitant: 0
    });
  }

  toggleListenCoach() {
    const isDe = this.currentLang === 'de';
    const btnText = this.container.querySelector('#listenCoachBtnText');

    if (speechController.isSpeaking()) {
      speechController.stopSpeaking();
      btnText.textContent = isDe ? 'Coach anhören' : 'Listen to Coach';
      this.container.querySelectorAll('.word-token').forEach(t => t.classList.remove('speaking-active'));
      return;
    }

    this.resetHighlights();
    btnText.textContent = isDe ? 'Audio stoppen' : 'Stop Listening';

    const tokens = Array.from(this.container.querySelectorAll('.word-token'));
    let currentIdx = 0;

    speechController.speak({
      text: this.currentLesson.text,
      rate: this.speechRate,
      intent: SpeakIntent.USER,
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
        btnText.textContent = isDe ? 'Coach anhören' : 'Listen to Coach';
        tokens.forEach(t => t.classList.remove('speaking-active'));
      },
      onError: () => {
        btnText.textContent = isDe ? 'Coach anhören' : 'Listen to Coach';
        tokens.forEach(t => t.classList.remove('speaking-active'));
      }
    });
  }

  startVisualizer(canvas) {
    if (!canvas) return;
    this.stopVisualizer(canvas);
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const draw = () => {
      if (!this.isRecording) {
        this.stopVisualizer(canvas);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, '#ec4899');
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#6366f1';
      ctx.beginPath();

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;
      const amp = this.spokenTranscript ? 16 : 8;

      for (let x = 0; x < width; x += 4) {
        const y = midY + Math.sin((x * 0.04) + phase) * amp * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += 0.12;
      this.visualizerFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  stopVisualizer(canvas) {
    if (this.visualizerFrame) {
      cancelAnimationFrame(this.visualizerFrame);
      this.visualizerFrame = null;
    }
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  }

  async toggleSpeaking() {
    const isDe = this.currentLang === 'de';
    const micBtn = this.container.querySelector('#micRecordBtn');
    const micBtnText = this.container.querySelector('#micRecordBtnText');
    const interimSpan = this.container.querySelector('#interimTranscriptText');
    const canvas = this.container.querySelector('#readWaveformCanvas');

    if (this.isRecording) {
      // Stop recording and process
      this.isRecording = false;
      micBtn.classList.remove('recording');
      micBtnText.textContent = isDe ? 'Sprechen' : 'Speak';
      this.stopVisualizer(canvas);

      const captured = (this.spokenTranscript || '').trim();
      speechController.stopListening();

      if (captured.length > 0) {
        this.finishEvaluation(captured);
      } else {
        // If nothing captured yet, wait for onResult or onEnd to flush
        this.pendingStopEval = true;
      }
      return;
    }

    // Start speaking
    speechController.stopSpeaking();
    this.resetHighlights();
    this.hasEvaluated = false;
    this.isRecording = true;
    this.recordStartTime = Date.now();
    this.spokenTranscript = '';
    micBtn.classList.add('recording');
    micBtnText.textContent = isDe ? 'Stop' : 'Stop';
    interimSpan.textContent = isDe ? 'Höre zu... Jetzt sprechen.' : 'Listening... Speak now.';

    this.startVisualizer(canvas);
    this.pendingStopEval = false;

    speechController.listen({
      lang: speechController.recognitionLang(),
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        this.spokenTranscript = full;
        interimSpan.textContent = full || (isDe ? 'Höre zu... Bitte deutlich sprechen.' : 'Listening... Speak clearly.');
      },
      onResult: (finalText) => {
        this.pendingStopEval = false;
        const fullSpoken = (finalText || this.spokenTranscript || '').trim();
        if (fullSpoken.length > 0) {
          this.finishEvaluation(fullSpoken);
        }
      
        // Release the state machine: without this the FSM parks in
        // PROCESSING and the status strip never clears.
        speechController.finishProcessing();
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        const errType = err && (err.error || err.message);
        if (err && err.permission) {
          // Actionable, dismissible, and offers the settings route on Android
          // - unlike the v1 alert(), which blocked the UI thread and told the
          // user nothing they could act on.
          statusStrip.showPermission(err.permission, { onRetry: () => this.toggleSpeaking() });
        }
        if (errType === 'no-speech') {
          return;
        }
        if (this.isRecording) {
          if (this.spokenTranscript && this.spokenTranscript.trim().length > 3) {
            this.finishEvaluation(this.spokenTranscript);
          } else {
            this.isRecording = false;
            micBtn.classList.remove('recording');
            micBtnText.textContent = isDe ? 'Sprechen' : 'Speak';
            this.stopVisualizer(canvas);
            interimSpan.textContent = isDe 
              ? 'Keine Sprache erkannt oder Mikrofon unterbrochen. Bitte erneut auf "Sprechen" tippen.' 
              : 'No speech caught or microphone interrupted. Please tap "Speak" again.';
          }
        }
      },
      onEnd: () => {
        // Safety-net: fires after onResult (if any). If pendingStopEval is still true,
        // it means stopListening was called but no final result was produced.
        if (this.pendingStopEval) {
          this.pendingStopEval = false;
          // Last chance: check interim transcript accumulated during the session
          const spoken = (this.spokenTranscript || '').trim();
          if (spoken.length > 0) {
            this.finishEvaluation(spoken);
          } else {
            interimSpan.textContent = isDe 
              ? 'Aufnahme beendet. Keine Sprache erfasst.' 
              : 'Recording stopped. No speech captured.';
          }
        }
      }
    });
  }

  finishEvaluation(spokenText) {
    if (this.hasEvaluated) return;
    this.hasEvaluated = true;
    const isDe = this.currentLang === 'de';
    this.isRecording = false;
    const micBtn = this.container.querySelector('#micRecordBtn');
    const micBtnText = this.container.querySelector('#micRecordBtnText');
    const canvas = this.container.querySelector('#readWaveformCanvas');
    if (micBtn) micBtn.classList.remove('recording');
    if (micBtnText) micBtnText.textContent = isDe ? 'Sprechen starten' : 'Start Speaking';
    this.stopVisualizer(canvas);

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
        tokens[i].title = `${isDe ? 'Gesprochen' : 'Spoken'}: "${w.spoken || (isDe ? 'ausgelassen' : 'omitted')}" (${w.similarity}% Match)`;
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
      audioEngine.playChime('success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      audioEngine.playChime('tap');
    }
  }

  updateScoreView({ accuracy, wpm, completeness, correct, hesitant }) {
    const isDe = this.currentLang === 'de';
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
      scoreGrade.textContent = isDe ? 'Bereit zum Üben' : 'Ready to Practice';
      scoreFeedback.textContent = isDe 
        ? 'Lesen Sie den Text laut vor für Ihre KI-Ausspracheauswertung.' 
        : 'Read the text aloud to receive your AI speech assessment.';
      wpmEl.textContent = '-- WPM';
      compEl.textContent = '-- %';
      corEl.textContent = '--';
      hesEl.textContent = '--';
      return;
    }

    const angle = (accuracy / 100) * 360;
    scoreCircle.style.setProperty('--score-angle', `${angle}deg`);
    scoreNumber.textContent = `${accuracy}%`;

    let grade = isDe ? 'Übung erforderlich' : 'Needs Practice';
    let feedback = isDe 
      ? 'Lesen Sie mit gleichmäßigem Tempo und sprechen Sie Konsonanten deutlich aus.' 
      : 'Try reading at a steady pace and pronouncing each consonant clearly.';

    if (accuracy >= 90) {
      grade = isDe ? '🌟 Native Aussprache!' : '🌟 Native-Like Fluency!';
      feedback = isDe ? 'Hervorragende Artikulation, Satzmelodie und Klarheit.' : 'Exceptional pronunciation, cadence, and word clarity.';
    } else if (accuracy >= 75) {
      grade = isDe ? '👍 Sehr guter Sprachfluss!' : '👍 Great Flow!';
      feedback = isDe ? 'Starke Aussprache. Achten Sie auf die hervorgehobenen Wörter.' : 'Solid pronunciation. Focus on the underlined words to reach 90%+.';
    } else if (accuracy >= 55) {
      grade = isDe ? 'Guter Versuch' : 'Good Effort';
      feedback = isDe ? 'Hören Sie den Coach bei 0.8x Tempo an und sprechen Sie synchron mit.' : 'Listen to the Coach once at 0.8x speed, then shadow along.';
    }

    scoreGrade.textContent = grade;
    scoreFeedback.textContent = feedback;
    wpmEl.textContent = `${wpm} WPM`;
    compEl.textContent = `${completeness}%`;
    corEl.textContent = `${correct}`;
    hesEl.textContent = `${hesitant}`;
  }

  inspectWord(word) {
    const isDe = this.currentLang === 'de';
    const clean = word.toLowerCase();
    const vocabList = this.currentLesson.vocabulary || [];
    const foundVocab = vocabList.find(v => v.word.toLowerCase() === clean);

    const ipa = foundVocab ? foundVocab.ipa : '';
    const def = foundVocab ? foundVocab.def : (isDe ? 'Lesen und artikulieren Sie dieses Wort laut und präzise.' : 'Practice reading and articulating this word clearly.');
    const isSaved = storageService.isWordSaved(clean);

    const inspector = this.container.querySelector('#inspectorContent');
    inspector.innerHTML = `
      <div class="inspector-card">
        <div class="inspector-header">
          <div>
            <div class="inspector-word">${word}</div>
            <div class="inspector-ipa">${ipa || (isDe ? 'IPA im Tresor verfügbar' : 'IPA available in vault')}</div>
          </div>
          <button id="inspectAudioBtn" class="btn btn-accent btn-sm" title="Aussprache anhören">
            ${isDe ? '🔊 Anhören' : '🔊 Listen'}
          </button>
        </div>
        <p style="font-size: 13px; color: #cbd5e1;">${def}</p>
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <button id="saveWordVaultBtn" class="btn ${isSaved ? 'btn-secondary' : 'btn-primary'} btn-sm">
            ${isSaved ? (isDe ? '✓ Im Tresor gespeichert' : '✓ Saved in Vault') : (isDe ? '+ Im Tresor speichern' : '+ Save to Vault')}
          </button>
        </div>
      </div>
    `;

    inspector.querySelector('#inspectAudioBtn').addEventListener('click', () => {
      speechController.speak({ text: word, rate: 0.85, intent: SpeakIntent.USER });
    });

    const saveBtn = inspector.querySelector('#saveWordVaultBtn');
    saveBtn.addEventListener('click', () => {
      storageService.saveToVault({
        word,
        ipa,
        def,
        example: `${isDe ? 'Aus' : 'From'} "${this.currentLesson.title}"`
      });
      saveBtn.textContent = isDe ? '✓ Im Tresor gespeichert' : '✓ Saved in Vault';
      saveBtn.classList.replace('btn-primary', 'btn-secondary');
      audioEngine.playChime('tap');
    });

    // Also speak word immediately on click
    speechController.speak({ text: word, rate: 0.9, intent: SpeakIntent.USER });
  }
}
