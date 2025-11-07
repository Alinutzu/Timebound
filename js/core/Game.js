/**
 * Game - Main game controller
 * Coordinates all systems
 */

import CONFIG from '../config.js';
import stateManager from './StateManager.js';
import saveManager from './SaveManager.js';
import tickManager from './TickManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

// Import all systems
import structureSystem from '../systems/StructureSystem.js';
import upgradeSystem from '../systems/UpgradeSystem.js';
import upgradeQueueSystem from '../systems/UpgradeQueueSystem.js';
import guardianSystem from '../systems/GuardianSystem.js';
import questSystem from '../systems/QuestSystem.js';
import achievementSystem from '../systems/AchievementSystem.js';
import realmSystem from '../systems/RealmSystem.js';
import ascensionSystem from '../systems/AscensionSystem.js';
import bossSystem from '../systems/BossSystem.js';
import shopSystem from '../systems/ShopSystem.js';
import dailyRewardSystem from '../systems/DailyRewardSystem.js';
import automationSystem from '../systems/AutomationSystem.js';
import statisticsSystem from '../systems/StatisticsSystem.js';
import tutorialSystem from '../systems/TutorialSystem.js';

class Game {
  constructor() {
    this.initialized = false;
    this.systems = {
      structure: structureSystem,
      upgrade: upgradeSystem,
      upgradeQueue: upgradeQueueSystem,
      guardian: guardianSystem,
      quest: questSystem,
      achievement: achievementSystem,
      realm: realmSystem,
      ascension: ascensionSystem,
      boss: bossSystem,
      shop: shopSystem,
      dailyReward: dailyRewardSystem,
      automation: automationSystem,
      statistics: statisticsSystem,
      tutorial: tutorialSystem
    };
    
    logger.info('Game', 'Game instance created');
  }
  
  /**
   * Initialize game
   */
  async init() {
    if (this.initialized) {
      logger.warn('Game', 'Already initialized');
      return;
    }
    
    logger.info('Game', 'Initializing game...');
    
    try {
      // Load save
      const saveData = saveManager.load();
      
      if (saveData) {
        logger.info('Game', 'Save loaded successfully');
        
        // Calculate offline progress
        const offlineProgress = tickManager.calculateOfflineProgress(saveData.timestamp);
        if (offlineProgress) {
          tickManager.applyOfflineProgress(offlineProgress);
        }
      } else {
        logger.info('Game', 'New game started');
      }
      
      // Start game loop
      tickManager.start();
      
      // Start auto-save
      saveManager.startAutoSave();
      
      // Initialize UI (will be done in UI layer)
      eventBus.emit('game:initialized');
      
      this.initialized = true;
      
      logger.info('Game', '✅ Game initialized successfully!');
      
      return true;
    } catch (error) {
      logger.error('Game', 'Failed to initialize:', error);
      return false;
    }
  }
  
  /**
   * Get system by name
   */
  getSystem(name) {
    return this.systems[name];
  }
  
  /**
   * Get all systems
   */
  getAllSystems() {
    return this.systems;
  }
  
  /**
   * Save game manually
   */
  save() {
    return saveManager.save();
  }
  
  /**
   * Reset game
   */
  reset() {
    if (!confirm('Are you sure you want to reset the game? All progress will be lost!')) {
      return false;
    }
    
    saveManager.deleteSave();
    location.reload();
    
    return true;
  }
  
  /**
   * Export save
   */
  exportSave() {
    return saveManager.export();
  }
  
  /**
   * Import save
   */
  async importSave(file) {
    return await saveManager.import(file);
  }
}

// Create global game instance
const game = new Game();

// Make available globally for debugging
if (CONFIG.DEBUG_MODE) {
  window.game = game;
  window.stateManager = stateManager;
  window.eventBus = eventBus;
  window.logger = logger;
}

export default game;