const fs = require('fs');
const path = require('path');

const WORD_LIST_PATH = path.join(__dirname, '../../data/sowpods.txt');

let wordSet = null;

function loadWords() {
  if (wordSet) return wordSet;
  const raw = fs.readFileSync(WORD_LIST_PATH, 'utf-8');
  const words = raw
    .split(/\r?\n/)
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length >= 2 && w.length <= 5);
  wordSet = new Set(words);
  return wordSet;
}

/**
 * Check if a word is valid (in dictionary and 2-5 letters)
 */
function isValidWord(word) {
  const set = loadWords();
  const upper = word.toUpperCase();
  return upper.length >= 2 && upper.length <= 5 && set.has(upper);
}

/**
 * Get all valid words (2-5 letters) that can be formed from the given letters,
 * respecting letter counts.
 */
function getValidWords(letters) {
  const set = loadWords();
  const upperLetters = letters.map(l => l.toUpperCase());

  // Build a frequency map of available letters
  const available = {};
  for (const l of upperLetters) {
    available[l] = (available[l] || 0) + 1;
  }

  const results = [];
  for (const word of set) {
    if (canFormWord(word, available)) {
      results.push(word);
    }
  }
  return results;
}

function canFormWord(word, available) {
  const needed = {};
  for (const ch of word) {
    needed[ch] = (needed[ch] || 0) + 1;
  }
  for (const [ch, count] of Object.entries(needed)) {
    if ((available[ch] || 0) < count) return false;
  }
  return true;
}

module.exports = { isValidWord, getValidWords, loadWords };
