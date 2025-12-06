/**
 * StructureSystem - Handles all structure-related logic
 */

import STRUCTURES from '../data/structures.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class StructureSystem {
  constructor() {
    this.structures = STRUCTURES;
    
    // Initialize structures in state if needed
    this.initializeState();
    
    // Subscribe to state changes
    this.subscribeToEvents();
    
    logger.info('StructureSystem', 'Initialized with structures:', Object.keys(this.structures));
  }
  
  /**
   * Initialize structure state
   */
  initializeState() {
    const state = stateManager.getState();
    
    // Ensure all structures exist in state
    for (let key of Object.keys(this.structures)) {
      if (!state.structures[key]) {
        // Will be added when first purchased
      }
    }
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    // Recalculate production when structures change
    eventBus.on('state:BUY_STRUCTURE', () => {
      this.recalculateProduction();
    });
    
    // Recalculate when upgrades change
    eventBus.on('state:BUY_UPGRADE', () => {
      this.recalculateProduction();
    });
    
    // Recalculate when guardians change
    eventBus.on('state:ADD_GUARDIAN', () => {
      this.recalculateProduction();
    });
    
    // Initial calculation
    this.recalculateProduction();
  }
  
  /**
   * Get structure definition
   */
  getStructure(key) {
    return this.structures[key];
  }
  
  /**
   * Get all structures for current realm
   */
  getStructuresForRealm(realmId = null) {
    const state = stateManager.getState();
    const currentRealm = realmId || state.realms.current;
    
    return Object.entries(this.structures)
      .filter(([key, data]) => {
        // Forest structures have no realm specified
        if (currentRealm === 'forest') {
          return !data.realm || data.realm === 'forest';
        }
        // Other realms
        return data.realm === currentRealm;
      })
      .reduce((obj, [key, data]) => {
        obj[key] = data;
        return obj;
      }, {});
  }
  
  /**
   * Check if structure is unlocked
   */
  isUnlocked(structureKey) {
    const structure = this.structures[structureKey];
    if (!structure) return false;
    
    if (!structure.unlockCondition) return true;
    
    const state = stateManager.getState();
    const condition = structure.unlockCondition;
    
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
      for (let [reqStructure, reqLevel] of Object.entries(condition.structures)) {
        const currentLevel = state.structures[reqStructure]?.level || 0;
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
    
    return true;
  }
  
  /**
   * Get structure level
   */
  getLevel(structureKey) {
    const state = stateManager.getState();
    return state.structures[structureKey]?.level || 0;
  }
  
  /**
   * Calculate cost for next level
   */
  getCost(structureKey) {
    const structure = this.structures[structureKey];
    if (!structure) return 0;
    
    const currentLevel = this.getLevel(structureKey);
    
    return Math.floor(
      structure.baseCost * Math.pow(structure.costMultiplier, currentLevel)
    );
  }
  
  /**
   * Calculate production for structure
   */
  getProduction(structureKey) {
    const structure = this.structures[structureKey];
    if (!structure) return 0;
    
    const level = this.getLevel(structureKey);
    if (level === 0) return 0;
    
    // Base production
    let production = structure.baseProduction * Math.pow(level, structure.productionExponent);
    
    // Apply global multipliers
    const multipliers = this.getGlobalMultipliers(structure.resource);
    production *= multipliers.total;
    
    // Apply structure-specific synergies
    const synergies = this.getSynergies(structureKey);
    production *= synergies;
    
    return production;
  }
  
  /**
   * Get global multipliers for resource type
   */
  getGlobalMultipliers(resource) {
  const state = stateManager.getState();
  let multipliers = {
    ascension: 1,
    upgrades: 1,
    guardians: 1,
    total: 1
  };
  
  // Ascension bonus
  if (state.ascension.level > 0) {
    multipliers.ascension = 1 + (state.ascension.level * 0.1);
  }
  
  // ===== FIX: Use UpgradeSystem instead of duplicate logic =====
  const upgradeSystem = require('./UpgradeSystem.js'). default;
  multipliers.upgrades = upgradeSystem.getProductionMultiplier(resource);
  // ===== END FIX =====
  
  // Guardian bonuses
  const guardianSystem = require('./GuardianSystem.js').default;
  multipliers.guardians = guardianSystem. getProductionMultiplier(resource);
  
  // Calculate total
  multipliers.total = multipliers.ascension * multipliers.upgrades * multipliers.guardians;
  
  return multipliers;
}
  
  /**
   * Get structure-specific synergies
   */
  getSynergies(structureKey) {
    const state = stateManager.getState();
    let synergyMultiplier = 1;
    
    // Example: Solar Synergy upgrade
    if (structureKey === 'solarPanel' && state.upgrades.solarSynergy) {
      synergyMultiplier *= 1 + (state.upgrades.solarSynergy.level * 0.5);
    }
    
    // Add more synergies as needed
    
    return synergyMultiplier;
  }
  
  /**
   * Check if can afford structure
   */
  canAfford(structureKey) {
    const structure = this.structures[structureKey];
    if (!structure) return false;
    
    const cost = this.getCost(structureKey);
    const state = stateManager.getState();
    const costResource = structure.costResource;
    
    return state.resources[costResource] >= cost;
  }
  
  /**
   * Buy structure (increment level)
   */
  buy(structureKey) {
    // Validate
    if (!this.isUnlocked(structureKey)) {
      logger.warn('StructureSystem', `Structure ${structureKey} is not unlocked`);
      eventBus.emit('structure:purchase-failed', { 
        structureKey, 
        reason: 'locked' 
      });
      return false;
    }
    
    if (!this.canAfford(structureKey)) {
      logger.warn('StructureSystem', `Cannot afford ${structureKey}`);
      eventBus.emit('structure:purchase-failed', { 
        structureKey, 
        reason: 'insufficient-resources' 
      });
      return false;
    }
    
    const cost = this.getCost(structureKey);
    
    // Dispatch purchase
    stateManager.dispatch({
      type: 'BUY_STRUCTURE',
      payload: {
        structureKey,
        cost
      }
    });
    
    const newLevel = this.getLevel(structureKey);
    
    logger.info('StructureSystem', `Purchased ${structureKey} (level ${newLevel})`);
    
    // Emit success event
    eventBus.emit('structure:purchased', {
      structureKey,
      level: newLevel,
      cost,
      production: this.getProduction(structureKey)
    });
    
    return true;
  }
  
  /**
   * Buy maximum affordable structures
   */
  buyMax(structureKey, maxPurchases = 100) {
    let purchased = 0;
    
    for (let i = 0; i < maxPurchases; i++) {
      if (this.buy(structureKey)) {
        purchased++;
      } else {
        break;
      }
    }
    
    if (purchased > 0) {
      logger.info('StructureSystem', `Bought ${purchased}x ${structureKey}`);
      eventBus.emit('structure:bulk-purchased', {
        structureKey,
        count: purchased,
        level: this.getLevel(structureKey)
      });
    }
    
    return purchased;
  }
  
  /**
   * Recalculate total production
   */
  recalculateProduction() {
    const state = stateManager.getState();
    let energyProduction = 0;
    let manaProduction = 0;
    let volcanicProduction = 0;
    
    // Sum production from all structures
    for (let [key, structure] of Object.entries(this.structures)) {
      const level = this.getLevel(key);
      if (level === 0) continue;
      
      const production = this.getProduction(key);
      
      switch (structure.resource) {
        case 'energy':
          energyProduction += production;
          break;
        case 'mana':
          manaProduction += production;
          break;
        case 'volcanicEnergy':
          volcanicProduction += production;
          break;
        case 'gems':
          // Gems production is handled separately (very slow)
          break;
      }
    }
    
    // Update state
    stateManager.dispatch({
      type: 'SET_PRODUCTION',
      payload: { resource: 'energy', amount: energyProduction }
    });
    
    stateManager.dispatch({
      type: 'SET_PRODUCTION',
      payload: { resource: 'mana', amount: manaProduction }
    });
    
    stateManager.dispatch({
      type: 'SET_PRODUCTION',
      payload: { resource: 'volcanicEnergy', amount: volcanicProduction }
    });
    
    logger.debug('StructureSystem', 'Production recalculated', {
      energy: energyProduction,
      mana: manaProduction,
      volcanic: volcanicProduction
    });
    
    eventBus.emit('production:updated', {
      energy: energyProduction,
      mana: manaProduction,
      volcanicEnergy: volcanicProduction
    });
  }
  
  /**
   * Get all structure stats
   */
  getStats() {
    const state = stateManager.getState();
    const stats = {
      totalStructures: 0,
      totalLevels: 0,
      byTier: { 1: 0, 2: 0, 3: 0 },
      byResource: { energy: 0, mana: 0, volcanicEnergy: 0, gems: 0 }
    };
    
    for (let [key, structure] of Object.entries(this.structures)) {
      const level = this.getLevel(key);
      if (level > 0) {
        stats.totalStructures++;
        stats.totalLevels += level;
        stats.byTier[structure.tier] = (stats.byTier[structure.tier] || 0) + level;
        stats.byResource[structure.resource] = (stats.byResource[structure.resource] || 0) + level;
      }
    }
    
    return stats;
  }
  
  /**
   * Get unlock progress
   */
  getUnlockProgress() {
    const total = Object.keys(this.structures).length;
    const unlocked = Object.keys(this.structures).filter(key => this.isUnlocked(key)).length;
    
    return {
      unlocked,
      total,
      percentage: (unlocked / total) * 100
    };
  }
}

// Singleton
const structureSystem = new StructureSystem();

export default structureSystem;