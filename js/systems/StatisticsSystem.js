/**
 * StatisticsSystem - Track and display game statistics
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import Formatters from '../utils/Formatters.js';

class StatisticsSystem {
  constructor() {
    this.categories = {
      general: 'General Stats',
      resources: 'Resources',
      structures: 'Structures',
      upgrades: 'Upgrades',
      guardians: 'Guardians',
      quests: 'Quests',
      puzzles: 'Puzzles',
      bosses: 'Bosses',
      achievements: 'Achievements',
      shop: 'Shop'
    };
    
    this.subscribeToEvents();
    this.startTracking();
    
    logger.info('StatisticsSystem', 'Initialized');
  }
  
  /**
   * Subscribe to events for automatic tracking
   */
  subscribeToEvents() {
    // Track session start
    eventBus.on('game:started', () => {
      this.incrementStat('sessionsPlayed');
      this.setStat('sessionStartTime', Date.now());
    });
    
    // Track purchases
    eventBus.on('structure:purchased', () => {
      this.incrementStat('structuresPurchased');
    });
    
    eventBus.on('upgrade:purchased', () => {
      this.incrementStat('upgradesPurchased');
    });
    
    // Track guardians
    eventBus.on('guardian:summoned', () => {
      this.incrementStat('guardiansSummoned');
    });
    
    // Track quests
    eventBus.on('quest:claimed', () => {
      this.incrementStat('questsCompleted');
    });
    
    // Track puzzles
    eventBus.on('puzzle:won', (data) => {
      this.incrementStat('puzzlesWon');
      this.incrementStat('puzzlesPlayed');
      
      if (data.score > this.getStat('puzzleHighScore')) {
        this.setStat('puzzleHighScore', data.score);
      }
    });
    
    eventBus.on('puzzle:lost', () => {
      this.incrementStat('puzzlesPlayed');
    });
    
    // Track bosses
    eventBus.on('boss:defeated', () => {
      this.incrementStat('bossesDefeated');
    });
    
    // Track achievements
    eventBus.on('achievement:unlocked', () => {
      this.incrementStat('achievementsUnlocked');
    });
    
    eventBus.on('achievement:claimed', () => {
      this.incrementStat('achievementsClaimed');
    });
    
    // Track gems
    eventBus.on('state:ADD_RESOURCE', (data) => {
      if (data.state.resources.gems > this.getStat('highestGems')) {
        this.setStat('highestGems', data.state.resources.gems);
      }
    });
    
    // Track production
    eventBus.on('production:updated', (data) => {
      if (data.energy > this.getStat('highestEnergyPerSecond')) {
        this.setStat('highestEnergyPerSecond', data.energy);
      }
    });
  }
  
  /**
   * Start tracking play time
   */
  startTracking() {
    // Update play time every minute
    setInterval(() => {
      this.updatePlayTime();
    }, 60000);
  }
  
  /**
   * Update total play time
   */
  updatePlayTime() {
    const state = stateManager.getState();
    const sessionStart = state.statistics.sessionStartTime;
    
    if (sessionStart) {
      const sessionTime = Date.now() - sessionStart;
      this.incrementStat('totalPlayTime', sessionTime);
      this.setStat('sessionStartTime', Date.now()); // Reset for next interval
    }
  }
  
  /**
   * Get statistic value
   */
  getStat(key) {
    const state = stateManager.getState();
    return state.statistics[key] || 0;
  }
  
  /**
   * Set statistic value
   */
  setStat(key, value) {
    stateManager.dispatch({
      type: 'UPDATE_STATISTIC',
      payload: { key, value }
    });
  }
  
  /**
   * Increment statistic
   */
  incrementStat(key, amount = 1) {
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: { key, amount }
    });
  }
  
  /**
   * Get all statistics by category
   */
  getAllStats() {
    const state = stateManager.getState();
    const stats = state.statistics;
    
    const categorized = {
      general: {
        'Sessions Played': stats.sessionsPlayed || 0,
        'Total Play Time': Formatters.formatTime(stats.totalPlayTime || 0),
        'Account Created': Formatters.formatDate(state.createdAt)
      },
      
      resources: {
        'Lifetime Energy': Formatters.formatNumber(state.ascension.lifetimeEnergy),
        'Current Energy': Formatters.formatNumber(state.resources.energy),
        'Current Mana': Formatters.formatNumber(state.resources.mana),
        'Current Gems': Formatters.formatNumber(state.resources.gems),
        'Current Crystals': Formatters.formatNumber(state.resources.crystals),
        'Highest Energy/s': Formatters.formatNumber(stats.highestEnergyPerSecond || 0),
        'Highest Gems': Formatters.formatNumber(stats.highestGems || 0)
      },
      
      structures: {
        'Structures Purchased': stats.structuresPurchased || 0,
        'Total Structure Levels': this.getTotalStructureLevels(),
        'Highest Structure Level': this.getHighestStructureLevel(),
        'Favorite Structure': this.getFavoriteStructure()
      },
      
      upgrades: {
        'Upgrades Purchased': stats.upgradesPurchased || 0,
        'Total Upgrade Levels': this.getTotalUpgradeLevels(),
        'Upgrades Completed': this.getCompletedUpgrades()
      },
      
      guardians: {
        'Total Guardians': state.guardians.length,
        'Guardians Summoned': stats.guardiansSummoned || 0,
        'Legendary Guardians': this.getLegendaryCount(),
        'Most Powerful Guardian': this.getMostPowerfulGuardian(),
        'Total Guardian Bonus': this.getTotalGuardianBonus()
      },
      
      quests: {
        'Quests Completed': stats.questsCompleted || 0,
        'Current Streak': state.quests.completedToday || 0
      },
      
      puzzles: {
        'Puzzles Played': stats.puzzlesPlayed || 0,
        'Puzzles Won': stats.puzzlesWon || 0,
        'Win Rate': this.getPuzzleWinRate(),
        'High Score': stats.puzzleHighScore || 0
      },
      
      bosses: {
        'Bosses Defeated': stats.bossesDefeated || 0,
        'Bosses Unlocked': this.getBossesUnlocked()
      },
      
      achievements: {
        'Achievements Unlocked': stats.achievementsUnlocked || 0,
        'Achievements Claimed': stats.achievementsClaimed || 0,
        'Completion': this.getAchievementCompletion()
      },
      
      shop: {
        'Gems Earned': stats.gemsEarned || 0,
        'Gems Spent': stats.gemsSpent || 0,
        'Net Gems': (stats.gemsEarned || 0) - (stats.gemsSpent || 0),
        'VIP Active': state.shop.vipActive ? 'Yes' : 'No'
      }
    };
    
    return categorized;
  }
  
  /**
   * Get total structure levels
   */
  getTotalStructureLevels() {
    const structureSystem = require('./StructureSystem.js').default;
    return structureSystem.getStats().totalLevels;
  }
  
  /**
   * Get highest structure level
   */
  getHighestStructureLevel() {
    const state = stateManager.getState();
    let highest = 0;
    
    for (let structure of Object.values(state.structures)) {
      if (structure.level > highest) {
        highest = structure.level;
      }
    }
    
    return highest;
  }
  
  /**
   * Get favorite structure (most purchased)
   */
  getFavoriteStructure() {
    const state = stateManager.getState();
    let favorite = null;
    let maxLevel = 0;
    
    for (let [key, structure] of Object.entries(state.structures)) {
      if (structure.level > maxLevel) {
        maxLevel = structure.level;
        favorite = key;
      }
    }
    
    if (favorite) {
      const structureSystem = require('./StructureSystem.js').default;
      const data = structureSystem.getStructure(favorite);
      return `${data.emoji} ${data.name}`;
    }
    
    return 'None';
  }
  
  /**
   * Get total upgrade levels
   */
  getTotalUpgradeLevels() {
    const upgradeSystem = require('./UpgradeSystem.js').default;
    return upgradeSystem.getStats().totalLevels;
  }
  
  /**
   * Get completed upgrades
   */
  getCompletedUpgrades() {
    const state = stateManager.getState();
    let completed = 0;
    
    for (let upgrade of Object.values(state.upgrades)) {
      if (upgrade.level > 0) completed++;
    }
    
    return completed;
  }
  
  /**
   * Get legendary guardian count
   */
  getLegendaryCount() {
    const state = stateManager.getState();
    return state.guardians.filter(g => g.rarity === 'legendary').length;
  }
  
  /**
   * Get most powerful guardian
   */
  getMostPowerfulGuardian() {
    const state = stateManager.getState();
    
    if (state.guardians.length === 0) return 'None';
    
    const strongest = state.guardians.reduce((best, current) => {
      return current.bonus > best.bonus ? current : best;
    });
    
    return `${strongest.emoji} ${strongest.name} (+${strongest.bonus}%)`;
  }
  
  /**
   * Get total guardian bonus
   */
  getTotalGuardianBonus() {
    const guardianSystem = require('./GuardianSystem.js').default;
    const energyBonus = guardianSystem.getTotalBonus('energy');
    const manaBonus = guardianSystem.getTotalBonus('mana');
    const allBonus = guardianSystem.getTotalBonus('all');
    
    return `Energy: +${energyBonus}%, Mana: +${manaBonus}%, All: +${allBonus}%`;
  }
  
  /**
   * Get puzzle win rate
   */
  getPuzzleWinRate() {
    const stats = stateManager.getState().statistics;
    const played = stats.puzzlesPlayed || 0;
    const won = stats.puzzlesWon || 0;
    
    if (played === 0) return '0%';
    
    return `${((won / played) * 100).toFixed(1)}%`;
  }
  
  /**
   * Get bosses unlocked
   */
  getBossesUnlocked() {
    const bossSystem = require('./BossSystem.js').default;
    return bossSystem.getStats().unlocked;
  }
  
  /**
   * Get achievement completion
   */
  getAchievementCompletion() {
    const achievementSystem = require('./AchievementSystem.js').default;
    const progress = achievementSystem.getProgress();
    return `${progress.unlocked}/${progress.total} (${progress.percentageUnlocked.toFixed(1)}%)`;
  }
  
  /**
   * Export statistics to file
   */
  exportStats() {
    const stats = this.getAllStats();
    
    const exportData = {
      version: stateManager.getState().version,
      exportedAt: new Date().toISOString(),
      statistics: stats
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_statistics_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.info('StatisticsSystem', 'Statistics exported');
    
    return true;
  }
  
  /**
   * Get milestones reached
   */
  getMilestones() {
    const state = stateManager.getState();
    const milestones = [];
    
    // Energy milestones
    if (state.ascension.lifetimeEnergy >= 1000000) {
      milestones.push({ name: '1M Lifetime Energy', emoji: '⚡' });
    }
    if (state.ascension.lifetimeEnergy >= 100000000) {
      milestones.push({ name: '100M Lifetime Energy', emoji: '⚡' });
    }
    
    // Ascension milestones
    if (state.ascension.level >= 1) {
      milestones.push({ name: 'First Ascension', emoji: '✨' });
    }
    if (state.ascension.level >= 10) {
      milestones.push({ name: '10 Ascensions', emoji: '✨' });
    }
    
    // Guardian milestones
    if (state.guardians.length >= 50) {
      milestones.push({ name: '50 Guardians', emoji: '🐉' });
    }
    
    // Boss milestones
    if (state.statistics.bossesDefeated >= 5) {
      milestones.push({ name: '5 Bosses Defeated', emoji: '⚔️' });
    }
    
    return milestones;
  }
  
  /**
   * Get session summary
   */
  getSessionSummary() {
    const state = stateManager.getState();
    const sessionStart = state.statistics.sessionStartTime;
    
    if (!sessionStart) {
      return null;
    }
    
    const sessionDuration = Date.now() - sessionStart;
    
    return {
      duration: Formatters.formatTime(sessionDuration),
      structuresPurchased: state.statistics.structuresPurchasedThisSession || 0,
      upgradesPurchased: state.statistics.upgradesPurchasedThisSession || 0,
      questsCompleted: state.statistics.questsCompletedThisSession || 0,
      guardiansSummoned: state.statistics.guardiansSummonedThisSession || 0
    };
  }
}

// Singleton
const statisticsSystem = new StatisticsSystem();

export default statisticsSystem;