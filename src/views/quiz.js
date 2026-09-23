// Quiz: "Which reply is professional?" One round is every question of the
// current domain; answers are kept so the learner sees their record.

import { h, mount } from '../app/dom.js';
import { t } from '../app/strings.js';
import { quizQuestions } from '../app/content.js';
import { store } from '../app/store.js';
import { audioEngine } from '../core/audioEngine.js';
import { domainSwitch, personName, arabicBlock, listenButton } from './common.js';

export function createQuizView() {
  let root = null;
  let index = 0;
  let roundCorrect = 0;
  let roundDomain = null;
  let roundLang = null;

  function questions() {
    return quizQuestions(store.settings.domain, store.settings.lang);
  }

  function resetRoundIfChanged() {
    if (roundDomain !== store.settings.domain || roundLang !== store.settings.lang) {
      roundDomain = store.settings.domain;
      roundLang = store.settings.lang;
      index = 0;
      roundCorrect = 0;
    }
  }

  function render() {
    resetRoundIfChanged();
    const lang = store.settings.lang;
    const s = t(lang).quiz;
    const qs = questions();
    const stats = store.quizStats(qs.map((q) => q.id));

    const statsEl = h('p', { class: 'page__meta' }, s.stats(stats.correct, stats.answered));
    const head = [
      h('h1', { class: 'page__title' }, s.title),
      domainSwitch(lang, () => { roundDomain = null; render(); }),
      statsEl
    ];

    if (index >= qs.length) {
      mount(root, h('section', { class: 'page' }, head,
        h('div', { class: 'quiz-done' },
          h('p', { class: 'quiz-done__score' }, s.done(roundCorrect, qs.length)),
          h('button', {
            type: 'button', class: 'btn btn--primary',
            onClick: () => { index = 0; roundCorrect = 0; render(); }
          }, s.restart)
        )
      ));
      return;
    }

    const q = qs[index];
    const feedback = h('div', { class: 'quiz-feedback', 'aria-live': 'polite' });
    const options = h('ol', { class: 'options' });

    q.options.forEach((opt, i) => {
      options.appendChild(h('li', null, h('button', {
        type: 'button',
        class: 'option',
        onClick: (e) => answer(i, e.currentTarget)
      }, opt)));
    });

    function answer(i, btn) {
      if (options.dataset.answered) return;
      options.dataset.answered = 'true';
      const correct = i === q.correctIdx;
      if (correct) roundCorrect += 1;
      store.recordQuiz(q.id, correct);
      const updated = store.quizStats(qs.map((x) => x.id));
      statsEl.textContent = s.stats(updated.correct, updated.answered);
      audioEngine.playChime(correct ? 'success' : 'error');

      [...options.querySelectorAll('.option')].forEach((b, j) => {
        b.disabled = true;
        if (j === q.correctIdx) b.classList.add('option--right');
      });
      if (!correct) btn.classList.add('option--wrong');

      mount(feedback,
        h('p', { class: ['quiz-feedback__verdict', correct ? 'is-right' : 'is-wrong'] }, correct ? s.correct : s.wrong),
        !correct && q.better
          ? h('div', { class: 'quiz-feedback__better' },
              h('span', { class: 'coach__label' }, s.better),
              h('p', null, q.better),
              listenButton(q.better, t(lang).bar.listen))
          : null,
        store.settings.showArabic ? arabicBlock(t(lang).coaching.arabic, q.explanationAr) : null,
        h('button', {
          type: 'button', class: 'btn btn--primary',
          onClick: () => { index += 1; render(); }
        }, s.next)
      );
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    mount(root, h('section', { class: 'page' }, head,
      h('article', { class: 'question' },
        h('p', { class: 'question__count' }, s.of(index + 1, qs.length)),
        q.speaker ? h('p', { class: 'question__who' }, s.says(personName(q.speaker))) : null,
        h('blockquote', { class: 'question__prompt' }, q.prompt),
        options,
        feedback
      )
    ));
  }

  return {
    mount(el) { root = el; render(); },
    unmount() { root = null; }
  };
}
