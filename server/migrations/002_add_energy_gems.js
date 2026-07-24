module.exports = {
  up(db) {
    const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

    if (!cols.includes('energy')) {
      db.exec("ALTER TABLE users ADD COLUMN energy INTEGER DEFAULT 100000");
    }
    db.exec("UPDATE users SET energy = 100000 WHERE energy IS NULL");

    if (!cols.includes('gems')) {
      db.exec("ALTER TABLE users ADD COLUMN gems INTEGER DEFAULT 60");
    }
    db.exec("UPDATE users SET gems = 60 WHERE gems IS NULL");

    if (!cols.includes('gems_won')) {
      db.exec("ALTER TABLE users ADD COLUMN gems_won INTEGER DEFAULT 0");
    }
    if (!cols.includes('gems_lost')) {
      db.exec("ALTER TABLE users ADD COLUMN gems_lost INTEGER DEFAULT 0");
    }
    if (!cols.includes('last_pve_at')) {
      db.exec("ALTER TABLE users ADD COLUMN last_pve_at INTEGER DEFAULT 0");
    }
    if (!cols.includes('last_pvp_at')) {
      db.exec("ALTER TABLE users ADD COLUMN last_pvp_at INTEGER DEFAULT 0");
    }
  }
};
