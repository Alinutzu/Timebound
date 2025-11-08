/**
 * SaveManager - Handle save/load with versioning and migration
 */

import CONFIG from '../config.js';
import stateManager from './StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class SaveManager {
  constructor() {
    this.saveKey = CONFIG.SAVE_KEY;
    this.compressionEnabled = true;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = null;
    
    logger.info('SaveManager', 'Initialized');
  }
  
  /**
   * Save game to localStorage
   */
  save() {
    try {
      const state = stateManager.getState();
      
      // Create save object
      const saveData = {
        version: CONFIG.VERSION,
        timestamp: Date.now(),
        state: state
      };
      
      // Stringify
      let jsonString = JSON.stringify(saveData);
      
      // Compress if enabled (simple LZString would be better in production)
      if (this.compressionEnabled) {
        // For now, just use regular JSON
        // In production, use: jsonString = LZString.compress(jsonString);
      }
      
      // Save to localStorage
      localStorage.setItem(this.saveKey, jsonString);
      
      // Update last saved time
stateManager.dispatch({
  type: 'SAVE_GAME',
  payload: {}
});
      
      logger.info('SaveManager', 'Game saved successfully');
      eventBus.emit('game:saved', { timestamp: Date.now() });
      
      return true;
    } catch (error) {
      logger.error('SaveManager', 'Failed to save game:', error);
      eventBus.emit('game:save-failed', { error: error.message });
      return false;
    }
  }
  
  /**
   * Load game from localStorage
   */
  load() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      
      if (!savedData) {
        logger.info('SaveManager', 'No save data found');
        return null;
      }
      
      // Decompress if needed
      let jsonString = savedData;
      if (this.compressionEnabled) {
        // jsonString = LZString.decompress(savedData) || savedData;
      }
      
      // Parse
      const saveData = JSON.parse(jsonString);
      
      // Validate
      if (!this.validateSave(saveData)) {
        logger.error('SaveManager', 'Invalid save data');
        return null;
      }
      
      // Migrate if needed
      const migratedData = this.migrate(saveData);
      
      // Load into state
      stateManager.dispatch({
        type: 'LOAD_STATE',
        payload: { state: migratedData.state }
      });
      
      logger.info('SaveManager', 'Game loaded successfully', {
        version: migratedData.version,
        timestamp: new Date(migratedData.timestamp).toLocaleString()
      });
      
      eventBus.emit('game:loaded', { saveData: migratedData });
      
      return migratedData;
    } catch (error) {
      logger.error('SaveManager', 'Failed to load game:', error);
      eventBus.emit('game:load-failed', { error: error.message });
      return null;
    }
  }
  
  /**
   * Validate save data structure
   */
  validateSave(saveData) {
    if (!saveData || typeof saveData !== 'object') {
      return false;
    }
    
    if (!saveData.version || !saveData.state) {
      return false;
    }
    
    // Basic structure validation
    const requiredKeys = ['resources', 'structures', 'upgrades'];
    for (let key of requiredKeys) {
      if (!saveData.state[key]) {
        logger.warn('SaveManager', `Missing required key: ${key}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Migrate old save versions to current
   */
  migrate(saveData) {
    const savedVersion = saveData.version;
    const currentVersion = CONFIG.VERSION;
    
    if (savedVersion === currentVersion) {
      logger.info('SaveManager', 'Save data is current version');
      return saveData;
    }
    
    logger.info('SaveManager', `Migrating from ${savedVersion} to ${currentVersion}`);
    
    let migratedState = { ...saveData.state };
    
    // Migration logic based on version
    // Example: v1.x.x → v2.x.x
    if (this.compareVersions(savedVersion, '2.0.0') < 0) {
      migratedState = this.migrateToV2(migratedState);
    }
    
    // Add more migrations as needed
    // if (this.compareVersions(savedVersion, '2.1.0') < 0) {
    //   migratedState = this.migrateToV2_1(migratedState);
    // }
    
    return {
      ...saveData,
      version: currentVersion,
      state: migratedState
    };
  }
  
  /**
   * Migration to v2.0.0
   */
  migrateToV2(state) {
    logger.info('SaveManager', 'Applying v2.0.0 migration');
    
    // Ensure new structure exists
    if (!state.ascension) {
      state.ascension = {
        level: 0,
        lifetimeEnergy: state.lifetimeEnergy || 0,
        totalAscensions: 0
      };
    }
    
    if (!state.realms) {
      state.realms = {
        current: 'forest',
        unlocked: ['forest']
      };
    }
    
    if (!state.automation) {
      state.automation = {
        autoBuyStructures: false,
        autoClaimQuests: false,
        autoPuzzle: false,
        autoBuyThreshold: 0.8
      };
    }
    
    // Migrate old structure format
    if (state.structures) {
      const newStructures = {};
      for (let [key, value] of Object.entries(state.structures)) {
        if (typeof value === 'number') {
          // Old format: just level
          newStructures[key] = {
            level: value,
            totalPurchased: value
          };
        } else {
          // Already new format
          newStructures[key] = value;
        }
      }
      state.structures = newStructures;
    }
    
    // Ensure statistics exist
    if (!state.statistics) {
      state.statistics = {
        sessionsPlayed: 1,
        totalPlayTime: 0,
        sessionStartTime: Date.now(),
        structuresPurchased: 0,
        upgradesPurchased: 0,
        guardiansSummoned: 0,
        questsCompleted: 0,
        bossesDefeated: 0,
        puzzlesPlayed: 0,
        puzzleHighScore: 0,
        gemsSpent: 0,
        gemsEarned: 0,
        highestEnergyPerSecond: 0
      };
    }
    
    return state;
  }
  
  /**
   * Compare version strings
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    
    return 0;
  }
  
  /**
   * Export save as downloadable file
   */
  export() {
    try {
      const state = stateManager.getState();
      const exportData = {
        version: CONFIG.VERSION,
        timestamp: Date.now(),
        state: state
      };
      
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `idle_game_save_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logger.info('SaveManager', 'Save exported');
      eventBus.emit('game:exported');
      
      return true;
    } catch (error) {
      logger.error('SaveManager', 'Failed to export save:', error);
      return false;
    }
  }
  
  /**
   * Import save from file
   */
  async import(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!this.validateSave(importData)) {
        throw new Error('Invalid save file');
      }
      
      const migratedData = this.migrate(importData);
      
      stateManager.dispatch({
        type: 'LOAD_STATE',
        payload: { state: migratedData.state }
      });
      
      // Save immediately
      this.save();
      
      logger.info('SaveManager', 'Save imported successfully');
      eventBus.emit('game:imported', { saveData: migratedData });
      
      return true;
    } catch (error) {
      logger.error('SaveManager', 'Failed to import save:', error);
      eventBus.emit('game:import-failed', { error: error.message });
      return false;
    }
  }
  
  /**
   * Delete save
   */
  deleteSave() {
    try {
      localStorage.removeItem(this.saveKey);
      logger.info('SaveManager', 'Save deleted');
      eventBus.emit('game:save-deleted');
      return true;
    } catch (error) {
      logger.error('SaveManager', 'Failed to delete save:', error);
      return false;
    }
  }
  
  /**
   * Check if save exists
   */
  hasSave() {
    return localStorage.getItem(this.saveKey) !== null;
  }
  
  /**
   * Get save size in bytes
   */
  getSaveSize() {
    const savedData = localStorage.getItem(this.saveKey);
    if (!savedData) return 0;
    
    // Rough estimate (UTF-16)
    return new Blob([savedData]).size;
  }
  
  /**
   * Get save info without loading
   */
  getSaveInfo() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (!savedData) return null;
      
      const saveData = JSON.parse(savedData);
      
      return {
        version: saveData.version,
        timestamp: saveData.timestamp,
        size: this.getSaveSize(),
        hasState: !!saveData.state
      };
    } catch (error) {
      logger.error('SaveManager', 'Failed to get save info:', error);
      return null;
    }
  }
  
  /**
   * Start auto-save
   */
  startAutoSave() {
    if (this.autoSaveInterval) {
      this.stopAutoSave();
    }
    
    this.autoSaveInterval = setInterval(() => {
      if (this.autoSaveEnabled) {
        this.save();
      }
    }, CONFIG.AUTO_SAVE_INTERVAL);
    
    logger.info('SaveManager', `Auto-save started (every ${CONFIG.AUTO_SAVE_INTERVAL / 1000}s)`);
  }
  
  /**
   * Stop auto-save
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      logger.info('SaveManager', 'Auto-save stopped');
    }
  }
  
  /**
   * Toggle auto-save
   */
  toggleAutoSave(enabled) {
    this.autoSaveEnabled = enabled;
    
    if (enabled && !this.autoSaveInterval) {
      this.startAutoSave();
    } else if (!enabled && this.autoSaveInterval) {
      this.stopAutoSave();
    }
  }
}

// Singleton
const saveManager = new SaveManager();

export default saveManager;