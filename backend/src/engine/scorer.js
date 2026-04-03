// Scrabble letter values
const LETTER_VALUES = {
  A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1,
  D: 2, G: 2,
  B: 3, C: 3, M: 3, P: 3,
  F: 4, H: 4, V: 4, W: 4, Y: 4,
  K: 5,
  J: 8, X: 8,
  Q: 10, Z: 10
};

/**
 * Score a word given a specific placement on the board.
 * @param {string} word - the word (uppercase)
 * @param {number[]} placement - array of board slot indices (0-4), one per letter
 * @param {string[]} board - array of 5 slot types: 'normal', 'DL', 'TL'
 * @returns {number} the score
 */
function scoreWord(word, placement, board) {
  const upper = word.toUpperCase();
  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const letter = upper[i];
    const slotIndex = placement[i];
    const slotType = board[slotIndex];
    let letterScore = LETTER_VALUES[letter] || 0;

    if (slotType === 'DL') {
      letterScore *= 2;
    } else if (slotType === 'TL') {
      letterScore *= 3;
    }
    total += letterScore;
  }
  return total;
}

/**
 * Try every valid placement of the word on the 5-slot board.
 * A placement is any selection of word.length distinct slots from 0-4, in order.
 * Returns the maximum possible score.
 */
function getBestScore(word, board) {
  return getBestPlacement(word, board).score;
}

/**
 * Returns { score, placement } for the best possible placement of a word.
 * Only considers consecutive slot placements.
 */
function getBestPlacement(word, board) {
  const upper = word.toUpperCase();
  const len = upper.length;
  if (len > 5) return { score: 0, placement: [] };

  const placements = getConsecutivePlacements(5, len);
  let best = 0;
  let bestPlacement = placements[0] || [];
  for (const placement of placements) {
    const s = scoreWord(upper, placement, board);
    if (s > best) {
      best = s;
      bestPlacement = placement;
    }
  }
  return { score: best, placement: bestPlacement };
}

/**
 * Generate all consecutive placements of `len` slots on a board of size `n`.
 * E.g. for n=5, len=3: [[0,1,2], [1,2,3], [2,3,4]]
 */
function getConsecutivePlacements(n, len) {
  const results = [];
  for (let start = 0; start <= n - len; start++) {
    const placement = [];
    for (let i = 0; i < len; i++) placement.push(start + i);
    results.push(placement);
  }
  return results;
}

/**
 * Build a score distribution for all valid words from the given letters on the board.
 * Returns { entries: [{word, score}], totalWords } sorted descending by score.
 */
function buildScoreDistribution(letters, board) {
  const { getValidWords } = require('./wordList');
  const validWords = getValidWords(letters);

  const entries = validWords.map(word => ({
    word,
    score: getBestScore(word, board)
  }));

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);

  return {
    entries,
    totalWords: entries.length
  };
}

/**
 * Get the percentile rank of a score within a distribution.
 * Percentile = percentage of words that score LESS than or equal to this score.
 * Higher percentile = better score.
 */
function getPercentile(score, distribution) {
  const { entries } = distribution;
  if (entries.length === 0) return 0;

  // Count how many words score less than the given score
  const below = entries.filter(e => e.score < score).length;
  // Percentile: fraction of words this score beats
  return Math.round((below / entries.length) * 10000) / 100;
}

module.exports = {
  LETTER_VALUES,
  scoreWord,
  getBestScore,
  getBestPlacement,
  buildScoreDistribution,
  getPercentile
};
