const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../auth');

const router = express.Router();

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function authRateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return next();
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  const limit = RATE_LIMIT_WINDOW * 2;
  for (const [ip, record] of rateLimitMap) {
    if (now - record.windowStart > limit) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000);

router.post('/register', authRateLimit, (req, res) => {
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

router.post('/login', authRateLimit, (req, res) => {
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

    res.json({ token, user: { id: user.id, username: user.username, energy: user.energy || 100000 } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/guest', authRateLimit, (req, res) => {
  try {
    const guestId = Math.random().toString(36).slice(2, 10);
    const username = `guest_${guestId}`;
    const email = `guest_${guestId}@temp.local`;
    const password = Math.random().toString(36).slice(2, 18);

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hash);

    const user = { id: result.lastInsertRowid, username };
    const token = generateToken(user);

    db.prepare('INSERT INTO leaderboard (user_id, username) VALUES (?, ?)').run(user.id, username);

    res.status(201).json({ token, user: { id: user.id, username }, isGuest: true });
  } catch (err) {
    console.error('Guest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const { authMiddleware } = require('../auth');

router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, energy, gems, gems_won, gems_lost FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/convert', authMiddleware, (req, res) => {
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

    const existing = db.prepare('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?').get(username, email, req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?').run(username, email, hash, req.user.id);
    db.prepare('UPDATE leaderboard SET username = ? WHERE user_id = ?').run(username, req.user.id);

    const token = generateToken({ id: req.user.id, username });

    res.json({ token, user: { id: req.user.id, username }, isGuest: false });
  } catch (err) {
    console.error('Convert error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
