const express = require('express');
const cors = require('cors');
const { generatePuzzle } = require('./engine/puzzleGenerator');
const { buildScoreDistribution, scoreWord, getPercentile, getBestPlacement } = require('./engine/scorer');
const { isValidWord } = require('./engine/wordList');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Generate a random practice puzzle
app.get('/api/puzzle/random', (req, res) => {
  try {
    const seed = 'random-' + Date.now() + '-' + Math.random();
    const { letters, board } = generatePuzzle(seed);
    const distribution = buildScoreDistribution(letters, board);
    res.json({ letters, board, distribution, seed });
  } catch (err) {
    console.error('Error generating puzzle:', err);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
});

// Generate today's daily puzzle (same for everyone)
app.get('/api/puzzle/today', (req, res) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const { letters, board } = generatePuzzle(dateStr);
    res.json({ date: dateStr, letters, board });
  } catch (err) {
    console.error('Error generating puzzle:', err);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
});

// Score a practice game (stateless — no DB)
app.post('/api/score/practice', (req, res) => {
  try {
    const { word, placement, letters, board, distribution } = req.body;

    if (!word || !placement || !letters || !board || !distribution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const upperWord = word.toUpperCase();
    if (!isValidWord(upperWord)) {
      return res.status(400).json({ error: 'NOT A VALID WORD' });
    }

    if (upperWord.length !== placement.length) {
      return res.status(400).json({ error: 'Placement length must match word length' });
    }

    // Validate consecutive
    const sorted = [...placement].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        return res.status(400).json({ error: 'Letters must be placed in consecutive slots' });
      }
    }

    // Validate letters exist
    const available = [...letters];
    for (const ch of upperWord) {
      const idx = available.indexOf(ch);
      if (idx === -1) return res.status(400).json({ error: `Letter '${ch}' not available` });
      available.splice(idx, 1);
    }

    const score = scoreWord(upperWord, placement, board);
    const percentile = getPercentile(score, distribution);
    const top5 = distribution.entries.slice(0, 5);
    const bestEntry = distribution.entries[0];
    const bestPlay = getBestPlacement(bestEntry.word, board);

    res.json({
      score,
      percentile,
      streakContinues: percentile >= 90,
      top5,
      totalWords: distribution.totalWords,
      board,
      bestWord: bestEntry.word,
      bestScore: bestEntry.score,
      bestPlacement: bestPlay.placement,
    });
  } catch (err) {
    console.error('Error scoring:', err);
    res.status(500).json({ error: 'Failed to score' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Slate backend running on port ${PORT}`);
});

module.exports = app;
