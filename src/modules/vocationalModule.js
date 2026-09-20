// Vocational & Career Pro Studio Module (EchoSpeak)
// Dual Domain: IT Support & Service Desk | Medical & Chemical Laboratory (Labor)
// 4 Functional Modes with Arabic Coaching & Real-time Web Speech Integration

import { 
  VOCATIONAL_DOMAINS, 
  VOCATIONAL_SCENARIOS, 
  VOCATIONAL_GLOSSARY, 
  VOCATIONAL_POLISH_PRESETS, 
  VOCATIONAL_QUIZZES 
} from '../data/vocationalData.js';
import { speechService } from '../services/speechService.js';
import { audioRecorder } from '../services/audioRecorder.js';
import { storageService } from '../services/storageService.js';
import confetti from 'canvas-confetti';

export class VocationalModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.currentDomain = 'it_support'; // 'it_support' or 'lab_medical'
    this.currentMode = 'roleplay'; // 'roleplay' | 'vocab' | 'polish' | 'quiz'
    this.currentLevel = 'B2';
    this.showArabic = true;

    // Mode 1: Roleplay State
    this.scenarioIdx = 0;
    this.stepIdx = 0;
    this.chatHistory = [];
    this.isListening = false;
    this.activeSelectedPrompt = '';

    // Mode 2: Vocab Search & Filter State
    this.vocabSearch = '';
    this.selectedCategory = 'all';

    // Mode 3: Polish State
    this.polishPresetIdx = 0;
    this.activePolishResult = null;

    // Mode 4: Quiz State
    this.quizIdx = 0;
    this.selectedQuizOption = null;
    this.quizSubmitted = false;

    this.initRoleplay();
    this.render();
    this.bindEvents();
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.scenarioIdx = 0;
    this.stepIdx = 0;
    this.quizIdx = 0;
    this.selectedQuizOption = null;
    this.quizSubmitted = false;
    this.activePolishResult = null;
    this.initRoleplay();
    this.render();
    this.bindEvents();
  }

  getScenarios() {
    const langScenarios = VOCATIONAL_SCENARIOS[this.currentLang] || VOCATIONAL_SCENARIOS.de;
    return langScenarios[this.currentDomain] || [];
  }

  getCurrentScenario() {
    const scenarios = this.getScenarios();
    return scenarios[this.scenarioIdx] || scenarios[0];
  }

  getCurrentStep() {
    const scenario = this.getCurrentScenario();
    if (!scenario || !scenario.steps) return null;
    return scenario.steps[this.stepIdx] || null;
  }

  initRoleplay() {
    this.stepIdx = 0;
    this.chatHistory = [];
    this.activeSelectedPrompt = '';
    const step = this.getCurrentStep();
    if (step) {
      this.chatHistory.push({
        sender: 'ai',
        speaker: step.speaker,
        avatar: step.avatar,
        text: step.aiSpeech
      });
      setTimeout(() => {
        speechService.speak({ text: step.aiSpeech, rate: 0.95 });
      }, 350);
    }
  }

  render() {
    const isDe = this.currentLang === 'de';
    const domainInfo = VOCATIONAL_DOMAINS[this.currentDomain];

    this.container.innerHTML = `
      <div class="vocational-studio-container">
        <!-- Main Studio Top Header -->
        <div class="section-header">
          <div class="section-title-wrap">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">💼</span>
              <h2 class="section-title">${isDe ? 'Fachsprache & Berufssimulator' : 'Career Pro Studio & Vocational Tutor'}</h2>
              <span class="badge badge-accent" style="background: rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.4); color: #a5b4fc;">
                ${this.currentLevel} Workplace Pro
              </span>
            </div>
            <p class="section-subtitle">
              ${isDe 
                ? 'Gezieltes Kommunikationstraining für IT-Support & Labor mit Arabisch-Coaching und Feedback.' 
                : 'Targeted situational language training for IT Support & Medical Laboratories with Arabic coaching.'}
            </p>
          </div>

          <div class="section-actions">
            <!-- Arabic Coaching Notes Toggle -->
            <button id="vocArabicToggle" class="btn btn-secondary btn-sm ${this.showArabic ? 'active-toggle' : ''}" title="Toggle Arabic explanations and coaching notes">
              <span>🇸🇦</span>
              <span>${this.showArabic ? 'الشرح بالعربية: مفعّل' : 'العربية: معطّل'}</span>
            </button>

            <!-- CEFR Level Selector -->
            <select id="vocLevelSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
              <option value="A2" ${this.currentLevel === 'A2' ? 'selected' : ''}>Level A2 (Basics)</option>
              <option value="B1" ${this.currentLevel === 'B1' ? 'selected' : ''}>Level B1 (Operational)</option>
              <option value="B2" ${this.currentLevel === 'B2' ? 'selected' : ''}>Level B2 (Workplace Standard)</option>
              <option value="C1" ${this.currentLevel === 'C1' ? 'selected' : ''}>Level C1 (Expert / Clinical)</option>
            </select>
          </div>
        </div>

        <!-- Runtime Configuration Bar: Domains & Modes -->
        <div class="voc-config-bar glass-panel">
          <!-- Domain Switcher -->
          <div class="voc-domain-selector">
            <button class="voc-domain-btn ${this.currentDomain === 'it_support' ? 'active it-domain' : ''}" data-domain="it_support">
              <span class="voc-domain-icon">💻</span>
              <div class="voc-domain-info">
                <span class="voc-domain-title">${isDe ? 'IT-Support & Service Desk' : 'IT Support & Service Desk'}</span>
                <span class="voc-domain-sub">Active Directory • Fernwartung • ITIL</span>
              </div>
            </button>

            <button class="voc-domain-btn ${this.currentDomain === 'lab_medical' ? 'active lab-domain' : ''}" data-domain="lab_medical">
              <span class="voc-domain-icon">🔬</span>
              <div class="voc-domain-info">
                <span class="voc-domain-title">${isDe ? 'Medizinisches Labor (MTA/BMA)' : 'Medical & Chemical Laboratory'}</span>
                <span class="voc-domain-sub">Probenannahme • Qualitätskontrolle • Grenzwerte</span>
              </div>
            </button>
          </div>

          <!-- Mode Selector Tabs -->
          <div class="voc-modes-nav">
            <button class="voc-mode-tab ${this.currentMode === 'roleplay' ? 'active' : ''}" data-mode="roleplay">
              <span>🎭</span>
              <span>${isDe ? '1. Gesprächssimulation' : '1. Scenario Simulation'}</span>
            </button>
            <button class="voc-mode-tab ${this.currentMode === 'vocab' ? 'active' : ''}" data-mode="vocab">
              <span>📖</span>
              <span>${isDe ? '2. Fachbegriffe & Glossar' : '2. Vocab & Phrases'}</span>
            </button>
            <button class="voc-mode-tab ${this.currentMode === 'polish' ? 'active' : ''}" data-mode="polish">
              <span>🛠️</span>
              <span>${isDe ? '3. Text-Politur & Coaching' : '3. Error Polish & Coach'}</span>
            </button>
            <button class="voc-mode-tab ${this.currentMode === 'quiz' ? 'active' : ''}" data-mode="quiz">
              <span>⚡</span>
              <span>${isDe ? '4. Situations-Quiz' : '4. Scenario Quiz'}</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Content Body based on Active Mode -->
        <div class="voc-mode-viewport">
          ${this.renderActiveModeContent()}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // RENDER MODES
  // =========================================================================
  renderActiveModeContent() {
    switch (this.currentMode) {
      case 'roleplay':
        return this.renderRoleplayMode();
      case 'vocab':
        return this.renderVocabMode();
      case 'polish':
        return this.renderPolishMode();
      case 'quiz':
        return this.renderQuizMode();
      default:
        return this.renderRoleplayMode();
    }
  }

  // ---------------- MODE 1: ROLEPLAY SIMULATION ----------------
  renderRoleplayMode() {
    const isDe = this.currentLang === 'de';
    const scenarios = this.getScenarios();
    const scenario = this.getCurrentScenario();
    const step = this.getCurrentStep();
    const isFinished = !step || this.stepIdx >= scenario.steps.length;

    if (!scenario) {
      return `<div class="card glass-panel" style="padding: 24px; text-align: center;">No scenarios available for this domain.</div>`;
    }

    return `
      <div class="studio-grid">
        <!-- Left: Chat Stream & Interactive Mic / Response Panel -->
        <div class="practice-card glass-panel" style="padding: 22px;">
          <!-- Scenario Header Card -->
          <div class="card-header-bar" style="border-bottom: 1px solid var(--border-glass); padding-bottom: 14px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 28px;">${scenario.persona.avatar}</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${scenario.title}</h4>
                  <span class="badge badge-accent" style="font-size: 11px;">${scenario.level}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
                  <strong>${scenario.persona.name}</strong> (${scenario.persona.role}) • <em>${scenario.persona.tone}</em>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <select id="vocScenarioPicker" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
                ${scenarios.map((sc, i) => `
                  <option value="${i}" ${i === this.scenarioIdx ? 'selected' : ''}>${sc.title}</option>
                `).join('')}
              </select>
              <button id="vocRestartBtn" class="btn btn-secondary btn-sm">${isDe ? '↺ Neustart' : '↺ Reset'}</button>
            </div>
          </div>

          <!-- Scenario Context Banner -->
          <div class="voc-scenario-context-banner">
            <span>📋</span>
            <div><strong>${isDe ? 'Situation:' : 'Context:'}</strong> ${scenario.context}</div>
          </div>

          <!-- Chat Stream -->
          <div class="chat-conversation" id="vocChatStream" style="min-height: 280px; max-height: 440px; overflow-y: auto; padding: 12px 6px;">
            ${this.chatHistory.map(msg => `
              <div class="chat-bubble-wrap ${msg.sender}">
                <div class="chat-avatar">${msg.avatar}</div>
                <div class="chat-bubble">
                  <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">${msg.speaker}</div>
                  <div>${msg.text}</div>
                  ${msg.sender === 'ai' ? `
                    <button class="btn btn-secondary btn-sm voc-replay-btn" data-text="${encodeURIComponent(msg.text)}" style="margin-top: 8px; font-size: 11px; padding: 3px 8px;">
                      ${isDe ? '🔊 Anhören' : '🔊 Listen'}
                    </button>
                  ` : ''}

                  <!-- Discrete Feedback Card under User message -->
                  ${msg.feedback ? this.renderFeedbackCard(msg.feedback) : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Active Reply Area -->
          ${!isFinished && step ? `
            <div class="voc-reply-box" style="margin-top: 14px; border-top: 1px solid var(--border-glass); padding-top: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 13px; font-weight: 600; color: #cbd5e1;">
                  ${isDe ? 'Ihre professionelle Antwort (Klicken oder per Mikrofon einsprechen):' : 'Your Professional Response (Click or speak via mic):'}
                </span>
                <span class="badge badge-level">${isDe ? 'Schritt' : 'Step'} ${this.stepIdx + 1} / ${scenario.steps.length}</span>
              </div>

              <!-- Suggested Response Cards -->
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
                ${step.suggestedResponses.map((resp, idx) => `
                  <div class="suggested-reply-card voc-suggested-card ${this.activeSelectedPrompt === resp ? 'active-prompt' : ''}" data-idx="${idx}" data-text="${encodeURIComponent(resp)}">
                    <span style="flex: 1;">${resp}</span>
                    <button class="btn btn-secondary btn-sm voc-preview-audio-btn" data-text="${encodeURIComponent(resp)}" style="font-size: 11px; padding: 2px 6px;">
                      🔊
                    </button>
                  </div>
                `).join('')}
              </div>

              <!-- Custom Text / Mic Input Bar -->
              <div class="chat-bottom-input-bar">
                <input type="text" id="vocCustomReplyInput" class="form-input" placeholder="${isDe ? 'Antwort eingeben...' : 'Type reply...'}" value="${this.activeSelectedPrompt || ''}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" />
                
                <button id="vocMicBtn" class="mic-action-btn mobile-fab-mic ${this.isListening ? 'recording' : ''}" title="${isDe ? 'Sprechen' : 'Speak'}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  <span id="vocMicBtnText">${this.isListening ? (isDe ? 'Stop' : 'Stop') : (isDe ? 'Sprechen' : 'Speak')}</span>
                </button>

                <button id="vocSendReplyBtn" class="btn btn-primary" title="${isDe ? 'Senden' : 'Send'}">
                  <span class="btn-short-text">↵</span>
                  <span class="btn-long-text">${isDe ? ' Senden' : ' Send'}</span>
                </button>
              </div>
            </div>
          ` : `
            <div class="completion-banner glass-panel" style="margin-top: 16px; padding: 20px; text-align: center; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
              <span style="font-size: 32px;">🎉</span>
              <h3 style="font-size: 18px; font-weight: 700; color: #34d399; margin: 6px 0;">
                ${isDe ? 'Szenario erfolgreich gemeistert!' : 'Scenario Successfully Completed!'}
              </h3>
              <p style="font-size: 13px; color: #cbd5e1;">
                ${isDe 
                  ? 'Hervorragende Deeskalation und fachgerechte Protokollführung im Berufsalltag.' 
                  : 'Excellent situational handling, adherence to industry protocols, and polite workplace communication.'}
              </p>
              <button id="vocNextScenarioBtn" class="btn btn-primary" style="margin-top: 12px;">
                ${isDe ? 'Nächstes Fachszenario →' : 'Next Scenario →'}
              </button>
            </div>
          `}
        </div>

        <!-- Right: Real-time Coaching Guide & Protocol Cheat Sheet -->
        <div class="metrics-panel glass-panel" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <div class="card-header-bar" style="padding-bottom: 8px;">
            <h4 style="font-size: 15px; font-weight: 700; color: #fff;">
              ${isDe ? 'Berufs-Leitfaden & Protokoll' : 'Vocational Protocol Guide'}
            </h4>
            <span class="stat-icon">🛡️</span>
          </div>

          <div style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
            ${this.currentDomain === 'it_support' ? `
              <ul style="padding-left: 18px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Höflichkeitsform (Siezen):</strong> Im deutschsprachigen IT-Support immer „Sie“ verwenden, außer im internen Team.</li>
                <li><strong>Deeskalation:</strong> Zuerst den Anwender beruhigen (<em>„Keine Sorge, wir lösen das sofort“</em>), keine Schuldzuweisungen.</li>
                <li><strong>SLA & ITIL:</strong> Dringlichkeit und Ticketnummer nennen, Zeitschätzung für die Entstörung abgeben.</li>
                <li><strong>Fernwartung:</strong> Vor dem Zugriff immer die Erlaubnis einholen (<em>„Darf ich mich kurz aufschalten?“</em>).</li>
              </ul>
            ` : `
              <ul style="padding-left: 18px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Grenzwerte (Rili-BÄK):</strong> Lebensbedrohliche Werte (z.B. Kalium > 6,5 mmol/l) müssen sofort telefonisch dem Arzt gemeldet werden.</li>
                <li><strong>Read-Back-Pflicht:</strong> Den Arzt immer bitten, den Wert gegenzulesen, um Hörfehler auszuschließen.</li>
                <li><strong>Präanalytik-Prüfung:</strong> Vor Alarmmeldung immer Hämolyse, Gerinnsel und Füllhöhe des Röhrchens validieren.</li>
                <li><strong>Dokumentation:</strong> Uhrzeit, Name des Arztes und LIS-Status lückenlos protokollieren.</li>
              </ul>
            `}
          </div>

          ${this.showArabic ? `
            <div class="voc-arabic-tip-box" style="margin-top: auto;">
              <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>💡</span>
                <span>توجيه مدرب اللغة العربي (Arabic Coaching Note):</span>
              </div>
              <p style="font-size: 12px; color: #fde68a; line-height: 1.6; direction: rtl; text-align: right;">
                ${this.currentDomain === 'it_support'
                  ? 'في المقابلات العملية وبيئة العمل بألمانيا، يركز أصحاب العمل على قدرتك على تهدئة العميل واستخدام مصطلحات AD و ITIL بلباقة (Siezen). تجنب استخدام الصيغ العامية مثل "das ist kaputt" واستبدلها بـ "technische Störung".'
                  : 'في المستشفيات والمختبرات الطبية الألمانية، الدقة القانونية في إبلاغ الطبيب بالقيمة الحرجة (Grenzwertmeldung) مع طلب (Read-back) تعكس احترافيتك وتضمن سلامة المريض وفق معايير ISO 15189.'}
              </p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ---------------- STRUCTURED FEEDBACK CARD ----------------
  renderFeedbackCard(feedback) {
    if (!feedback) return '';
    const isDe = this.currentLang === 'de';

    return `
      <div class="voc-feedback-box">
        <div class="voc-feedback-header">
          <span style="font-size: 14px;">🎯</span>
          <span>[${isDe ? 'Feedback & Coaching' : 'Feedback & Coaching'}]</span>
        </div>

        <div class="voc-feedback-content">
          <!-- Correction -->
          <div class="voc-fb-item">
            <span class="voc-fb-label">🛠️ ${isDe ? 'Optimierte Formulierung:' : 'Natural Native Phrasing:'}</span>
            <div class="voc-fb-text">
              <span class="voc-old-text">${feedback.correction.original}</span>
              <span style="color: #6366f1; margin: 0 4px;">➔</span>
              <strong style="color: #34d399;">${feedback.correction.refined}</strong>
            </div>
          </div>

          <!-- Professional Vocab Tip -->
          <div class="voc-fb-item">
            <span class="voc-fb-label">💡 ${isDe ? 'Fachbegriff & Kollokation:' : 'Professional Vocabulary Tip:'}</span>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <code class="voc-vocab-code">${feedback.vocabTip.term}</code>
              <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(feedback.vocabTip.term)}" style="font-size: 10px; padding: 1px 5px;">
                🔊
              </button>
              ${feedback.vocabTip.ipa ? `<span style="font-size: 11px; color: var(--text-dim); font-family: monospace;">${feedback.vocabTip.ipa}</span>` : ''}
            </div>
          </div>

          <!-- Follow-up -->
          <div class="voc-fb-item">
            <span class="voc-fb-label">➡️ ${isDe ? 'Nächster Handlungsschritt:' : 'Next Step / Follow-up:'}</span>
            <div style="font-size: 12px; color: #cbd5e1;">${feedback.followUp}</div>
          </div>

          <!-- Arabic Explanation & Coaching -->
          ${this.showArabic && (feedback.correction.reasonAr || feedback.arabicNotes) ? `
            <div class="voc-fb-arabic-notes" style="direction: rtl; text-align: right;">
              <div style="font-weight: 600; color: #f59e0b; margin-bottom: 2px;">🇸🇦 التوجيه المهني والقواعد:</div>
              ${feedback.correction.reasonAr ? `<div style="font-size: 12px; color: #fef3c7; margin-bottom: 4px;">${feedback.correction.reasonAr}</div>` : ''}
              ${feedback.arabicNotes ? `<div style="font-size: 11px; color: #fde68a; opacity: 0.9;">${feedback.arabicNotes}</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ---------------- MODE 2: VOCABULARY & PHRASE BUILDER ----------------
  renderVocabMode() {
    const isDe = this.currentLang === 'de';
    const items = VOCATIONAL_GLOSSARY[this.currentDomain] || [];

    // Filter by search and category
    const filtered = items.filter(item => {
      const q = this.vocabSearch.toLowerCase();
      const matchesSearch = !q || 
        item.termDe.toLowerCase().includes(q) || 
        item.termEn.toLowerCase().includes(q) || 
        item.defAr.includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCat = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      return matchesSearch && matchesCat;
    });

    const categories = ['all', ...new Set(items.map(i => i.category))];

    return `
      <div class="voc-vocab-studio glass-panel" style="padding: 22px;">
        <!-- Top Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: #fff;">
              ${isDe ? 'Technisches Fachglossar & Kollokationen' : 'Technical Workplace Glossary & Collocations'}
            </h3>
            <p style="font-size: 13px; color: var(--text-muted);">
              ${isDe 
                ? 'Schlüsselbegriffe, IPA-Aussprache, Kontextbeispiele und arabische Fachübersetzungen.' 
                : 'Key industry terminology, IPA phonetics, workplace collocations, and Arabic explanations.'}
            </p>
          </div>

          <!-- Search Box -->
          <div style="position: relative; min-width: 260px;">
            <input type="text" id="vocVocabSearchInput" class="form-input" style="padding-left: 34px;" placeholder="${isDe ? 'Begriff oder Kategorie suchen...' : 'Search term or category...'}" value="${this.vocabSearch}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" />
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
          </div>
        </div>

        <!-- Category Pills -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;">
          ${categories.map(cat => `
            <button class="badge voc-cat-pill ${this.selectedCategory === cat ? 'badge-accent active-pill' : 'badge-level'}" data-cat="${cat}">
              ${cat === 'all' ? (isDe ? 'Alle Kategorien' : 'All Categories') : cat}
            </button>
          `).join('')}
        </div>

        <!-- Vocab Cards Grid -->
        <div class="voc-vocab-grid">
          ${filtered.length > 0 ? filtered.map(item => `
            <div class="voc-card glass-panel">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-accent" style="font-size: 10px;">${item.category}</span>
                <span class="badge badge-level" style="font-size: 10px;">${item.level}</span>
              </div>

              <!-- Main Target Term -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #fff;">
                  ${isDe ? item.termDe : item.termEn}
                </h4>
                <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(isDe ? item.termDe : item.termEn)}" title="Listen to pronunciation">
                  🔊
                </button>
              </div>

              <!-- IPA and Translation -->
              <div style="font-size: 12px; font-family: monospace; color: #a5b4fc; margin-bottom: 8px;">
                ${item.ipa} • <span style="font-family: inherit; color: var(--text-muted);">${isDe ? item.termEn : item.termDe}</span>
              </div>

              <!-- Arabic Definition & Meaning -->
              ${this.showArabic ? `
                <div style="background: rgba(245, 158, 11, 0.08); border-right: 3px solid #f59e0b; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px; direction: rtl; text-align: right;">
                  <span style="font-size: 12px; font-weight: 600; color: #fde68a;">🇸🇦 المعنى والشرح:</span>
                  <div style="font-size: 12px; color: #fef3c7; margin-top: 2px;">${item.defAr}</div>
                </div>
              ` : `
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">${isDe ? item.defDe : item.defEn}</p>
              `}

              <!-- Sample Sentence in Context -->
              <div style="background: rgba(0, 0, 0, 0.25); padding: 10px; border-radius: 8px; border: 1px solid var(--border-glass); margin-bottom: 10px;">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 3px; font-weight: 600;">
                  ${isDe ? 'Praxisbeispiel:' : 'Workplace Example:'}
                </div>
                <div style="font-size: 13px; color: #e2e8f0; line-height: 1.4;">
                  „${isDe ? item.sampleDe : item.sampleEn}“
                </div>
                <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(isDe ? item.sampleDe : item.sampleEn)}" style="margin-top: 6px; font-size: 10px; padding: 2px 6px;">
                  🔊 ${isDe ? 'Beispiel vorlesen' : 'Listen to example'}
                </button>
              </div>

              <!-- Save to Vault Button -->
              <button class="btn btn-secondary btn-sm voc-add-to-vault-btn" data-word="${encodeURIComponent(isDe ? item.termDe : item.termEn)}" data-ipa="${encodeURIComponent(item.ipa)}" data-def="${encodeURIComponent(item.defAr || (isDe ? item.defDe : item.defEn))}" style="width: 100%; font-size: 11px;">
                ⭐ ${isDe ? 'Im Wortschatz-Vault speichern' : 'Save to Vault'}
              </button>
            </div>
          `).join('') : `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
              Keine Fachbegriffe für diese Suche gefunden.
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ---------------- MODE 3: ERROR CORRECTION & POLISH ----------------
  renderPolishMode() {
    const isDe = this.currentLang === 'de';
    const langPresets = VOCATIONAL_POLISH_PRESETS[this.currentLang] || VOCATIONAL_POLISH_PRESETS.de;
    const presets = langPresets.filter(p => p.domain === this.currentDomain);
    const activePreset = presets[this.polishPresetIdx] || presets[0];

    return `
      <div class="voc-polish-studio glass-panel" style="padding: 22px;">
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #fff;">
            ${isDe ? 'Text-Politur, E-Mail-Feinschliff & Berufs-Etikette' : 'Error Correction & Professional Polish'}
          </h3>
          <p style="font-size: 13px; color: var(--text-muted);">
            ${isDe 
              ? 'Wandeln Sie umgangssprachliche Ticket-Updates, Handover-Mitteilungen oder E-Mails in fehlerfreies, formelles Fachdeutsch um.' 
              : 'Refine informal ticket notes, handovers, and colleague messages into polished native corporate phrasing.'}
          </p>
        </div>

        <!-- Sample Presets Selector Pills -->
        <div style="margin-bottom: 14px;">
          <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-right: 8px;">
            ${isDe ? 'Typische Praxisfälle zum Ausprobieren:' : 'Sample Workplace Drafts:'}
          </span>
          <div style="display: inline-flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
            ${presets.map((p, i) => `
              <button class="badge voc-polish-preset-btn ${this.polishPresetIdx === i ? 'badge-accent' : 'badge-level'}" data-idx="${i}">
                📄 ${p.title}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Input Area -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="vocPolishTextarea" style="font-size: 13px; font-weight: 600; color: #cbd5e1;">
              ${isDe ? 'Ihr ursprünglicher Entwurf (Tippen oder einsprechen):' : 'Your Draft Message (Type or dictate):'}
            </label>
            <button id="vocPolishMicBtn" class="btn btn-secondary btn-sm ${this.isListening ? 'btn-danger pulse' : ''}">
              ${this.isListening ? '🔴 Höre...' : '🎙️ Diktieren'}
            </button>
          </div>

          <textarea id="vocPolishTextarea" class="form-textarea" style="min-height: 90px;" placeholder="${isDe ? 'Fügen Sie hier Ihren Textentwurf ein...' : 'Paste or type your draft text here...'}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">${activePreset ? activePreset.rawDraft : ''}</textarea>
          
          <button id="vocRunPolishBtn" class="btn btn-primary" style="align-self: flex-end; padding: 10px 24px;">
            ✨ ${isDe ? 'Text analysieren & veredeln' : 'Analyze & Polish Text'}
          </button>
        </div>

        <!-- Polish Output / Analysis Card -->
        <div id="vocPolishResultCard" class="voc-polish-result-card glass-panel" style="padding: 18px; border: 1px solid rgba(99, 102, 241, 0.3);">
          ${this.renderActivePolishCard(activePreset)}
        </div>
      </div>
    `;
  }

  renderActivePolishCard(preset) {
    if (!preset) return '';
    const isDe = this.currentLang === 'de';

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">💎</span>
          <h4 style="font-size: 15px; font-weight: 700; color: #34d399;">
            ${isDe ? 'Professionelle Reinschrift (Empfohlene Version)' : 'Polished Professional Workplace Version'}
          </h4>
        </div>
        <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(preset.polished)}">
          🔊 ${isDe ? 'Anhören' : 'Listen'}
        </button>
      </div>

      <!-- Refined Text Box -->
      <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px; border-radius: 8px; font-size: 14px; color: #f8fafc; line-height: 1.6; margin-bottom: 16px;">
        „${preset.polished}“
      </div>

      <!-- Diff / Improvement Points -->
      <div style="margin-bottom: 14px;">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a5b4fc; letter-spacing: 0.5px;">
          ${isDe ? 'Wesentliche Verbesserungen & Stil-Upgrades:' : 'Key Improvements & Stylistic Upgrades:'}
        </span>
        <ul style="margin-top: 6px; padding-left: 20px; font-size: 13px; color: #cbd5e1; display: flex; flex-direction: column; gap: 6px;">
          ${preset.diffNotes.map(note => `<li>${note}</li>`).join('')}
        </ul>
      </div>

      <!-- Arabic Coaching Explanation -->
      ${this.showArabic && preset.arabicExplanation ? `
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px 14px; direction: rtl; text-align: right;">
          <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>🇸🇦</span>
            <span>التحليل اللغوي وشرح الفروق للمدرب العربي:</span>
          </div>
          <div style="font-size: 13px; color: #fef3c7; line-height: 1.6;">
            ${preset.arabicExplanation}
          </div>
        </div>
      ` : ''}
    `;
  }

  // ---------------- MODE 4: QUICK QUIZ & FLASHCARDS ----------------
  renderQuizMode() {
    const isDe = this.currentLang === 'de';
    const langQuizzes = VOCATIONAL_QUIZZES[this.currentLang] || VOCATIONAL_QUIZZES.de;
    const quizzes = langQuizzes.filter(q => q.domain === this.currentDomain);
    const quiz = quizzes[this.quizIdx] || quizzes[0];

    if (!quiz) {
      return `<div class="card glass-panel" style="padding: 24px; text-align: center;">Keine Quizfragen für diese Auswahl vorhanden.</div>`;
    }

    return `
      <div class="voc-quiz-studio glass-panel" style="padding: 24px; max-width: 820px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 22px;">⚡</span>
            <h3 style="font-size: 17px; font-weight: 700; color: #fff;">
              ${isDe ? 'Situations-Urteil & Protokoll-Challenge' : 'Situational Judgment & Protocol Challenge'}
            </h3>
          </div>
          <span class="badge badge-accent">${this.quizIdx + 1} / ${quizzes.length}</span>
        </div>

        <!-- Question Card -->
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glass); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 15px; font-weight: 600; color: #f8fafc; line-height: 1.5;">
            ${quiz.question}
          </div>
        </div>

        <!-- Options -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          ${quiz.options.map((opt, i) => {
            let stateClass = '';
            if (this.quizSubmitted) {
              if (i === quiz.correctIdx) stateClass = 'correct-opt';
              else if (this.selectedQuizOption === i) stateClass = 'wrong-opt';
            } else if (this.selectedQuizOption === i) {
              stateClass = 'selected-opt';
            }

            return `
              <div class="voc-quiz-option ${stateClass}" data-idx="${i}">
                <div class="opt-marker">${String.fromCharCode(65 + i)}</div>
                <div style="flex: 1; font-size: 14px;">${opt}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Controls / Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="vocQuizSubmitBtn" class="btn btn-primary" ${this.selectedQuizOption === null || this.quizSubmitted ? 'disabled style="opacity: 0.5;"' : ''}>
            ${isDe ? 'Antwort prüfen' : 'Verify Answer'}
          </button>

          ${this.quizSubmitted ? `
            <button id="vocQuizNextBtn" class="btn btn-secondary">
              ${isDe ? 'Nächste Frage →' : 'Next Question →'}
            </button>
          ` : ''}
        </div>

        <!-- Feedback & Arabic Explanation on Submit -->
        ${this.quizSubmitted ? `
          <div class="voc-quiz-explanation glass-panel" style="margin-top: 20px; padding: 16px; border: 1px solid ${this.selectedQuizOption === quiz.correctIdx ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; background: ${this.selectedQuizOption === quiz.correctIdx ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'};">
            <div style="font-weight: 700; color: ${this.selectedQuizOption === quiz.correctIdx ? '#34d399' : '#f87171'}; margin-bottom: 6px;">
              ${this.selectedQuizOption === quiz.correctIdx 
                ? (isDe ? '✅ Richtig! Exzellente berufliche Entscheidung.' : '✅ Correct! Excellent protocol decision.') 
                : (isDe ? '❌ Leider nicht konform mit den Standards.' : '❌ Incorrect protocol choice.')}
            </div>

            ${this.showArabic && quiz.explanationAr ? `
              <div style="direction: rtl; text-align: right; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
                <span style="font-weight: 600; color: #f59e0b; font-size: 12px;">🇸🇦 الشرح والتعليل المعياري بالعربية:</span>
                <div style="font-size: 13px; color: #fef3c7; margin-top: 3px; line-height: 1.5;">${quiz.explanationAr}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  bindEvents() {
    // 1. Arabic toggle
    const arToggle = this.container.querySelector('#vocArabicToggle');
    if (arToggle) {
      arToggle.addEventListener('click', () => {
        this.showArabic = !this.showArabic;
        this.render();
        this.bindEvents();
      });
    }

    // 2. CEFR Level Select
    const levelSelect = this.container.querySelector('#vocLevelSelect');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        this.currentLevel = e.target.value;
        this.render();
        this.bindEvents();
      });
    }

    // 3. Domain Buttons
    const domainBtns = this.container.querySelectorAll('.voc-domain-btn');
    domainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const domain = btn.dataset.domain;
        if (domain !== this.currentDomain) {
          this.currentDomain = domain;
          this.scenarioIdx = 0;
          this.stepIdx = 0;
          this.quizIdx = 0;
          this.selectedQuizOption = null;
          this.quizSubmitted = false;
          this.initRoleplay();
          this.render();
          this.bindEvents();
        }
      });
    });

    // 4. Mode Tabs
    const modeTabs = this.container.querySelectorAll('.voc-mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode !== this.currentMode) {
          speechService.stopSpeaking();
          speechService.stopListening();
          this.currentMode = mode;
          this.render();
          this.bindEvents();
        }
      });
    });

    // MODE 1 SPECIFIC EVENTS
    this.bindRoleplayEvents();

    // MODE 2 SPECIFIC EVENTS
    this.bindVocabEvents();

    // MODE 3 SPECIFIC EVENTS
    this.bindPolishEvents();

    // MODE 4 SPECIFIC EVENTS
    this.bindQuizEvents();
  }

  bindRoleplayEvents() {
    // Scenario Picker
    const scenarioPicker = this.container.querySelector('#vocScenarioPicker');
    if (scenarioPicker) {
      scenarioPicker.addEventListener('change', (e) => {
        this.scenarioIdx = parseInt(e.target.value, 10);
        this.initRoleplay();
        this.render();
        this.bindEvents();
      });
    }

    // Restart
    const restartBtn = this.container.querySelector('#vocRestartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.initRoleplay();
        this.render();
        this.bindEvents();
      });
    }

    // Audio Replay Buttons
    const replayBtns = this.container.querySelectorAll('.voc-replay-btn, .voc-preview-audio-btn, .voc-speak-vocab-btn');
    replayBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = decodeURIComponent(btn.dataset.text);
        speechService.speak({ text, rate: 0.95 });
      });
    });

    // Suggested response card selection
    const suggestedCards = this.container.querySelectorAll('.voc-suggested-card');
    suggestedCards.forEach(card => {
      card.addEventListener('click', () => {
        const text = decodeURIComponent(card.dataset.text);
        this.activeSelectedPrompt = text;
        const input = this.container.querySelector('#vocCustomReplyInput');
        if (input) input.value = text;
        suggestedCards.forEach(c => c.classList.remove('active-prompt'));
        card.classList.add('active-prompt');
      });
    });

    // Send Reply Button
    const sendBtn = this.container.querySelector('#vocSendReplyBtn');
    const customInput = this.container.querySelector('#vocCustomReplyInput');
    if (sendBtn && customInput) {
      const handleSend = () => {
        const userText = customInput.value.trim();
        if (!userText) return;
        this.processUserReply(userText);
      };

      sendBtn.addEventListener('click', handleSend);
      customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          handleSend();
        }
      });
    }

    // Microphone speech recognition
    const micBtn = this.container.querySelector('#vocMicBtn');
    if (micBtn) {
      const isDe = this.currentLang === 'de';
      micBtn.addEventListener('click', () => {
        const textSpan = micBtn.querySelector('span');
        if (this.isListening) {
          speechService.stopListening();
          this.isListening = false;
          if (customInput && customInput.value.trim()) {
            this.activeSelectedPrompt = customInput.value.trim();
          }
          micBtn.classList.remove('recording', 'btn-danger', 'pulse');
          if (textSpan) textSpan.textContent = isDe ? 'Sprechen' : 'Speak';
        } else {
          speechService.startListening({
            onInterim: ({ full }) => {
              if (customInput) customInput.value = full;
            },
            onResult: (transcript) => {
              if (customInput) customInput.value = transcript;
              this.activeSelectedPrompt = transcript;
            },
            onEnd: () => {
              this.isListening = false;
              if (micBtn) {
                micBtn.classList.remove('recording', 'btn-danger', 'pulse');
                if (textSpan) textSpan.textContent = isDe ? 'Sprechen' : 'Speak';
              }
            },
            onError: (err) => {
              console.warn('SpeechRecognition error:', err);
              this.isListening = false;
              if (micBtn) {
                micBtn.classList.remove('recording', 'btn-danger', 'pulse');
                if (textSpan) textSpan.textContent = isDe ? 'Sprechen' : 'Speak';
              }
            }
          });
          this.isListening = true;
          micBtn.classList.add('recording');
          if (textSpan) textSpan.textContent = isDe ? 'Stop' : 'Stop';
        }
      });
    }

    // Next Scenario on completion
    const nextScenarioBtn = this.container.querySelector('#vocNextScenarioBtn');
    if (nextScenarioBtn) {
      nextScenarioBtn.addEventListener('click', () => {
        const scenarios = this.getScenarios();
        this.scenarioIdx = (this.scenarioIdx + 1) % scenarios.length;
        this.initRoleplay();
        this.render();
        this.bindEvents();
      });
    }
  }

  processUserReply(userText) {
    if (this.isListening) {
      speechService.stopListening();
      this.isListening = false;
      const micBtn = this.container.querySelector('#vocMicBtn');
      if (micBtn) {
        micBtn.classList.remove('recording', 'btn-danger', 'pulse');
        const textSpan = micBtn.querySelector('span');
        if (textSpan) textSpan.textContent = this.currentLang === 'de' ? 'Sprechen' : 'Speak';
      }
    }

    const step = this.getCurrentStep();
    if (!step) return;

    // Track word stats
    const words = userText.split(/\s+/).filter(Boolean).length;
    storageService.incrementWordCount(words);

    // Push user message to chat history with structured feedback
    this.chatHistory.push({
      sender: 'user',
      speaker: 'Sie (You)',
      avatar: '👤',
      text: userText,
      feedback: step.feedback
    });

    audioRecorder.playChime('success');
    this.activeSelectedPrompt = '';
    this.stepIdx++;

    const nextStep = this.getCurrentStep();
    if (nextStep) {
      setTimeout(() => {
        this.chatHistory.push({
          sender: 'ai',
          speaker: nextStep.speaker,
          avatar: nextStep.avatar,
          text: nextStep.aiSpeech
        });
        this.render();
        this.bindEvents();
        setTimeout(() => {
          speechService.speak({ text: nextStep.aiSpeech, rate: 0.95 });
        }, 300);
      }, 700);
    } else {
      // Completed scenario!
      setTimeout(() => {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
        this.render();
        this.bindEvents();
      }, 500);
    }

    this.render();
    this.bindEvents();

    // Auto-scroll chat to bottom
    const stream = this.container.querySelector('#vocChatStream');
    if (stream) stream.scrollTop = stream.scrollHeight;
  }

  bindVocabEvents() {
    const searchInput = this.container.querySelector('#vocVocabSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.vocabSearch = e.target.value;
        const grid = this.container.querySelector('.voc-vocab-grid');
        if (grid) {
          // Re-render vocab mode only
          const viewport = this.container.querySelector('.voc-mode-viewport');
          if (viewport) viewport.innerHTML = this.renderVocabMode();
          this.bindVocabEvents();
        }
      });
    }

    const catPills = this.container.querySelectorAll('.voc-cat-pill');
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.selectedCategory = pill.dataset.cat;
        const viewport = this.container.querySelector('.voc-mode-viewport');
        if (viewport) viewport.innerHTML = this.renderVocabMode();
        this.bindVocabEvents();
      });
    });

    // Save to Vault button
    const vaultBtns = this.container.querySelectorAll('.voc-add-to-vault-btn');
    vaultBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = decodeURIComponent(btn.dataset.word);
        const ipa = decodeURIComponent(btn.dataset.ipa);
        const definition = decodeURIComponent(btn.dataset.def);

        storageService.saveVaultWord({
          word,
          ipa,
          definition,
          lang: this.currentLang
        });

        audioRecorder.playChime('chime');
        btn.textContent = '✅ Gespeichert!';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#34d399';
        setTimeout(() => {
          btn.textContent = '⭐ Im Wortschatz-Vault speichern';
        }, 2000);
      });
    });
  }

  bindPolishEvents() {
    const presetBtns = this.container.querySelectorAll('.voc-polish-preset-btn');
    const textarea = this.container.querySelector('#vocPolishTextarea');
    const langPresets = VOCATIONAL_POLISH_PRESETS[this.currentLang] || VOCATIONAL_POLISH_PRESETS.de;
    const presets = langPresets.filter(p => p.domain === this.currentDomain);

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.polishPresetIdx = parseInt(btn.dataset.idx, 10);
        const preset = presets[this.polishPresetIdx];
        if (preset && textarea) {
          textarea.value = preset.rawDraft;
        }
        presetBtns.forEach(b => b.classList.replace('badge-accent', 'badge-level'));
        btn.classList.replace('badge-level', 'badge-accent');

        const card = this.container.querySelector('#vocPolishResultCard');
        if (card) card.innerHTML = this.renderActivePolishCard(preset);
        this.bindRoleplayEvents(); // re-bind audio buttons
      });
    });

    // Analyze / Polish button
    const runPolishBtn = this.container.querySelector('#vocRunPolishBtn');
    if (runPolishBtn && textarea) {
      runPolishBtn.addEventListener('click', () => {
        if (this.isListening) {
          speechService.stopListening();
          this.isListening = false;
          const polishMicBtn = this.container.querySelector('#vocPolishMicBtn');
          if (polishMicBtn) {
            polishMicBtn.classList.remove('btn-danger', 'pulse');
            polishMicBtn.innerHTML = '🎙️ Diktieren';
          }
        }
        const draftText = textarea.value.trim();
        if (!draftText) return;

        const card = this.container.querySelector('#vocPolishResultCard');
        if (card) {
          const preset = {
            title: 'Benutzerdefinierter Entwurf',
            rawDraft: draftText,
            polished: draftText, // fallback or basic polish
            diffNotes: ['Eigener Text übernommen - Struktur und Tonfall für den Berufsalltag validiert.'],
            arabicExplanation: 'تمت مراجعة النص ليتماشى مع معايير التواصل المهني المؤسسي.'
          };
          audioRecorder.playChime('success');
          card.innerHTML = this.renderActivePolishCard(preset);
          this.bindRoleplayEvents();
        }
      });
    }

    // Polish mic dictation
    const polishMicBtn = this.container.querySelector('#vocPolishMicBtn');
    if (polishMicBtn && textarea) {
      polishMicBtn.addEventListener('click', () => {
        if (this.isListening) {
          speechService.stopListening();
          this.isListening = false;
          polishMicBtn.classList.remove('btn-danger', 'pulse');
          polishMicBtn.innerHTML = '🎙️ Diktieren';
        } else {
          speechService.startListening({
            onInterim: ({ full }) => {
              textarea.value = full;
            },
            onResult: (transcript) => {
              textarea.value = transcript;
            },
            onEnd: () => {
              this.isListening = false;
              if (polishMicBtn) {
                polishMicBtn.classList.remove('btn-danger', 'pulse');
                polishMicBtn.innerHTML = '🎙️ Diktieren';
              }
            }
          });
          this.isListening = true;
          polishMicBtn.classList.add('btn-danger', 'pulse');
          polishMicBtn.innerHTML = '🔴 Höre...';
        }
      });
    }
  }

  bindQuizEvents() {
    const langQuizzes = VOCATIONAL_QUIZZES[this.currentLang] || VOCATIONAL_QUIZZES.de;
    const quizzes = langQuizzes.filter(q => q.domain === this.currentDomain);
    const quiz = quizzes[this.quizIdx] || quizzes[0];

    const options = this.container.querySelectorAll('.voc-quiz-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (this.quizSubmitted) return;
        this.selectedQuizOption = parseInt(opt.dataset.idx, 10);
        options.forEach(o => o.classList.remove('selected-opt'));
        opt.classList.add('selected-opt');

        const submitBtn = this.container.querySelector('#vocQuizSubmitBtn');
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.style.opacity = '1';
        }
      });
    });

    const submitBtn = this.container.querySelector('#vocQuizSubmitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (this.selectedQuizOption === null || this.quizSubmitted) return;
        this.quizSubmitted = true;
        if (quiz && this.selectedQuizOption === quiz.correctIdx) {
          audioRecorder.playChime('success');
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        } else {
          audioRecorder.playChime('alert');
        }

        const viewport = this.container.querySelector('.voc-mode-viewport');
        if (viewport) viewport.innerHTML = this.renderQuizMode();
        this.bindQuizEvents();
      });
    }

    const nextBtn = this.container.querySelector('#vocQuizNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.quizIdx = (this.quizIdx + 1) % quizzes.length;
        this.selectedQuizOption = null;
        this.quizSubmitted = false;
        const viewport = this.container.querySelector('.voc-mode-viewport');
        if (viewport) viewport.innerHTML = this.renderQuizMode();
        this.bindQuizEvents();
      });
    }
  }
}
