/**
 * AchievementSystem - Tracks and unlocks achievements
 * OPTIMIZED VERSION with proper state management
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
    this.debugMode = false; // ✅ Toggle pentru logging
    
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
    
    // Verifică dacă avem structura nouă (unlocked/claimed arrays)
    if (!state.achievements.unlocked || !state.achievements.claimed) {
      logger.warn('AchievementSystem', 'Legacy achievement structure detected - using new format');
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
      // ✅ FIX: Folosește getAchievementState pentru verificare corectă
      const achievementState = this.getAchievementState(key);
      
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
    
    // ✅ FIX: Dispatch cu 'id' în loc de 'achievementKey'
    stateManager.dispatch({
      type: 'UNLOCK_ACHIEVEMENT',
      payload: { id: achievementKey }
    });
    
    logger.info('AchievementSystem', `✅ Unlocked: ${achievement.name}`);
    
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
      title: '🏆 Achievement Unlocked!',
      message: `${achievement.emoji} ${achievement.name}`,
      description: achievement.description,
      duration: 5000
    };
    
    eventBus.emit('notification:show', notification);
  }
  
  /**
   * ✅ FIXED: Claim achievement rewards
   */
  claim(achievementKey) {
    if (this.debugMode) {
      logger.info('AchievementSystem', '🎯 Attempting to claim:', achievementKey);
    }
    
    const state = this.getAchievementState(achievementKey);
    const achievement = this.achievements[achievementKey];
    
    if (!achievement) {
      logger.error('AchievementSystem', `❌ Achievement ${achievementKey} not found`);
      return false;
    }
    
    // ✅ Validations
    if (!state.unlocked) {
      logger.warn('AchievementSystem', `❌ Achievement ${achievementKey} not unlocked`);
      eventBus.emit('notification:show', {
        type: 'error',
        message: 'Achievement not unlocked yet!',
        duration: 2000
      });
      return false;
    }
    
    if (state.claimed) {
      logger.warn('AchievementSystem', `⚠️ Achievement ${achievementKey} already claimed`);
      eventBus.emit('notification:show', {
        type: 'warning',
        message: 'Already claimed!',
        duration: 2000
      });
      return false;
    }
    
    // ✅ Give rewards
    const rewards = achievement.reward;
    
    if (this.debugMode) {
      logger.info('AchievementSystem', '✅ Granting rewards:', rewards);
    }
    
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
    
    // ✅ Mark as claimed (folosește 'id' nu 'achievementKey')
    stateManager.dispatch({
      type: 'CLAIM_ACHIEVEMENT',
      payload: { id: achievementKey }
    });
    
    logger.info('AchievementSystem', `✅ Claimed ${achievement.name}:`, rewards);
    
    // ✅ Show success notification
    const rewardText = Object.entries(rewards)
      .map(([r, a]) => {
        const icons = { gems: '💎', crystals: '💠', energy: '⚡', timeShards: '⏰' };
        return `${a} ${icons[r] || r}`;
      })
      .join(', ');
    
    eventBus.emit('notification:show', {
      type: 'success',
      title: `🏆 ${achievement.name}`,
      message: `Claimed: ${rewardText}`,
      duration: 4000
    });
    
    // Emit event
    eventBus.emit('achievement:claimed', { achievementKey, rewards });
    
    return true;
  }
  
  /**
   * ✅ FIXED: Get achievement state from new structure
   */
  getAchievementState(achievementKey) {
    const state = stateManager.getState();
    
    if (!state.achievements) {
      return { unlocked: false, claimed: false };
    }
    
    // ✅ Check în unlocked/claimed arrays
    const isUnlocked = state.achievements.unlocked?.includes(achievementKey) || false;
    const isClaimed = state.achievements.claimed?.includes(achievementKey) || false;
    
    // ✅ Doar debug logging, nu spam
    if (this.debugMode) {
      logger.debug('AchievementSystem', `getState(${achievementKey}):`, { 
        unlocked: isUnlocked, 
        claimed: isClaimed 
      });
    }
    
    return {
      unlocked: isUnlocked,
      claimed: isClaimed
    };
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
   * ✅ FIXED: Get achievement progress
   */
  getProgress() {
    const state = stateManager.getState();
    
    const total = Object.keys(this.achievements).length;
    const unlocked = state.achievements?.unlocked?.length || 0;
    const claimed = state.achievements?.claimed?.length || 0;
    
    return {
      total,
      unlocked,
      claimed,
      percentageUnlocked: total > 0 ? (unlocked / total) * 100 : 0,
      percentageClaimed: total > 0 ? (claimed / total) * 100 : 0
    };
  }
  
  /**
   * ✅ FIXED: Get unclaimed achievements count
   */
  getUnclaimedCount() {
    const state = stateManager.getState();
    
    const unlocked = state.achievements?.unlocked || [];
    const claimed = state.achievements?.claimed || [];
    
    // Unclaimed = unlocked dar nu claimed
    const unclaimed = unlocked.filter(key => !claimed.includes(key));
    
    return unclaimed.length;
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
      if (stats[tier]) {
        stats[tier].total++;
        
        const achievementState = this.getAchievementState(key);
        if (achievementState.unlocked) {
          stats[tier].unlocked++;
        }
      }
    }
    
    return stats;
  }
  
  /**
   * ✅ FIXED: Get recently unlocked achievements
   */
  getRecentlyUnlocked(count = 5) {
    const state = stateManager.getState();
    const unlocked = [];
    
    // Get all unlocked achievement keys
    const unlockedKeys = state.achievements?.unlocked || [];
    
    for (let key of unlockedKeys) {
      const achievement = this.achievements[key];
      if (achievement) {
        unlocked.push({
          key,
          achievement,
          unlockedAt: Date.now() // Would need timestamp tracking
        });
      }
    }
    
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
  
  /**
   * ✅ Enable/disable debug logging
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    logger.info('AchievementSystem', `Debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }
}

// Singleton
const achievementSystem = new AchievementSystem();

// ✅ Make claim globally accessible
window.claimAchievement = function(achievementKey) {
  return achievementSystem.claim(achievementKey);
};

export default achievementSystem;