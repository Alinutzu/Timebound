const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const save = db.prepare('SELECT state, updated_at FROM save_data WHERE user_id = ?').get(req.user.id);
    if (!save) return res.json({ state: null });

    res.json({ state: JSON.parse(save.state), updatedAt: save.updated_at });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { state } = req.body;
    if (!state) return res.status(400).json({ error: 'State required' });

    const stateStr = JSON.stringify(state);

    db.prepare(`
      INSERT INTO save_data (user_id, state, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET state = ?, updated_at = CURRENT_TIMESTAMP
    `).run(req.user.id, stateStr, stateStr);

    res.json({ success: true, updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
