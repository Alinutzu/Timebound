const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const entries = db.prepare(`
      SELECT user_id, username, wins, losses, rating, guardian_power
      FROM leaderboard
      ORDER BY rating DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as c FROM leaderboard').get().c;

    res.json({ entries, total, limit, offset });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  try {
    const entry = db.prepare('SELECT * FROM leaderboard WHERE user_id = ?').get(req.user.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });

    const rank = db.prepare('SELECT COUNT(*) as c FROM leaderboard WHERE rating > ?').get(entry.rating).c + 1;

    res.json({ ...entry, rank });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/opponents', authMiddleware, (req, res) => {
  try {
    const me = db.prepare('SELECT rating FROM leaderboard WHERE user_id = ?').get(req.user.id);
    if (!me) return res.status(404).json({ error: 'Not found' });

    const opponents = db.prepare(`
      SELECT user_id, username, wins, losses, rating, guardian_power
      FROM leaderboard
      WHERE user_id != ? AND rating BETWEEN ? AND ?
      ORDER BY ABS(rating - ?) ASC
      LIMIT 10
    `).all(req.user.id, me.rating - 200, me.rating + 200, me.rating);

    res.json(opponents);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
