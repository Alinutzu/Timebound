/**
 * GuardianSystem - Handles guardian summoning and bonuses
 */

import { GUARDIAN_POOL, RARITIES } from '../data/guardians.js';
import CONFIG from '../config.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import upgradeSystem from './UpgradeSystem.js';

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
    
    const MAX_GUARDIANS = 20;
    if (this.getGuardians().length >= MAX_GUARDIANS) {
      logger.warn('GuardianSystem', 'Guardian roster full');
      eventBus.emit('guardian:summon-failed', { reason: 'roster-full' });
      eventBus.emit('notification:show', {
        type: 'warning',
        title: 'Roster Full',
        message: `You can have at most ${MAX_GUARDIANS} guardians. Dismiss one first.`,
        duration: 4000
      });
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
    
    // Pity system
    const pity = state.guardianPity || { epic: 0, legendary: 0 };
    const PITY_EPIC = 25;
    const PITY_LEGENDARY = 50;
    let forcedRarity = null;
    
    if (pity.legendary >= PITY_LEGENDARY - 1) {
      forcedRarity = 'legendary';
    } else if (pity.epic >= PITY_EPIC - 1) {
      forcedRarity = 'epic';
    }
    
    // Roll rarity (with pity override)
    let rarity;
    if (forcedRarity && guardianData.rarities.includes(forcedRarity)) {
      rarity = forcedRarity;
    } else {
      rarity = this.rollRarity(guardianData.rarities);
    }
    
    // Roll bonus within rarity range
    const bonus = this.rollBonus(rarity);
    
    // Update pity counters
    const newPity = { ...pity };
    if (rarity === 'legendary') {
      newPity.epic = 0;
      newPity.legendary = 0;
    } else if (rarity === 'epic') {
      newPity.epic = 0;
      newPity.legendary = pity.legendary + 1;
    } else {
      newPity.epic = pity.epic + 1;
      newPity.legendary = pity.legendary + 1;
    }
    
    // Create guardian instance
    const guardian = {
      id: Date.now() + Math.random(),
      key: guardianKey,
      name: guardianData.name,
      emoji: guardianData.emoji,
      type: guardianData.type,
      realm: guardianData.realm,
      rarity: rarity,
      bonus: bonus,
      summonedAt: Date.now(),
      special: guardianData.special || null,
      ability: guardianData.ability || null
    };
    
    // Add to state
    stateManager.dispatch({
      type: 'ADD_GUARDIAN',
      payload: { guardian, newPity }
    });
    
    logger.info('GuardianSystem', `Summoned ${guardian.name} (${rarity}) with +${bonus}% bonus (pity: ${newPity.epic}/${newPity.legendary})`);
    
    if (forcedRarity) {
      eventBus.emit('notification:show', {
        type: 'success',
        title: 'Pity System!',
        message: `You were guaranteed a ${forcedRarity} after ${pity[forcedRarity]} summons without one!`,
        duration: 5000
      });
    }
    
    // Apply unlock abilities (e.g. abyssSerpent unlocks pressureTech)
    if (guardianData.ability && guardianData.ability.type === 'unlock') {
      const target = guardianData.ability.target;
      if (!state.upgrades[target] || state.upgrades[target].level === 0) {
        stateManager.dispatch({
          type: 'BUY_UPGRADE',
          payload: { upgradeKey: target, skipResourceDeduction: true }
        });
        eventBus.emit('notification:show', {
          type: 'success',
          title: 'Guardian Unlock',
          message: `${guardianData.name} unlocked ${target}!`,
          duration: 4000
        });
      }
    }
    
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
   * Get guardians by type — maps realm resources (e.g. 'tidalEnergy') to guardian type ('water')
   */
  getGuardiansByType(type) {
    const guardians = this.getGuardians();
    const resourceToType = {
      volcanicEnergy: 'volcanic',
      tidalEnergy: 'water',
      solarEssence: 'solar',
      cryoEnergy: 'cryo',
      cosmicEnergy: 'cosmic'
    };
    const mappedType = resourceToType[type] || type;
    return guardians.filter(g => g.type === mappedType || g.type === 'all');
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
    const abilityMultiplier = this.getAbilityMultiplier(resourceType);
    return (1 + (bonus / 100)) * abilityMultiplier;
  }

  /**
   * Get ability-based multiplier for a resource
   */
  getAbilityMultiplier(resourceType) {
    const guardians = this.getGuardians();
    let multiplier = 1;
    for (const g of guardians) {
      if (g.ability && g.ability.type === 'boost' && g.ability.target === resourceType) {
        multiplier *= g.ability.multiplier;
      }
    }
    return multiplier;
  }

  /**
   * Get structure-specific synergy multiplier from guardians
   */
  getStructureSynergy(structureKey) {
    const guardians = this.getGuardians();
    let multiplier = 1;
    for (const g of guardians) {
      if (g.ability && g.ability.type === 'synergy' && g.ability.target === structureKey) {
        multiplier *= g.ability.multiplier;
      }
    }
    return multiplier;
  }

  /**
   * Get unlock abilities (auto-unlock upgrades/structures)
   */
  getUnlockAbilities() {
    const guardians = this.getGuardians();
    const unlocks = [];
    for (const g of guardians) {
      if (g.ability && g.ability.type === 'unlock') {
        unlocks.push(g.ability.target);
      }
    }
    return unlocks;
  }

  /**
   * Get chance-based bonuses (e.g. extra pearl chance)
   */
  getChanceBonus(targetKey) {
    const guardians = this.getGuardians();
    let totalChance = 0;
    for (const g of guardians) {
      if (g.ability && g.ability.type === 'chanceBonus' && g.ability.target === targetKey) {
        totalChance += g.ability.chance;
      }
    }
    return totalChance;
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
        water: this.getTotalBonus('water'),
        all: this.getTotalBonus('all')
      },
      averageBonus: 0,
      bestGuardian: null,
      collection: this.getCollectionProgress()
    };
    
    // Count by rarity
    for (let rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
      stats.byRarity[rarity] = guardians.filter(g => g.rarity === rarity).length;
    }
    
    // Count by type
    const types = ['energy', 'mana', 'volcanic', 'water', 'all', 'gems'];
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
   * Bulk summon — x10 with one guaranteed Rare+
   */
  summonBulk(count = 10) {
    const state = stateManager.getState();
    const totalCost = this.summonCost * count;
    if (state.resources.gems < totalCost) {
      eventBus.emit('guardian:summon-failed', { reason: 'insufficient-gems' });
      return [];
    }
    
    const freeSlots = 20 - this.getGuardians().length;
    if (freeSlots < count) {
      eventBus.emit('notification:show', {
        type: 'warning', title: 'Roster Full',
        message: `Need ${count} free slots but only ${freeSlots} available. Dismiss some guardians first.`,
        duration: 4000
      });
      return [];
    }
    
    const results = [];
    let hasRareOrBetter = false;
    
    for (let i = 0; i < count; i++) {
      const guardian = this.summon();
      if (guardian) {
        results.push(guardian);
        if (guardian.rarity === 'rare' || guardian.rarity === 'epic' || guardian.rarity === 'legendary') {
          hasRareOrBetter = true;
        }
      }
    }
    
    // Guarantee: replace last common with rare if no Rare+ was pulled
    if (!hasRareOrBetter && results.length > 0) {
      this.dismiss(results[results.length - 1].id);
      results[results.length - 1] = this.summonGuaranteed('rare');
    }
    
    if (results.length > 0) {
      eventBus.emit('guardian:bulk-summoned', { count: results.length, guardians: results });
    }
    
    return results;
  }

  /**
   * Summon a guaranteed minimum rarity
   */
  summonGuaranteed(minRarity) {
    const state = stateManager.getState();
    const currentRealm = state.realms.current;
    const availableGuardians = this.getAvailableGuardians(currentRealm);
    if (availableGuardians.length === 0) return null;
    
    const guardianKey = availableGuardians[Math.floor(Math.random() * availableGuardians.length)];
    const guardianData = this.guardianPool[guardianKey];
    const validRarities = guardianData.rarities.filter(r => {
      const order = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
      return order[r] >= order[minRarity];
    });
    const rarity = validRarities.length > 0
      ? validRarities[Math.floor(Math.random() * validRarities.length)]
      : this.rollRarity(guardianData.rarities);
    const bonus = this.rollBonus(rarity);
    
    const pity = state.guardianPity || { epic: 0, legendary: 0 };
    const newPity = { ...pity };
    if (rarity === 'legendary') { newPity.epic = 0; newPity.legendary = 0; }
    else if (rarity === 'epic') { newPity.epic = 0; newPity.legendary = pity.legendary + 1; }
    else { newPity.epic = pity.epic + 1; newPity.legendary = pity.legendary + 1; }
    
    const guardian = {
      id: Date.now() + Math.random(), key: guardianKey, name: guardianData.name,
      emoji: guardianData.emoji, type: guardianData.type, realm: guardianData.realm,
      rarity, bonus, summonedAt: Date.now(), special: guardianData.special || null,
      ability: guardianData.ability || null
    };
    
    stateManager.dispatch({ type: 'ADD_GUARDIAN', payload: { guardian, newPity, cost: 0 } });
    return guardian;
  }
  
  /**
   * Fuse 3 same-rarity guardians into 1 of next rarity
   */
  fuseGuardians(guardianIds) {
    if (guardianIds.length !== 3) return null;
    const guardians = this.getGuardians();
    const selected = guardians.filter(g => guardianIds.includes(g.id));
    if (selected.length !== 3) return null;
    
    const rarity = selected[0].rarity;
    if (!selected.every(g => g.rarity === rarity)) return null;
    
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const idx = rarityOrder.indexOf(rarity);
    if (idx === -1 || idx >= rarityOrder.length - 1) return null;
    const nextRarity = rarityOrder[idx + 1];
    
    // Remove the 3 fused guardians
    for (const g of selected) {
      stateManager.dispatch({ type: 'REMOVE_GUARDIAN', payload: { guardianId: g.id } });
    }
    
    // Pick a random guardian from the pool that can be of next rarity
    const available = Object.values(this.guardianPool).filter(g =>
      g.rarities.includes(nextRarity)
    );
    if (available.length === 0) return null;
    
    const data = available[Math.floor(Math.random() * available.length)];
    const bonus = this.rollBonus(nextRarity);
    
    const guardian = {
      id: Date.now() + Math.random(), key: data.id, name: data.name,
      emoji: data.emoji, type: data.type, realm: data.realm,
      rarity: nextRarity, bonus, summonedAt: Date.now(),
      special: data.special || null, ability: data.ability || null
    };
    
    stateManager.dispatch({ type: 'ADD_GUARDIAN_DIRECT', payload: { guardian } });
    
    eventBus.emit('notification:show', {
      type: 'success', title: 'Guardian Fusion!',
      message: `Fused 3 ${rarity} into ${data.emoji} ${data.name} (${nextRarity})!`,
      duration: 5000
    });
    
    eventBus.emit('guardian:summoned', guardian);
    return guardian;
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