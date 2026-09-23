// Home: pick a workplace situation. Each scenario is shown as a ticket - the
// unit of work in both domains (an incident on the service desk, a sample
// order in the lab) - and a finished one carries the stamp that closes it.

import { h, mount } from '../app/dom.js';
import { t } from '../app/strings.js';
import { scenarios } from '../app/content.js';
import { store } from '../app/store.js';
import { domainSwitch, splitTitle, personName } from './common.js';

export function createHomeView({ go }) {
  let root = null;

  function render() {
    const lang = store.settings.lang;
    const s = t(lang);
    const domain = store.settings.domain;
    const list = scenarios(domain, lang);
    const doneCount = list.filter((sc) => (store.progressFor(sc.key) || {}).done).length;

    mount(root,
      h('section', { class: 'page' },
        h('h1', { class: 'page__title' }, s.home.title),
        domainSwitch(lang, render),
        h('p', { class: 'page__meta' }, s.home.progress(doneCount, list.length)),
        h('ol', { class: 'tickets', dataset: { domain } },
          list.map((sc) => h('li', null, ticket(sc, lang)))
        )
      )
    );
  }

  function ticket(sc, lang) {
    const s = t(lang);
    const progress = store.progressFor(sc.key);
    const done = !!(progress && progress.done);
    const { main, tag } = splitTitle(sc.title);

    return h('button', {
      type: 'button',
      class: ['ticket', done && 'ticket--done'],
      dataset: { domain: sc.domain },
      onClick: () => go(`/s/${encodeURIComponent(sc.key)}`)
    },
      h('span', { class: 'ticket__cap', 'aria-hidden': 'true' }),
      h('span', { class: 'ticket__head' },
        h('span', { class: 'ticket__id' }, sc.ticket),
        h('span', { class: ['ticket__level', sc.level === 'C1' && 'ticket__level--hi'] }, sc.level)
      ),
      h('span', { class: 'ticket__title' }, main),
      tag ? h('span', { class: 'ticket__tag' }, tag) : null,
      h('span', { class: 'ticket__who' }, `${personName(sc.persona.name)} · ${sc.persona.role}`),
      h('span', { class: 'ticket__foot' }, s.home.steps(sc.steps.length)),
      done ? h('span', { class: 'stamp', 'aria-label': s.home.done }, s.stamp[sc.domain]) : null
    );
  }

  return {
    mount(el) {
      root = el;
      render();
    },
    unmount() { root = null; }
  };
}
