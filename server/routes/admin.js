const express = require('express');

const db = require('../db');

const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

function basicAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Timebound Admin"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64 = header.split(' ')[1];
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [user, pass] = decoded.split(':');

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  next();
}

router.get('/dashboard', basicAuth, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const guestUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE username LIKE 'guest_%'").get().c;
    const totalGuardians = db.prepare('SELECT COUNT(*) as c FROM guardians').get().c;
    const totalBattles = db.prepare('SELECT COUNT(*) as c FROM battles').get().c;
    const pvpBattles = db.prepare('SELECT COUNT(*) as c FROM battles WHERE defender_id IS NOT NULL').get().c;
    const topUsers = db.prepare('SELECT * FROM leaderboard ORDER BY rating DESC LIMIT 5').all();

    const userGrowth = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7
    `).all();

    res.json({ totalUsers, guestUsers, totalGuardians, totalBattles, pvpBattles, topUsers, userGrowth });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', basicAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let users;
    let total;

    if (search) {
      users = db.prepare(`
        SELECT u.id, u.username, u.email, u.created_at, u.last_login,
               COALESCE(l.wins, 0) as wins, COALESCE(l.losses, 0) as losses,
               COALESCE(l.rating, 1000) as rating
        FROM users u
        LEFT JOIN leaderboard l ON u.id = l.user_id
        WHERE u.username LIKE ? OR u.email LIKE ?
        ORDER BY u.created_at DESC LIMIT ? OFFSET ?
      `).all(`%${search}%`, `%${search}%`, limit, offset);

      total = db.prepare("SELECT COUNT(*) as c FROM users WHERE username LIKE ? OR email LIKE ?").get(`%${search}%`, `%${search}%`).c;
    } else {
      users = db.prepare(`
        SELECT u.id, u.username, u.email, u.created_at, u.last_login,
               COALESCE(l.wins, 0) as wins, COALESCE(l.losses, 0) as losses,
               COALESCE(l.rating, 1000) as rating
        FROM users u
        LEFT JOIN leaderboard l ON u.id = l.user_id
        ORDER BY u.created_at DESC LIMIT ? OFFSET ?
      `).all(limit, offset);

      total = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    }

    res.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', basicAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.username.startsWith('guest_')) {
      return res.status(400).json({ error: 'Only guest accounts can be deleted via admin. Ban instead?' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Deleted guest user #${req.params.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/guardians', basicAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const offset = (page - 1) * limit;

    const guardians = db.prepare(`
      SELECT g.*, u.username FROM guardians g
      JOIN users u ON g.user_id = u.id
      ORDER BY g.level DESC, g.rarity DESC LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as c FROM guardians').get().c;

    const rarityStats = db.prepare(`
      SELECT rarity, COUNT(*) as count FROM guardians GROUP BY rarity
    `).all();

    res.json({ guardians, total, page, limit, pages: Math.ceil(total / limit), rarityStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/battles', basicAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const offset = (page - 1) * limit;

    const battles = db.prepare(`
      SELECT b.*, a.username as attacker, d.username as defender
      FROM battles b
      JOIN users a ON b.attacker_id = a.id
      LEFT JOIN users d ON b.defender_id = d.id
      ORDER BY b.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as c FROM battles').get().c;
    const winRate = db.prepare("SELECT result, COUNT(*) as count FROM battles GROUP BY result").all();

    res.json({ battles, total, page, limit, pages: Math.ceil(total / limit), winRate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaderboard/reset', basicAuth, (req, res) => {
  try {
    db.prepare('UPDATE leaderboard SET wins = 0, losses = 0, rating = 1000').run();
    res.json({ success: true, message: 'Leaderboard reset to default values' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
