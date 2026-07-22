const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'timebound.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS guardians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    guardian_key TEXT NOT NULL,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 5,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attacker_id INTEGER NOT NULL,
    defender_id INTEGER,
    attacker_guardian_ids TEXT NOT NULL,
    defender_guardian_ids TEXT,
    result TEXT NOT NULL,
    attacker_hp_remaining INTEGER DEFAULT 0,
    defender_hp_remaining INTEGER DEFAULT 0,
    exp_reward INTEGER DEFAULT 0,
    gems_reward INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attacker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (defender_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 1000,
    guardian_power INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS save_data (
    user_id INTEGER PRIMARY KEY,
    state TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_leaderboard_rating ON leaderboard(rating DESC);
  CREATE INDEX IF NOT EXISTS idx_battles_attacker ON battles(attacker_id);
  CREATE INDEX IF NOT EXISTS idx_guardians_user ON guardians(user_id);
`);

const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
if (!userCols.includes('energy')) {
  db.exec("ALTER TABLE users ADD COLUMN energy INTEGER DEFAULT 100000");
} else {
  db.exec("UPDATE users SET energy = 100000 WHERE energy <= 10000");
}
if (!userCols.includes('gems')) {
  db.exec("ALTER TABLE users ADD COLUMN gems INTEGER DEFAULT 60");
} else {
  db.exec("UPDATE users SET gems = 60 WHERE gems = 0");
}
if (!userCols.includes('gems_won')) {
  db.exec("ALTER TABLE users ADD COLUMN gems_won INTEGER DEFAULT 0");
}
if (!userCols.includes('gems_lost')) {
  db.exec("ALTER TABLE users ADD COLUMN gems_lost INTEGER DEFAULT 0");
}
if (!userCols.includes('last_pve_at')) {
  db.exec("ALTER TABLE users ADD COLUMN last_pve_at INTEGER DEFAULT 0");
}
if (!userCols.includes('last_pvp_at')) {
  db.exec("ALTER TABLE users ADD COLUMN last_pvp_at INTEGER DEFAULT 0");
}

module.exports = db;
