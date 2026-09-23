// Read-only access to training content, shaped for the views.
//
// The authored glossary (4 terms per domain) and quiz (2 questions per
// language) were too thin to stand as features. Every scenario step already
// holds what both need - a vocabulary entry with IPA and Arabic meaning, and
// three phrasings with one marked professional - so both are derived from the
// scenarios here and merged with the authored entries. No new content is
// invented; it is the same material, reached from a different angle.

import {
  VOCATIONAL_DOMAINS,
  VOCATIONAL_SCENARIOS,
  VOCATIONAL_GLOSSARY,
  VOCATIONAL_QUIZZES
} from '../data/vocationalData.js';

export const DOMAINS = ['it_support', 'lab_medical'];

// The ticket prefix is the unit of work in each domain: an incident number
// on the service desk, a sample/order number in the lab.
const TICKET_PREFIX = { it_support: 'INC', lab_medical: 'LAB' };

export function domainInfo(domainId, lang) {
  const d = VOCATIONAL_DOMAINS[domainId];
  return {
    id: domainId,
    title: d.title[lang] || d.title.en,
    subtitle: d.subtitle[lang] || d.subtitle.en
  };
}

// Stable, human-looking ticket number derived from the scenario id, so the
// same scenario always shows the same number in both languages.
function ticketNumber(baseId) {
  let hash = 0;
  for (const ch of baseId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return String(1000 + (hash % 9000));
}

const baseId = (id) => id.replace(/_(de|en)$/, '');

export function scenarios(domainId, lang) {
  const list = (VOCATIONAL_SCENARIOS[lang] && VOCATIONAL_SCENARIOS[lang][domainId]) || [];
  return list.map((sc) => ({
    ...sc,
    key: baseId(sc.id),
    domain: domainId,
    ticket: `${TICKET_PREFIX[domainId]}-${ticketNumber(baseId(sc.id))}`
  }));
}

/** Look a scenario up by its language-neutral key (e.g. "it_epic_chart"). */
export function findScenario(key, lang) {
  for (const domainId of DOMAINS) {
    const found = scenarios(domainId, lang).find((s) => s.key === key);
    if (found) return found;
  }
  return null;
}

/** Initials for the chat avatar: "Frau Dr. Weber" -> "W", "Ms. Sarah Jenkins" -> "SJ". */
export function initials(name) {
  const clean = String(name || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\b(Frau|Herr|Dr\.|Ms\.|Mr\.|Mrs\.|med\.)\s*/gi, '')
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Glossary for one domain in the learner's language. */
export function glossary(domainId, lang) {
  const out = [];
  const seen = new Set();
  const add = (entry) => {
    const k = entry.term.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(entry);
  };

  (VOCATIONAL_GLOSSARY[domainId] || []).forEach((g) => add({
    term: lang === 'de' ? g.termDe : g.termEn,
    other: lang === 'de' ? g.termEn : g.termDe,
    ipa: lang === 'de' ? g.ipa : '',
    meaningAr: g.defAr,
    definition: lang === 'de' ? g.defDe : g.defEn,
    example: lang === 'de' ? g.sampleDe : g.sampleEn,
    source: g.category
  }));

  scenarios(domainId, lang).forEach((sc) => {
    sc.steps.forEach((st) => {
      const v = st.feedback && st.feedback.vocabTip;
      if (!v || !v.term) return;
      add({
        term: v.term,
        other: '',
        ipa: v.ipa || '',
        meaningAr: v.ar || '',
        definition: '',
        example: st.suggestedResponses[st.bestResponseIdx] || '',
        source: sc.title
      });
    });
  });

  return out;
}

/**
 * Quiz questions for one domain: the authored ones, plus one per scenario
 * step ("Which reply is professional?"). Options are shuffled per question
 * with a seeded shuffle, so the correct answer is not always first and the
 * order is stable while the learner works through the round.
 */
export function quizQuestions(domainId, lang) {
  const out = [];

  (VOCATIONAL_QUIZZES[lang] || [])
    .filter((q) => q.domain === domainId)
    .forEach((q, i) => out.push({
      id: `authored-${domainId}-${i}`,
      prompt: q.question,
      speaker: '',
      options: q.options,
      correctIdx: q.correctIdx,
      explanationAr: q.explanationAr,
      better: q.options[q.correctIdx]
    }));

  scenarios(domainId, lang).forEach((sc) => {
    sc.steps.forEach((st, i) => {
      const order = seededOrder(st.suggestedResponses.length, `${sc.key}-${i}`);
      out.push({
        id: `${sc.key}-${i}`,
        prompt: st.aiSpeech,
        speaker: st.speaker,
        scenarioTitle: sc.title,
        options: order.map((j) => st.suggestedResponses[j]),
        correctIdx: order.indexOf(st.bestResponseIdx),
        explanationAr: st.feedback.correction.reasonAr,
        better: st.feedback.correction.refined
      });
    });
  });

  return out;
}

function seededOrder(n, seed) {
  let s = 0;
  for (const ch of seed) s = (s * 33 + ch.charCodeAt(0)) >>> 0;
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}
