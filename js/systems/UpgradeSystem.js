/**
 * UpgradeSystem - Handles all upgrade-related logic
 */

import UPGRADES from '../data/upgrades.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class UpgradeSystem {
  constructor() {
    this.upgrades = UPGRADES;
    
    this.initializeState();
    this.subscribeToEvents();
    
    logger.info('UpgradeSystem', 'Initialized with upgrades:', Object.keys(this.upgrades));
  }
  
  /**
   * Initialize upgrade state
   */
  initializeState() {
    const state = stateManager.getState();
    
    // Ensure all upgrades exist in state
    for (let key of Object.keys(this.upgrades)) {
      if (!state.upgrades[key]) {
        // Will be added when first purchased
      }
    }
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    // When upgrades change, recalculate production
    eventBus.on('state:BUY_UPGRADE', () => {
      eventBus.emit('upgrades:changed');
    });
  }
  
  /**
   * Get upgrade definition
   */
  getUpgrade(key) {
    return this.upgrades[key];
  }
  
  /**
   * Get all upgrades by category
   */
  getUpgradesByCategory(category = null) {
    if (!category) {
      return this.upgrades;
    }
    
    return Object.entries(this.upgrades)
      .filter(([key, data]) => data.category === category)
      .reduce((obj, [key, data]) => {
        obj[key] = data;
        return obj;
      }, {});
  }
  
  /**
   * Check if upgrade is unlocked
   */
  isUnlocked(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return false;
    
    if (!upgrade.unlockCondition) return true;
    
    const state = stateManager.getState();
    const condition = upgrade.unlockCondition;
    
    // Check resource requirements
    if (condition.resources) {
      for (let [resource, amount] of Object.entries(condition.resources)) {
        if (state.resources[resource] < amount) {
          return false;
        }
      }
    }
    
    // Check structure requirements
    if (condition.structures) {
      for (let [structure, reqLevel] of Object.entries(condition.structures)) {
        const currentLevel = state.structures[structure]?.level || 0;
        if (currentLevel < reqLevel) {
          return false;
        }
      }
    }
    
    // Check upgrade requirements
    if (condition.upgrades) {
      for (let [reqUpgrade, reqLevel] of Object.entries(condition.upgrades)) {
        const currentLevel = state.upgrades[reqUpgrade]?.level || 0;
        if (currentLevel < reqLevel) {
          return false;
        }
      }
    }
    
    // Check ascension requirements
    if (condition.ascension) {
      if (state.ascension.level < condition.ascension.level) {
        return false;
      }
    }
    
    // Check realm requirements
    if (condition.realms) {
      for (let [realm, required] of Object.entries(condition.realms)) {
        if (required && !state.realms.unlocked.includes(realm)) {
          return false;
        }
      }
    }
    
    // Check statistics requirements
    if (condition.statistics) {
      for (let [stat, required] of Object.entries(condition.statistics)) {
        if (state.statistics[stat] < required) {
          return false;
        }
      }
    }
    
    // Check guardian requirements
    if (condition.guardians) {
      if (condition.guardians.count) {
        if (state.guardians.length < condition.guardians.count) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get upgrade level
   */
  getLevel(upgradeKey) {
    const state = stateManager.getState();
    return state.upgrades[upgradeKey]?.level || 0;
  }
  
  /**
   * Check if upgrade is maxed
   */
  isMaxed(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return false;
    
    const currentLevel = this.getLevel(upgradeKey);
    return currentLevel >= upgrade.maxLevel;
  }
  
  /**
   * Calculate cost for next level
   */
  getCost(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return 0;
    
    const currentLevel = this.getLevel(upgradeKey);
    
    // Check if maxed
    if (currentLevel >= upgrade.maxLevel) {
      return Infinity;
    }
    
    return Math.floor(
      upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel)
    );
  }
  
  /**
   * Get current effect value
   */
  getEffect(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return null;
    
    const level = this.getLevel(upgradeKey);
    if (level === 0) return null;
    
    return upgrade.effect(level);
  }
  
  /**
   * Check if can afford upgrade
   */
  canAfford(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return false;
    
    if (this.isMaxed(upgradeKey)) return false;
    
    const cost = this.getCost(upgradeKey);
    const state = stateManager.getState();
    const costResource = upgrade.costResource;
    
    return state.resources[costResource] >= cost;
  }
  
  /**
 * Buy upgrade (increment level) - with queue support
 */
buy(upgradeKey) {
  // Import queue system
  const upgradeQueueSystem = require('./UpgradeQueueSystem.js').default;
  
  // Validate
  if (!this.isUnlocked(upgradeKey)) {
    logger.warn('UpgradeSystem', `Upgrade ${upgradeKey} is not unlocked`);
    eventBus.emit('upgrade:purchase-failed', { 
      upgradeKey, 
      reason: 'locked' 
    });
    return false;
  }
  
  if (this.isMaxed(upgradeKey)) {
    logger.warn('UpgradeSystem', `Upgrade ${upgradeKey} is already maxed`);
    eventBus.emit('upgrade:purchase-failed', { 
      upgradeKey, 
      reason: 'maxed' 
    });
    return false;
  }
  
  if (!this.canAfford(upgradeKey)) {
    logger.warn('UpgradeSystem', `Cannot afford ${upgradeKey}`);
    eventBus.emit('upgrade:purchase-failed', { 
      upgradeKey, 
      reason: 'insufficient-resources' 
    });
    return false;
  }
  
  const upgrade = this.upgrades[upgradeKey];
  const cost = this.getCost(upgradeKey);
  const currentLevel = this.getLevel(upgradeKey);
  const targetLevel = currentLevel + 1;
  
  // Check if upgrade should be queued
  if (!upgradeQueueSystem.isInstant(upgradeKey, targetLevel)) {
    // Queue the upgrade
    return upgradeQueueSystem.queueUpgrade(upgradeKey, cost, upgrade.costResource);
  }
  
  // Instant upgrade (levels 1-3)
  stateManager.dispatch({
    type: 'BUY_UPGRADE',
    payload: {
      upgradeKey,
      upgradeCost: cost,
      costResource: upgrade.costResource
    }
  });
  
  const newLevel = this.getLevel(upgradeKey);
  
  logger.info('UpgradeSystem', `Purchased ${upgradeKey} (level ${newLevel}) - INSTANT`);
  
  // Handle special effects
  this.applySpecialEffects(upgradeKey, newLevel);
  
  // Emit success event
  eventBus.emit('upgrade:purchased', {
    upgradeKey,
    level: newLevel,
    cost,
    effect: this.getEffect(upgradeKey)
  });
  
  return true;
}
  
    /**
   * Apply special effects (like unlocks and capacity updates)
   * NOTE: Called by both instant upgrades and UpgradeQueueSystem
   */
  applySpecialEffects(upgradeKey, level) {
    const upgrade = this.upgrades[upgradeKey];
    const effect = upgrade.effect(level);
    
    // Handle unlock effects
    if (effect && effect.unlock) {
      logger.info('UpgradeSystem', `Unlocked: ${effect.unlock}`);
      eventBus.emit('unlock:structure', { structureKey: effect.unlock });
    }
    
    // Handle capacity upgrades
    if (upgrade.category === 'capacity') {
      const resource = upgradeKey.replace('Cap', ''); // energyCap → energy
      stateManager.dispatch({
        type: 'SET_CAP',
        payload: {
          resource: resource,
          amount: effect
        }
      });
      
      logger.info('UpgradeSystem', `Updated ${resource} cap to ${effect}`);
    }
  }
  
  /**
   * Get multiplier for production
   */
  getProductionMultiplier(resource) {
    let multiplier = 1;
    
    // Energy boost
    if (resource === 'energy' && this.getLevel('energyBoost') > 0) {
      multiplier *= this.getEffect('energyBoost');
    }
    
    // Mana efficiency
    if (resource === 'mana' && this.getLevel('manaEfficiency') > 0) {
      multiplier *= this.getEffect('manaEfficiency');
    }
    
    // Volcanic power
    if (resource === 'volcanicEnergy' && this.getLevel('volcanicPower') > 0) {
      multiplier *= this.getEffect('volcanicPower');
    }
    
    return multiplier;
  }
  
  /**
   * Get structure synergy multiplier
   */
  getStructureSynergy(structureKey) {
    let multiplier = 1;
    
    // Check for structure-specific synergies
    for (let [upgradeKey, upgrade] of Object.entries(this.upgrades)) {
      if (upgrade.category === 'synergy' && 
          upgrade.targetStructure === structureKey &&
          this.getLevel(upgradeKey) > 0) {
        multiplier *= this.getEffect(upgradeKey);
      }
    }
    
    return multiplier;
  }
  
  /**
   * Get guardian bonus multiplier
   */
  getGuardianBonusMultiplier() {
    if (this.getLevel('guardianBond') > 0) {
      return this.getEffect('guardianBond');
    }
    return 1;
  }
  
  /**
   * Get offline production percentage
   */
  getOfflineProductionRate() {
    if (this.getLevel('offlineProduction') > 0) {
      return this.getEffect('offlineProduction') / 100; // Convert to decimal
    }
    return 0;
  }
  
  /**
   * Check if auto-collect is enabled
   */
  hasAutoCollect() {
    return this.getLevel('autoCollect') > 0;
  }
  
  /**
   * Get critical energy chance
   */
  getCriticalChance() {
    if (this.getLevel('criticalEnergy') > 0) {
      return this.getEffect('criticalEnergy') / 100;
    }
    return 0;
  }
  
  /**
   * Get lucky gems chance
   */
  getLuckyGemsChance() {
    if (this.getLevel('luckyGems') > 0) {
      return this.getEffect('luckyGems') / 100;
    }
    return 0;
  }
  
  /**
   * Get all upgrade stats
   */
  getStats() {
    const state = stateManager.getState();
    const stats = {
      totalUpgrades: 0,
      totalLevels: 0,
      byCategory: {},
      totalSpent: {}
    };
    
    for (let [key, upgrade] of Object.entries(this.upgrades)) {
      const level = this.getLevel(key);
      if (level > 0) {
        stats.totalUpgrades++;
        stats.totalLevels += level;
        
        // By category
        if (!stats.byCategory[upgrade.category]) {
          stats.byCategory[upgrade.category] = 0;
        }
        stats.byCategory[upgrade.category] += level;
        
        // Total spent calculation
        const costResource = upgrade.costResource;
        if (!stats.totalSpent[costResource]) {
          stats.totalSpent[costResource] = 0;
        }
        
        // Sum all costs from level 0 to current level
        for (let i = 0; i < level; i++) {
          const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, i));
          stats.totalSpent[costResource] += cost;
        }
      }
    }
    
    return stats;
  }
  
  /**
   * Get unlock progress
   */
  getUnlockProgress() {
    const total = Object.keys(this.upgrades).length;
    const unlocked = Object.keys(this.upgrades).filter(key => this.isUnlocked(key)).length;
    const purchased = Object.keys(this.upgrades).filter(key => this.getLevel(key) > 0).length;
    
    return {
      unlocked,
      purchased,
      total,
      percentageUnlocked: (unlocked / total) * 100,
      percentagePurchased: (purchased / total) * 100
    };
  }
  
  /**
   * Get recommended upgrades
   */
  getRecommendedUpgrades(count = 3) {
    const state = stateManager.getState();
    const affordable = [];
    
    for (let [key, upgrade] of Object.entries(this.upgrades)) {
      if (this.isUnlocked(key) && !this.isMaxed(key) && this.canAfford(key)) {
        const cost = this.getCost(key);
        const priority = this.calculateUpgradePriority(key);
        
        affordable.push({
          key,
          cost,
          priority,
          category: upgrade.category
        });
      }
    }
    
    // Sort by priority
    affordable.sort((a, b) => b.priority - a.priority);
    
    return affordable.slice(0, count);
  }
  
  /**
   * Calculate upgrade priority for recommendations
   */
  calculateUpgradePriority(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    let priority = 0;
    
    // Production upgrades = high priority
    if (upgrade.category === 'production') {
      priority += 10;
    }
    
    // Capacity upgrades = medium priority
    if (upgrade.category === 'capacity') {
      priority += 5;
    }
    
    // QoL upgrades = lower priority
    if (upgrade.category === 'qol') {
      priority += 3;
    }
    
    // Synergies = depends on structure level
    if (upgrade.category === 'synergy' && upgrade.targetStructure) {
      const state = stateManager.getState();
      const structureLevel = state.structures[upgrade.targetStructure]?.level || 0;
      priority += structureLevel / 10;
    }
    
    // Lower level upgrades = higher priority (diminishing returns)
    const currentLevel = this.getLevel(upgradeKey);
    priority += (upgrade.maxLevel - currentLevel) / upgrade.maxLevel * 5;
    
    return priority;
  }
}

// Singleton
const upgradeSystem = new UpgradeSystem();

export default upgradeSystem;