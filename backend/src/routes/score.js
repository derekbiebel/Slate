const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { isValidWord } = require('../engine/wordList');
const { scoreWord, getPercentile, getBestPlacement } = require('../engine/scorer');

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function loadTodayPuzzle(db) {
  const dateStr = getTodayString();
  const row = db.prepare('SELECT * FROM puzzles WHERE date = ?').get(dateStr);
  if (!row) return null;
  return {
    date: row.date,
    letters: JSON.parse(row.letters),
    board: JSON.parse(row.board),
    distribution: JSON.parse(row.distribution)
  };
}

/**
 * POST /api/score
 * Body: { word, placement, userId? }
 */
router.post('/', (req, res) => {
  try {
    const db = req.app.get('db');
    const { word, placement, userId: rawUserId } = req.body;

    if (!word || !placement) {
      return res.status(400).json({ error: 'word and placement are required' });
    }

    const upperWord = word.toUpperCase();

    // Validate word is in dictionary
    if (!isValidWord(upperWord)) {
      return res.status(400).json({ error: 'Word is not in the dictionary' });
    }

    // Validate word length matches placement
    if (upperWord.length !== placement.length) {
      return res.status(400).json({ error: 'Placement length must match word length' });
    }

    // Validate placement indices are valid and unique
    const placementSet = new Set(placement);
    if (placementSet.size !== placement.length) {
      return res.status(400).json({ error: 'Placement indices must be unique' });
    }
    if (placement.some(i => i < 0 || i > 4)) {
      return res.status(400).json({ error: 'Placement indices must be 0-4' });
    }

    // Validate placement is consecutive
    const sorted = [...placement].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        return res.status(400).json({ error: 'Letters must be placed in consecutive slots' });
      }
    }

    // Load today's puzzle
    const puzzle = loadTodayPuzzle(db);
    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle for today. Hit /api/puzzle/today first.' });
    }

    // Validate letters exist in today's puzzle
    const availableLetters = [...puzzle.letters];
    for (const ch of upperWord) {
      const idx = availableLetters.indexOf(ch);
      if (idx === -1) {
        return res.status(400).json({ error: `Letter '${ch}' is not available in today's puzzle` });
      }
      availableLetters.splice(idx, 1);
    }

    // Calculate score
    const score = scoreWord(upperWord, placement, puzzle.board);

    // Get percentile
    const percentile = getPercentile(score, puzzle.distribution);

    // Check/create userId
    const userId = rawUserId || uuidv4();

    // Check if user already submitted today
    const existing = db.prepare(
      'SELECT * FROM scores WHERE puzzle_date = ? AND user_id = ?'
    ).get(puzzle.date, userId);

    if (existing) {
      return res.status(409).json({
        error: 'Already submitted for today',
        score: existing.score,
        percentile: existing.percentile
      });
    }

    // Store score
    db.prepare(
      'INSERT INTO scores (puzzle_date, user_id, word, placement, score, percentile) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(puzzle.date, userId, upperWord, JSON.stringify(placement), score, percentile);

    // Determine streak (>= 90th percentile)
    const streakContinues = percentile >= 90;

    // Update user streak if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (user) {
      if (streakContinues) {
        const newStreak = user.streak + 1;
        const bestStreak = Math.max(user.best_streak, newStreak);
        db.prepare('UPDATE users SET streak = ?, best_streak = ? WHERE id = ?')
          .run(newStreak, bestStreak, userId);
      } else {
        db.prepare('UPDATE users SET streak = 0 WHERE id = ?').run(userId);
      }
    }

    // Top 5 words
    const top5 = puzzle.distribution.entries.slice(0, 5);
    const totalWords = puzzle.distribution.totalWords;

    // Best word with optimal placement
    const bestEntry = puzzle.distribution.entries[0];
    const bestPlay = getBestPlacement(bestEntry.word, puzzle.board);

    return res.json({
      score,
      percentile,
      streakContinues,
      top5,
      totalWords,
      userId,
      board: puzzle.board,
      bestWord: bestEntry.word,
      bestScore: bestEntry.score,
      bestPlacement: bestPlay.placement,
    });
  } catch (err) {
    console.error('Error scoring:', err);
    return res.status(500).json({ error: 'Failed to score word' });
  }
});

/**
 * GET /api/reveal?userId=...
 * Return top 5 words with scores for today (only if player already submitted).
 */
router.get('/reveal', (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.query.userId;
    const dateStr = getTodayString();

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user has submitted
    const submission = db.prepare(
      'SELECT * FROM scores WHERE puzzle_date = ? AND user_id = ?'
    ).get(dateStr, userId);

    if (!submission) {
      return res.status(403).json({ error: 'Must submit a word before revealing answers' });
    }

    const puzzle = loadTodayPuzzle(db);
    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle for today' });
    }

    const top5 = puzzle.distribution.entries.slice(0, 5);

    return res.json({
      top5,
      yourWord: submission.word,
      yourScore: submission.score,
      yourPercentile: submission.percentile
    });
  } catch (err) {
    console.error('Error revealing:', err);
    return res.status(500).json({ error: 'Failed to reveal answers' });
  }
});

module.exports = router;
