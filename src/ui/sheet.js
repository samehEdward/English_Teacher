// Bottom sheet: one at a time, dismissed by the close button, a tap on the
// backdrop, Escape, or any navigation.

import { h, mount } from '../app/dom.js';
import { icon } from './icons.js';

class Sheet {
  constructor() {
    this.root = null;
    this._onClose = null;
    this._onKey = (e) => { if (e.key === 'Escape') this.close(); };
  }

  init() {
    this.root = document.getElementById('sheet');
    if (!this.root) return;
    this.root.addEventListener('click', (e) => { if (e.target === this.root) this.close(); });
  }

  get isOpen() { return !!(this.root && this.root.classList.contains('open')); }

  open({ title, body, closeLabel = 'Schließen', onClose = null }) {
    if (!this.root) return;
    this._onClose = onClose;
    mount(this.root,
      h('div', { class: 'sheet__panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('div', { class: 'sheet__head' },
          h('h2', { class: 'sheet__title' }, title),
          h('button', { type: 'button', class: 'icon-btn', 'aria-label': closeLabel, html: icon('close'), onClick: () => this.close() })
        ),
        h('div', { class: 'sheet__body' }, body)
      )
    );
    this.root.classList.add('open');
    document.addEventListener('keydown', this._onKey);
    const first = this.root.querySelector('button, input, select, textarea');
    if (first) first.focus({ preventScroll: true });
  }

  close() {
    if (!this.isOpen) return;
    this.root.classList.remove('open');
    this.root.replaceChildren();
    document.removeEventListener('keydown', this._onKey);
    const cb = this._onClose;
    this._onClose = null;
    if (cb) cb();
  }
}

export const sheet = new Sheet();
