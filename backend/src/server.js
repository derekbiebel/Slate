const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const puzzleRoutes = require('./routes/puzzle');
const scoreRoutes = require('./routes/score');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json({ limit: '1mb' }));

// Initialize SQLite database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'slate.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Run schema
const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf-8');
db.exec(schema);

// Make db available to routes
app.set('db', db);

// Routes
app.use('/api/puzzle', puzzleRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Dev: reset today's scores (allows replaying)
app.post('/api/dev/reset', (req, res) => {
  const dateStr = new Date().toISOString().slice(0, 10);
  db.prepare('DELETE FROM scores WHERE puzzle_date = ?').run(dateStr);
  db.prepare('DELETE FROM puzzles WHERE date = ?').run(dateStr);
  res.json({ ok: true, cleared: dateStr });
});

// Dev: generate a random practice puzzle (not the daily)
app.get('/api/puzzle/random', (req, res) => {
  try {
    const { generatePuzzle } = require('./engine/puzzleGenerator');
    const { buildScoreDistribution } = require('./engine/scorer');
    // Use a random seed based on current timestamp
    const seed = 'random-' + Date.now() + '-' + Math.random();
    const { letters, board } = generatePuzzle(seed);
    const distribution = buildScoreDistribution(letters, board);
    res.json({ letters, board, distribution, seed });
  } catch (err) {
    console.error('Error generating random puzzle:', err);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
});

// Dev: score against a random puzzle (doesn't save to DB)
app.post('/api/score/practice', (req, res) => {
  try {
    const { word, placement, letters, board, distribution } = req.body;
    const { isValidWord } = require('./engine/wordList');
    const { scoreWord, getPercentile, getBestPlacement } = require('./engine/scorer');

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
    console.error('Error scoring practice:', err);
    res.status(500).json({ error: 'Failed to score' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Slate backend running on port ${PORT}`);
});

module.exports = app;
