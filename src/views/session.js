// Session: one scenario, played as a conversation.
//
// Per step: the other person's line appears (it is spoken only when the
// learner asks, or right after they tap "Weiter"), the learner answers by
// voice or keyboard, taps "Senden", and gets a coaching card. Three phases:
//
//   answer    mic + Anhören / Tipp / Tippen / Senden
//   feedback  Muster / Nochmal / Weiter
//   summary   the ticket is stamped; Nochmal üben / Zur Übersicht
//
// Nothing here speaks on mount: entering a session is a view change, and the
// app never starts speech on its own.

import { h, mount, INPUT_HARDENING } from '../app/dom.js';
import { t } from '../app/strings.js';
import { findScenario, initials } from '../app/content.js';
import { store } from '../app/store.js';
import { evaluateAnswer, Verdict } from '../app/scoring.js';
import { speechController, SpeakIntent } from '../core/speechController.js';
import { audioEngine } from '../core/audioEngine.js';
import { actionBar } from '../ui/actionBar.js';
import { statusStrip } from '../ui/statusStrip.js';
import { sheet } from '../ui/sheet.js';
import { icon } from '../ui/icons.js';
import { splitTitle, personName, listenButton, verdictChip, arabicBlock } from './common.js';

export function createSessionView({ go }) {
  let root = null;
  let sc = null;
  let lang = 'de';
  let stepIdx = 0;
  let phase = 'answer';
  let verdicts = [];
  let els = {};

  const s = () => t(lang);
  const step = () => sc.steps[stepIdx];

  // == layout ================================================================

  function build() {
    const { main } = splitTitle(sc.title);

    els.pips = h('ol', { class: 'pips', 'aria-hidden': 'true' },
      sc.steps.map(() => h('li', null)));
    els.stepLabel = h('span', { class: 'session-bar__step' });

    els.thread = h('ol', { class: 'thread', 'aria-live': 'polite' });

    els.composer = h('textarea', {
      class: 'composer__field',
      rows: '2',
      placeholder: s().session.placeholder,
      'aria-label': s().session.placeholder,
      enterkeyhint: 'send',
      ...INPUT_HARDENING,
      onKeydown: (e) => {
        // isComposing / 229: never send while an IME is mid-composition.
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          send();
        }
      }
    });
    els.composerWrap = h('div', { class: 'composer' }, els.composer);

    mount(root,
      h('section', { class: 'session', dataset: { domain: sc.domain } },
        h('header', { class: 'session-bar' },
          h('button', {
            type: 'button', class: 'icon-btn', 'aria-label': s().session.back,
            html: icon('back'), onClick: () => go('/')
          }),
          h('div', { class: 'session-bar__label' },
            h('span', { class: 'session-bar__id' }, sc.ticket),
            h('span', { class: 'session-bar__title' }, main)
          ),
          h('div', { class: 'session-bar__progress' }, els.pips, els.stepLabel)
        ),
        h('div', { class: 'session-body' },
          h('details', { class: 'situation', open: true },
            h('summary', null, s().session.situation),
            h('p', null, sc.context)
          ),
          els.thread
        ),
        els.composerWrap
      )
    );
  }

  function updateProgress() {
    [...els.pips.children].forEach((li, i) => {
      li.className = i < stepIdx || phase === 'summary' ? 'done' : (i === stepIdx ? 'now' : '');
    });
    const shown = Math.min(stepIdx + 1, sc.steps.length);
    els.stepLabel.textContent = s().session.step(shown, sc.steps.length);
  }

  function scrollToEnd() {
    requestAnimationFrame(() => {
      const last = els.thread.lastElementChild;
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // == thread items ==========================================================

  function partnerMessage(st) {
    return h('li', { class: 'msg msg--partner' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(st.speaker)),
      h('div', { class: 'msg__body' },
        h('span', { class: 'msg__who' }, personName(st.speaker)),
        h('p', { class: 'msg__text' }, st.aiSpeech),
        listenButton(st.aiSpeech, s().bar.listen, { compact: true })
      )
    );
  }

  function learnerMessage(text) {
    return h('li', { class: 'msg msg--you' },
      h('div', { class: 'msg__body' },
        h('span', { class: 'msg__who' }, s().session.you),
        h('p', { class: 'msg__text' }, text)
      )
    );
  }

  function modelFor(st, result) {
    // For a risky answer the authored correction speaks directly to the
    // mistake; otherwise the full professional reply is the model.
    return result.verdict === Verdict.RISKY
      ? st.feedback.correction.refined
      : st.suggestedResponses[st.bestResponseIdx];
  }

  function coachingCard(st, result) {
    const f = st.feedback;
    const c = s().coaching;
    const model = modelFor(st, result);

    return h('li', { class: ['coach', `coach--${result.verdict}`] },
      h('div', { class: 'coach__head' },
        verdictChip(result.verdict, lang),
        h('p', { class: 'coach__note' }, s().verdict[result.verdict].note)
      ),
      result.verdict === Verdict.RISKY
        ? h('div', { class: 'coach__row' },
            h('span', { class: 'coach__label' }, c.avoid),
            h('p', { class: 'coach__avoid' }, st.suggestedResponses[result.closestIdx]))
        : null,
      h('div', { class: 'coach__row' },
        h('span', { class: 'coach__label' }, c.model),
        h('p', { class: 'coach__model' }, model),
        listenButton(model, s().bar.listen)
      ),
      f.vocabTip && f.vocabTip.term
        ? h('div', { class: 'coach__row coach__row--term' },
            h('span', { class: 'coach__label' }, c.term),
            h('div', { class: 'term' },
              h('p', { class: 'term__text' }, f.vocabTip.term),
              f.vocabTip.ipa ? h('p', { class: 'term__ipa' }, f.vocabTip.ipa) : null,
              listenButton(f.vocabTip.term, s().bar.listen, { compact: true })
            ))
        : null,
      f.followUp
        ? h('div', { class: 'coach__row' },
            h('span', { class: 'coach__label' }, c.nextAction),
            h('p', null, f.followUp))
        : null,
      store.settings.showArabic
        ? arabicBlock(c.arabic, f.correction.reasonAr, f.arabicNotes)
        : null
    );
  }

  function summaryCard() {
    const ss = s().session;
    return h('li', { class: 'summary' },
      h('div', { class: 'summary__ticket', dataset: { domain: sc.domain } },
        h('span', { class: 'ticket__id' }, sc.ticket),
        h('h2', { class: 'summary__title' }, ss.summaryTitle),
        h('span', { class: 'stamp stamp--land' }, s().stamp[sc.domain])
      ),
      h('p', null, ss.summaryBody),
      h('ol', { class: 'summary__steps' },
        sc.steps.map((st, i) => h('li', null,
          h('span', { class: 'summary__n' }, String(i + 1)),
          h('span', { class: 'summary__line' }, st.aiSpeech),
          verdicts[i] ? verdictChip(verdicts[i], lang) : null
        ))
      )
    );
  }

  // == phases ================================================================

  function setPhase(next) {
    phase = next;
    els.composerWrap.hidden = phase !== 'answer';
    updateProgress();
    publishActions();
  }

  function publishActions() {
    const b = s().bar;

    if (phase === 'answer') {
      actionBar.setActions({
        mic: { onStart: listen, onStop: () => speechController.stopListening() },
        buttons: [
          { icon: 'volume', label: b.listen, onClick: () => speak(step().aiSpeech) },
          { icon: 'hint', label: b.hint, onClick: showHints },
          { icon: 'keyboard', label: b.type, onClick: () => els.composer.focus() },
          { icon: 'send', label: b.send, onClick: send }
        ]
      });
      return;
    }

    if (phase === 'feedback') {
      const last = stepIdx >= sc.steps.length - 1;
      const lastResult = els.lastResult;
      actionBar.setActions({
        mic: null,
        buttons: [
          { icon: 'volume', label: b.model, onClick: () => speak(modelFor(step(), lastResult)) },
          { icon: 'reset', label: b.retry, onClick: retry },
          { icon: last ? 'check' : 'next', label: last ? b.finish : b.next, onClick: advance, primary: true }
        ]
      });
      return;
    }

    actionBar.setActions({
      mic: null,
      buttons: [
        { icon: 'reset', label: s().session.again, onClick: restart },
        { icon: 'back', label: s().session.back, onClick: () => go('/'), primary: true }
      ]
    });
  }

  // == actions ===============================================================

  function speak(text) {
    speechController.speak({ text, intent: SpeakIntent.USER, rate: store.settings.rate });
  }

  async function listen() {
    const ss = s().session;
    els.composer.value = '';
    els.composer.placeholder = ss.listening;

    const res = await speechController.listen({
      onInterim: ({ full }) => { if (full) els.composer.value = full; },
      onResult: (text) => {
        els.composer.value = text;
        speechController.finishProcessing();
      },
      onError: (err) => {
        if (err && err.error === 'no-speech') {
          statusStrip.info(ss.noSpeech);
          return;
        }
        if (err && err.permission) statusStrip.showPermission(err.permission, { onRetry: listen });
      },
      onEnd: () => { els.composer.placeholder = ss.placeholder; }
    });

    if (!res.ok) {
      els.composer.placeholder = ss.placeholder;
      if (res.reason === 'permission') statusStrip.showPermission(res.permission, { onRetry: listen });
    }
  }

  function showHints() {
    const ss = s().session;
    const st = step();
    const order = hintOrder(st.suggestedResponses.length);
    sheet.open({
      title: ss.hintTitle,
      closeLabel: s().settings.close,
      body: [
        h('p', { class: 'sheet__note' }, ss.hintNote),
        h('ul', { class: 'hints' }, order.map((i) => {
          const text = st.suggestedResponses[i];
          return h('li', { class: 'hint' },
            h('button', {
              type: 'button', class: 'hint__pick',
              onClick: () => {
                els.composer.value = text;
                sheet.close();
              }
            }, text),
            listenButton(text, s().bar.listen, { compact: true })
          );
        }))
      ]
    });
  }

  // Stable per step, and the professional option is not always first.
  function hintOrder(n) {
    const idx = Array.from({ length: n }, (_, i) => i);
    const k = (sc.key.length + stepIdx) % n;
    return idx.slice(k).concat(idx.slice(0, k));
  }

  function send() {
    const text = els.composer.value.trim();
    if (!text) {
      statusStrip.info(s().session.emptyAnswer);
      els.composer.focus();
      return;
    }
    if (speechController.isListening()) speechController.abortListening();

    const st = step();
    const result = evaluateAnswer(text, st);
    els.lastResult = result;
    verdicts[stepIdx] = result.verdict;
    store.recordStep(sc.key, stepIdx, result.verdict);

    els.thread.append(learnerMessage(text), coachingCard(st, result));
    els.composer.value = '';
    els.composer.blur();
    audioEngine.playChime(result.verdict === Verdict.RISKY ? 'error' : 'success');

    setPhase('feedback');
    scrollToEnd();
  }

  function retry() {
    speechController.stopSpeaking();
    // Remove this step's answer and its coaching card.
    els.thread.lastElementChild.remove();
    els.thread.lastElementChild.remove();
    verdicts[stepIdx] = undefined;
    setPhase('answer');
    els.composer.focus({ preventScroll: true });
  }

  function advance() {
    if (stepIdx >= sc.steps.length - 1) {
      finish();
      return;
    }
    stepIdx += 1;
    els.thread.append(partnerMessage(step()));
    setPhase('answer');
    scrollToEnd();
    // The learner just tapped "Weiter": the reply is a direct response to
    // their action, so reading it aloud here is allowed (and switchable).
    if (store.settings.autoPlayPartner) speak(step().aiSpeech);
  }

  function finish() {
    store.completeScenario(sc.key, verdicts.filter(Boolean));
    els.thread.append(summaryCard());
    stepIdx = sc.steps.length;
    setPhase('summary');
    audioEngine.playChime('success');
    scrollToEnd();
  }

  function restart() {
    start();
  }

  function start() {
    stepIdx = 0;
    verdicts = [];
    build();
    els.thread.append(partnerMessage(step()));
    setPhase('answer');
  }

  return {
    mount(el, key) {
      root = el;
      lang = store.settings.lang;
      sc = findScenario(key, lang);
      if (!sc) {
        go('/');
        return;
      }
      start();
    },
    unmount() {
      sheet.close();
      root = null;
      sc = null;
      els = {};
    }
  };
}
