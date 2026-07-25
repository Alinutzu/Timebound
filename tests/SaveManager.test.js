/**
 * SaveManager Tests
 *
 * Tests validation, migration, and version comparison.
 * Run: node --test tests/SaveManager.test.js
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ===== MOCKS =====

const mockLogger = {
  _logs: [],
  info(mod, msg) { this._logs.push({ level: 'info', mod, msg }); },
  warn(mod, msg) { this._logs.push({ level: 'warn', mod, msg }); },
  error(mod, msg) { this._logs.push({ level: 'error', mod, msg }); },
  debug(mod, msg) { this._logs.push({ level: 'debug', mod, msg }); },
  clear() { this._logs = []; }
};

function createMockConfig(version = '2.1.0') {
  return Object.freeze({
    VERSION: version,
    BALANCING: {
      BASE_TIDAL_ENERGY_CAP: 50000,
      BASE_SOLAR_ESSENCE_CAP: 50000,
      BASE_CRYO_ENERGY_CAP: 50000,
      BASE_COSMIC_ENERGY_CAP: 50000
    }
  });
}

// Inline SaveManager (mirrors js/core/SaveManager.js)
class SaveManager {
  constructor(config) {
    this._config = config;
  }

  validateSave(saveData) {
    if (!saveData || typeof saveData !== 'object') return false;
    if (!saveData.version || !saveData.state) return false;
    const required = ['resources', 'structures', 'upgrades'];
    for (const key of required) {
      if (!saveData.state[key]) return false;
    }
    return true;
  }

  migrate(saveData) {
    const savedVersion = saveData.version;
    const currentVersion = this._config.VERSION;
    if (savedVersion === currentVersion) return saveData;

    let migrated = { ...saveData.state };

    if (this.compareVersions(savedVersion, '2.0.0') < 0) {
      migrated = this.migrateToV2(migrated);
    }

    return { ...saveData, version: currentVersion, state: migrated };
  }

  migrateToV2(state) {
    if (!state.ascension) {
      state.ascension = { level: 0, lifetimeEnergy: state.lifetimeEnergy || 0, totalAscensions: 0 };
    }
    if (!state.realms) {
      state.realms = { current: 'forest', unlocked: ['forest'] };
    }
    if (!state.automation) {
      state.automation = { autoBuyStructures: false, autoClaimQuests: false, autoPuzzle: false, autoBuyThreshold: 0.8 };
    }
    if (state.structures) {
      const newStructures = {};
      for (const [key, value] of Object.entries(state.structures)) {
        newStructures[key] = typeof value === 'number' ? { level: value, totalPurchased: value } : value;
      }
      state.structures = newStructures;
    }
    if (state.resources) {
      state.resources.tidalEnergy = state.resources.tidalEnergy || 0;
      state.resources.solarEssence = state.resources.solarEssence || 0;
      state.resources.cryoEnergy = state.resources.cryoEnergy || 0;
      state.resources.cosmicEnergy = state.resources.cosmicEnergy || 0;
      state.resources.pearls = state.resources.pearls || 0;
    }
    if (state.production) {
      state.production.tidalEnergy = state.production.tidalEnergy || 0;
      state.production.solarEssence = state.production.solarEssence || 0;
      state.production.cryoEnergy = state.production.cryoEnergy || 0;
      state.production.cosmicEnergy = state.production.cosmicEnergy || 0;
    }
    if (state.caps) {
      state.caps.tidalEnergy = state.caps.tidalEnergy || this._config.BALANCING.BASE_TIDAL_ENERGY_CAP;
      state.caps.solarEssence = state.caps.solarEssence || this._config.BALANCING.BASE_SOLAR_ESSENCE_CAP;
      state.caps.cryoEnergy = state.caps.cryoEnergy || this._config.BALANCING.BASE_CRYO_ENERGY_CAP;
      state.caps.cosmicEnergy = state.caps.cosmicEnergy || this._config.BALANCING.BASE_COSMIC_ENERGY_CAP;
    }
    if (!state.statistics) {
      state.statistics = { sessionsPlayed: 1, totalPlayTime: 0, sessionStartTime: Date.now(), structuresPurchased: 0, upgradesPurchased: 0, guardiansSummoned: 0, questsCompleted: 0, bossesDefeated: 0, puzzlesPlayed: 0, puzzleHighScore: 0, gemsSpent: 0, gemsEarned: 0, highestEnergyPerSecond: 0 };
    }
    return state;
  }

  compareVersions(v1, v2) {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (p1[i] > p2[i]) return 1;
      if (p1[i] < p2[i]) return -1;
    }
    return 0;
  }
}

// ===== TESTS =====

describe('SaveManager', () => {
  let sm;

  beforeEach(() => {
    sm = new SaveManager(createMockConfig('2.1.0'));
    mockLogger.clear();
  });

  // --- validateSave ---

  describe('validateSave()', () => {
    it('returns false for null', () => {
      assert.equal(sm.validateSave(null), false);
    });

    it('returns false for undefined', () => {
      assert.equal(sm.validateSave(undefined), false);
    });

    it('returns false for non-object', () => {
      assert.equal(sm.validateSave('string'), false);
      assert.equal(sm.validateSave(42), false);
    });

    it('returns false when version missing', () => {
      assert.equal(sm.validateSave({ state: { resources: {}, structures: {}, upgrades: {} } }), false);
    });

    it('returns false when state missing', () => {
      assert.equal(sm.validateSave({ version: '2.1.0' }), false);
    });

    it('returns false when resources missing from state', () => {
      assert.equal(sm.validateSave({ version: '2.1.0', state: { structures: {}, upgrades: {} } }), false);
    });

    it('returns false when structures missing from state', () => {
      assert.equal(sm.validateSave({ version: '2.1.0', state: { resources: {}, upgrades: {} } }), false);
    });

    it('returns false when upgrades missing from state', () => {
      assert.equal(sm.validateSave({ version: '2.1.0', state: { resources: {}, structures: {} } }), false);
    });

    it('returns true for valid save with all required fields', () => {
      const valid = {
        version: '2.1.0',
        state: { resources: { energy: 10 }, structures: {}, upgrades: {} }
      };
      assert.equal(sm.validateSave(valid), true);
    });

    it('returns true even with extra fields', () => {
      const valid = {
        version: '2.1.0',
        state: { resources: {}, structures: {}, upgrades: {}, guardians: [] }
      };
      assert.equal(sm.validateSave(valid), true);
    });
  });

  // --- compareVersions ---

  describe('compareVersions()', () => {
    it('returns 0 for equal versions', () => {
      assert.equal(sm.compareVersions('2.0.0', '2.0.0'), 0);
    });

    it('returns 1 when v1 > v2 (major)', () => {
      assert.equal(sm.compareVersions('3.0.0', '2.0.0'), 1);
    });

    it('returns -1 when v1 < v2 (major)', () => {
      assert.equal(sm.compareVersions('1.0.0', '2.0.0'), -1);
    });

    it('compares minor versions', () => {
      assert.equal(sm.compareVersions('2.1.0', '2.0.0'), 1);
      assert.equal(sm.compareVersions('2.0.0', '2.1.0'), -1);
    });

    it('compares patch versions', () => {
      assert.equal(sm.compareVersions('2.0.1', '2.0.0'), 1);
      assert.equal(sm.compareVersions('2.0.0', '2.0.1'), -1);
    });

    it('handles multi-digit numbers', () => {
      assert.equal(sm.compareVersions('2.10.0', '2.9.0'), 1);
    });
  });

  // --- migrate ---

  describe('migrate()', () => {
    it('returns saveData unchanged when versions match', () => {
      const save = { version: '2.1.0', state: { resources: {}, structures: {}, upgrades: {} } };
      const result = sm.migrate(save);
      assert.deepEqual(result, save);
    });

    it('updates version to current when migrating', () => {
      const save = {
        version: '1.5.0',
        state: { resources: {}, structures: {}, upgrades: {} }
      };
      const result = sm.migrate(save);
      assert.equal(result.version, '2.1.0');
    });

    it('calls migrateToV2 for pre-2.0.0 saves', () => {
      const save = {
        version: '1.0.0',
        state: {
          resources: { energy: 100 },
          structures: { solarPanel: 5 },
          upgrades: { efficiency1: 1 }
        }
      };
      const result = sm.migrate(save);
      assert.ok(result.state.ascension, 'should add ascension');
      assert.ok(result.state.realms, 'should add realms');
      assert.ok(result.state.statistics, 'should add statistics');
    });
  });

  // --- migrateToV2 ---

  describe('migrateToV2()', () => {
    it('adds ascension if missing', () => {
      const state = { resources: {}, structures: {}, upgrades: {} };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.ascension, { level: 0, lifetimeEnergy: 0, totalAscensions: 0 });
    });

    it('preserves existing ascension', () => {
      const state = {
        ascension: { level: 3, lifetimeEnergy: 5000, totalAscensions: 3 },
        resources: {}, structures: {}, upgrades: {}
      };
      const result = sm.migrateToV2(state);
      assert.equal(result.ascension.level, 3);
    });

    it('adds realms if missing', () => {
      const state = { resources: {}, structures: {}, upgrades: {} };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.realms, { current: 'forest', unlocked: ['forest'] });
    });

    it('adds automation if missing', () => {
      const state = { resources: {}, structures: {}, upgrades: {} };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.automation, {
        autoBuyStructures: false,
        autoClaimQuests: false,
        autoPuzzle: false,
        autoBuyThreshold: 0.8
      });
    });

    it('converts numeric structures to { level, totalPurchased }', () => {
      const state = {
        resources: {},
        structures: { solarPanel: 5, windTurbine: 3 },
        upgrades: {}
      };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.structures.solarPanel, { level: 5, totalPurchased: 5 });
      assert.deepEqual(result.structures.windTurbine, { level: 3, totalPurchased: 3 });
    });

    it('preserves already-object structures', () => {
      const state = {
        resources: {},
        structures: { solarPanel: { level: 5, totalPurchased: 10 } },
        upgrades: {}
      };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.structures.solarPanel, { level: 5, totalPurchased: 10 });
    });

    it('adds tidalEnergy/solarEssence/cryoEnergy/cosmicEnergy/pearls to resources', () => {
      const state = { resources: { energy: 100 }, structures: {}, upgrades: {} };
      const result = sm.migrateToV2(state);
      assert.equal(result.resources.tidalEnergy, 0);
      assert.equal(result.resources.solarEssence, 0);
      assert.equal(result.resources.cryoEnergy, 0);
      assert.equal(result.resources.cosmicEnergy, 0);
      assert.equal(result.resources.pearls, 0);
    });

    it('adds production rates for new resources', () => {
      const state = { resources: {}, structures: {}, upgrades: {}, production: { energy: 5 } };
      const result = sm.migrateToV2(state);
      assert.equal(result.production.tidalEnergy, 0);
      assert.equal(result.production.solarEssence, 0);
      assert.equal(result.production.cryoEnergy, 0);
      assert.equal(result.production.cosmicEnergy, 0);
      assert.equal(result.production.energy, 5);
    });

    it('adds caps with config defaults', () => {
      const state = { resources: {}, structures: {}, upgrades: {}, caps: { energy: 10000 } };
      const result = sm.migrateToV2(state);
      assert.equal(result.caps.tidalEnergy, 50000);
      assert.equal(result.caps.solarEssence, 50000);
      assert.equal(result.caps.cryoEnergy, 50000);
      assert.equal(result.caps.cosmicEnergy, 50000);
      assert.equal(result.caps.energy, 10000);
    });

    it('adds statistics if missing', () => {
      const state = { resources: {}, structures: {}, upgrades: {} };
      const result = sm.migrateToV2(state);
      assert.ok(result.statistics);
      assert.equal(result.statistics.sessionsPlayed, 1);
      assert.equal(result.statistics.structuresPurchased, 0);
    });

    it('preserves existing lifetimeEnergy in ascension', () => {
      const state = {
        lifetimeEnergy: 99999,
        resources: {},
        structures: {},
        upgrades: {}
      };
      const result = sm.migrateToV2(state);
      assert.equal(result.ascension.lifetimeEnergy, 99999);
    });
  });

  // --- Edge cases ---

  describe('edge cases', () => {
    it('version between 2.0.0 and current skips migrateToV2', () => {
      const save = {
        version: '2.0.5',
        state: {
          resources: { energy: 100 },
          structures: { solarPanel: 3 },
          upgrades: {}
        }
      };
      const result = sm.migrate(save);
      assert.equal(result.version, '2.1.0');
      // Should NOT add ascension/realms/statistics (those are v2 migration)
      assert.equal(result.state.ascension, undefined);
      assert.equal(result.state.realms, undefined);
      assert.equal(result.state.statistics, undefined);
      // Structures should remain as-is (not converted from numbers)
      assert.equal(result.state.structures.solarPanel, 3);
    });

    it('state.resources = null does not crash in migrateToV2', () => {
      const state = {
        resources: null,
        structures: {},
        upgrades: {}
      };
      // Should not throw
      const result = sm.migrateToV2(state);
      assert.ok(result);
    });

    it('empty structures object is handled', () => {
      const state = { resources: {}, structures: {}, upgrades: {} };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.structures, {});
    });

    it('mixed old and new structures are converted correctly', () => {
      const state = {
        resources: {},
        structures: {
          solarPanel: 5,
          windTurbine: { level: 3, totalPurchased: 10 }
        },
        upgrades: {}
      };
      const result = sm.migrateToV2(state);
      assert.deepEqual(result.structures.solarPanel, { level: 5, totalPurchased: 5 });
      assert.deepEqual(result.structures.windTurbine, { level: 3, totalPurchased: 10 });
    });

    it('resources with some fields already set preserves them', () => {
      const state = {
        resources: { energy: 100, tidalEnergy: 50, pearls: 10 },
        structures: {},
        upgrades: {}
      };
      const result = sm.migrateToV2(state);
      assert.equal(result.resources.tidalEnergy, 50);
      assert.equal(result.resources.pearls, 10);
      assert.equal(result.resources.energy, 100);
    });

    it('validateSave returns false for save with empty state object', () => {
      assert.equal(sm.validateSave({ version: '2.1.0', state: {} }), false);
    });
  });
});
