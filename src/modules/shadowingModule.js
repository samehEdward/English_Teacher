// Shadowing & Rhythm Lab Module (EchoTalk Technique)
import { SHADOWING_LESSONS } from '../data/lessonsData.js';
import { GERMAN_SHADOWING_LESSONS } from '../data/lessonsData_de.js';
import { speechController, SpeakIntent } from '../core/speechController.js';
import { audioEngine } from '../core/audioEngine.js';
import { actionBar } from '../ui/actionBar.js';
import { statusStrip } from '../ui/statusStrip.js';
import { playLocalAudio } from '../ui/playback.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';

export class ShadowingModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.loadLessons();
    this.currentLessonIdx = 0;
    this.currentSentenceIdx = 0;
    this.isRecording = false;
    this.userAudioUrl = null;

    this.render();
    this.bindEvents();
  }

  loadLessons() {
    this.lessons = this.currentLang === 'de' ? GERMAN_SHADOWING_LESSONS : SHADOWING_LESSONS;
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
    // mirror so a re-mount starts from a clean state.
    this.isRecording = false;
    actionBar.setActions(null);
  }

  /**
   * Bottom-bar controls.
   *
   * Sentence navigation is deliberately NOT here: this module already has a
   * stepper-dot row for that, and the thumb bar is for practice actions. The
   * FAB drives speech recognition; "Aufnahme" is the separate MediaRecorder
   * pass for A/B playback. The two can never run at once - see
   * toggleRecordShadow().
   */
  publishActions() {
    const isDe = this.currentLang === 'de';

    actionBar.setActions({
      mic: {
        onStart: () => this.toggleRecordShadow(),
        onStop: () => this.toggleRecordShadow()
      },
      buttons: [
        {
          icon: 'play',
          label: isDe ? 'Nativ' : 'Native',
          ariaLabel: isDe ? 'Muttersprachler anhören' : 'Hear the native speaker',
          onClick: () => this.playNativeSentence(1.0)
        },
        {
          icon: 'slow',
          label: isDe ? 'Langsam' : 'Slow',
          ariaLabel: isDe ? 'Mit 0,75-facher Geschwindigkeit anhören' : 'Play at 0.75x speed',
          onClick: () => this.playNativeSentence(0.75)
        },
        {
          icon: 'save',
          label: isDe ? 'Aufnahme' : 'Record',
          ariaLabel: isDe ? 'Eigene Aufnahme zum Vergleich' : 'Record your own audio to compare',
          onClick: () => this.toggleRecordPlayback()
        }
      ]
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.loadLessons();
    this.currentLessonIdx = 0;
    this.currentSentenceIdx = 0;
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
    const isDe = this.currentLang === 'de';
    const lesson = this.getCurrentLesson();
    const sentence = this.getCurrentSentence();
    const totalSentences = lesson.sentences.length;

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${isDe ? 'Shadowing & Rhythmus-Labor' : 'Shadowing & Rhythm Lab'}</h2>
          <p class="section-subtitle">${isDe ? 'Muttersprachliche Satzmelodie, Sprechrhythmus und Akzentreduktion durch direktes auditives Shadowing trainieren.' : 'Train native cadence, vocal rhythm, and accent reduction by immediate auditory shadowing.'}</p>
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
            <span>💡 <strong>${isDe ? 'Rhythmus-Tipp:' : 'Cadence Tip:'}</strong></span>
            <span id="shadowTipText">${sentence.phoneticTip}</span>
          </div>
        </div>

        <!-- Audio Canvas Visualizer -->
        <canvas id="shadowWaveformCanvas" class="waveform-canvas" width="600" height="70"></canvas>

        <!-- Action Controls -->
        <div class="control-bar mobile-app-bar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="playNativeBtn" class="btn btn-accent" title="${isDe ? 'Nativ anhören (1.0x)' : 'Listen Native (1.0x)'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>
                <span class="btn-short-text">1.0x</span>
                <span class="btn-long-text">${isDe ? ' Nativ' : ' Native'}</span>
              </span>
            </button>
            <button id="playSlowBtn" class="btn btn-secondary btn-sm" title="${isDe ? 'Langsam anhören (0.75x)' : 'Listen at 0.75x'}">
              <span>🐢 0.75x</span>
            </button>
          </div>

          <button id="shadowRecordBtn" class="mic-action-btn mobile-fab-mic" title="${isDe ? 'Shadowing aufnehmen' : 'Record Your Shadow'}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            <span id="shadowRecordText">${isDe ? 'Shadow' : 'Shadow'}</span>
          </button>

          <!-- Second, separate pass: records audio for A/B playback WITHOUT
               speech recognition. Sequential by design - the two can never
               hold the microphone at the same time. -->
          <button id="shadowPlaybackRecBtn" class="btn btn-secondary btn-sm" title="${isDe ? 'Eigene Aufnahme für Vergleich' : 'Record your own audio to compare'}">
            <span>${isDe ? '⏺ Aufnahme' : '⏺ Record'}</span>
          </button>

          <div style="display: flex; gap: 6px;">
            <button id="prevSentenceBtn" class="btn btn-secondary btn-sm" ${this.currentSentenceIdx === 0 ? 'disabled' : ''} title="${isDe ? 'Vorheriger Satz' : 'Previous sentence'}">
              <span class="btn-short-text">←</span>
              <span class="btn-long-text">${isDe ? ' Zurück' : ' Prev'}</span>
            </button>
            <button id="nextSentenceBtn" class="btn btn-secondary btn-sm" ${this.currentSentenceIdx === totalSentences - 1 ? 'disabled' : ''} title="${isDe ? 'Nächster Satz' : 'Next sentence'}">
              <span class="btn-short-text">→</span>
              <span class="btn-long-text">${isDe ? ' Weiter' : ' Next'}</span>
            </button>
          </div>
        </div>

        <!-- Dual Audio Comparison Player -->
        <div class="dual-playback-grid" id="dualPlaybackGrid" style="display: ${this.userAudioUrl ? 'grid' : 'none'};">
          <div class="audio-track-box">
            <div class="track-label">
              <span>${isDe ? '🔊 Spur A: Muttersprachler-Referenz' : '🔊 Track A: Native Speaker Reference'}</span>
            </div>
            <button id="replayNativeTrackBtn" class="btn btn-secondary btn-sm">
              ${isDe ? 'Muttersprachler abspielen' : 'Play Native Speaker'}
            </button>
          </div>

          <div class="audio-track-box" style="border-color: rgba(99, 102, 241, 0.4);">
            <div class="track-label" style="color: #a5b4fc;">
              <span>${isDe ? '🎙️ Spur B: Ihre Aufnahme' : '🎙️ Track B: Your Recorded Voice'}</span>
            </div>
            <button id="replayUserTrackBtn" class="btn btn-primary btn-sm">
              ${isDe ? 'Ihre Aufnahme abspielen' : 'Play Your Recording'}
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

    const playbackRecBtn = this.container.querySelector('#shadowPlaybackRecBtn');
    if (playbackRecBtn) {
      playbackRecBtn.addEventListener('click', () => this.toggleRecordPlayback());
    }

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
          playLocalAudio(this.userAudioUrl);
        }
      });
    }
  }

  playNativeSentence(rate = 1.0) {
    const sentence = this.getCurrentSentence();
    speechController.speak({
      text: sentence.text,
      rate,
      intent: SpeakIntent.USER
    });
  }

  startWaveform(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;
    const draw = () => {
      if (!this.isRecording) {
        this.stopWaveform(canvas);
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
      const amp = this._capturedSpoken ? 16 : 8;
      for (let x = 0; x < width; x += 4) {
        const y = midY + Math.sin((x * 0.04) + phase) * amp * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += 0.12;
      this.waveformFrame = requestAnimationFrame(draw);
    };
    draw();
  }

  stopWaveform(canvas) {
    if (this.waveformFrame) {
      cancelAnimationFrame(this.waveformFrame);
      this.waveformFrame = null;
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

  /**
   * Shadowing capture — SPEECH RECOGNITION ONLY.
   *
   * v1 started MediaRecorder and SpeechRecognition against the same device
   * and papered over the Android collision with a user-agent sniff
   * (`_isMobileSession`), which still broke on Android tablets reporting a
   * desktop UA and on desktop Chrome with a single-channel USB mic.
   *
   * PRODUCT DECISION: scoring is the point of this exercise, so the mic goes
   * to speech recognition. The side-by-side playback recording is now a
   * separate, explicitly user-initiated pass (`toggleRecordPlayback`) that
   * runs without recognition. The two passes are sequential and can never
   * overlap, because speechController models LISTENING and RECORDING as
   * mutually exclusive states — the collision is unrepresentable rather than
   * merely avoided.
   */
  async toggleRecordShadow() {
    const btn = this.container.querySelector('#shadowRecordBtn');
    const textSpan = this.container.querySelector('#shadowRecordText');
    const canvas = this.container.querySelector('#shadowWaveformCanvas');
    const isDe = this.currentLang === 'de';

    const resetButton = () => {
      if (btn) btn.classList.remove('recording');
      if (textSpan) textSpan.textContent = isDe ? 'Shadow' : 'Shadow';
      this.isRecording = false;
      this.stopWaveform(canvas);
    };

    if (speechController.isListening()) {
      // Graceful stop: flushes buffered audio so the final transcript still
      // arrives through onResult.
      speechController.stopListening();
      return;
    }

    this._capturedSpoken = '';
    this.isRecording = true;
    if (btn) btn.classList.add('recording');
    if (textSpan) textSpan.textContent = isDe ? 'Stop' : 'Stop';

    // Simulated waveform: recognition owns the mic, so there is no stream to
    // analyse. Honest about what it is, and it costs nothing.
    this.startWaveform(canvas);

    const result = await speechController.listen({
      lang: speechController.recognitionLang(),
      continuous: true,
      interimResults: true,

      onInterim: ({ full }) => {
        this._capturedSpoken = full;
      },

      onResult: (finalText) => {
        const spoken = (finalText || this._capturedSpoken || '').trim();
        resetButton();
        if (spoken) this.evaluateShadow(spoken);
        speechController.finishProcessing();
      },

      onError: (err) => {
        // no-speech is routine hesitation, not a failure.
        if (err && err.error === 'no-speech') return;
        resetButton();
        statusStrip.showPermission(err && err.permission ? err.permission : 'denied', {
          onRetry: () => this.toggleRecordShadow()
        });
      },

      onEnd: () => {
        // Silence timeout with something captured but no final event.
        if (!this.isRecording) return;
        const spoken = (this._capturedSpoken || '').trim();
        resetButton();
        if (spoken) this.evaluateShadow(spoken);
      }
    });

    if (!result.ok) {
      resetButton();
      if (result.reason === 'permission') {
        statusStrip.showPermission(result.permission, {
          onRetry: () => this.toggleRecordShadow()
        });
      } else if (result.reason === 'stt-unsupported') {
        statusStrip.info(isDe
          ? 'Spracherkennung ist hier nicht verfügbar. Nutzen Sie die Aufnahme zum Vergleichen.'
          : 'Speech recognition is unavailable here. Use the recording pass to compare instead.');
      }
    }
  }

  /**
   * Second pass: record audio for the A/B playback comparison, with NO
   * recognition running. Separate button, separate user gesture, never
   * concurrent with toggleRecordShadow().
   */
  async toggleRecordPlayback() {
    const btn = this.container.querySelector('#shadowPlaybackRecBtn');
    const isDe = this.currentLang === 'de';
    const canvas = this.container.querySelector('#shadowWaveformCanvas');

    if (speechController.isRecording()) {
      const captured = await speechController.stopRecording();
      if (btn) btn.classList.remove('recording');
      if (captured && captured.url) {
        this.userAudioUrl = captured.url;
        const grid = this.container.querySelector('#dualPlaybackGrid');
        if (grid) grid.style.display = 'grid';
      }
      speechController.finishProcessing();
      return;
    }

    if (btn) btn.classList.add('recording');

    const result = await speechController.startRecording({
      canvas,
      onError: (err) => {
        if (btn) btn.classList.remove('recording');
        statusStrip.showPermission(err.permission || 'denied');
      }
    });

    if (!result.ok) {
      if (btn) btn.classList.remove('recording');
      if (result.reason === 'mic-busy-listening') {
        statusStrip.info(isDe
          ? 'Bitte zuerst die Spracherkennung beenden.'
          : 'Stop speech recognition first.');
      }
    }
  }

  evaluateShadow(spoken) {
    const isDe = this.currentLang === 'de';
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
      scoreText.textContent = `${isDe ? 'Genauigkeit:' : 'Accuracy:'} ${result.accuracy}%`;
      scoreDetail.textContent = `${isDe ? 'Gesprochen:' : 'Spoken:'} "${spoken || (isDe ? 'Höre zu...' : 'Listening...')}"`;
      if (result.accuracy >= 80) {
        audioEngine.playChime('success');
      }
    }

    storageService.recordActivity({
      words: sentence.text.split(' ').length,
      accuracy: result.accuracy
    });
  }
}
