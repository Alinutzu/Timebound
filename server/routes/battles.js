const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

const MAX_PVP_GUARDIANS = 5;

const PVE_COOLDOWN_BASE = 15;
const PVE_COOLDOWN_PER_LEVEL = 2;
const PVE_COOLDOWN_MAX = 60;

const PVP_COOLDOWN_BASE = 30;
const PVP_COOLDOWN_PER_LEVEL = 5;
const PVP_COOLDOWN_MAX = 180;

function getAvgGuardianLevel(userId) {
  const row = db.prepare('SELECT AVG(level) as avg FROM guardians WHERE user_id = ?').get(userId);
  return Math.floor(row?.avg || 0);
}

function getCooldownRemaining(lastTime, cooldownSec) {
  if (!lastTime) return 0;
  const elapsed = Math.floor(Date.now() / 1000) - lastTime;
  return Math.max(0, cooldownSec - elapsed);
}

router.post('/pve', authMiddleware, (req, res) => {
  try {
    const { guardianIds } = req.body;
    if (!Array.isArray(guardianIds) || guardianIds.length === 0) {
      return res.status(400).json({ error: 'Select at least one guardian' });
    }

    if (guardianIds.length > MAX_PVP_GUARDIANS) {
      return res.status(400).json({ error: `Max ${MAX_PVP_GUARDIANS} guardians per battle` });
    }

    const avgLevel = getAvgGuardianLevel(req.user.id);
    const cooldownSec = Math.min(PVE_COOLDOWN_BASE + avgLevel * PVE_COOLDOWN_PER_LEVEL, PVE_COOLDOWN_MAX);
    const user = db.prepare('SELECT last_pve_at FROM users WHERE id = ?').get(req.user.id);
    const remaining = getCooldownRemaining(user?.last_pve_at, cooldownSec);
    if (remaining > 0) {
      return res.status(429).json({ error: `Train again in ${remaining}s`, cooldown: remaining });
    }

    const placeholders = guardianIds.map(() => '?').join(',');
    const guardians = db.prepare(`SELECT * FROM guardians WHERE id IN (${placeholders}) AND user_id = ?`)
      .all(...guardianIds, req.user.id);

    if (guardians.length !== guardianIds.length) {
      return res.status(400).json({ error: 'Some guardians not found' });
    }

    const enemyPower = Math.floor(
      guardians.reduce((sum, g) => sum + g.attack + g.defense + g.hp, 0) * (0.8 + Math.random() * 0.6)
    );

    const playerPower = guardians.reduce((sum, g) => sum + g.attack + g.defense + g.hp, 0);

    const playerRoll = playerPower * (0.8 + Math.random() * 0.4);
    const enemyRoll = enemyPower * (0.8 + Math.random() * 0.4);

    const won = playerRoll > enemyRoll;
    const expReward = won ? Math.floor(playerPower * 0.3) + 50 : Math.floor(playerPower * 0.05) + 10;
    const gemsReward = won ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 2);

    const battleOps = db.transaction(() => {
      db.prepare('UPDATE users SET last_pve_at = ? WHERE id = ?').run(Math.floor(Date.now() / 1000), req.user.id);

      if (won) {
        guardians.forEach(g => {
          const hpGain = Math.floor(g.max_hp * 0.02);
          const atkGain = Math.random() < 0.3 ? 1 : 0;
          const defGain = Math.random() < 0.2 ? 1 : 0;
          db.prepare('UPDATE guardians SET level = level + 1, attack = attack + ?, defense = defense + ?, hp = hp + ?, max_hp = max_hp + ? WHERE id = ?')
            .run(atkGain, defGain, hpGain, hpGain, g.id);
        });
      }

      db.prepare(`INSERT INTO battles (attacker_id, attacker_guardian_ids, result, exp_reward, gems_reward) VALUES (?, ?, ?, ?, ?)`)
        .run(req.user.id, JSON.stringify(guardianIds), won ? 'win' : 'loss', expReward, gemsReward);
    });

    battleOps();

    const updatedGuardians = db.prepare(`SELECT id, level, attack, defense, hp FROM guardians WHERE id IN (${placeholders})`).all(...guardianIds);

    res.json({
      result: won ? 'win' : 'loss',
      playerPower: Math.floor(playerRoll),
      enemyPower: Math.floor(enemyRoll),
      expReward,
      gemsReward,
      guardians: updatedGuardians,
      cooldown: cooldownSec,
      message: won ? 'Victory! Your guardians grew stronger.' : 'Defeat... Train your guardians harder.'
    });
  } catch (err) {
    console.error('PvE error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/pvp/challenge', authMiddleware, (req, res) => {
  try {
    const { guardianIds, defenderId } = req.body;
    if (!Array.isArray(guardianIds) || guardianIds.length === 0) {
      return res.status(400).json({ error: 'Select at least one guardian' });
    }

    if (guardianIds.length > MAX_PVP_GUARDIANS) {
      return res.status(400).json({ error: `Max ${MAX_PVP_GUARDIANS} guardians per battle` });
    }

    if (!defenderId) {
      return res.status(400).json({ error: 'Defender required' });
    }

    const avgLevel = getAvgGuardianLevel(req.user.id);
    const cooldownSec = Math.min(PVP_COOLDOWN_BASE + avgLevel * PVP_COOLDOWN_PER_LEVEL, PVP_COOLDOWN_MAX);
    const user = db.prepare('SELECT last_pvp_at FROM users WHERE id = ?').get(req.user.id);
    const remaining = getCooldownRemaining(user?.last_pvp_at, cooldownSec);
    if (remaining > 0) {
      return res.status(429).json({ error: `Battle again in ${remaining}s`, cooldown: remaining });
    }

    const defender = db.prepare('SELECT * FROM leaderboard WHERE user_id = ?').get(defenderId);
    if (!defender) return res.status(404).json({ error: 'Defender not found' });

    const placeholders = guardianIds.map(() => '?').join(',');
    const guardians = db.prepare(`SELECT * FROM guardians WHERE id IN (${placeholders}) AND user_id = ?`)
      .all(...guardianIds, req.user.id);

    if (guardians.length !== guardianIds.length) {
      return res.status(400).json({ error: 'Some guardians not found' });
    }

    const attackerPower = guardians.reduce((sum, g) => sum + g.attack + g.defense + g.hp, 0);
    const defenderPower = defender.guardian_power || 500;

    const attackerRoll = attackerPower * (0.8 + Math.random() * 0.4);
    const defenderRoll = defenderPower * (0.8 + Math.random() * 0.4);

    const attackerWon = attackerRoll > defenderRoll;
    const attackerChange = attackerWon ? Math.floor(10 + Math.random() * 15) : -Math.floor(5 + Math.random() * 10);
    const defenderChange = attackerWon ? -Math.floor(5 + Math.random() * 10) : Math.floor(8 + Math.random() * 12);

    const battleOps = db.transaction(() => {
      db.prepare('UPDATE users SET last_pvp_at = ? WHERE id = ?').run(Math.floor(Date.now() / 1000), req.user.id);

      db.prepare('UPDATE leaderboard SET wins = wins + ?, losses = losses + ?, rating = MAX(0, rating + ?) WHERE user_id = ?')
        .run(attackerWon ? 1 : 0, attackerWon ? 0 : 1, attackerChange, req.user.id);

      db.prepare('UPDATE leaderboard SET wins = wins + ?, losses = losses + ?, rating = MAX(0, rating + ?) WHERE user_id = ?')
        .run(attackerWon ? 0 : 1, attackerWon ? 1 : 0, defenderChange, defenderId);

      db.prepare(`INSERT INTO battles (attacker_id, defender_id, attacker_guardian_ids, result, attacker_hp_remaining, defender_hp_remaining, exp_reward, gems_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(req.user.id, defenderId, JSON.stringify(guardianIds), attackerWon ? 'win' : 'loss',
          Math.floor(attackerRoll), Math.floor(defenderRoll),
          Math.floor(attackerPower * 0.2) + 30, attackerWon ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 3));
    });

    battleOps();

    const attackerRating = db.prepare('SELECT rating FROM leaderboard WHERE user_id = ?').get(req.user.id).rating;
    const defenderRating = db.prepare('SELECT rating FROM leaderboard WHERE user_id = ?').get(defenderId).rating;

    res.json({
      result: attackerWon ? 'win' : 'loss',
      attackerPower: Math.floor(attackerRoll),
      defenderPower: Math.floor(defenderRoll),
      attackerChange,
      defenderChange,
      attackerRating,
      defenderRating,
      cooldown: cooldownSec
    });
  } catch (err) {
    console.error('PvP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
