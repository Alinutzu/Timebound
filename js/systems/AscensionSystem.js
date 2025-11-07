/**
 * AscensionSystem - Prestige/Ascension mechanic
 */

import CONFIG from '../config.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class AscensionSystem {
  constructor() {
    this.minEnergy = CONFIG.BALANCING.ASCENSION_MIN_ENERGY;
    this.crystalFormula = CONFIG.BALANCING.ASCENSION_CRYSTAL_FORMULA;
    this.productionBonus = CONFIG.BALANCING.ASCENSION_PRODUCTION_BONUS;
    this.capacityBonus = CONFIG.BALANCING.ASCENSION_CAPACITY_BONUS;
    
    logger.info('AscensionSystem', 'Initialized');
  }
  
  /**
   * Check if can ascend
   */
  canAscend() {
    const state = stateManager.getState();
    const lifetimeEnergy = state.ascension.lifetimeEnergy;
    
    if (lifetimeEnergy < this.minEnergy) {
      return {
        can: false,
        reason: 'insufficient-energy',
        required: this.minEnergy,
        current: lifetimeEnergy,
        remaining: this.minEnergy - lifetimeEnergy
      };
    }
    
    return { can: true };
  }
  
  /**
   * Calculate crystals earned from ascension
   */
  calculateCrystalsEarned() {
    const state = stateManager.getState();
    const lifetimeEnergy = state.ascension.lifetimeEnergy;
    
    return this.crystalFormula(lifetimeEnergy);
  }
  
  /**
   * Get ascension preview (what will happen)
   */
  getAscensionPreview() {
    const state = stateManager.getState();
    const crystalsEarned = this.calculateCrystalsEarned();
    const newLevel = state.ascension.level + 1;
    
    return {
      currentLevel: state.ascension.level,
      newLevel: newLevel,
      crystalsEarned: crystalsEarned,
      totalCrystals: state.resources.crystals + crystalsEarned,
      
      bonuses: {
        production: {
          current: 1 + (state.ascension.level * this.productionBonus),
          new: 1 + (newLevel * this.productionBonus),
          increase: this.productionBonus
        },
        capacity: {
          current: 1 + (state.ascension.level * this.capacityBonus),
          new: 1 + (newLevel * this.capacityBonus),
          increase: this.capacityBonus
        }
      },
      
      willLose: {
        energy: state.resources.energy,
        mana: state.resources.mana,
        volcanicEnergy: state.resources.volcanicEnergy,
        structures: this.getStructuresSummary(),
        upgrades: this.getUpgradesSummary()
      },
      
      willKeep: {
        gems: state.resources.gems,
        crystals: state.resources.crystals + crystalsEarned,
        guardians: state.guardians.length,
        achievements: this.getUnlockedAchievementsCount(),
        realms: state.realms.unlocked.length,
        bossProgress: this.getBossProgress()
      }
    };
  }
  
  /**
   * Perform ascension
   */
  ascend() {
    const canAscend = this.canAscend();
    
    if (!canAscend.can) {
      logger.warn('AscensionSystem', 'Cannot ascend:', canAscend.reason);
      eventBus.emit('ascension:failed', canAscend);
      return false;
    }
    
    const state = stateManager.getState();
    const crystalsEarned = this.calculateCrystalsEarned();
    const preview = this.getAscensionPreview();
    
    // Confirm with player (UI will handle this)
    eventBus.emit('ascension:confirm-required', { preview });
    
    // Actual ascension will be triggered by confirmAscend()
    return true;
  }
  
  /**
   * Confirm and execute ascension
   */
  confirmAscend() {
    const crystalsEarned = this.calculateCrystalsEarned();
    
    // Dispatch ascension action
    stateManager.dispatch({
      type: 'ASCEND',
      payload: { crystalsEarned }
    });
    
    const state = stateManager.getState();
    
    logger.info('AscensionSystem', `Ascended to level ${state.ascension.level}! Earned ${crystalsEarned} crystals`);
    
    // Apply quick start bonus if upgrade exists
    this.applyQuickStart();
    
    // Recalculate everything
    eventBus.emit('ascension:completed', {
      level: state.ascension.level,
      crystalsEarned
    });
    
    // Show celebration
    eventBus.emit('notification:show', {
      type: 'ascension',
      title: 'ASCENSION!',
      message: `Level ${state.ascension.level}`,
      description: `Earned ${crystalsEarned} 💠 crystals!`,
      duration: 10000
    });
    
    return true;
  }
  
  /**
   * Apply quick start bonus (from upgrades)
   */
  applyQuickStart() {
    const upgradeSystem = require('./UpgradeSystem.js').default;
    
    if (upgradeSystem.getLevel('quickStart') > 0) {
      const bonus = upgradeSystem.getEffect('quickStart');
      
      // Get previous run stats (would need to be saved before reset)
      // For now, give a flat bonus
      const bonusEnergy = 1000 * upgradeSystem.getLevel('quickStart');
      const bonusMana = 10 * upgradeSystem.getLevel('quickStart');
      
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'energy', amount: bonusEnergy }
      });
      
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'mana', amount: bonusMana }
      });
      
      logger.info('AscensionSystem', `Quick Start bonus applied: ${bonusEnergy} energy, ${bonusMana} mana`);
    }
  }
  
  /**
   * Get production multiplier from ascension
   */
  getProductionMultiplier() {
    const state = stateManager.getState();
    return 1 + (state.ascension.level * this.productionBonus);
  }
  
  /**
   * Get capacity multiplier from ascension
   */
  getCapacityMultiplier() {
    const state = stateManager.getState();
    return 1 + (state.ascension.level * this.capacityBonus);
  }
  
  /**
   * Get ascension stats
   */
  getStats() {
    const state = stateManager.getState();
    
    return {
      level: state.ascension.level,
      totalAscensions: state.ascension.totalAscensions,
      lifetimeEnergy: state.ascension.lifetimeEnergy,
      canAscend: this.canAscend().can,
      nextAscensionAt: this.minEnergy,
      crystalsOnAscend: this.calculateCrystalsEarned(),
      productionBonus: this.getProductionMultiplier(),
      capacityBonus: this.getCapacityMultiplier()
    };
  }
  
  /**
   * Helper: Get structures summary
   */
  getStructuresSummary() {
    const state = stateManager.getState();
    let total = 0;
    
    for (let structure of Object.values(state.structures)) {
      total += structure.level || 0;
    }
    
    return total;
  }
  
  /**
   * Helper: Get upgrades summary
   */
  getUpgradesSummary() {
    const state = stateManager.getState();
    let total = 0;
    
    for (let upgrade of Object.values(state.upgrades)) {
      total += upgrade.level || 0;
    }
    
    return total;
  }
  
  /**
   * Helper: Get unlocked achievements count
   */
  getUnlockedAchievementsCount() {
    const state = stateManager.getState();
    let count = 0;
    
    for (let achievement of Object.values(state.achievements)) {
      if (achievement.unlocked) count++;
    }
    
    return count;
  }
  
  /**
   * Helper: Get boss progress
   */
  getBossProgress() {
    const state = stateManager.getState();
    let defeated = 0;
    
    for (let boss of Object.values(state.bosses)) {
      if (boss.defeated) defeated++;
    }
    
    return defeated;
  }
  
  /**
   * Get next milestone info
   */
  getNextMilestone() {
    const state = stateManager.getState();
    const currentLevel = state.ascension.level;
    
    const milestones = [
      { level: 1, reward: 'Unlock Volcano Realm' },
      { level: 3, reward: 'Unlock Ocean Realm' },
      { level: 5, reward: 'Unlock Cosmic Realm, Boss 3' },
      { level: 10, reward: 'Special Achievement' }
    ];
    
    return milestones.find(m => m.level > currentLevel) || null;
  }
}

// Singleton
const ascensionSystem = new AscensionSystem();

export default ascensionSystem;