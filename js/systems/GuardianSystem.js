/**
 * GuardianSystem - Handles guardian summoning and bonuses
 */

import { GUARDIAN_POOL, RARITIES } from '../data/guardians.js';
import CONFIG from '../config.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class GuardianSystem {
  constructor() {
    this.guardianPool = GUARDIAN_POOL;
    this.rarities = RARITIES;
    this.summonCost = CONFIG.BALANCING.GUARDIAN_SUMMON_COST;
    
    this.subscribeToEvents();
    
    logger.info('GuardianSystem', 'Initialized with guardian pool:', Object.keys(this.guardianPool));
  }
  
  /**
   * Subscribe to events
   */
  subscribeToEvents() {
    // When guardians change, recalculate bonuses
    eventBus.on('state:ADD_GUARDIAN', () => {
      eventBus.emit('guardians:changed');
    });
    
    eventBus.on('state:REMOVE_GUARDIAN', () => {
      eventBus.emit('guardians:changed');
    });
  }
  
  /**
   * Check if can summon
   */
  canSummon() {
    const state = stateManager.getState();
    return state.resources.gems >= this.summonCost;
  }
  
  /**
   * Summon a random guardian
   */
  summon(realmId = null) {
    if (!this.canSummon()) {
      logger.warn('GuardianSystem', 'Cannot afford summon');
      eventBus.emit('guardian:summon-failed', { reason: 'insufficient-gems' });
      return null;
    }
    
    const state = stateManager.getState();
    const currentRealm = realmId || state.realms.current;
    
    // Get available guardians for realm
    const availableGuardians = this.getAvailableGuardians(currentRealm);
    
    if (availableGuardians.length === 0) {
      logger.error('GuardianSystem', 'No guardians available for realm:', currentRealm);
      return null;
    }
    
    // Pick random guardian
    const guardianKey = availableGuardians[Math.floor(Math.random() * availableGuardians.length)];
    const guardianData = this.guardianPool[guardianKey];
    
    // Roll rarity
    const rarity = this.rollRarity(guardianData.rarities);
    
    // Roll bonus within rarity range
    const bonus = this.rollBonus(rarity);
    
    // Create guardian instance
    const guardian = {
      id: Date.now() + Math.random(), // Unique ID
      key: guardianKey,
      name: guardianData.name,
      emoji: guardianData.emoji,
      type: guardianData.type,
      rarity: rarity,
      bonus: bonus,
      summonedAt: Date.now(),
      special: guardianData.special || null
    };
    
    // Add to state
    stateManager.dispatch({
      type: 'ADD_GUARDIAN',
      payload: { guardian }
    });
    
    logger.info('GuardianSystem', `Summoned ${guardian.name} (${rarity}) with +${bonus}% bonus`);
    
    // Emit event
    eventBus.emit('guardian:summoned', guardian);
    
    return guardian;
  }
  
  /**
   * Get available guardians for realm
   */
  getAvailableGuardians(realmId) {
    return Object.entries(this.guardianPool)
      .filter(([key, data]) => {
        return data.realm === realmId || data.realm === 'any';
      })
      .map(([key]) => key);
  }
  
  /**
   * Roll rarity using weighted random
   */
  rollRarity(allowedRarities) {
    // Filter rarities to only allowed ones
    const validRarities = Object.entries(this.rarities)
      .filter(([rarityKey]) => allowedRarities.includes(rarityKey));
    
    // Calculate total weight
    const totalWeight = validRarities.reduce((sum, [key, data]) => sum + data.weight, 0);
    
    // Roll
    let roll = Math.random() * totalWeight;
    
    for (let [rarityKey, rarityData] of validRarities) {
      roll -= rarityData.weight;
      if (roll <= 0) {
        return rarityKey;
      }
    }
    
    // Fallback to first allowed rarity
    return allowedRarities[0];
  }
  
  /**
   * Roll bonus within rarity range
   */
  rollBonus(rarity) {
    const rarityData = this.rarities[rarity];
    const [min, max] = rarityData.bonusRange;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Get all guardians
   */
  getGuardians() {
    const state = stateManager.getState();
    return state.guardians;
  }
  
  /**
   * Get guardians by type
   */
  getGuardiansByType(type) {
    const guardians = this.getGuardians();
    return guardians.filter(g => g.type === type || g.type === 'all');
  }
  
  /**
   * Get guardians by rarity
   */
  getGuardiansByRarity(rarity) {
    const guardians = this.getGuardians();
    return guardians.filter(g => g.rarity === rarity);
  }
  
  /**
   * Calculate total bonus for a resource type
   */
  getTotalBonus(resourceType) {
    const guardians = this.getGuardiansByType(resourceType);
    
    // Sum all bonuses
    let totalBonus = guardians.reduce((sum, g) => sum + g.bonus, 0);
    
    // Apply guardian bond upgrade if exists
    const upgradeSystem = require('./UpgradeSystem.js').default;
    if (upgradeSystem.getLevel('guardianBond') > 0) {
      const bondMultiplier = upgradeSystem.getGuardianBonusMultiplier();
      totalBonus *= bondMultiplier;
    }
    
    return totalBonus;
  }
  
  /**
   * Get production multiplier from guardians
   */
  getProductionMultiplier(resourceType) {
    const bonus = this.getTotalBonus(resourceType);
    return 1 + (bonus / 100); // Convert percentage to multiplier
  }
  
  /**
   * Dismiss a guardian
   */
  dismiss(guardianId) {
    stateManager.dispatch({
      type: 'REMOVE_GUARDIAN',
      payload: { guardianId }
    });
    
    logger.info('GuardianSystem', `Dismissed guardian ${guardianId}`);
    eventBus.emit('guardian:dismissed', { guardianId });
  }
  
  /**
   * Get guardian stats
   */
  getStats() {
    const guardians = this.getGuardians();
    
    const stats = {
      total: guardians.length,
      byRarity: {},
      byType: {},
      totalBonus: {
        energy: this.getTotalBonus('energy'),
        mana: this.getTotalBonus('mana'),
        volcanic: this.getTotalBonus('volcanic'),
        all: this.getTotalBonus('all')
      },
      averageBonus: 0,
      bestGuardian: null
    };
    
    // Count by rarity
    for (let rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
      stats.byRarity[rarity] = guardians.filter(g => g.rarity === rarity).length;
    }
    
    // Count by type
    const types = ['energy', 'mana', 'volcanic', 'all', 'gems'];
    for (let type of types) {
      stats.byType[type] = guardians.filter(g => g.type === type).length;
    }
    
    // Calculate average
    if (guardians.length > 0) {
      stats.averageBonus = guardians.reduce((sum, g) => sum + g.bonus, 0) / guardians.length;
    }
    
    // Find best guardian
    if (guardians.length > 0) {
      stats.bestGuardian = guardians.reduce((best, current) => {
        return current.bonus > best.bonus ? current : best;
      });
    }
    
    return stats;
  }
  
  /**
   * Get collection progress
   */
  getCollectionProgress() {
    const guardians = this.getGuardians();
    const uniqueKeys = new Set(guardians.map(g => g.key));
    const totalUnique = Object.keys(this.guardianPool).length;
    
    return {
      unique: uniqueKeys.size,
      total: totalUnique,
      percentage: (uniqueKeys.size / totalUnique) * 100,
      missing: totalUnique - uniqueKeys.size
    };
  }
  
  /**
   * Get special bonuses (from special guardians)
   */
  getSpecialBonuses() {
    const guardians = this.getGuardians();
    const bonuses = {
      offlineBonus: 0,
      gemBonus: 0
    };
    
    for (let guardian of guardians) {
      if (guardian.special) {
        if (guardian.special.offlineBonus) {
          bonuses.offlineBonus += guardian.special.offlineBonus;
        }
        if (guardian.special.gemBonus) {
          bonuses.gemBonus += guardian.special.gemBonus;
        }
      }
    }
    
    return bonuses;
  }
  
  /**
   * Summon multiple guardians
   */
  async summonMultiple(count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      if (!this.canSummon()) {
        break;
      }
      
      const guardian = this.summon();
      if (guardian) {
        results.push(guardian);
      }
    }
    
    if (results.length > 0) {
      eventBus.emit('guardian:bulk-summoned', { 
        count: results.length,
        guardians: results
      });
    }
    
    return results;
  }
  
  /**
   * Get rarity display name
   */
  getRarityName(rarity) {
    const names = {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary'
    };
    return names[rarity] || rarity;
  }
  
  /**
   * Get rarity color
   */
  getRarityColor(rarity) {
    const colors = {
      common: '#9ca3af',    // Gray
      uncommon: '#10b981',  // Green
      rare: '#3b82f6',      // Blue
      epic: '#a855f7',      // Purple
      legendary: '#f59e0b'  // Gold
    };
    return colors[rarity] || '#ffffff';
  }
}

// Singleton
const guardianSystem = new GuardianSystem();

export default guardianSystem;