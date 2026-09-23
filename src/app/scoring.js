// Answer evaluation for one roleplay step.
//
// A step offers several phrasings: one professional (bestResponseIdx) and
// realistic mistakes. The learner answers in their own words - spoken or
// typed - so we cannot demand an exact match. Instead we measure how close
// the answer is to EACH phrasing and ask two questions:
//
//   1. Is it closest to one of the mistakes?  -> "risky": show the correction
//   2. Otherwise, how close is it to the professional phrasing?
//
// This is deliberately a similarity heuristic, not grammar checking, and the
// verdict names reflect that: an answer we cannot match is "own wording",
// not "wrong".

export const Verdict = {
  STRONG: 'strong',   // close to the professional phrasing
  OK: 'ok',           // on the right track, phrasing can improve
  RISKY: 'risky',     // closest to one of the mistakes
  OWN: 'own'          // too different to judge; compare with the model
};

const RANK = { risky: 0, own: 1, ok: 2, strong: 3 };
export const verdictRank = (v) => RANK[v] ?? 0;

const STRONG_AT = 0.55;
const OK_AT = 0.30;
const RISKY_MIN = 0.45;     // a mistake must be at least this close...
const RISKY_MARGIN = 0.05;  // ...and beat the professional phrasing by this much

// Function words carry no signal about professionalism and would make every
// answer look similar to every other. Kept short on purpose: modal verbs,
// negation and politeness markers (bitte, sofort, nicht) are signal.
const STOPWORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'und', 'oder', 'zu', 'im', 'in', 'am', 'an', 'auf', 'mit', 'von', 'für', 'fuer', 'ist', 'es',
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'at', 'for', 'is', 'it', 'be'
]);

/** Lowercase, fold umlauts so STT output and typed answers compare equally. */
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text) {
  return normalize(text).split(' ').filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

// Light stemming: German and English inflect heavily ("entsperrt" /
// "entsperren", "unlocked" / "unlock"). Comparing the first six letters of
// longer words catches most of it without a real stemmer.
function stem(word) {
  return word.length > 6 ? word.slice(0, 6) : word;
}

/**
 * Similarity in [0,1]: Dice coefficient over stemmed content words,
 * weighted by how much of the REFERENCE the answer covers. Coverage matters
 * more than precision here - a learner who says the key professional parts
 * plus some extra words is still doing well.
 */
export function similarity(answer, reference) {
  const a = new Set(tokens(answer).map(stem));
  const r = new Set(tokens(reference).map(stem));
  if (!a.size || !r.size) return 0;
  let shared = 0;
  for (const w of a) if (r.has(w)) shared += 1;
  const dice = (2 * shared) / (a.size + r.size);
  const coverage = shared / r.size;
  return Math.min(1, 0.5 * dice + 0.5 * coverage);
}

/**
 * @param {string} answer
 * @param {{suggestedResponses: string[], bestResponseIdx: number}} step
 * @returns {{verdict: string, score: number, closestIdx: number, scores: number[]}}
 */
export function evaluateAnswer(answer, step) {
  const options = step.suggestedResponses || [];
  const bestIdx = step.bestResponseIdx || 0;
  const scores = options.map((opt) => similarity(answer, opt));
  const best = scores[bestIdx] || 0;

  let closestIdx = bestIdx;
  scores.forEach((s, i) => { if (s > scores[closestIdx]) closestIdx = i; });

  let verdict;
  if (closestIdx !== bestIdx && scores[closestIdx] >= RISKY_MIN && scores[closestIdx] > best + RISKY_MARGIN) {
    verdict = Verdict.RISKY;
  } else if (best >= STRONG_AT) {
    verdict = Verdict.STRONG;
  } else if (best >= OK_AT) {
    verdict = Verdict.OK;
  } else {
    verdict = Verdict.OWN;
  }

  return { verdict, score: Math.round(best * 100), closestIdx, scores };
}
