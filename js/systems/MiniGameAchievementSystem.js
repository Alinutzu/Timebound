/**
 * MiniGameAchievementSystem - Manages mini-game specific achievements
 * Tracks progress, unlocks, and rewards
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import { 
  MINI_GAME_ACHIEVEMENTS, 
  getAchievementsByGame,
  getAchievementById,
  getAllMiniGameAchievements,
  ACHIEVEMENT_TIERS
} from '../data/miniGameAchievements.js';

class MiniGameAchievementSystem {
  constructor() {
    this.checkQueue = [];
    this.isProcessing = false;
    
    this.init();
  }
  
  init() {
    // Listen for mini-game events
    eventBus.on('daily-spin:reward-granted', () => this.checkAchievements('dailySpin'));
    eventBus.on('game-2048:game-over', () => this.checkAchievements('game2048'));
    eventBus.on('match3:game-complete', () => this.checkAchievements('match3'));
    
    // Also check on stats update
    eventBus.on('mini-game:stats-updated', (data) => {
      if (data.game) {
        this.checkAchievements(data.game);
      }
    });
    
    logger.info('MiniGameAchievementSystem', 'Initialized');
  }
  
  /**
   * Check all achievements for a specific game
   */
  checkAchievements(gameType) {
    const achievements = getAchievementsByGame(gameType);
    if (!achievements || achievements.length === 0) return;
    
    const stats = this.getMiniGameStats(gameType);
    const state = stateManager.getState();
    const unlockedAchievements = state.achievements?.miniGames?.[gameType] || [];
    
    achievements.forEach(achievement => {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) return;
      
      // Check condition
      if (achievement.condition(stats)) {
        this.unlockAchievement(achievement);
      }
    });
  }
  
  /**
   * Get mini-game stats from state
   */
  getMiniGameStats(gameType) {
    const state = stateManager.getState();
    const miniGameData = state.miniGames?.[gameType] || {};
    
    switch(gameType) {
      case 'dailySpin':
        return {
          totalSpins: miniGameData.totalSpins || 0,
          currentStreak: this.calculateSpinStreak(),
          highestGemReward: miniGameData.highestGemReward || 0,
          guardiansWon: miniGameData.guardiansWon || 0
        };
        
      case 'game2048':
        return {
          gamesPlayed: miniGameData.gamesPlayed || 0,
          highScore: miniGameData.highScore || 0,
          highestTile: miniGameData.highestTile || 0
        };
        
      case 'match3':
        return {
          gamesPlayed: miniGameData.gamesPlayed || 0,
          highScore: miniGameData.highScore || 0,
          bestCombo: miniGameData.bestCombo || 0,
          specialGemsCreated: miniGameData.specialGemsCreated || {},
          perfectVictories: miniGameData.perfectVictories || 0
        };
        
      default:
        return {};
    }
  }
  
  /**
   * Calculate spin streak (consecutive days)
   */
  calculateSpinStreak() {
    const state = stateManager.getState();
    const spinData = state.miniGames?.dailySpin || {};
    const spinHistory = spinData.spinHistory || [];
    
    if (spinHistory.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toDateString();
    
    // Check backward from today
    for (let i = 1; i < spinHistory.length; i++) {
      const prevDate = new Date(spinHistory[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (prevDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  /**
   * Unlock achievement
   */
  unlockAchievement(achievement) {
    logger.info('MiniGameAchievementSystem', `Achievement unlocked: ${achievement.name}`, achievement);
    
    // Mark as unlocked
    stateManager.dispatch({
      type: 'UNLOCK_MINI_GAME_ACHIEVEMENT',
      payload: {
        game: achievement.category,
        achievementId: achievement.id,
        timestamp: Date.now()
      }
    });
    
    // Grant rewards
    this.grantReward(achievement);
    
    // Show notification
    this.showAchievementNotification(achievement);
    
    // Emit event
    eventBus.emit('mini-game-achievement:unlocked', { achievement });
    
    // Update statistics
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: {
        key: 'miniGameAchievementsUnlocked',
        value: 1
      }
    });
  }
  
  /**
   * Grant achievement rewards
   */
  grantReward(achievement) {
    const reward = achievement.reward;
    
    for (const [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        // Trigger guardian summon
        eventBus.emit('guardian:summon', {
          amount,
          source: `achievement-${achievement.id}`,
          guaranteed: true
        });
      } else {
        // Add resource
        stateManager.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resource, amount }
        });
      }
    }
    
    logger.info('MiniGameAchievementSystem', 'Rewards granted', reward);
  }
  
  /**
   * Show achievement unlock notification
   */
  showAchievementNotification(achievement) {
    const tier = ACHIEVEMENT_TIERS[achievement.tier];
    const rewardText = this.formatReward(achievement.reward);
    
    eventBus.emit('notification:show', {
      type: 'achievement',
      title: `${tier.icon} Achievement Unlocked!`,
      message: `<strong>${achievement.name}</strong><br>${achievement.description}<br><small>Reward: ${rewardText}</small>`,
      duration: 7000,
      sound: 'achievement'
    });
  }
  
  /**
   * Format reward for display
   */
  formatReward(reward) {
    const parts = [];
    const icons = {
      timeShards: '⏰',
      gems: '💎',
      energy: '⚡',
      crystals: '💠',
      guardian: '🛡️'
    };
    
    for (const [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        parts.push(`${icons[resource]} Guardian`);
      } else {
        parts.push(`${amount} ${icons[resource]}`);
      }
    }
    
    return parts.join(', ');
  }
  
  /**
   * Get achievement progress for a specific game
   */
  getProgress(gameType) {
    const achievements = getAchievementsByGame(gameType);
    const state = stateManager.getState();
    const unlocked = state.achievements?.miniGames?.[gameType] || [];
    const stats = this.getMiniGameStats(gameType);
    
    return achievements.map(achievement => {
      const isUnlocked = unlocked.includes(achievement.id);
      
      return {
        ...achievement,
        unlocked: isUnlocked,
        progress: this.calculateProgress(achievement, stats),
        timestamp: isUnlocked ? this.getUnlockTimestamp(gameType, achievement.id) : null
      };
    });
  }
  
  /**
   * Calculate progress percentage
   */
  calculateProgress(achievement, stats) {
    // Simple heuristic - can be improved per achievement
    try {
      const result = achievement.condition(stats);
      return result ? 100 : 0;
    } catch (e) {
      return 0;
    }
  }
  
  /**
   * Get unlock timestamp
   */
  getUnlockTimestamp(gameType, achievementId) {
    const state = stateManager.getState();
    const unlockData = state.achievements?.miniGamesTimestamps?.[gameType]?.[achievementId];
    return unlockData || null;
  }
  
  /**
   * Get overall mini-game achievement stats
   */
  getOverallStats() {
    const allAchievements = getAllMiniGameAchievements();
    const state = stateManager.getState();
    const miniGameAchievements = state.achievements?.miniGames || {};
    
    let totalUnlocked = 0;
    Object.values(miniGameAchievements).forEach(gameAchievements => {
      totalUnlocked += gameAchievements.length;
    });
    
    return {
      total: allAchievements.length,
      unlocked: totalUnlocked,
      percentage: Math.round((totalUnlocked / allAchievements.length) * 100),
      byGame: {
        dailySpin: this.getGameStats('dailySpin'),
        game2048: this.getGameStats('game2048'),
        match3: this.getGameStats('match3')
      }
    };
  }
  
  /**
   * Get stats for a specific game
   */
  getGameStats(gameType) {
    const achievements = getAchievementsByGame(gameType);
    const state = stateManager.getState();
    const unlocked = state.achievements?.miniGames?.[gameType] || [];
    
    return {
      total: achievements.length,
      unlocked: unlocked.length,
      percentage: achievements.length > 0 
        ? Math.round((unlocked.length / achievements.length) * 100) 
        : 0
    };
  }
}

export default new MiniGameAchievementSystem();