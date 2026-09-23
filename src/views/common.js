// Pieces shared by several screens.

import { h } from '../app/dom.js';
import { t } from '../app/strings.js';
import { DOMAINS } from '../app/content.js';
import { store } from '../app/store.js';
import { icon } from '../ui/icons.js';
import { speechController, SpeakIntent } from '../core/speechController.js';

/** Two-way switch between the IT and lab tracks, shared by all tabs. */
export function domainSwitch(lang, onChange) {
  const s = t(lang);
  const current = store.settings.domain;
  return h('div', { class: 'domain-switch', role: 'radiogroup', 'aria-label': 'Bereich' },
    DOMAINS.map((d) => h('button', {
      type: 'button',
      class: 'domain-switch__opt',
      role: 'radio',
      'aria-checked': String(d === current),
      dataset: { domain: d },
      onClick: () => {
        if (d === store.settings.domain) return;
        store.setSetting('domain', d);
        onChange(d);
      }
    }, h('span', { class: 'cap', 'aria-hidden': 'true' }), s.domains[d]))
  );
}

/** Split "Titel (Thema)" into its title and topic tag. */
export function splitTitle(title) {
  const m = String(title).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { main: m[1], tag: m[2] } : { main: title, tag: '' };
}

/** "Frau Sabine Schneider (Vertrieb)" -> "Frau Sabine Schneider" */
export const personName = (name) => String(name).replace(/\s*\(.*?\)\s*/g, '').trim();

/**
 * Speak one piece of text on an explicit tap. Returns the button so callers
 * can place it; the button reflects "speaking" while its own text plays.
 */
export function listenButton(text, label, { compact = false } = {}) {
  const btn = h('button', {
    type: 'button',
    class: ['listen-btn', compact && 'listen-btn--compact'],
    'aria-label': label,
    title: label,
    html: icon('volume')
  });
  if (!compact) btn.appendChild(h('span', null, label));

  btn.addEventListener('click', () => {
    if (btn.dataset.speaking === 'true') {
      speechController.stopSpeaking();
      return;
    }
    const ok = speechController.speak({
      text,
      intent: SpeakIntent.USER,
      rate: store.settings.rate,
      onStart: () => { btn.dataset.speaking = 'true'; },
      onEnd: () => { btn.dataset.speaking = 'false'; },
      onError: () => { btn.dataset.speaking = 'false'; }
    });
    if (ok) btn.dataset.speaking = 'true';
  });

  // Any other speech or a reset clears this button's state.
  const unsub = speechController.subscribe(({ to }) => {
    if (to !== 'SPEAKING') btn.dataset.speaking = 'false';
    if (!btn.isConnected) unsub();
  });
  return btn;
}

export function verdictChip(verdict, lang) {
  const v = t(lang).verdict[verdict];
  return h('span', { class: ['verdict', `verdict--${verdict}`] }, v.label);
}

/** Arabic coaching block, rendered right-to-left. */
export function arabicBlock(title, ...paragraphs) {
  const body = paragraphs.filter(Boolean);
  if (!body.length) return null;
  return h('details', { class: 'arabic', open: true },
    h('summary', null, title),
    h('div', { class: 'arabic__body', dir: 'rtl', lang: 'ar' }, body.map((p) => h('p', null, p)))
  );
}
