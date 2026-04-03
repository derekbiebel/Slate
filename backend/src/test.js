const { generatePuzzle } = require('./engine/puzzleGenerator');
const { getValidWords } = require('./engine/wordList');
const { getBestScore, buildScoreDistribution, getPercentile } = require('./engine/scorer');

const dateStr = new Date().toISOString().slice(0, 10);
console.log(`\n=== Slate Engine Test for ${dateStr} ===\n`);

// Generate puzzle
const puzzle = generatePuzzle(dateStr);
console.log('Letters:', puzzle.letters.join(', '));
console.log('Board:', puzzle.board.join(', '));

// Find all valid words
console.log('\nFinding valid words...');
const validWords = getValidWords(puzzle.letters);
console.log(`Total valid words: ${validWords.length}`);

// Build score distribution
console.log('\nBuilding score distribution...');
const distribution = buildScoreDistribution(puzzle.letters, puzzle.board);

// Top 10 words
console.log('\nTop 10 words:');
distribution.entries.slice(0, 10).forEach((entry, i) => {
  console.log(`  ${i + 1}. ${entry.word} = ${entry.score} pts`);
});

// Test percentile
if (distribution.entries.length > 0) {
  const topScore = distribution.entries[0].score;
  const midScore = distribution.entries[Math.floor(distribution.entries.length / 2)]?.score || 0;
  console.log(`\nPercentile of top score (${topScore}): ${getPercentile(topScore, distribution)}%`);
  console.log(`Percentile of median score (${midScore}): ${getPercentile(midScore, distribution)}%`);
}

// Verify determinism
const puzzle2 = generatePuzzle(dateStr);
const match = JSON.stringify(puzzle) === JSON.stringify(puzzle2);
console.log(`\nDeterministic: ${match ? 'YES' : 'NO'}`);

console.log('\n=== Test Complete ===\n');
