/**
 * Deterministic PRNG using a seeded hash (mulberry32).
 */
function seededRandom(seed) {
  // Convert string seed to numeric
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }

  // Mulberry32 PRNG
  return function () {
    h |= 0;
    h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Common consonants weighted heavily, rare ones weighted lightly
const CONSONANT_POOL = [
  // Common (weight ~5 each)
  'L', 'L', 'L', 'L', 'L',
  'N', 'N', 'N', 'N', 'N',
  'R', 'R', 'R', 'R', 'R',
  'S', 'S', 'S', 'S', 'S',
  'T', 'T', 'T', 'T', 'T',
  // Moderately common (weight ~3)
  'B', 'B', 'B',
  'C', 'C', 'C',
  'D', 'D', 'D',
  'F', 'F', 'F',
  'G', 'G', 'G',
  'H', 'H', 'H',
  'K', 'K', 'K',
  'M', 'M', 'M',
  'P', 'P', 'P',
  'W', 'W', 'W',
  'Y', 'Y', 'Y',
  'V', 'V',
  // Rare (weight ~1, <10% chance per pick)
  'J',
  'Q',
  'X',
  'Z'
];

/**
 * Generate a puzzle for a given date string (YYYY-MM-DD).
 * Returns { letters: string[], board: string[] }
 */
function generatePuzzle(dateString) {
  const rand = seededRandom(dateString);

  // Generate 12 letters: at least 5 vowels
  const letters = [];

  // Pick 5 vowels first
  for (let i = 0; i < 5; i++) {
    letters.push(VOWELS[Math.floor(rand() * VOWELS.length)]);
  }

  // Pick 7 consonants from weighted pool
  for (let i = 0; i < 7; i++) {
    letters.push(CONSONANT_POOL[Math.floor(rand() * CONSONANT_POOL.length)]);
  }

  // Shuffle the letters using Fisher-Yates
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  // Generate 5-square board
  // Exactly 1 TL, 1-2 DL, rest normal
  const board = ['normal', 'normal', 'normal', 'normal', 'normal'];

  // Pick TL position
  const tlPos = Math.floor(rand() * 5);
  board[tlPos] = 'TL';

  // Pick 1 or 2 DL positions (not on TL)
  const numDL = rand() < 0.5 ? 1 : 2;
  const availablePositions = [0, 1, 2, 3, 4].filter(p => p !== tlPos);

  // Shuffle available positions
  for (let i = availablePositions.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
  }

  for (let i = 0; i < numDL; i++) {
    board[availablePositions[i]] = 'DL';
  }

  return { letters, board };
}

module.exports = { generatePuzzle };
