// Shadowing & Rhythm Lab Module (EchoTalk Technique)
import { SHADOWING_LESSONS } from '../data/lessonsData.js';
import { speechService } from '../services/speechService.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';

export class ShadowingModule {
  constructor(container) {
    this.container = container;
    this.lessons = SHADOWING_LESSONS;
    this.currentLessonIdx = 0;
    this.currentSentenceIdx = 0;
    this.isRecording = false;
    this.userAudioUrl = null;

    this.render();
    this.bindEvents();
  }

  getCurrentLesson() {
    return this.lessons[this.currentLessonIdx];
  }

  getCurrentSentence() {
    return this.getCurrentLesson().sentences[this.currentSentenceIdx];
  }

  render() {
    const lesson = this.getCurrentLesson();
    const sentence = this.getCurrentSentence();
    const totalSentences = lesson.sentences.length;

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">Shadowing & Rhythm Lab</h2>
          <p class="section-subtitle">Train native cadence, vocal rhythm, and accent reduction by immediate auditory shadowing.</p>
        </div>
        <div class="section-actions">
          <select id="shadowLessonSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.lessons.map((l, idx) => `
              <option value="${idx}" ${idx === this.currentLessonIdx ? 'selected' : ''}>
                ${l.title} (${l.difficulty})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="practice-card glass-panel shadowing-card">
        <div class="card-header-bar">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="badge badge-level">${lesson.difficulty}</span>
            <span style="font-size: 14px; color: var(--text-muted);">${lesson.description}</span>
          </div>

          <!-- Sentence Stepper Dots -->
          <div class="sentence-stepper" id="sentenceStepper">
            ${lesson.sentences.map((_, i) => `
              <div class="stepper-dot ${i === this.currentSentenceIdx ? 'active' : ''}" data-idx="${i}">
                ${i + 1}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Target Shadowing Sentence -->
        <div class="shadow-prompt-box">
          <div class="shadow-prompt-text" id="shadowPromptText">
            "${sentence.text}"
          </div>
          <div class="shadow-phonetic-tip">
            <span>💡 <strong>Cadence Tip:</strong></span>
            <span id="shadowTipText">${sentence.phoneticTip}</span>
          </div>
        </div>

        <!-- Audio Canvas Visualizer -->
        <canvas id="shadowWaveformCanvas" class="waveform-canvas" width="600" height="70"></canvas>

        <!-- Action Controls -->
        <div class="control-bar">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="playNativeBtn" class="btn btn-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Listen Native (1.0x)</span>
            </button>
            <button id="playSlowBtn" class="btn btn-secondary btn-sm" title="Listen at 0.75x">
              🐢 0.75x
            </button>
          </div>

          <button id="shadowRecordBtn" class="mic-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            <span id="shadowRecordText">Record Your Shadow</span>
          </button>

          <div style="display: flex; gap: 8px;">
            <button id="prevSentenceBtn" class="btn btn-secondary btn-sm" ${this.currentSentenceIdx === 0 ? 'disabled' : ''}>← Previous</button>
            <button id="nextSentenceBtn" class="btn btn-secondary btn-sm" ${this.currentSentenceIdx === totalSentences - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>

        <!-- Dual Audio Comparison Player -->
        <div class="dual-playback-grid" id="dualPlaybackGrid" style="display: ${this.userAudioUrl ? 'grid' : 'none'};">
          <div class="audio-track-box">
            <div class="track-label">
              <span>🔊 Track A: Native Speaker Reference</span>
            </div>
            <button id="replayNativeTrackBtn" class="btn btn-secondary btn-sm">
              Play Native Speaker
            </button>
          </div>

          <div class="audio-track-box" style="border-color: rgba(99, 102, 241, 0.4);">
            <div class="track-label" style="color: #a5b4fc;">
              <span>🎙️ Track B: Your Recorded Voice</span>
            </div>
            <button id="replayUserTrackBtn" class="btn btn-primary btn-sm">
              Play Your Recording
            </button>
          </div>
        </div>

        <!-- Shadowing Accuracy Feedback -->
        <div id="shadowFeedbackBox" style="display: none; padding: 14px 18px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: #34d399;" id="shadowScoreText">Accuracy: 95%</span>
            <span style="font-size: 13px; color: var(--text-muted);" id="shadowScoreDetail">Spoken transcript verified.</span>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const lessonSelect = this.container.querySelector('#shadowLessonSelect');
    lessonSelect.addEventListener('change', (e) => {
      this.currentLessonIdx = parseInt(e.target.value);
      this.currentSentenceIdx = 0;
      this.userAudioUrl = null;
      this.render();
      this.bindEvents();
    });

    const stepper = this.container.querySelector('#sentenceStepper');
    stepper.addEventListener('click', (e) => {
      const dot = e.target.closest('.stepper-dot');
      if (dot) {
        this.currentSentenceIdx = parseInt(dot.dataset.idx);
        this.userAudioUrl = null;
        this.render();
        this.bindEvents();
      }
    });

    this.container.querySelector('#playNativeBtn').addEventListener('click', () => {
      this.playNativeSentence(1.0);
    });

    this.container.querySelector('#playSlowBtn').addEventListener('click', () => {
      this.playNativeSentence(0.75);
    });

    this.container.querySelector('#prevSentenceBtn').addEventListener('click', () => {
      if (this.currentSentenceIdx > 0) {
        this.currentSentenceIdx--;
        this.userAudioUrl = null;
        this.render();
        this.bindEvents();
      }
    });

    this.container.querySelector('#nextSentenceBtn').addEventListener('click', () => {
      if (this.currentSentenceIdx < this.getCurrentLesson().sentences.length - 1) {
        this.currentSentenceIdx++;
        this.userAudioUrl = null;
        this.render();
        this.bindEvents();
      }
    });

    this.container.querySelector('#shadowRecordBtn').addEventListener('click', () => {
      this.toggleRecordShadow();
    });

    const replayNative = this.container.querySelector('#replayNativeTrackBtn');
    if (replayNative) {
      replayNative.addEventListener('click', () => {
        this.playNativeSentence(1.0);
      });
    }

    const replayUser = this.container.querySelector('#replayUserTrackBtn');
    if (replayUser) {
      replayUser.addEventListener('click', () => {
        if (this.userAudioUrl) {
          audioRecorder.playAudio(this.userAudioUrl);
        }
      });
    }
  }

  playNativeSentence(rate = 1.0) {
    const sentence = this.getCurrentSentence();
    speechService.speak({
      text: sentence.text,
      rate
    });
  }

  async toggleRecordShadow() {
    const btn = this.container.querySelector('#shadowRecordBtn');
    const textSpan = this.container.querySelector('#shadowRecordText');
    const canvas = this.container.querySelector('#shadowWaveformCanvas');

    if (this.isRecording) {
      this.isRecording = false;
      btn.classList.remove('recording');
      textSpan.textContent = 'Record Your Shadow';
      speechService.stopListening();
      const recResult = await audioRecorder.stopRecording();
      if (recResult && recResult.url) {
        this.userAudioUrl = recResult.url;
        const grid = this.container.querySelector('#dualPlaybackGrid');
        if (grid) grid.style.display = 'grid';
      }
      return;
    }

    // Start recording
    this.isRecording = true;
    btn.classList.add('recording');
    textSpan.textContent = 'Stop Recording';
    this.userAudioUrl = null;

    try {
      await audioRecorder.startRecording(canvas);
    } catch (e) {
      alert('Microphone permission required for shadowing practice.');
      this.isRecording = false;
      btn.classList.remove('recording');
      textSpan.textContent = 'Record Your Shadow';
      return;
    }

    let capturedSpoken = '';
    speechService.startListening({
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        capturedSpoken = full;
      },
      onResult: (finalText) => {
        const spoken = finalText || capturedSpoken;
        this.evaluateShadow(spoken);
      }
    });
  }

  evaluateShadow(spoken) {
    const sentence = this.getCurrentSentence();
    const result = DiffEngine.evaluateSpeech({
      referenceText: sentence.text,
      spokenText: spoken
    });

    const box = this.container.querySelector('#shadowFeedbackBox');
    const scoreText = this.container.querySelector('#shadowScoreText');
    const scoreDetail = this.container.querySelector('#shadowScoreDetail');

    if (box && scoreText) {
      box.style.display = 'block';
      scoreText.textContent = `Accuracy: ${result.accuracy}%`;
      scoreDetail.textContent = `Spoken: "${spoken || 'Listening...'}"`;
      if (result.accuracy >= 80) {
        audioRecorder.playChime('success');
      }
    }

    storageService.recordActivity({
      words: sentence.text.split(' ').length,
      accuracy: result.accuracy
    });
  }
}
