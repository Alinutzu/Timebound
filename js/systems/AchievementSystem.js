/**
 * AchievementSystem - Tracks and unlocks achievements
 */

import ACHIEVEMENTS from '../data/achievements.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceManager from '../core/ResourceManager.js';

class AchievementSystem {
  constructor() {
    this.achievements = ACHIEVEMENTS;
    this.checkInterval = null;
    
    this.initializeState();
    this.subscribeToEvents();
    this.startPeriodicCheck();
    
    logger.info('AchievementSystem', 'Initialized with achievements:', Object.keys(this.achievements).length);
  }
  
  /**
   * Initialize achievement state
   */
  initializeState() {
    const state = stateManager.getState();
    
    if (!state.achievements || Object.keys(state.achievements).length === 0) {
      const initialAchievements = {};
      
      for (let key of Object.keys(this.achievements)) {
        initialAchievements[key] = {
          unlocked: false,
          claimed: false,
          unlockedAt: null,
          claimedAt: null
        };
      }
      
      // This would need a new action in StateManager
      // For now, we'll assume it's initialized in getInitialState
    }
  }
  
  /**
   * Subscribe to events for instant checking
   */
  subscribeToEvents() {
    // Check achievements on key events
    eventBus.on('structure:purchased', () => this.checkAchievements());
    eventBus.on('upgrade:purchased', () => this.checkAchievements());
    eventBus.on('upgrade:completed', () => this.checkAchievements());
    eventBus.on('guardian:summoned', () => this.checkAchievements());
    eventBus.on('quest:claimed', () => this.checkAchievements());
    eventBus.on('puzzle:won', () => this.checkAchievements());
    eventBus.on('boss:defeated', () => this.checkAchievements());
    eventBus.on('ascension:completed', () => this.checkAchievements());
    eventBus.on('realm:unlocked', () => this.checkAchievements());
    
    // Special: Patient Upgrader (upgrade took > 1 hour)
    eventBus.on('upgrade:completed', (data) => {
      const duration = data.duration || 0;
      if (duration >= 3600000) { // 1 hour
        stateManager.dispatch({
          type: 'TRIGGER_ACHIEVEMENT',
          payload: { achievementKey: 'patientUpgrader' }
        });
      }
    });
  }
  
  /**
   * Start periodic checking (for time-based achievements)
   */
  startPeriodicCheck() {
    this.checkInterval = resourceManager.setInterval(() => {
      this.checkAchievements();
    }, 5000, 'AchievementCheck'); // Check every 5 seconds
  }
  
  /**
   * Check all achievements
   */
  checkAchievements() {
    const state = stateManager.getState();
    let newUnlocks = 0;
    
    for (let [key, achievement] of Object.entries(this.achievements)) {
      const achievementState = state.achievements[key];
      
      // Skip if already unlocked
      if (achievementState?.unlocked) continue;
      
      // Check condition
      try {
        if (achievement.condition()) {
          this.unlockAchievement(key);
          newUnlocks++;
        }
      } catch (error) {
        logger.error('AchievementSystem', `Error checking ${key}:`, error);
      }
    }
    
    if (newUnlocks > 0) {
      logger.info('AchievementSystem', `Unlocked ${newUnlocks} new achievements`);
    }
  }
  
  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementKey) {
    const achievement = this.achievements[achievementKey];
    
    if (!achievement) {
      logger.error('AchievementSystem', `Achievement ${achievementKey} not found`);
      return;
    }
    
    stateManager.dispatch({
      type: 'UNLOCK_ACHIEVEMENT',
      payload: { achievementKey }
    });
    
    logger.info('AchievementSystem', `Unlocked: ${achievement.name}`);
    
    // Show notification
    this.showUnlockNotification(achievementKey, achievement);
    
    // Emit event
    eventBus.emit('achievement:unlocked', { achievementKey, achievement });
  }
  
  /**
   * Show unlock notification
   */
  showUnlockNotification(key, achievement) {
    const notification = {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${achievement.emoji} ${achievement.name}`,
      description: achievement.description,
      duration: 5000
    };
    
    eventBus.emit('notification:show', notification);
  }
  
  /**
   * Claim achievement rewards
   */
  claim(achievementKey) {
    const state = stateManager.getState();
    const achievementState = state.achievements[achievementKey];
    const achievement = this.achievements[achievementKey];
    
    if (!achievement) {
      logger.error('AchievementSystem', `Achievement ${achievementKey} not found`);
      return false;
    }
    
    if (!achievementState?.unlocked) {
      logger.warn('AchievementSystem', `Achievement ${achievementKey} not unlocked`);
      return false;
    }
    
    if (achievementState.claimed) {
      logger.warn('AchievementSystem', `Achievement ${achievementKey} already claimed`);
      return false;
    }
    
    // Give rewards
    const rewards = achievement.reward;
    
    for (let [resource, amount] of Object.entries(rewards)) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource, amount }
      });
      
      // Track gem earnings
      if (resource === 'gems') {
        stateManager.dispatch({
          type: 'INCREMENT_STATISTIC',
          payload: { key: 'gemsEarned', amount }
        });
      }
    }
    
    // Mark as claimed
    stateManager.dispatch({
      type: 'CLAIM_ACHIEVEMENT',
      payload: { achievementKey }
    });
    
    logger.info('AchievementSystem', `Claimed ${achievement.name}:`, rewards);
    eventBus.emit('achievement:claimed', { achievementKey, rewards });
    
    return true;
  }
  
  /**
   * Get achievement state
   */
  getAchievementState(achievementKey) {
    const state = stateManager.getState();
    return state.achievements[achievementKey];
  }
  
  /**
   * Get all achievements by category
   */
  getByCategory(category = null) {
    if (!category) {
      return this.achievements;
    }
    
    return Object.entries(this.achievements)
      .filter(([key, data]) => data.category === category)
      .reduce((obj, [key, data]) => {
        obj[key] = data;
        return obj;
      }, {});
  }
  
  /**
   * Get achievement progress
   */
  getProgress() {
    const state = stateManager.getState();
    
    let total = 0;
    let unlocked = 0;
    let claimed = 0;
    
    for (let key of Object.keys(this.achievements)) {
      total++;
      const achievementState = state.achievements[key];
      
      if (achievementState?.unlocked) {
        unlocked++;
      }
      
      if (achievementState?.claimed) {
        claimed++;
      }
    }
    
    return {
      total,
      unlocked,
      claimed,
      percentageUnlocked: (unlocked / total) * 100,
      percentageClaimed: (claimed / total) * 100
    };
  }
  
  /**
   * Get unclaimed achievements count
   */
  getUnclaimedCount() {
    const state = stateManager.getState();
    let count = 0;
    
    for (let key of Object.keys(this.achievements)) {
      const achievementState = state.achievements[key];
      if (achievementState?.unlocked && !achievementState.claimed) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Get stats by tier
   */
  getStatsByTier() {
    const state = stateManager.getState();
    const stats = {
      bronze: { total: 0, unlocked: 0 },
      silver: { total: 0, unlocked: 0 },
      gold: { total: 0, unlocked: 0 },
      platinum: { total: 0, unlocked: 0 },
      diamond: { total: 0, unlocked: 0 }
    };
    
    for (let [key, achievement] of Object.entries(this.achievements)) {
      const tier = achievement.tier;
      stats[tier].total++;
      
      const achievementState = state.achievements[key];
      if (achievementState?.unlocked) {
        stats[tier].unlocked++;
      }
    }
    
    return stats;
  }
  
  /**
   * Get recently unlocked achievements
   */
  getRecentlyUnlocked(count = 5) {
    const state = stateManager.getState();
    const unlocked = [];
    
    for (let [key, achievement] of Object.entries(this.achievements)) {
      const achievementState = state.achievements[key];
      
      if (achievementState?.unlocked) {
        unlocked.push({
          key,
          achievement,
          unlockedAt: achievementState.unlockedAt
        });
      }
    }
    
    // Sort by unlock time (newest first)
    unlocked.sort((a, b) => b.unlockedAt - a.unlockedAt);
    
    return unlocked.slice(0, count);
  }
  
  /**
   * Check if should show hint for close achievements
   */
  getCloseAchievements() {
    const hints = [];
    
    // This would check achievements that are almost complete
    // For example: "You're 80% done with Energy Collector!"
    
    // To be implemented based on specific achievement types
    
    return hints;
  }
}

// Singleton
const achievementSystem = new AchievementSystem();

export default achievementSystem;