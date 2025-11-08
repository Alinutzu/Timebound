/**
 * BossSystem - Manages boss encounters and battles
 */

import BOSSES from '../data/bosses.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class BossSystem {
  constructor() {
    this.bosses = BOSSES;
    this.currentBattle = null;
    
    this.initializeState();
    this.subscribeToEvents();
    
    logger.info('BossSystem', 'Initialized with bosses:', Object.keys(this.bosses));
  }
  
  /**
   * Initialize boss state
   */
  initializeState() {
  const state = stateManager.getState();
  
  // Check if bosses are already initialized
  if (!state.bosses || Object.keys(state.bosses).length === 0) {
    logger.info('BossSystem', 'Initializing boss states...');
    
    const initialBosses = {};
    
    for (let [key, boss] of Object.entries(this.bosses)) {
      // Skip locked bosses
      if (boss.locked) {
        logger.info('BossSystem', `Skipping locked boss: ${key}`);
        continue;
      }
      
      // First boss (corruptedTreeant) should be unlocked by default
      const isFirstBoss = key === 'corruptedTreeant';
      
      initialBosses[key] = {
        unlocked: isFirstBoss,
        defeated: false,
        currentHP: boss.hp,
        maxHP: boss.hp,
        attempts: 0,
        bestScore: 0,
        defeatedCount: 0,
        firstDefeatAt: null
      };
      
      logger.info('BossSystem', `Initialized boss ${key}:`, {
        unlocked: isFirstBoss,
        hp: boss.hp
      });
    }
    
    // Dispatch to state
    stateManager.dispatch({
      type: 'INIT_BOSSES',
      payload: { bosses: initialBosses }
    });
    
    logger.info('BossSystem', 'Boss states initialized:', initialBosses);
  } else {
    logger.info('BossSystem', 'Bosses already initialized');
  }
  
  // Check for unlocks
  this.checkUnlocks();
}
  
  /**
   * Subscribe to events
   */
  subscribeToEvents() {
    // Check unlocks on key milestones
    eventBus.on('structure:purchased', () => this.checkUnlocks());
    eventBus.on('production:updated', () => this.checkUnlocks());
    eventBus.on('realm:unlocked', () => this.checkUnlocks());
    eventBus.on('ascension:completed', () => this.checkUnlocks());
    eventBus.on('boss:defeated', () => this.checkUnlocks());
    
    // Handle puzzle completion during boss battle
    eventBus.on('puzzle:completed', (data) => {
      if (this.currentBattle) {
        this.processPuzzleResult(data);
      }
    });
  }
  
  /**
   * Check which bosses should be unlocked
   */
  checkUnlocks() {
    const state = stateManager.getState();
    
    for (let [key, boss] of Object.entries(this.bosses)) {
      if (boss.locked) continue;
      
      const bossState = state.bosses[key];
      
      if (bossState?.unlocked) continue;
      
      if (this.meetsUnlockCondition(key)) {
        this.unlockBoss(key);
      }
    }
  }
  
  /**
   * Check if boss unlock condition is met
   */
  meetsUnlockCondition(bossKey) {
  const boss = this.bosses[bossKey];
  const condition = boss.unlockCondition;
  
  // If no condition, always unlocked (for first boss)
  if (!condition) {
    logger.info('BossSystem', `Boss ${bossKey} has no unlock conditions - auto unlocked`);
    return true;
  }
  
  const state = stateManager.getState();
    
    // Check production requirement
    if (condition.production) {
      for (let [resource, required] of Object.entries(condition.production)) {
        if (state.production[resource] < required) {
          return false;
        }
      }
    }
    
    // Check structure requirement
    if (condition.structures) {
      if (condition.structures.total) {
        const structureSystem = require('./StructureSystem.js').default;
        const totalLevels = structureSystem.getStats().totalLevels;
        
        if (totalLevels < condition.structures.total) {
          return false;
        }
      }
    }
    
    // Check realm requirement
    if (condition.realms) {
      for (let [realm, requirement] of Object.entries(condition.realms)) {
        if (requirement === 'unlocked' && !state.realms.unlocked.includes(realm)) {
          return false;
        }
      }
    }
    
    // Check ascension requirement
    if (condition.ascension) {
      if (state.ascension.level < condition.ascension.level) {
        return false;
      }
    }
    
    // Check boss requirements
    if (condition.bosses) {
      for (let [requiredBoss, requirement] of Object.entries(condition.bosses)) {
        const requiredBossState = state.bosses[requiredBoss];
        
        if (requirement === 'defeated' && !requiredBossState?.defeated) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Unlock a boss
   */
  unlockBoss(bossKey) {
    stateManager.dispatch({
      type: 'UNLOCK_BOSS',
      payload: { bossKey }
    });
    
    const boss = this.bosses[bossKey];
    
    logger.info('BossSystem', `Unlocked boss: ${boss.name}`);
    
    eventBus.emit('notification:show', {
      type: 'boss',
      title: 'Boss Unlocked!',
      message: `${boss.emoji} ${boss.name}`,
      description: boss.description,
      duration: 6000
    });
    
    eventBus.emit('boss:unlocked', { bossKey, boss });
  }
  
  /**
   * Start a boss battle
   */
  startBattle(bossKey) {
    const state = stateManager.getState();
    const bossState = state.bosses[bossKey];
    const boss = this.bosses[bossKey];
    
    if (!boss) {
      logger.error('BossSystem', `Boss ${bossKey} not found`);
      return false;
    }
    
    if (!bossState?.unlocked) {
      logger.warn('BossSystem', `Boss ${bossKey} not unlocked`);
      eventBus.emit('boss:battle-failed', { bossKey, reason: 'locked' });
      return false;
    }
    
    if (bossState.currentHP <= 0) {
      logger.warn('BossSystem', `Boss ${bossKey} already defeated`);
      // Allow re-fighting for rewards
    }
    
    // Set current battle
    this.currentBattle = {
      bossKey,
      startedAt: Date.now(),
      attempts: 0
    };
    
    // Update state
    stateManager.dispatch({
      type: 'START_BOSS_BATTLE',
      payload: { bossKey }
    });
    
    logger.info('BossSystem', `Started battle with ${boss.name}`);
    eventBus.emit('boss:battle-started', { bossKey, boss, bossState });
    
    return true;
  }
  
  /**
   * Process puzzle result during boss battle
   */
  processPuzzleResult(puzzleData) {
    if (!this.currentBattle) {
      logger.warn('BossSystem', 'No active boss battle');
      return;
    }
    
    const { bossKey } = this.currentBattle;
    const boss = this.bosses[bossKey];
    const state = stateManager.getState();
    const bossState = state.bosses[bossKey];
    
    const { score, combo, moves } = puzzleData;
    
    // Calculate damage
    const damage = boss.damageFormula(score, combo);
    
    // Apply damage
    const newHP = Math.max(0, bossState.currentHP - damage);
    
    stateManager.dispatch({
      type: 'DAMAGE_BOSS',
      payload: {
        bossKey,
        damage,
        newHP,
        score
      }
    });
    
    this.currentBattle.attempts++;
    
    logger.info('BossSystem', `Dealt ${damage} damage to ${boss.name} (${newHP}/${bossState.maxHP} HP)`);
    
    eventBus.emit('boss:damage-dealt', {
      bossKey,
      damage,
      currentHP: newHP,
      maxHP: bossState.maxHP,
      score,
      combo
    });
    
    // Check if defeated
    if (newHP <= 0) {
      this.defeatBoss(bossKey);
    }
  }
  
  /**
   * Defeat a boss
   */
  defeatBoss(bossKey) {
    const boss = this.bosses[bossKey];
    const state = stateManager.getState();
    const bossState = state.bosses[bossKey];
    
    const isFirstDefeat = !bossState.defeated;
    
    // Mark as defeated
    stateManager.dispatch({
      type: 'DEFEAT_BOSS',
      payload: { bossKey }
    });
    
    // Give rewards
    const rewards = isFirstDefeat ? boss.rewards.firstTime : boss.rewards.repeat;
    
    this.giveRewards(bossKey, rewards, isFirstDefeat);
    
    // Clear current battle
    this.currentBattle = null;
    
    logger.info('BossSystem', `Defeated ${boss.name}!`, { isFirstDefeat, rewards });
    
    // Show victory screen
    eventBus.emit('boss:defeated', {
      bossKey,
      boss,
      isFirstDefeat,
      rewards
    });
    
    // Update statistics
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: { key: 'bossesDefeated', amount: 1 }
    });
    
    // Trigger achievements
    if (boss.achievements) {
      for (let achievementKey of boss.achievements) {
        eventBus.emit('achievement:check', { achievementKey });
      }
    }
  }
  
  /**
   * Give boss rewards
   */
  giveRewards(bossKey, rewards, isFirstDefeat) {
    // Resource rewards
    for (let [resource, amount] of Object.entries(rewards)) {
      if (resource === 'guaranteedGuardian' || resource === 'specialReward') continue;
      
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
    
    // Guaranteed guardian
    if (rewards.guaranteedGuardian) {
      const guardianSystem = require('./GuardianSystem.js').default;
      
      // Summon specific rarity/type
      const { rarity, type } = rewards.guaranteedGuardian;
      
      // Filter guardians by type
      const guardianPool = require('../data/guardians.js').default;
      const availableGuardians = Object.entries(guardianPool)
        .filter(([key, data]) => {
          if (data.type !== type && data.type !== 'all') return false;
          if (!data.rarities.includes(rarity)) return false;
          return true;
        })
        .map(([key]) => key);
      
      if (availableGuardians.length > 0) {
        const guardianKey = availableGuardians[Math.floor(Math.random() * availableGuardians.length)];
        const guardianData = guardianPool[guardianKey];
        
        // Roll bonus in rarity range
        const rarityData = require('../data/guardians.js').RARITIES[rarity];
        const [min, max] = rarityData.bonusRange;
        const bonus = Math.floor(Math.random() * (max - min + 1)) + min;
        
        const guardian = {
          id: Date.now() + Math.random(),
          key: guardianKey,
          name: guardianData.name,
          emoji: guardianData.emoji,
          type: guardianData.type,
          rarity: rarity,
          bonus: bonus,
          summonedAt: Date.now(),
          special: guardianData.special || null,
          source: `Boss: ${bossKey}`
        };
        
        stateManager.dispatch({
          type: 'ADD_GUARDIAN_DIRECT',
          payload: { guardian }
        });
        
        logger.info('BossSystem', `Awarded guaranteed guardian: ${guardian.name} (${rarity})`);
      }
    }
    
    // Special rewards
    if (rewards.specialReward) {
      logger.info('BossSystem', `Special reward: ${rewards.specialReward.name}`);
      // Handle special rewards (cosmetics, titles, etc.)
      eventBus.emit('special-reward:unlocked', rewards.specialReward);
    }
  }
  
  /**
   * Exit boss battle
   */
  exitBattle() {
    if (!this.currentBattle) {
      return false;
    }
    
    const { bossKey } = this.currentBattle;
    
    this.currentBattle = null;
    
    stateManager.dispatch({
      type: 'EXIT_BOSS_BATTLE'
    });
    
    logger.info('BossSystem', `Exited battle with ${bossKey}`);
    eventBus.emit('boss:battle-exited', { bossKey });
    
    return true;
  }
  
  /**
   * Get boss state
   */
  getBossState(bossKey) {
    const state = stateManager.getState();
    return state.bosses[bossKey];
  }
  
  /**
   * Get unlocked bosses
   */
  getUnlockedBosses() {
    const state = stateManager.getState();
    const unlocked = [];
    
    for (let [key, boss] of Object.entries(this.bosses)) {
      if (boss.locked) continue;
      
      const bossState = state.bosses[key];
      if (bossState?.unlocked) {
        unlocked.push({ key, boss, state: bossState });
      }
    }
    
    return unlocked;
  }
  
  /**
   * Get boss stats
   */
  getStats() {
    const state = stateManager.getState();
    
    let totalBosses = 0;
    let unlockedBosses = 0;
    let defeatedBosses = 0;
    
    for (let [key, boss] of Object.entries(this.bosses)) {
      if (boss.locked) continue;
      
      totalBosses++;
      
      const bossState = state.bosses[key];
      if (bossState?.unlocked) unlockedBosses++;
      if (bossState?.defeated) defeatedBosses++;
    }
    
    return {
      total: totalBosses,
      unlocked: unlockedBosses,
      defeated: defeatedBosses,
      percentageUnlocked: (unlockedBosses / totalBosses) * 100,
      percentageDefeated: (defeatedBosses / totalBosses) * 100
    };
  }
  
  /**
   * Get current battle info
   */
  getCurrentBattle() {
    if (!this.currentBattle) {
      return null;
    }
    
    const { bossKey, startedAt, attempts } = this.currentBattle;
    const boss = this.bosses[bossKey];
    const bossState = this.getBossState(bossKey);
    
    return {
      bossKey,
      boss,
      bossState,
      startedAt,
      attempts,
      duration: Date.now() - startedAt
    };
  }
}

// Singleton
const bossSystem = new BossSystem();

export default bossSystem;