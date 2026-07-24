const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();
}

function checksum(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function ensureVersionTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function getAppliedMigrations(db) {
  try {
    return db.prepare("SELECT version, checksum FROM schema_version ORDER BY version").all();
  } catch {
    return [];
  }
}

function runMigrations(db) {
  ensureVersionTable(db);

  const applied = getAppliedMigrations(db);
  const appliedVersions = new Set(applied.map(m => m.version));
  const migrationFiles = getMigrationFiles();
  let ran = 0;

  for (const file of migrationFiles) {
    const version = parseInt(file.split('_')[0], 10);
    const name = file.replace(/^\d+_/, '').replace('.js', '');
    const filePath = path.join(MIGRATIONS_DIR, file);
    const fileChecksum = checksum(filePath);

    if (appliedVersions.has(version)) {
      const existing = applied.find(m => m.version === version);
      if (existing && existing.checksum !== fileChecksum) {
        console.error(`[Migration] CHECKSUM MISMATCH v${version}: ${name}`);
        console.error(`  Applied: ${existing.checksum}`);
        console.error(`  Current: ${fileChecksum}`);
        console.error('  Migration file was modified after being applied!');
      }
      continue;
    }

    console.log(`[Migration] Applying v${version}: ${name}`);
    const migration = require(filePath);
    migration.up(db);

    db.prepare("INSERT INTO schema_version (version, name, checksum) VALUES (?, ?, ?)").run(version, name, fileChecksum);
    ran++;
  }

  return ran;
}

module.exports = { runMigrations };
