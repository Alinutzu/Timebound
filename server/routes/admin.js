const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');

const CONFIG_PATH = path.resolve(__dirname, '../admin-config.json');
const AUDIT_LOG_PATH = path.resolve(__dirname, '../admin-audit.log');

const router = express.Router();

function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);
    if (!config.password_hash && config.password) {
      config.password_hash = bcrypt.hashSync(config.password, 10);
      delete config.password;
      saveConfig(config);
    }
    return config;
  } catch {
    const defaults = {
      username: process.env.ADMIN_USER || 'admin',
      password_hash: bcrypt.hashSync(process.env.ADMIN_PASS || 'admin123', 10),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60000;
const CHECK_LOCK_RATE_MAX = 10;
const CHECK_LOCK_RATE_WINDOW = 60000;

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress;
}

let lastCleanup = Date.now();
function cleanupStaleRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, record] of loginAttempts) {
    if (!record.lockedUntil && now - record.firstAttempt > LOCKOUT_MS) {
      loginAttempts.delete(ip);
    } else if (record.lockedUntil && now >= record.lockedUntil) {
      loginAttempts.delete(ip);
    }
  }
}

setInterval(cleanupStaleRecords, CLEANUP_INTERVAL_MS);

function checkRateLimit(ip) {
  cleanupStaleRecords();
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true, remaining: MAX_ATTEMPTS };

  if (record.lockedUntil && now < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, locked: true, minutesLeft, remaining: 0 };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  return { allowed: true, remaining: Math.max(0, MAX_ATTEMPTS - record.count) };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  if (record.lockedUntil) return;
  record.count++;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    auditLog('system', 'IP locked', { ip, attempts: record.count, duration: LOCKOUT_MINUTES });
  }

  loginAttempts.set(ip, record);
}

function recordSuccessfulAttempt(ip) {
  loginAttempts.delete(ip);
}

const checkLockRateMap = new Map();
function checkLockRateLimit(ip) {
  const now = Date.now();
  const record = checkLockRateMap.get(ip);
  if (!record || now - record.windowStart > CHECK_LOCK_RATE_WINDOW) {
    checkLockRateMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= CHECK_LOCK_RATE_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of checkLockRateMap) {
    if (now - record.windowStart > CHECK_LOCK_RATE_WINDOW * 2) {
      checkLockRateMap.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

function getAdminIPWhitelist() {
  const raw = process.env.ADMIN_IP_WHITELIST || '';
  if (!raw) return null;
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function checkIPWhitelist(req) {
  const whitelist = getAdminIPWhitelist();
  if (!whitelist || whitelist.length === 0) return { allowed: true };
  const ip = getClientIP(req);
  const allowed = whitelist.includes(ip) || whitelist.includes('::1') || whitelist.includes('127.0.0.1');
  if (!allowed) {
    auditLog('system', 'IP denied by whitelist', { ip, whitelist });
  }
  return { allowed };
}

function auditLog(action, detail, extra = {}) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      detail,
      ...extra,
    };
    fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + '\n');
  } catch {}
}

function basicAuth(req, res, next) {
  const ip = getClientIP(req);

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Too many failed attempts',
      locked: true,
      minutesLeft: rateCheck.minutesLeft,
    });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64 = header.split(' ')[1];
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [user, pass] = decoded.split(':');

  const config = loadConfig();

  const passMatch = bcrypt.compareSync(pass || '', config.password_hash || '');

  if (user !== config.username || !passMatch) {
    recordFailedAttempt(ip);
    const remaining = MAX_ATTEMPTS - (loginAttempts.get(ip)?.count || 0);
    auditLog('auth', 'Failed login attempt', { ip, user, remaining: Math.max(0, remaining) });
    return res.status(403).json({
      error: 'Invalid credentials',
      remaining: Math.max(0, remaining),
    });
  }

  recordSuccessfulAttempt(ip);
  req.adminUser = config.username;
  next();
}

router.get('/check-lock', (req, res) => {
  const ip = getClientIP(req);
  if (!checkLockRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  const ipCheck = checkIPWhitelist(req);
  if (!ipCheck.allowed) {
    return res.json({ locked: false, whitelistDenied: true });
  }
  const rateCheck = checkRateLimit(ip);
  res.json(rateCheck);
});

router.post('/change-password', basicAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const config = loadConfig();
  if (!bcrypt.compareSync(currentPassword, config.password_hash)) {
    auditLog('auth', 'Failed password change', { user: req.adminUser, ip: getClientIP(req) });
    return res.status(403).json({ error: 'Current password is incorrect' });
  }

  config.password_hash = bcrypt.hashSync(newPassword, 10);
  saveConfig(config);
  auditLog('auth', 'Password changed', { user: req.adminUser, ip: getClientIP(req) });
  res.json({ success: true, message: 'Password changed successfully' });
});

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

    auditLog('view', 'Dashboard viewed', { user: req.adminUser, ip: getClientIP(req) });
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
    auditLog('delete', 'Guest user deleted', { user: req.adminUser, targetId: req.params.id, targetUser: user.username });
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

router.post('/leaderboard/reset', basicAuth, (req, res) => {
  try {
    db.prepare('UPDATE leaderboard SET wins = 0, losses = 0, rating = 1000').run();
    auditLog('reset', 'Leaderboard reset', { user: req.adminUser, ip: getClientIP(req) });
    res.json({ success: true, message: 'Leaderboard reset to default values' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit-log', basicAuth, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    if (!fs.existsSync(AUDIT_LOG_PATH)) return res.json({ entries: [] });
    const data = fs.readFileSync(AUDIT_LOG_PATH, 'utf-8');
    const lines = data.trim().split('\n').filter(Boolean);
    const entries = lines.slice(-limit).map(line => JSON.parse(line)).reverse();
    res.json({ entries, total: lines.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
