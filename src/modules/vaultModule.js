// Vocabulary Vault & Analytics Dashboard Module
import { storageService } from '../services/storageService.js';
import { speechController, SpeakIntent } from '../core/speechController.js';
import { audioEngine } from '../core/audioEngine.js';
import { actionBar } from '../ui/actionBar.js';

export class VaultModule {
  constructor(container) {
    this.container = container;
    this.currentLang = storageService.getLanguage();
    this.searchQuery = '';

    this.render();
    this.bindEvents();
  }

  // == module lifecycle ====================================================

  mount() {
    this.render();
    this.bindEvents();
    this.publishActions();
  }

  unmount() {
    // No audio state of its own; main.js has already reset the controller.
    actionBar.setActions(null);
  }

  /**
   * Bottom-bar controls.
   *
   * mic is null: the vault is a reference view, not a speaking exercise, and
   * its only audio is per-row word playback. Declaring no mic hides the FAB
   * rather than offering a button with nothing to listen for.
   */
  publishActions() {
    const isDe = this.currentLang === 'de';

    actionBar.setActions({
      mic: null,
      buttons: [
        {
          icon: 'save',
          label: isDe ? 'Neu' : 'Add',
          ariaLabel: isDe ? 'Neues Wort hinzufügen' : 'Add a new word',
          onClick: () => this.toggleQuickAdd(true)
        },
        {
          icon: 'hint',
          label: isDe ? 'Suchen' : 'Search',
          onClick: () => this.focusSearch()
        }
      ]
    });
  }

  /** @param {boolean} [forceOpen] open rather than toggle (bar entry point) */
  toggleQuickAdd(forceOpen = false) {
    const box = this.container.querySelector('#quickAddWordBox');
    if (!box) return;

    const isHidden = box.style.display === 'none' || !box.style.display;
    box.style.display = (forceOpen || isHidden) ? 'block' : 'none';

    if (box.style.display === 'block') {
      const first = this.container.querySelector('#newWordInput');
      if (first) first.focus();
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  focusSearch() {
    const input = this.container.querySelector('#vaultSearchInput');
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
    input.select();
  }

  setLanguage(lang) {
    this.currentLang = lang;
    this.render();
    this.bindEvents();
  }

  render() {
    const isDe = this.currentLang === 'de';
    const stats = storageService.getStats();
    const streak = storageService.getStreak();
    let vault = storageService.getVault();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      vault = vault.filter(item => 
        item.word.toLowerCase().includes(q) || 
        (item.def && item.def.toLowerCase().includes(q))
      );
    }

    this.container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${isDe ? 'Wortschatz-Tresor & Lernanalysen' : 'Vocabulary Vault & Learning Analytics'}</h2>
          <p class="section-subtitle">${isDe ? 'Verfolgen Sie Ihre Meilensteine und wiederholen Sie Ihren persönlichen Wortschatz.' : 'Track your fluency milestones and review your personal bank of target vocabulary.'}</p>
        </div>
      </div>

      <!-- Analytics Cards Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🔥
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${isDe ? 'AKTIVE SERIE' : 'ACTIVE STREAK'}</div>
            <div style="font-size: 24px; font-weight: 800; color: #fcd34d;">${streak.currentStreak} ${isDe ? (streak.currentStreak === 1 ? 'Tag' : 'Tage') : (streak.currentStreak === 1 ? 'Day' : 'Days')}</div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🗣️
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${isDe ? 'GESPROCHENE WÖRTER' : 'WORDS SPOKEN'}</div>
            <div style="font-size: 24px; font-weight: 800; color: #a5b4fc;">${stats.wordsSpoken}</div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🎯
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${isDe ? 'DURCHSCHN. GENAUIGKEIT' : 'AVG ACCURACY'}</div>
            <div style="font-size: 24px; font-weight: 800; color: #34d399;">${stats.avgAccuracy}%</div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(6, 182, 212, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ⏱️
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${isDe ? 'ÜBUNGSZEIT' : 'PRACTICE TIME'}</div>
            <div style="font-size: 24px; font-weight: 800; color: #38bdf8;">${stats.practiceMinutes} min</div>
          </div>
        </div>
      </div>

      <!-- Vocabulary Vault Section -->
      <div class="practice-card glass-panel">
        <div class="card-header-bar">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #fff;">${isDe ? 'Gespeicherter Wortschatz' : 'Saved Vocabulary'} (${vault.length})</h3>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="vaultSearchInput" class="form-input" placeholder="${isDe ? 'Wörter oder Bedeutungen suchen...' : 'Search words or definitions...'}" value="${this.searchQuery}" style="width: 240px; padding: 8px 12px; font-size: 13px;" enterkeyhint="send" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
            <button id="addNewWordBtn" class="btn btn-primary btn-sm">
              ${isDe ? '+ Wort hinzufügen' : '+ Add Word'}
            </button>
          </div>
        </div>

        <!-- Quick Add Word Form (Hidden by default) -->
        <div id="quickAddWordBox" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(10, 15, 26, 0.85); border: 1px solid var(--border-active); margin-bottom: 12px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 10px;">${isDe ? 'Neues Wort im Tresor speichern' : 'Add New Word to Vault'}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="newWordInput" class="form-input" placeholder="${isDe ? 'Wort (z.B. gemütlich)' : 'Word (e.g. serendipity)'}" enterkeyhint="send" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
            <input type="text" id="newIpaInput" class="form-input" placeholder="${isDe ? 'Lautschrift / IPA (optional)' : 'Phonetics / IPA (optional)'}" enterkeyhint="send" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
            <input type="text" id="newDefInput" class="form-input" placeholder="${isDe ? 'Bedeutung / Übersetzung' : 'Definition / Meaning'}" enterkeyhint="send" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="saveNewWordConfirmBtn" class="btn btn-primary btn-sm">${isDe ? 'Speichern' : 'Save Word'}</button>
            <button id="cancelNewWordBtn" class="btn btn-secondary btn-sm">${isDe ? 'Abbrechen' : 'Cancel'}</button>
          </div>
        </div>

        <!-- Vocabulary Table View -->
        ${vault.length > 0 ? `
          <div class="vault-table-wrap">
            <table class="vault-table">
              <thead>
                <tr>
                  <th>${isDe ? 'Wort' : 'Word'}</th>
                  <th>${isDe ? 'Lautschrift (IPA)' : 'Phonetics (IPA)'}</th>
                  <th>${isDe ? 'Bedeutung' : 'Definition'}</th>
                  <th>${isDe ? 'Kontext / Notiz' : 'Context / Note'}</th>
                  <th style="text-align: right;">${isDe ? 'Aktion' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                ${vault.map(item => `
                  <tr>
                    <td style="font-weight: 700; color: #ffffff;">
                      ${item.word}
                    </td>
                    <td style="font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 13px;">
                      ${item.ipa || '--'}
                    </td>
                    <td style="color: #cbd5e1; max-width: 320px;">
                      ${item.def || '--'}
                    </td>
                    <td style="color: var(--text-dim); font-size: 12px;">
                      ${item.example || item.dateAdded || '--'}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button class="btn btn-accent btn-sm play-vault-word" data-word="${item.word}" title="${isDe ? 'Aussprache anhören' : 'Listen to pronunciation'}">
                          🔊
                        </button>
                        <button class="btn btn-secondary btn-sm delete-vault-word" data-word="${item.word}" title="${isDe ? 'Wort entfernen' : 'Remove word'}" style="color: #f87171;">
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">📖</div>
            <h4 style="font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px;">${isDe ? 'Noch keine Wörter gespeichert' : 'No vocabulary saved yet'}</h4>
            <p style="font-size: 13px;">${isDe ? 'Klicken Sie auf ein Wort im Lesestudio oder fügen Sie oben manuell Wörter hinzu.' : 'Click on any word in the "Read & Speak Aloud" studio or add words manually above.'}</p>
          </div>
        `}
      </div>
    `;
  }

  bindEvents() {
    const searchInput = this.container.querySelector('#vaultSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const q = this.searchQuery.toLowerCase().trim();
        const rows = this.container.querySelectorAll('.vault-table tbody tr');
        rows.forEach(tr => {
          const text = tr.textContent.toLowerCase();
          tr.style.display = (!q || text.includes(q)) ? '' : 'none';
        });
      });
    }

    const addBtn = this.container.querySelector('#addNewWordBtn');
    const quickBox = this.container.querySelector('#quickAddWordBox');
    if (addBtn && quickBox) {
      addBtn.addEventListener('click', () => {
        this.toggleQuickAdd();
      });
    }

    const cancelBtn = this.container.querySelector('#cancelNewWordBtn');
    if (cancelBtn && quickBox) {
      cancelBtn.addEventListener('click', () => {
        quickBox.style.display = 'none';
      });
    }

    const saveConfirmBtn = this.container.querySelector('#saveNewWordConfirmBtn');
    if (saveConfirmBtn) {
      saveConfirmBtn.addEventListener('click', () => {
        const word = this.container.querySelector('#newWordInput').value.trim();
        const ipa = this.container.querySelector('#newIpaInput').value.trim();
        const def = this.container.querySelector('#newDefInput').value.trim();

        if (!word) {
          const input = this.container.querySelector('#newWordInput');
          if (input) input.focus();
          audioEngine.playChime('error');
          return;
        }

        storageService.saveToVault({ word, ipa, def, example: 'Manually added' });
        audioEngine.playChime('tap');
        this.render();
        this.bindEvents();
        this.publishActions();
      });
    }

    this.container.querySelectorAll('.play-vault-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.currentTarget.dataset.word;
        speechController.speak({ text: word, rate: 0.85, intent: SpeakIntent.USER });
      });
    });

    this.container.querySelectorAll('.delete-vault-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.currentTarget.dataset.word;
        storageService.removeFromVault(word);
        this.render();
        this.bindEvents();
      });
    });
  }
}
