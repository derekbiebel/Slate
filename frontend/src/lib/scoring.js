const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1,
  J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1,
  S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

export function getLetterValue(letter) {
  return LETTER_VALUES[letter.toUpperCase()] || 0;
}

export function calculateScore(boardSlots, boardTypes) {
  let total = 0;
  for (let i = 0; i < boardSlots.length; i++) {
    const letter = boardSlots[i];
    if (!letter) continue;
    let value = getLetterValue(letter);
    const type = boardTypes[i];
    if (type === 'DL') value *= 2;
    else if (type === 'TL') value *= 3;
    total += value;
  }
  return total;
}
