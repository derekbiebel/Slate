const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/user/register
 * Body: { email }
 */
router.post('/register', (req, res) => {
  try {
    const db = req.app.get('db');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.json({ userId: existing.id, message: 'Already registered' });
    }

    const userId = uuidv4();
    db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(userId, email);

    return res.json({ userId });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * GET /api/user/:id/streak
 */
router.get('/:id/streak', (req, res) => {
  try {
    const db = req.app.get('db');
    const user = db.prepare('SELECT streak, best_streak FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      streak: user.streak,
      bestStreak: user.best_streak
    });
  } catch (err) {
    console.error('Error getting streak:', err);
    return res.status(500).json({ error: 'Failed to get streak' });
  }
});

module.exports = router;
