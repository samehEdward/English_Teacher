// Words: the workplace vocabulary of the current domain, searchable. Built
// from the authored glossary plus every key term taught in the scenarios.

import { h, mount, INPUT_HARDENING } from '../app/dom.js';
import { t } from '../app/strings.js';
import { glossary } from '../app/content.js';
import { store } from '../app/store.js';
import { icon } from '../ui/icons.js';
import { domainSwitch, listenButton, splitTitle } from './common.js';

export function createWordsView() {
  let root = null;
  let query = '';
  let listEl = null;
  let countEl = null;

  function render() {
    const lang = store.settings.lang;
    const s = t(lang).words;

    countEl = h('p', { class: 'page__meta' });
    listEl = h('ul', { class: 'words' });

    const search = h('input', {
      type: 'search',
      class: 'search__field',
      placeholder: s.search,
      'aria-label': s.search,
      enterkeyhint: 'search',
      value: query,
      ...INPUT_HARDENING,
      onInput: (e) => { query = e.target.value; renderList(); }
    });

    mount(root,
      h('section', { class: 'page' },
        h('h1', { class: 'page__title' }, s.title),
        domainSwitch(lang, render),
        h('label', { class: 'search' }, h('span', { class: 'search__icon', html: icon('search'), 'aria-hidden': 'true' }), search),
        countEl,
        listEl
      )
    );
    renderList();
  }

  function renderList() {
    const lang = store.settings.lang;
    const s = t(lang).words;
    const all = glossary(store.settings.domain, lang);
    const q = query.trim().toLowerCase();
    const hits = q
      ? all.filter((w) => [w.term, w.other, w.meaningAr, w.definition].join(' ').toLowerCase().includes(q))
      : all;

    countEl.textContent = s.count(hits.length);

    if (!hits.length) {
      mount(listEl, h('li', { class: 'empty' }, s.empty(query.trim())));
      return;
    }

    mount(listEl, hits.map((w) => h('li', { class: 'word' },
      h('div', { class: 'word__head' },
        h('p', { class: 'word__term' }, w.term),
        listenButton(w.term, s.listen, { compact: true })
      ),
      w.ipa ? h('p', { class: 'word__ipa' }, w.ipa) : null,
      w.other ? h('p', { class: 'word__other' }, w.other) : null,
      store.settings.showArabic && w.meaningAr
        ? h('p', { class: 'word__ar', dir: 'rtl', lang: 'ar' }, w.meaningAr)
        : null,
      w.definition ? h('p', { class: 'word__def' }, w.definition) : null,
      w.example ? h('p', { class: 'word__example' }, w.example) : null,
      h('p', { class: 'word__source' }, `${s.from}: ${splitTitle(w.source).main}`)
    )));
  }

  return {
    mount(el) { root = el; render(); },
    unmount() { root = null; }
  };
}
