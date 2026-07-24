const Database = require('better-sqlite3');
const path = require('path');
const { runMigrations } = require('./migration_runner');

const db = new Database(path.join(__dirname, 'timebound.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const ran = runMigrations(db);
if (ran > 0) {
  console.log(`[DB] Applied ${ran} migration(s)`);
}

module.exports = db;
