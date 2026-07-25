/**
 * migration_runner Tests
 *
 * Tests migration execution, idempotency, checksum detection, schema_version tracking.
 * Run: node --test tests/migration_runner.test.js
 *
 * Uses real better-sqlite3 in-memory DB and real migration files.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Require modules under test (CommonJS)
const Database = require(join(__dirname, '..', 'server', 'node_modules', 'better-sqlite3'));
const { runMigrations } = require(join(__dirname, '..', 'server', 'migration_runner.js'));

// Path to real migrations
const MIGRATIONS_DIR = join(__dirname, '..', 'server', 'migrations');
const FILE_PATTERN = /^(\d+)_(.+)\.js$/;

// Helper: get migration files from disk
function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => FILE_PATTERN.test(f))
    .sort();
}

// Helper: compute checksum
function checksum(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

describe('migration_runner', () => {
  let db;

  beforeEach(() => {
    // Fresh in-memory DB for each test
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    // Clear require cache to avoid stale module state
    Object.keys(require.cache).forEach(key => {
      if (key.includes('migration_runner') || key.includes('migrations/')) {
        delete require.cache[key];
      }
    });
  });

  // --- Fresh DB ---

  describe('fresh DB', () => {
    it('applies all migrations and returns count', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      const ran = runner.runMigrations(db);
      const expectedFiles = getMigrationFiles();
      assert.equal(ran, expectedFiles.length);
    });

    it('creates schema_version table', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const names = tables.map(t => t.name);
      assert.ok(names.includes('schema_version'));
    });

    it('creates game tables (users, guardians, etc.)', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const names = tables.map(t => t.name);
      assert.ok(names.includes('users'));
      assert.ok(names.includes('guardians'));
      assert.ok(names.includes('battles'));
      assert.ok(names.includes('leaderboard'));
      assert.ok(names.includes('save_data'));
    });
  });

  // --- schema_version tracking ---

  describe('schema_version', () => {
    it('records each migration with version, name, and checksum', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);

      const rows = db.prepare("SELECT * FROM schema_version ORDER BY version").all();
      const expectedFiles = getMigrationFiles();
      assert.equal(rows.length, expectedFiles.length);

      for (const row of rows) {
        assert.ok(typeof row.version === 'number');
        assert.ok(typeof row.name === 'string' && row.name.length > 0);
        assert.ok(typeof row.checksum === 'string' && row.checksum.length === 32); // md5 hex
        assert.ok(row.applied_at); // timestamp
      }
    });

    it('stores correct migration names', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);

      const rows = db.prepare("SELECT version, name FROM schema_version ORDER BY version").all();
      const names = rows.map(r => r.name);
      assert.ok(names.includes('initial_schema'));
      assert.ok(names.includes('add_energy_gems'));
      assert.ok(names.includes('fix_wrong_defaults'));
    });
  });

  // --- Idempotency ---

  describe('idempotency', () => {
    it('returns 0 on second run (no reapplication)', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      const first = runner.runMigrations(db);
      const second = runner.runMigrations(db);
      assert.equal(first, getMigrationFiles().length);
      assert.equal(second, 0);
    });

    it('does not duplicate schema_version rows', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);
      runner.runMigrations(db);

      const rows = db.prepare("SELECT * FROM schema_version").all();
      assert.equal(rows.length, getMigrationFiles().length);
    });

    it('preserves existing data across runs', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);

      // Insert test data
      db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run('test', 'test@test.com', 'hash');
      const countBefore = db.prepare("SELECT COUNT(*) as n FROM users").get().n;

      runner.runMigrations(db); // should not affect data

      const countAfter = db.prepare("SELECT COUNT(*) as n FROM users").get().n;
      assert.equal(countBefore, countAfter);
    });
  });

  // --- Checksum detection ---

  describe('checksum mismatch', () => {
    it('throws error when migration file was modified after apply', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));

      // First run — applies all migrations
      runner.runMigrations(db);

      // Tamper with checksum: update schema_version for v1 to wrong checksum
      db.prepare("UPDATE schema_version SET checksum = 'tampered' WHERE version = 1").run();

      // Second run should detect mismatch and throw
      assert.throws(
        () => runner.runMigrations(db),
        /CHECKSUM MISMATCH/
      );
    });
  });

  // --- Table structure ---

  describe('table structure', () => {
    it('users table has expected columns', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);

      const cols = db.prepare("PRAGMA table_info(users)").all();
      const colNames = cols.map(c => c.name);
      assert.ok(colNames.includes('id'));
      assert.ok(colNames.includes('username'));
      assert.ok(colNames.includes('email'));
      assert.ok(colNames.includes('password'));
      assert.ok(colNames.includes('created_at'));
      assert.ok(colNames.includes('last_login'));
    });

    it('save_data table exists and has user_id + state columns', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);

      const cols = db.prepare("PRAGMA table_info(save_data)").all();
      const colNames = cols.map(c => c.name);
      assert.ok(colNames.includes('user_id'));
      assert.ok(colNames.includes('state'));
      assert.ok(colNames.includes('updated_at'));
    });

    it('leaderboard table has expected columns', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);

      const cols = db.prepare("PRAGMA table_info(leaderboard)").all();
      const colNames = cols.map(c => c.name);
      assert.ok(colNames.includes('user_id'));
      assert.ok(colNames.includes('username'));
      assert.ok(colNames.includes('wins'));
      assert.ok(colNames.includes('losses'));
      assert.ok(colNames.includes('rating'));
      assert.ok(colNames.includes('guardian_power'));
    });
  });

  // --- Edge cases ---

  describe('edge cases', () => {
    it('ignores files that do not match FILE_PATTERN', () => {
      // Create a non-matching file
      const fakeFile = join(MIGRATIONS_DIR, 'README.md');
      fs.writeFileSync(fakeFile, '# not a migration');
      try {
        const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
        const ran = runner.runMigrations(db);
        // Should only apply real migrations, not README.md
        assert.equal(ran, getMigrationFiles().length);
        // README.md should not appear in schema_version
        const rows = db.prepare("SELECT * FROM schema_version WHERE name = 'md'").all();
        assert.equal(rows.length, 0);
      } finally {
        fs.unlinkSync(fakeFile);
      }
    });

    it('ignores files without numeric prefix', () => {
      const fakeFile = join(MIGRATIONS_DIR, 'test_migration.js');
      fs.writeFileSync(fakeFile, 'module.exports = { up(db) {} }');
      try {
        const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
        const ran = runner.runMigrations(db);
        assert.equal(ran, getMigrationFiles().length);
      } finally {
        fs.unlinkSync(fakeFile);
      }
    });

    it('applies migrations in version order', () => {
      const runner = require(join(__dirname, '..', 'server', 'migration_runner.js'));
      runner.runMigrations(db);
      const rows = db.prepare("SELECT version FROM schema_version ORDER BY version").all();
      const versions = rows.map(r => r.version);
      // Should be sorted ascending
      for (let i = 1; i < versions.length; i++) {
        assert.ok(versions[i] > versions[i - 1]);
      }
    });
  });
});
