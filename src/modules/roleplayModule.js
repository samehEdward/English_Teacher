// Situational Dialogue & Conversational Roleplay Module
import { ROLEPLAY_SCENARIOS } from '../data/lessonsData.js';
import { speechService } from '../services/speechService.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { DiffEngine } from '../services/diffEngine.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class RoleplayModule {
  constructor(container) {
    this.container = container;
    this.scenarios = ROLEPLAY_SCENARIOS;
    this.currentScenarioIdx = 0;
    this.currentStepIdx = 0;
    this.chatHistory = [];
    this.isListening = false;
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
      // Optionally speak initial greeting
      setTimeout(() => {
        speechService.speak({ text: step.aiSpeech, rate: 0.95 });
      }, 400);
    }
  }

  render() {
    const scenario = this.getCurrentScenario();
    const step = this.getCurrentStep();
    const isCompleted = this.currentStepIdx >= scenario.steps.length;

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">Conversational Roleplay Studio</h2>
          <p class="section-subtitle">Simulate real-life spoken English interactions with conversational AI partners.</p>
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
            Restart
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
            <span class="badge badge-level">Step ${Math.min(this.currentStepIdx + 1, scenario.steps.length)} / ${scenario.steps.length}</span>
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
                      🔊 Listen
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- User Reply Area -->
          ${!isCompleted && step ? `
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px; border-top: 1px solid var(--border-glass); padding-top: 16px;">
              <div style="font-size: 13px; font-weight: 600; color: #cbd5e1;">Suggested Responses (Click to select & speak):</div>
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

              <!-- Speaking Trigger -->
              <div class="control-bar" style="margin-top: 8px;">
                <div style="font-size: 13px; color: var(--text-muted);" id="roleplayInterim">
                  ${this.activeSelectedPrompt ? 'Selected line ready. Press Speak to respond.' : 'Choose a line above or speak freely...'}
                </div>
                <button id="roleplayMicBtn" class="mic-action-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  <span id="roleplayMicText">Speak Response</span>
                </button>
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 30px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3);">
              <h3 style="font-size: 20px; font-weight: 700; color: #34d399; margin-bottom: 8px;">🎉 Dialogue Successfully Completed!</h3>
              <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">
                You navigated this conversation naturally and expressed your points with clarity.
              </p>
              <button id="restartCompletedBtn" class="btn btn-primary">
                Practice Again
              </button>
            </div>
          `}
        </div>

        <!-- Right Dialogue Coach Guide -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px;">Conversation Strategy</h4>
            <ul style="font-size: 13px; color: var(--text-muted); line-height: 1.8; padding-left: 18px;">
              <li>Maintain steady vocal pace and do not rush through pauses.</li>
              <li>Acknowledge the other speaker before answering (e.g. <em>"Thank you"</em>, <em>"That is a great question"</em>).</li>
              <li>Speak clearly toward your microphone.</li>
            </ul>
          </div>

          ${step ? `
            <div class="glass-panel" style="padding: 20px;">
              <h5 style="font-size: 14px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">Target Vocabulary & Keywords:</h5>
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
        speechService.speak({ text, rate: 0.95 });
      });
    });

    // Speak suggested response audio sample
    this.container.querySelectorAll('.speak-sample-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = decodeURIComponent(e.currentTarget.dataset.text);
        speechService.speak({ text, rate: 0.9 });
      });
    });

    // Select suggested response card
    this.container.querySelectorAll('.suggested-reply-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = decodeURIComponent(card.dataset.text);
        this.activeSelectedPrompt = text;
        this.render();
        this.bindEvents();
      });
    });

    // Mic action button
    const micBtn = this.container.querySelector('#roleplayMicBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.toggleRoleplaySpeaking();
      });
    }
  }

  toggleRoleplaySpeaking() {
    const btn = this.container.querySelector('#roleplayMicBtn');
    const btnText = this.container.querySelector('#roleplayMicText');
    const interimBox = this.container.querySelector('#roleplayInterim');

    if (this.isListening) {
      this.isListening = false;
      btn.classList.remove('recording');
      btnText.textContent = 'Speak Response';
      speechService.stopListening();
      return;
    }

    this.isListening = true;
    btn.classList.add('recording');
    btnText.textContent = 'Listening... Speak now';
    interimBox.textContent = 'Listening... Speak your reply aloud.';

    let spokenAccumulator = '';
    speechService.startListening({
      continuous: true,
      interimResults: true,
      onInterim: ({ full }) => {
        spokenAccumulator = full;
        interimBox.textContent = full;
      },
      onResult: (finalText) => {
        const spoken = finalText || spokenAccumulator;
        this.handleUserSpokenReply(spoken);
      },
      onError: () => {
        this.isListening = false;
        btn.classList.remove('recording');
        btnText.textContent = 'Speak Response';
      }
    });
  }

  handleUserSpokenReply(spoken) {
    this.isListening = false;
    const btn = this.container.querySelector('#roleplayMicBtn');
    const btnText = this.container.querySelector('#roleplayMicText');
    if (btn) btn.classList.remove('recording');
    if (btnText) btnText.textContent = 'Speak Response';

    const cleanSpoken = spoken.trim() || this.activeSelectedPrompt || 'I understand.';

    // Push user message
    this.chatHistory.push({
      sender: 'user',
      speaker: 'You',
      avatar: '🗣️',
      text: cleanSpoken
    });

    audioRecorder.playChime('tap');
    this.activeSelectedPrompt = '';
    this.currentStepIdx++;

    const scenario = this.getCurrentScenario();
    if (this.currentStepIdx < scenario.steps.length) {
      const nextStep = scenario.steps[this.currentStepIdx];
      setTimeout(() => {
        this.chatHistory.push({
          sender: 'ai',
          speaker: nextStep.speaker,
          avatar: nextStep.avatar,
          text: nextStep.aiSpeech
        });
        this.render();
        this.bindEvents();
        speechService.speak({ text: nextStep.aiSpeech, rate: 0.95 });
      }, 600);
    } else {
      setTimeout(() => {
        this.render();
        this.bindEvents();
        confetti({ particleCount: 70, spread: 60 });
        audioRecorder.playChime('success');
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
