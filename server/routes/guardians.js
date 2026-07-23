const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

const RARITY_STATS = {
  common:    { baseAtk: 8,  baseDef: 5,  baseHp: 80  },
  uncommon:  { baseAtk: 12, baseDef: 8,  baseHp: 120 },
  rare:      { baseAtk: 18, baseDef: 12, baseHp: 180 },
  epic:      { baseAtk: 28, baseDef: 18, baseHp: 280 },
  legendary: { baseAtk: 45, baseDef: 30, baseHp: 450 }
};

const GUARDIAN_NAMES = [
  'Aethon', 'Borealis', 'Calyx', 'Dravion', 'Elara',
  'Fenris', 'Galen', 'Helios', 'Iridis', 'Jarek',
  'Kael', 'Luna', 'Mira', 'Nyx', 'Orion',
  'Pyra', 'Quinn', 'Rhea', 'Sylas', 'Theron'
];

const BASE_LEVELUP_COST = 10000;
const MAX_GUARDIAN_LEVEL = 50;
const SUMMON_COST = 50;

router.get('/', authMiddleware, (req, res) => {
  try {
    const guardians = db.prepare('SELECT * FROM guardians WHERE user_id = ? ORDER BY rarity DESC, level DESC').all(req.user.id);
    res.json(guardians);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/summon', authMiddleware, (req, res) => {
  try {
    const summonOp = db.transaction(() => {
      const user = db.prepare('SELECT id, gems FROM users WHERE id = ?').get(req.user.id);
      if (!user) return { error: 'User not found', status: 404 };

      if (user.gems < SUMMON_COST) {
        return { error: `Summon costs ${SUMMON_COST} gems`, status: 400, cost: SUMMON_COST, gems: user.gems };
      }

      const count = db.prepare('SELECT COUNT(*) as c FROM guardians WHERE user_id = ?').get(req.user.id).c;
      if (count >= 20) {
        return { error: 'Guardian roster full (max 20)', status: 400 };
      }

      const roll = Math.random() * 100;
      let rarity;
      if (roll < 1)       rarity = 'legendary';
      else if (roll < 5)  rarity = 'epic';
      else if (roll < 20) rarity = 'rare';
      else if (roll < 50) rarity = 'uncommon';
      else                rarity = 'common';

      const stats = RARITY_STATS[rarity];
      const name = GUARDIAN_NAMES[Math.floor(Math.random() * GUARDIAN_NAMES.length)];
      const guardianKey = `guardian_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      const result = db.prepare(`
        INSERT INTO guardians (user_id, guardian_key, name, rarity, attack, defense, hp, max_hp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, guardianKey, name, rarity, stats.baseAtk, stats.baseDef, stats.baseHp, stats.baseHp);

      db.prepare('UPDATE users SET gems = gems - ? WHERE id = ?').run(SUMMON_COST, req.user.id);

      const guardian = db.prepare('SELECT * FROM guardians WHERE id = ?').get(result.lastInsertRowid);
      const updatedUser = db.prepare('SELECT gems FROM users WHERE id = ?').get(req.user.id);

      updateLeaderboardPower(req.user.id);

      return { guardian, gems: updatedUser.gems, cost: SUMMON_COST };
    });

    const result = summonOp();
    if (result.error) {
      return res.status(result.status).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    console.error('Summon error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/levelup', authMiddleware, (req, res) => {
  try {
    const guardian = db.prepare('SELECT * FROM guardians WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!guardian) return res.status(404).json({ error: 'Guardian not found' });

    if (guardian.level >= MAX_GUARDIAN_LEVEL) {
      return res.status(400).json({ error: `Guardian already at max level (${MAX_GUARDIAN_LEVEL})` });
    }

    const cost = Math.floor(BASE_LEVELUP_COST * Math.pow(1.5, guardian.level));

    const user = db.prepare('SELECT energy FROM users WHERE id = ?').get(req.user.id);
    if (user.energy < cost) {
      return res.status(400).json({ error: 'Not enough energy', required: cost, current: user.energy });
    }

    const hpGain = Math.floor(guardian.max_hp * 0.1);
    const atkGain = Math.floor(guardian.attack * 0.08) + 1;
    const defGain = Math.floor(guardian.defense * 0.06) + 1;

    db.prepare('UPDATE users SET energy = energy - ? WHERE id = ?').run(cost, req.user.id);

    db.prepare(`
      UPDATE guardians SET
        level = level + 1,
        attack = attack + ?,
        defense = defense + ?,
        hp = hp + ?,
        max_hp = max_hp + ?
      WHERE id = ?
    `).run(atkGain, defGain, hpGain, hpGain, req.params.id);

    const updated = db.prepare('SELECT * FROM guardians WHERE id = ?').get(req.params.id);
    const updatedUser = db.prepare('SELECT energy FROM users WHERE id = ?').get(req.user.id);

    updateLeaderboardPower(req.user.id);

    res.json({ guardian: updated, energy: updatedUser.energy, cost });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM guardians WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Guardian not found' });

    updateLeaderboardPower(req.user.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

function updateLeaderboardPower(userId) {
  const guardians = db.prepare('SELECT attack, defense, hp FROM guardians WHERE user_id = ?').all(userId);
  const power = guardians.reduce((sum, g) => sum + g.attack + g.defense + g.hp, 0);
  db.prepare('UPDATE leaderboard SET guardian_power = ?, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?').run(power, userId);
}

module.exports = router;
