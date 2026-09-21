// Phonetics & Tongue Twister Gym Module
import { PHONETICS_DRILLS } from '../data/lessonsData.js';
import { GERMAN_PHONETICS_DRILLS } from '../data/lessonsData_de.js';
import { speechController, SpeakIntent } from '../core/speechController.js';
import { audioEngine } from '../core/audioEngine.js';
import { actionBar } from '../ui/actionBar.js';
import { statusStrip } from '../ui/statusStrip.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class PhoneticsModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.loadDrills();
    this.activeTab = 'minimalPairs'; // 'minimalPairs' | 'twisters'
    this.selectedPairCategoryIdx = 0;
    this.activeTestingPair = null;
    this.isTestingPair = false;
    this.isRecordingTwister = false;
    this.activeTwisterIdx = 0;

    this.render();
    this.bindEvents();
  }

  loadDrills() {
    this.drills = this.currentLang === 'de' ? GERMAN_PHONETICS_DRILLS : PHONETICS_DRILLS;
  }

  // == module lifecycle ====================================================

  mount() {
    this.render();
    this.bindEvents();
    this.publishActions();
  }

  unmount() {
    // main.js already called speechController.reset(); clear the view-local
    // mirrors so a re-mount starts from a clean state.
    this.isRecordingTwister = false;
    this.isTestingPair = false;
    this.activeTestingPair = null;
    actionBar.setActions(null);
  }

  /**
   * Bottom-bar controls, per tab.
   *
   * Minimal pairs has no bar-level microphone on purpose: a pair test is
   * always started from a specific word-pair card, so a bare FAB would have
   * no idea which pair to test. The FAB appears only on the tongue-twister
   * tab, where there is exactly one thing to say.
   */
  publishActions() {
    const isDe = this.currentLang === 'de';

    if (this.activeTab === 'minimalPairs') {
      const categories = (this.drills && this.drills.minimalPairs) || [];
      actionBar.setActions({
        mic: null,
        buttons: [
          {
            icon: 'next',
            label: isDe ? 'Kontrast' : 'Contrast',
            ariaLabel: isDe ? 'Nächster Lautkontrast' : 'Next sound contrast',
            disabled: categories.length < 2,
            onClick: () => this.cycleCategory()
          },
          {
            icon: 'play',
            label: isDe ? 'Zungen' : 'Twisters',
            ariaLabel: isDe ? 'Zu den Zungenbrechern wechseln' : 'Switch to tongue twisters',
            onClick: () => this.setTab('twisters')
          }
        ]
      });
      return;
    }

    const twisters = (this.drills && this.drills.tongueTwisters) || [];
    actionBar.setActions({
      mic: {
        onStart: () => this.toggleTwisterRecord(),
        onStop: () => this.toggleTwisterRecord()
      },
      buttons: [
        {
          icon: 'volume',
          label: 'Demo',
          ariaLabel: isDe ? 'Zungenbrecher anhören' : 'Hear the tongue twister',
          onClick: () => {
            const twister = twisters[this.activeTwisterIdx];
            if (!twister) return;
            speechController.speak({ text: twister.text, rate: 0.9, intent: SpeakIntent.USER });
          }
        },
        {
          icon: 'next',
          label: isDe ? 'Nächster' : 'Next',
          disabled: twisters.length < 2,
          onClick: () => this.cycleTwister()
        },
        {
          icon: 'prev',
          label: isDe ? 'Paare' : 'Pairs',
          ariaLabel: isDe ? 'Zu den Minimalpaaren wechseln' : 'Switch to minimal pairs',
          onClick: () => this.setTab('minimalPairs')
        }
      ]
    });
  }

  /** Single path for switching tabs, so the bar always matches the view. */
  setTab(tab) {
    if (tab === this.activeTab) return;
    speechController.reset('phonetics-tab');
    this.activeTab = tab;
    this.render();
    this.bindEvents();
    this.publishActions();
  }

  cycleCategory() {
    const categories = (this.drills && this.drills.minimalPairs) || [];
    if (categories.length < 2) return;
    speechController.reset('phonetics-category');
    this.selectedPairCategoryIdx = (this.selectedPairCategoryIdx + 1) % categories.length;
    this.render();
    this.bindEvents();
    this.publishActions();
  }

  cycleTwister() {
    const twisters = (this.drills && this.drills.tongueTwisters) || [];
    if (twisters.length < 2) return;
    speechController.reset('phonetics-twister');
    this.activeTwisterIdx = (this.activeTwisterIdx + 1) % twisters.length;
    this.render();
    this.bindEvents();
    this.publishActions();
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.loadDrills();
    this.selectedPairCategoryIdx = 0;
    this.activeTwisterIdx = 0;
    this.render();
    this.bindEvents();
  }

  render() {
    const isDe = this.currentLang === 'de';

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${isDe ? 'Phonetik- & Zungenbrecher-Gym' : 'Phonetics & Accent Gym'}</h2>
          <p class="section-subtitle">${isDe ? 'Schwierige deutsche Laute trainieren, Minimalpaare meistern und Sprechmuskeln mit Zungenbrechern schulen.' : 'Target tricky English sounds, master minimal pairs, and build vocal agility with tongue twisters.'}</p>
        </div>
        <div class="section-actions">
          <button id="tabPairsBtn" class="btn ${this.activeTab === 'minimalPairs' ? 'btn-primary' : 'btn-secondary'} btn-sm">
            ${isDe ? 'Minimalpaare' : 'Minimal Pairs'}
          </button>
          <button id="tabTwistersBtn" class="btn ${this.activeTab === 'twisters' ? 'btn-primary' : 'btn-secondary'} btn-sm">
            ${isDe ? 'Zungenbrecher' : 'Tongue Twisters'}
          </button>
        </div>
      </div>

      ${this.activeTab === 'minimalPairs' ? this.renderMinimalPairsView() : this.renderTwistersView()}
    `;
  }

  renderMinimalPairsView() {
    const isDe = this.currentLang === 'de';
    const currentCategory = this.drills.minimalPairs[this.selectedPairCategoryIdx];

    return `
      <div class="studio-grid">
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <select id="contrastSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
              ${this.drills.minimalPairs.map((cat, idx) => `
                <option value="${idx}" ${idx === this.selectedPairCategoryIdx ? 'selected' : ''}>
                  ${isDe ? 'Kontrast' : 'Contrast'}: ${cat.contrast}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Articulation Guide Tip -->
          <div style="padding: 16px 20px; border-radius: var(--radius-md); background: rgba(99, 102, 241, 0.12); border-left: 4px solid #6366f1;">
            <div style="font-size: 14px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">👅 ${isDe ? 'Artikulationstechnik:' : 'Articulation Technique:'}</div>
            <div style="font-size: 14px; color: #e2e8f0;">${currentCategory.tip}</div>
          </div>

          <!-- Minimal Pairs Cards Grid -->
          <div class="minimal-pairs-grid">
            ${currentCategory.pairs.map((pair, pIdx) => `
              <div class="pair-card">
                <div class="pair-words">
                  <span style="color: #38bdf8;">${pair.wordA}</span>
                  <span class="vs-badge">VS</span>
                  <span style="color: #d946ef;">${pair.wordB}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary btn-sm play-word-btn" data-word="${pair.wordA}" style="flex: 1;">
                    🔊 ${pair.wordA}
                  </button>
                  <button class="btn btn-secondary btn-sm play-word-btn" data-word="${pair.wordB}" style="flex: 1;">
                    🔊 ${pair.wordB}
                  </button>
                </div>
                <button class="btn btn-accent btn-sm test-pair-btn" data-a="${pair.wordA}" data-b="${pair.wordB}" style="width: 100%;">
                  🎙️ ${isDe ? 'Aussprache-Test' : 'Pronunciation Test'}
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Test Feedback Modal/Box -->
          <div id="pairTestBox" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(10, 15, 26, 0.85); border: 1px solid var(--border-active); margin-top: 10px;">
            <div style="font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;" id="pairTestTitle"></div>
            <div id="pairTestResult" style="font-size: 16px; font-weight: 700; color: #34d399;"></div>
          </div>
        </div>

        <!-- Right Sound Anatomy Column -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 12px;">${isDe ? 'Warum Minimalpaare?' : 'Why Minimal Pairs?'}</h4>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.7;">
              ${isDe ? 'Minimalpaare sind Wortpaare, die sich durch nur einen einzigen Laut unterscheiden. Nicht-Muttersprachler verwechseln diese häufig mit Lauten ihrer Muttersprache.' : 'Minimal pairs are pairs of words that differ by only one single sound. Non-native speakers often substitute their native phonemes, leading to confusion.'}
            </p>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.7; margin-top: 10px;">
              ${isDe ? 'Durch das direkte Üben gegensätzlicher Paare schärfen Sie Ihr Gehör für feine Frequenzen und trainieren die exakte Zungen- und Lippenhaltung.' : 'By practicing contrasting pairs back-to-back, your ear attunes to the acoustic frequency and your vocal tract learns the exact muscular placement.'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderTwistersView() {
    const isDe = this.currentLang === 'de';
    const twister = this.drills.tongueTwisters[this.activeTwisterIdx];

    return `
      <div class="studio-grid">
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge badge-level">${twister.difficulty}</span>
              <span style="font-size: 14px; color: var(--text-muted);">${twister.targetSound}</span>
            </div>
            <select id="twisterSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
              ${this.drills.tongueTwisters.map((t, idx) => `
                <option value="${idx}" ${idx === this.activeTwisterIdx ? 'selected' : ''}>
                  ${t.title}
                </option>
              `).join('')}
            </select>
          </div>

          <div style="padding: 28px; background: rgba(10, 15, 26, 0.7); border-radius: var(--radius-md); border-left: 4px solid #d946ef; font-size: 22px; font-weight: 600; line-height: 1.7; color: #fff;">
            "${twister.text}"
          </div>

          <div class="control-bar mobile-app-bar">
            <button id="playTwisterBtn" class="btn btn-accent" title="${isDe ? 'Demonstration anhören' : 'Listen Demonstration'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>
                <span class="btn-short-text">Demo</span>
                <span class="btn-long-text">${isDe ? ' anhören' : ' Listen'}</span>
              </span>
            </button>

            <button id="twisterRecordBtn" class="mic-action-btn mobile-fab-mic" title="${isDe ? 'Tempo-Drill starten' : 'Start Speed Drill'}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="twisterRecordText">${isDe ? 'Drill' : 'Drill'}</span>
            </button>
          </div>

          <div id="twisterFeedback" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
            <div style="font-size: 16px; font-weight: 700; color: #34d399;" id="twisterAccuracyScore"></div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;" id="twisterSpokenResult"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px;">${isDe ? 'Regeln für den Zungenbrecher-Drill' : 'Speed Drill Rules'}</h4>
            <ol style="font-size: 13px; color: var(--text-muted); line-height: 1.8; padding-left: 18px;">
              <li>${isDe ? 'Beginnen Sie langsam mit deutlicher Konsonantenbildung.' : 'Start slow: focus on crisp consonant closure.'}</li>
              <li>${isDe ? 'Steigern Sie schrittweise das Tempo bei entspannter Zunge.' : 'Gradually increase tempo while keeping your tongue loose.'}</li>
              <li>${isDe ? 'Zielen Sie auf 90%+ Treffergenauigkeit ab.' : 'Aim for 90%+ accuracy without stumbling over syllables.'}</li>
            </ol>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('#tabPairsBtn').addEventListener('click', () => {
      this.setTab('minimalPairs');
    });

    this.container.querySelector('#tabTwistersBtn').addEventListener('click', () => {
      this.setTab('twisters');
    });

    if (this.activeTab === 'minimalPairs') {
      const contrastSelect = this.container.querySelector('#contrastSelect');
      if (contrastSelect) {
        contrastSelect.addEventListener('change', (e) => {
          speechController.reset('phonetics-category');
          this.selectedPairCategoryIdx = parseInt(e.target.value);
          this.render();
          this.bindEvents();
          this.publishActions();
        });
      }

      this.container.querySelectorAll('.play-word-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const word = e.currentTarget.dataset.word;
          speechController.speak({ text: word, rate: 0.85, intent: SpeakIntent.USER });
        });
      });

      this.container.querySelectorAll('.test-pair-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const wordA = e.currentTarget.dataset.a;
          const wordB = e.currentTarget.dataset.b;
          this.startPairTest(wordA, wordB);
        });
      });
    } else {
      const twisterSelect = this.container.querySelector('#twisterSelect');
      if (twisterSelect) {
        twisterSelect.addEventListener('change', (e) => {
          speechController.reset('phonetics-twister');
          this.activeTwisterIdx = parseInt(e.target.value);
          this.render();
          this.bindEvents();
          this.publishActions();
        });
      }

      const playBtn = this.container.querySelector('#playTwisterBtn');
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          const twister = this.drills.tongueTwisters[this.activeTwisterIdx];
          speechController.speak({ text: twister.text, rate: 0.9, intent: SpeakIntent.USER });
        });
      }

      const recordBtn = this.container.querySelector('#twisterRecordBtn');
      if (recordBtn) {
        recordBtn.addEventListener('click', () => {
          this.toggleTwisterRecord();
        });
      }
    }
  }

  startPairTest(wordA, wordB) {
    const isDe = this.currentLang === 'de';
    const box = this.container.querySelector('#pairTestBox');
    const title = this.container.querySelector('#pairTestTitle');
    const result = this.container.querySelector('#pairTestResult');

    box.style.display = 'block';
    title.textContent = isDe 
      ? `Sprechen Sie entweder "${wordA}" oder "${wordB}" deutlich ins Mikrofon:` 
      : `Say either "${wordA}" or "${wordB}" into the microphone:`;
    result.textContent = isDe ? 'Höre zu... Jetzt sprechen!' : 'Listening... Speak now!';

    speechController.listen({
      lang: speechController.recognitionLang(),
      continuous: false,
      interimResults: false,
      onResult: (spoken) => {
        const cleanSpoken = (spoken || '').trim().toLowerCase();
        if (!cleanSpoken) return;
        const simA = DiffEngine.wordSimilarity(cleanSpoken, wordA);
        const simB = DiffEngine.wordSimilarity(cleanSpoken, wordB);

        if (simA > simB && simA >= 0.7) {
          result.textContent = isDe ? `🎯 Erkannt: "${wordA}"! Sehr präzise Aussprache!` : `🎯 Detected: "${wordA}"! Clear articulation!`;
          result.style.color = '#34d399';
          audioEngine.playChime('success');
        } else if (simB > simA && simB >= 0.7) {
          result.textContent = isDe ? `🎯 Erkannt: "${wordB}"! Sehr präzise Aussprache!` : `🎯 Detected: "${wordB}"! Clear articulation!`;
          result.style.color = '#34d399';
          audioEngine.playChime('success');
        } else {
          result.textContent = isDe 
            ? `Erkannt: "${cleanSpoken}". Betonen Sie den Unterschied zwischen "${wordA}" und "${wordB}" noch klarer.` 
            : `Detected: "${cleanSpoken}". Try to distinguish the vowel or consonant more crisply.`;
          result.style.color = '#fbbf24';
          audioEngine.playChime('tap');
        }
      
        // Release the state machine: without this the FSM parks in
        // PROCESSING and the status strip never clears.
        speechController.finishProcessing();
      },
      onError: (err) => {
        if (err && err.error === 'no-speech') return;
        if (err && err.permission) {
          statusStrip.showPermission(err.permission, {
            onRetry: () => this.startPairTest(wordA, wordB)
          });
          return;
        }
        result.textContent = isDe ? 'Konnte leider nicht deutlich verstanden werden. Bitte erneut versuchen.' : 'Could not catch that clearly. Please try again.';
      }
    });
  }

  toggleTwisterRecord() {
    const isDe = this.currentLang === 'de';
    const btn = this.container.querySelector('#twisterRecordBtn');
    const btnText = this.container.querySelector('#twisterRecordText');
    const feedback = this.container.querySelector('#twisterFeedback');
    const scoreText = this.container.querySelector('#twisterAccuracyScore');
    const spokenText = this.container.querySelector('#twisterSpokenResult');
    const twister = this.drills.tongueTwisters[this.activeTwisterIdx];

    if (this.isRecordingTwister) {
      this.isRecordingTwister = false;
      btn.classList.remove('recording');
      btnText.textContent = isDe ? 'Drill' : 'Drill';
      speechController.stopListening();
      return;
    }

    this.isRecordingTwister = true;
    btn.classList.add('recording');
    btnText.textContent = isDe ? 'Stop' : 'Stop';
    feedback.style.display = 'none';

    let captured = '';
    speechController.listen({
      lang: speechController.recognitionLang(),
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        captured = full;
      },
      onResult: (finalText) => {
        const spoken = finalText || captured;
        this.isRecordingTwister = false;
        btn.classList.remove('recording');
        btnText.textContent = isDe ? 'Drill' : 'Drill';

        if (!spoken || !spoken.trim()) return;

        const evalResult = DiffEngine.evaluateSpeech({
          referenceText: twister.text,
          spokenText: spoken
        });

        feedback.style.display = 'block';
        scoreText.textContent = `${isDe ? 'Tempo-Drill Genauigkeit' : 'Speed Drill Accuracy'}: ${evalResult.accuracy}% (${evalResult.wordsPerMinute} WPM)`;
        spokenText.textContent = `${isDe ? 'Gesprochen' : 'Spoken'}: "${spoken}"`;

        if (evalResult.accuracy >= 80) {
          audioEngine.playChime('success');
          confetti({ particleCount: 50, spread: 50 });
        } else {
          audioEngine.playChime('tap');
        }

        storageService.recordActivity({
          words: twister.text.split(' ').length,
          accuracy: evalResult.accuracy
        });
      
        // Release the state machine: without this the FSM parks in
        // PROCESSING and the status strip never clears.
        speechController.finishProcessing();
      },
      onError: (err) => {
        if (err && err.error === 'no-speech') return;
        if (err && err.permission) {
          statusStrip.showPermission(err.permission, {
            onRetry: () => this.toggleTwisterRecord()
          });
        }
        this.isRecordingTwister = false;
        btn.classList.remove('recording');
        btnText.textContent = isDe ? 'Drill' : 'Drill';
      }
    });
  }
}
