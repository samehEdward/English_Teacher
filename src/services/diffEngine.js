// Pronunciation Diff Engine & Text Alignment Algorithms

export class DiffEngine {
  /**
   * Cleans a string into tokens, removing punctuation for phonetic matching
   */
  static tokenize(text) {
    if (!text) return [];
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s']/gu, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Normalizes word for lenient comparison (handles common contractions, quotes, and umlauts)
   */
  static normalizeWord(word) {
    return (word || '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^\p{L}\p{N}]/gu, '')
      .trim();
  }

  /**
   * Computes standard Levenshtein distance between two strings
   */
  static levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Calculates similarity between 0.0 and 1.0
   */
  static wordSimilarity(w1, w2) {
    const n1 = this.normalizeWord(w1);
    const n2 = this.normalizeWord(w2);
    if (!n1 && !n2) return 1.0;
    if (!n1 || !n2) return 0.0;
    if (n1 === n2) return 1.0;

    const maxLen = Math.max(n1.length, n2.length);
    const dist = this.levenshtein(n1, n2);
    return Math.max(0, 1 - (dist / maxLen));
  }

  /**
   * Sequence alignment aligning reference words with spoken words
   * Uses Wagner-Fischer sequence dynamic programming with backtrace
   */
  static alignTokens(refTokens, spokenTokens) {
    const n = refTokens.length;
    const m = spokenTokens.length;

    if (n === 0) return [];
    if (m === 0) {
      return refTokens.map(w => ({
        word: w,
        status: 'missing',
        similarity: 0,
        spoken: null
      }));
    }

    // Cost matrix: DP table
    // dp[i][j] represents optimal alignment cost for ref[0..i-1] and spoken[0..j-1]
    const dp = Array.from({ length: n + 1 }, () => new Float32Array(m + 1));
    const backtrack = Array.from({ length: n + 1 }, () => new Array(m + 1));

    for (let i = 0; i <= n; i++) {
      dp[i][0] = i * 1.0; // deletion penalty
      backtrack[i][0] = 'del';
    }
    for (let j = 0; j <= m; j++) {
      dp[0][j] = j * 0.8; // insertion penalty
      backtrack[0][j] = 'ins';
    }
    backtrack[0][0] = 'start';

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const sim = this.wordSimilarity(refTokens[i - 1], spokenTokens[j - 1]);
        const matchCost = 1.0 - sim; // 0 if identical, 1 if completely different

        const costSub = dp[i - 1][j - 1] + matchCost;
        const costDel = dp[i - 1][j] + 1.0; // skipped reference word
        const costIns = dp[i][j - 1] + 0.8; // extra spoken word

        if (costSub <= costDel && costSub <= costIns) {
          dp[i][j] = costSub;
          backtrack[i][j] = 'match';
        } else if (costDel <= costIns) {
          dp[i][j] = costDel;
          backtrack[i][j] = 'del';
        } else {
          dp[i][j] = costIns;
          backtrack[i][j] = 'ins';
        }
      }
    }

    // Backtrack from (n, m) to build aligned output
    let i = n;
    let j = m;
    const reversedResult = [];

    while (i > 0 || j > 0) {
      const action = backtrack[i][j];
      if (action === 'match') {
        const refWord = refTokens[i - 1];
        const spokenWord = spokenTokens[j - 1];
        const sim = this.wordSimilarity(refWord, spokenWord);
        let status = 'correct';
        if (sim < 0.65) {
          status = 'incorrect';
        } else if (sim < 0.85) {
          status = 'hesitant';
        }
        reversedResult.push({
          word: refWord,
          status,
          similarity: Math.round(sim * 100),
          spoken: spokenWord
        });
        i--;
        j--;
      } else if (action === 'del') {
        // Reference word was omitted
        reversedResult.push({
          word: refTokens[i - 1],
          status: 'missing',
          similarity: 0,
          spoken: null
        });
        i--;
      } else if (action === 'ins') {
        // Spoken word was extra/unprompted
        reversedResult.push({
          word: spokenTokens[j - 1],
          status: 'extra',
          similarity: 0,
          spoken: spokenTokens[j - 1]
        });
        j--;
      } else {
        break;
      }
    }

    return reversedResult.reverse();
  }

  /**
   * Complete evaluation of user's read-aloud attempt
   */
  static evaluateSpeech({ referenceText, spokenText, durationSec = 1 }) {
    // Preserve original words with punctuation for display
    const rawTokens = referenceText.trim().split(/\s+/).filter(Boolean);
    const cleanRef = rawTokens.map(w => this.normalizeWord(w));
    const cleanSpoken = this.tokenize(spokenText);

    const alignment = this.alignTokens(cleanRef, cleanSpoken);

    // Map back to original words with preserved capitalization and punctuation
    let refIdx = 0;
    const decoratedWords = [];
    let correctCount = 0;
    let hesitantCount = 0;
    let missingCount = 0;

    for (const item of alignment) {
      if (item.status !== 'extra') {
        const originalWord = rawTokens[refIdx] || item.word;
        if (item.status === 'correct') correctCount++;
        else if (item.status === 'hesitant') hesitantCount++;
        else if (item.status === 'missing') missingCount++;

        decoratedWords.push({
          displayWord: originalWord,
          rawWord: item.word,
          status: item.status,
          similarity: item.similarity,
          spoken: item.spoken
        });
        refIdx++;
      }
    }

    const totalWords = rawTokens.length || 1;
    // Score formula: correct is 100%, hesitant counts as 60%
    const weightedPoints = (correctCount * 1.0) + (hesitantCount * 0.6);
    const accuracy = Math.min(100, Math.round((weightedPoints / totalWords) * 100));
    const completeness = Math.min(100, Math.round(((totalWords - missingCount) / totalWords) * 100));
    const wordsPerMinute = durationSec > 0 ? Math.round((cleanSpoken.length / durationSec) * 60) : 0;

    return {
      accuracy,
      completeness,
      wordsPerMinute,
      correctCount,
      hesitantCount,
      missingCount,
      totalWords,
      words: decoratedWords,
      rawSpoken: spokenText
    };
  }

  /**
   * Dictation Diff: compares typed user input with ground truth sentence
   */
  static diffDictation(groundTruth, userInput) {
    const truthTokens = groundTruth.trim().split(/\s+/).filter(Boolean);
    const userTokens = userInput.trim().split(/\s+/).filter(Boolean);

    const cleanTruth = truthTokens.map(w => this.normalizeWord(w));
    const cleanUser = userTokens.map(w => this.normalizeWord(w));

    const alignment = this.alignTokens(cleanTruth, cleanUser);

    let matchCount = 0;
    let truthIndex = 0;
    const diffResult = [];

    for (const item of alignment) {
      if (item.status === 'extra') {
        diffResult.push({
          type: 'extra',
          word: item.word,
          expected: null
        });
      } else {
        const originalTruth = truthTokens[truthIndex] || item.word;
        if (item.status === 'correct') {
          matchCount++;
          diffResult.push({
            type: 'correct',
            word: originalTruth,
            userInput: item.spoken
          });
        } else if (item.status === 'hesitant' || item.status === 'incorrect') {
          diffResult.push({
            type: 'mismatch',
            word: originalTruth,
            userInput: item.spoken
          });
        } else {
          diffResult.push({
            type: 'missing',
            word: originalTruth,
            userInput: null
          });
        }
        truthIndex++;
      }
    }

    const accuracy = Math.min(100, Math.round((matchCount / Math.max(1, truthTokens.length)) * 100));
    const isExact = accuracy === 100 && userTokens.length === truthTokens.length;

    return {
      accuracy,
      isExact,
      diff: diffResult,
      expected: groundTruth,
      submitted: userInput
    };
  }
}
