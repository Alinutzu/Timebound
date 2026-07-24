import CONFIG from '../config.js';
import logger from '../utils/Logger.js';

class SaveManager {
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
    const currentVersion = CONFIG.VERSION;
    if (savedVersion === currentVersion) return saveData;

    logger.info('[SaveManager] Migrating', savedVersion, '->', currentVersion);
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
      state.caps.tidalEnergy = state.caps.tidalEnergy || CONFIG.BALANCING.BASE_TIDAL_ENERGY_CAP;
      state.caps.solarEssence = state.caps.solarEssence || CONFIG.BALANCING.BASE_SOLAR_ESSENCE_CAP;
      state.caps.cryoEnergy = state.caps.cryoEnergy || CONFIG.BALANCING.BASE_CRYO_ENERGY_CAP;
      state.caps.cosmicEnergy = state.caps.cosmicEnergy || CONFIG.BALANCING.BASE_COSMIC_ENERGY_CAP;
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

const saveManager = new SaveManager();
export default saveManager;
