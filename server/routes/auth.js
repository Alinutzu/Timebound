const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../auth');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hash);

    const user = { id: result.lastInsertRowid, username };
    const token = generateToken(user);

    db.prepare('INSERT INTO leaderboard (user_id, username) VALUES (?, ?)').run(user.id, username);

    res.status(201).json({ token, user: { id: user.id, username } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = generateToken({ id: user.id, username: user.username });

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
