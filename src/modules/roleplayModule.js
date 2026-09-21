// Situational Dialogue & Conversational Roleplay Module
import { ROLEPLAY_SCENARIOS } from '../data/lessonsData.js';
import { GERMAN_ROLEPLAY_SCENARIOS } from '../data/lessonsData_de.js';
import { speechController, SpeakIntent } from '../core/speechController.js';
import { audioEngine } from '../core/audioEngine.js';
import { actionBar } from '../ui/actionBar.js';
import { statusStrip } from '../ui/statusStrip.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class RoleplayModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.loadScenarios();
    this.currentScenarioIdx = 0;
    this.currentStepIdx = 0;
    this.chatHistory = [];
    this.isListening = false;
    this.activeSelectedPrompt = '';

    this.initScenario();
    this.render();
    this.bindEvents();
  }

  // == module lifecycle ====================================================

  mount() {
    this.render();
    this.bindEvents();
    this.publishActions();
    // Silent by contract. The opening line has its own replay button.
  }

  unmount() {
    this.isListening = false;
    actionBar.setActions(null);
  }

  publishActions() {
    const isDe = this.currentLang === 'de';

    actionBar.setActions({
      mic: { onStart: () => this.startDictation(), onStop: () => speechController.stopListening() },
      buttons: [
        { icon: 'replay', label: isDe ? 'Hören' : 'Listen', onClick: () => this.speakCurrentStep() },
        { icon: 'hint',   label: isDe ? 'Tipp'  : 'Hint',   onClick: () => this.revealHint() },
        { icon: 'send',   label: isDe ? 'Senden': 'Send',   onClick: () => this.sendFromInput() },
        { icon: 'reset',  label: isDe ? 'Neu'   : 'Reset',  onClick: () => { this.initScenario(); this.mount(); } }
      ]
    });
  }

  speakCurrentStep() {
    const step = this.getCurrentStep();
    if (!step || !step.aiSpeech) return;
    speechController.speak({ text: step.aiSpeech, rate: 0.95, intent: SpeakIntent.USER });
  }

  revealHint() {
    const step = this.getCurrentStep();
    const options = (step && (step.suggestedResponses || step.suggested)) || [];
    if (!options.length) return;

    const best = options[step.bestResponseIdx || 0] || options[0];
    const input = this.container.querySelector('#roleplayCustomInput');
    if (input) {
      input.value = best;
      this.activeSelectedPrompt = best;
      input.focus();
    }
  }

  sendFromInput() {
    const input = this.container.querySelector('#roleplayCustomInput');
    const text = (input && input.value.trim()) || this.activeSelectedPrompt;
    if (!text) {
      statusStrip.info(this.currentLang === 'de'
        ? 'Bitte zuerst antworten oder sprechen.'
        : 'Type or speak a reply first.');
      return;
    }
    this.handleUserSpokenReply(text);
  }

  async startDictation() {
    const input = this.container.querySelector('#roleplayCustomInput');

    const result = await speechController.listen({
      onInterim: ({ full }) => { if (input) input.value = full; },
      onResult: (transcript) => {
        if (input) input.value = transcript;
        this.activeSelectedPrompt = transcript;
        speechController.finishProcessing();
      },
      onError: (err) => {
        if (err && err.error === 'no-speech') return;
        if (err && err.permission) statusStrip.showPermission(err.permission);
      }
    });

    if (!result.ok && result.reason === 'permission') {
      statusStrip.showPermission(result.permission, { onRetry: () => this.startDictation() });
    }
  }

  loadScenarios() {
    this.scenarios = this.currentLang === 'de' ? GERMAN_ROLEPLAY_SCENARIOS : ROLEPLAY_SCENARIOS;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.loadScenarios();
    this.currentScenarioIdx = 0;
    this.currentStepIdx = 0;
    this.activeSelectedPrompt = '';
    this.initScenario();
    this.render();
    this.bindEvents();
  }

  getCurrentScenario() {
    return this.scenarios[this.currentScenarioIdx];
  }

  getCurrentStep() {
    const scenario = this.getCurrentScenario();
    return scenario.steps[this.currentStepIdx] || null;
  }

  initScenario() {
    this.currentStepIdx = 0;
    this.chatHistory = [];
    const step = this.getCurrentStep();
    if (step) {
      this.chatHistory.push({
        sender: 'ai',
        speaker: step.speaker,
        avatar: step.avatar,
        text: step.aiSpeech
      });
      // NO automatic speech here. initScenario() runs on construction, on
      // render and on language switch; speaking from it is exactly the rogue
      // TTS the rebuild removes. The opening line carries a replay button,
      // and speechController would refuse this call anyway (no gesture
      // window, no open turn).
    }
  }

  render() {
    const isDe = this.currentLang === 'de';
    const scenario = this.getCurrentScenario();
    const step = this.getCurrentStep();
    const isCompleted = this.currentStepIdx >= scenario.steps.length;

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${isDe ? 'Konversations- & Rollenspiel-Studio' : 'Conversational Roleplay Studio'}</h2>
          <p class="section-subtitle">${isDe ? 'Reale deutsche Gesprächssituationen mit interaktiven KI-Partnern simulieren.' : 'Simulate real-life spoken English interactions with conversational AI partners.'}</p>
        </div>
        <div class="section-actions">
          <select id="roleplaySelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.scenarios.map((sc, idx) => `
              <option value="${idx}" ${idx === this.currentScenarioIdx ? 'selected' : ''}>
                ${sc.icon} ${sc.title}
              </option>
            `).join('')}
          </select>
          <button id="restartScenarioBtn" class="btn btn-secondary btn-sm">
            ${isDe ? 'Neustart' : 'Restart'}
          </button>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Chat & Interaction Viewport -->
        <div class="practice-card glass-panel" style="padding: 20px;">
          <div class="card-header-bar" style="padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">${scenario.icon}</span>
              <div>
                <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${scenario.title}</h4>
                <div style="font-size: 13px; color: var(--text-muted);">${scenario.context}</div>
              </div>
            </div>
            <span class="badge badge-level">${isDe ? 'Schritt' : 'Step'} ${Math.min(this.currentStepIdx + 1, scenario.steps.length)} / ${scenario.steps.length}</span>
          </div>

          <!-- Chat messages stream -->
          <div class="chat-conversation" id="chatConversation">
            ${this.chatHistory.map(msg => `
              <div class="chat-bubble-wrap ${msg.sender}">
                <div class="chat-avatar">${msg.avatar}</div>
                <div class="chat-bubble">
                  <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">${msg.speaker}</div>
                  <div>${msg.text}</div>
                  ${msg.sender === 'ai' ? `
                    <button class="btn btn-secondary btn-sm replay-ai-speech" data-text="${encodeURIComponent(msg.text)}" style="margin-top: 8px; font-size: 11px; padding: 3px 8px;">
                      ${isDe ? '🔊 Anhören' : '🔊 Listen'}
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- User Reply Area -->
          ${!isCompleted && step ? `
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px; border-top: 1px solid var(--border-glass); padding-top: 16px;">
              <div style="font-size: 13px; font-weight: 600; color: #cbd5e1;">${isDe ? 'Vorgeschlagene Antworten (Klicken zum Auswählen):' : 'Suggested Responses (Click to select & speak):'}</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${step.suggestedResponses.map((resp, i) => `
                  <div class="suggested-reply-card ${this.activeSelectedPrompt === resp ? 'active-prompt' : ''}" data-text="${encodeURIComponent(resp)}">
                    <span>${resp}</span>
                    <button class="btn btn-secondary btn-sm speak-sample-btn" data-text="${encodeURIComponent(resp)}" style="font-size: 11px; padding: 2px 6px;">
                      🔊
                    </button>
                  </div>
                `).join('')}
              </div>

              <!-- Custom Reply & Mic Input Bar -->
              <div class="chat-bottom-input-bar">
                <input type="text" id="roleplayCustomInput" class="form-input" placeholder="${isDe ? 'Antwort eingeben...' : 'Type your reply...'}" value="${this.activeSelectedPrompt || ''}" enterkeyhint="send" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" />

                <button id="roleplayMicBtn" class="mic-action-btn mobile-fab-mic ${this.isListening ? 'recording' : ''}" title="${isDe ? 'Sprechen' : 'Speak'}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  <span id="roleplayMicText">${this.isListening ? (isDe ? 'Stop' : 'Stop') : (isDe ? 'Sprechen' : 'Speak')}</span>
                </button>

                <button id="roleplaySendBtn" class="btn btn-primary" title="${isDe ? 'Senden' : 'Send'}">
                  <span class="btn-short-text">↵</span>
                  <span class="btn-long-text">${isDe ? ' Senden' : ' Send'}</span>
                </button>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); min-height: 18px;" id="roleplayInterim"></div>
            </div>
          ` : `
            <div style="text-align: center; padding: 30px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3);">
              <h3 style="font-size: 20px; font-weight: 700; color: #34d399; margin-bottom: 8px;">🎉 ${isDe ? 'Dialog erfolgreich abgeschlossen!' : 'Dialogue Successfully Completed!'}</h3>
              <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">
                ${isDe ? 'Sie haben das Gespräch souverän geführt und Ihre Gedanken präzise ausgedrückt.' : 'You navigated this conversation naturally and expressed your points with clarity.'}
              </p>
              <button id="restartCompletedBtn" class="btn btn-primary">
                ${isDe ? 'Nochmal üben' : 'Practice Again'}
              </button>
            </div>
          `}
        </div>

        <!-- Right Dialogue Coach Guide -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px;">${isDe ? 'Gesprächsstrategie' : 'Conversation Strategy'}</h4>
            <ul style="font-size: 13px; color: var(--text-muted); line-height: 1.8; padding-left: 18px;">
              <li>${isDe ? 'Halten Sie ein gleichmäßiges Sprechtempo und nutzen Sie gezielte Pausen.' : 'Maintain steady vocal pace and do not rush through pauses.'}</li>
              <li>${isDe ? 'Bestätigen Sie das Gehörte vor der Antwort (z.B. "Vielen Dank", "Das ist ein wichtiger Punkt").' : 'Acknowledge the other speaker before answering (e.g. <em>"Thank you"</em>, <em>"That is a great question"</em>).'}</li>
              <li>${isDe ? 'Sprechen Sie deutlich in Richtung Ihres Mikrofons.' : 'Speak clearly toward your microphone.'}</li>
            </ul>
          </div>

          ${step ? `
            <div class="glass-panel" style="padding: 20px;">
              <h5 style="font-size: 14px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">${isDe ? 'Wichtiger Wortschatz & Schlüsselwörter:' : 'Target Vocabulary & Keywords:'}</h5>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${step.targetKeywords.map(kw => `
                  <span class="badge badge-cat">${kw}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Scroll chat to bottom
    const chat = this.container.querySelector('#chatConversation');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  bindEvents() {
    const scenarioSelect = this.container.querySelector('#roleplaySelect');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', (e) => {
        this.currentScenarioIdx = parseInt(e.target.value);
        this.initScenario();
        this.render();
        this.bindEvents();
      });
    }

    const restartBtn = this.container.querySelector('#restartScenarioBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.initScenario();
        this.render();
        this.bindEvents();
      });
    }

    const restartComp = this.container.querySelector('#restartCompletedBtn');
    if (restartComp) {
      restartComp.addEventListener('click', () => {
        this.initScenario();
        this.render();
        this.bindEvents();
      });
    }

    // Replay AI audio buttons
    this.container.querySelectorAll('.replay-ai-speech').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.dataset.text);
        speechController.speak({ text, rate: 0.95, intent: SpeakIntent.USER });
      });
    });

    // Speak suggested response audio sample
    this.container.querySelectorAll('.speak-sample-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = decodeURIComponent(e.currentTarget.dataset.text);
        speechController.speak({ text, rate: 0.9, intent: SpeakIntent.USER });
      });
    });

    // Select suggested response card
    this.container.querySelectorAll('.suggested-reply-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = decodeURIComponent(card.dataset.text);
        this.activeSelectedPrompt = text;
        const input = this.container.querySelector('#roleplayCustomInput');
        if (input) input.value = text;
        this.render();
        this.bindEvents();
      });
    });

    // Custom text input send
    const roleplayInput = this.container.querySelector('#roleplayCustomInput');
    const sendBtn = this.container.querySelector('#roleplaySendBtn');
    if (roleplayInput && sendBtn) {
      const handleSend = () => {
        const text = roleplayInput.value.trim();
        if (!text) return;
        this.handleUserSpokenReply(text);
      };
      sendBtn.addEventListener('click', handleSend);
      roleplayInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          handleSend();
        }
      });
    }

    // Mic action button
    const micBtn = this.container.querySelector('#roleplayMicBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.toggleRoleplaySpeaking();
      });
    }
  }

  toggleRoleplaySpeaking() {
    const isDe = this.currentLang === 'de';
    const btn = this.container.querySelector('#roleplayMicBtn');
    const btnText = this.container.querySelector('#roleplayMicText');
    const interimBox = this.container.querySelector('#roleplayInterim');

    if (this.isListening) {
      this.isListening = false;
      this._pendingRoleplayStop = true;
      btn.classList.remove('recording');
      btnText.textContent = isDe ? 'Sprechen' : 'Speak';
      speechController.stopListening();
      return;
    }

    this.isListening = true;
    this._pendingRoleplayStop = false;
    btn.classList.add('recording');
    btnText.textContent = isDe ? 'Stop' : 'Stop';
    interimBox.textContent = isDe ? 'Höre zu... Bitte sprechen.' : 'Listening... Speak now.';

    let spokenAccumulator = '';
    speechController.listen({
      lang: speechController.recognitionLang(),
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        spokenAccumulator = full;
        interimBox.textContent = full;
        const input = this.container.querySelector('#roleplayCustomInput');
        if (input) input.value = full;
      },
      onResult: (finalText) => {
        this._pendingRoleplayStop = false;
        const spoken = finalText || spokenAccumulator;
        const input = this.container.querySelector('#roleplayCustomInput');
        if (input && spoken) input.value = spoken;
        this.handleUserSpokenReply(spoken);
      },
      onError: () => {
        this.isListening = false;
        btn.classList.remove('recording');
        btnText.textContent = isDe ? 'Sprechen' : 'Speak';
      },
      onEnd: () => {
        // Safety net: if stop was pressed but onResult never fired (mobile flush delay),
        // fall back to the accumulated interim transcript
        if (this._pendingRoleplayStop) {
          this._pendingRoleplayStop = false;
          const spoken = (spokenAccumulator || '').trim();
          if (spoken.length > 0) {
            const input = this.container.querySelector('#roleplayCustomInput');
            if (input) input.value = spoken;
            this.handleUserSpokenReply(spoken);
          } else {
            if (interimBox) {
              interimBox.textContent = isDe 
                ? 'Keine Sprache erkannt. Bitte tippen Sie eine Antwort oder wählen Sie eine Vorlage.' 
                : 'No speech caught. Please type your response or select a suggested option.';
            }
          }
        }
      }
    });
  }

  handleUserSpokenReply(spoken) {
    const isDe = this.currentLang === 'de';
    this.isListening = false;
    const btn = this.container.querySelector('#roleplayMicBtn');
    const btnText = this.container.querySelector('#roleplayMicText');
    if (btn) btn.classList.remove('recording');
    if (btnText) btnText.textContent = isDe ? 'Sprechen' : 'Speak';

    const cleanSpoken = (spoken || '').trim() || (this.activeSelectedPrompt || '').trim();
    if (!cleanSpoken) {
      const interimBox = this.container.querySelector('#roleplayInterim');
      if (interimBox) {
        interimBox.textContent = isDe 
          ? 'Keine Sprache erkannt. Bitte tippen Sie eine Antwort oder wählen Sie eine Vorlage.' 
          : 'No speech caught. Please type your response or select a suggested option.';
      }
      return;
    }

    // Push user message
    this.chatHistory.push({
      sender: 'user',
      speaker: isDe ? 'Sie' : 'You',
      avatar: '🗣️',
      text: cleanSpoken
    });

    audioEngine.playChime('tap');
    this.activeSelectedPrompt = '';
    this.currentStepIdx++;

    const scenario = this.getCurrentScenario();
    if (this.currentStepIdx < scenario.steps.length) {
      const nextStep = scenario.steps[this.currentStepIdx];

      // The partner's reply is a direct consequence of the learner's turn, so
      // it is authorised with a one-shot turn id rather than a gesture. The
      // id is burned on use and voided by any reset(), so a reply queued
      // before the user navigated away can never fire afterwards.
      const turnId = speechController.openTurn();

      setTimeout(() => {
        this.chatHistory.push({
          sender: 'ai',
          speaker: nextStep.speaker,
          avatar: nextStep.avatar,
          text: nextStep.aiSpeech
        });
        this.render();
        this.bindEvents();
        speechController.speak({
          text: nextStep.aiSpeech,
          rate: 0.95,
          intent: SpeakIntent.TURN,
          turnId
        });
      }, 600);
    } else {
      setTimeout(() => {
        this.render();
        this.bindEvents();
        confetti({ particleCount: 70, spread: 60 });
        audioEngine.playChime('success');
      }, 400);
    }

    storageService.recordActivity({
      words: cleanSpoken.split(' ').length,
      accuracy: 90
    });

    this.render();
    this.bindEvents();
  }
}
