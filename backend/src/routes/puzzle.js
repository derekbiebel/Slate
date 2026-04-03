const express = require('express');
const router = express.Router();
const { generatePuzzle } = require('../engine/puzzleGenerator');
const { buildScoreDistribution } = require('../engine/scorer');

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/puzzle/today
 * Generate today's puzzle (or load from cache), store distribution in DB.
 * Returns { letters, board } (NOT distribution/solutions).
 */
router.get('/today', (req, res) => {
  try {
    const db = req.app.get('db');
    const dateStr = getTodayString();

    // Check cache
    const cached = db.prepare('SELECT letters, board FROM puzzles WHERE date = ?').get(dateStr);
    if (cached) {
      return res.json({
        date: dateStr,
        letters: JSON.parse(cached.letters),
        board: JSON.parse(cached.board)
      });
    }

    // Generate new puzzle
    const { letters, board } = generatePuzzle(dateStr);

    // Build score distribution
    const distribution = buildScoreDistribution(letters, board);

    // Store in DB
    db.prepare(
      'INSERT INTO puzzles (date, letters, board, distribution) VALUES (?, ?, ?, ?)'
    ).run(
      dateStr,
      JSON.stringify(letters),
      JSON.stringify(board),
      JSON.stringify(distribution)
    );

    return res.json({
      date: dateStr,
      letters,
      board
    });
  } catch (err) {
    console.error('Error generating puzzle:', err);
    return res.status(500).json({ error: 'Failed to generate puzzle' });
  }
});

module.exports = router;
