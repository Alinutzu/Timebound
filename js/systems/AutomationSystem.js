/**
 * AutomationSystem - Auto-buy, auto-claim, auto-play features
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceManager from '../core/ResourceManager.js';

class AutomationSystem {
  constructor() {
    this.features = {
      autoBuyStructures: {
        name: 'Auto-Buy Structures',
        description: 'Automatically purchase structures when affordable',
        cost: 500, // gems
        unlocked: false,
        enabled: false
      },
      autoClaimQuests: {
        name: 'Auto-Claim Quests',
        description: 'Automatically claim completed quests',
        cost: 300,
        unlocked: false,
        enabled: false
      },
      autoPuzzle: {
        name: 'Auto-Puzzle',
        description: 'Automatically play puzzle games',
        cost: 1000,
        unlocked: false,
        enabled: false
      },
      autoUpgrade: {
        name: 'Auto-Upgrade',
        description: 'Automatically queue upgrades',
        cost: 750,
        unlocked: false,
        enabled: false
      },
      autoSummon: {
        name: 'Auto-Summon',
        description: 'Automatically summon guardians',
        cost: 2000,
        unlocked: false,
        enabled: false
      }
    };
    
    this.initializeState();
    this.subscribeToEvents();
    this.startAutomationLoop();
    
    logger.info('AutomationSystem', 'Initialized');
  }
  
  /**
   * Initialize automation state
   */
  initializeState() {
    const state = stateManager.getState();
    
    if (!state.automation) {
      // Initialize in StateManager getInitialState
    }
    
    // Load unlocked features from state
    for (let [key, feature] of Object.entries(this.features)) {
      const stateFeature = state.automation[key];
      if (stateFeature) {
        feature.unlocked = stateFeature.unlocked || false;
        feature.enabled = stateFeature.enabled || false;
      }
    }
  }
  
  /**
   * Subscribe to events
   */
  subscribeToEvents() {
    // When quests complete, check auto-claim
    eventBus.on('quest:completed', () => {
      if (this.isEnabled('autoClaimQuests')) {
        this.autoClaimQuests();
      }
    });
    
    // When resources change, check auto-buy
    eventBus.on('state:ADD_RESOURCE', () => {
      if (this.isEnabled('autoBuyStructures')) {
        // Debounce auto-buy (don't trigger on every resource tick)
        if (!this.autoBuyDebounce) {
          this.autoBuyDebounce = true;
          setTimeout(() => {
            this.autoBuyStructures();
            this.autoBuyDebounce = false;
          }, 1000);
        }
      }
    });
  }
  
  /**
   * Start automation loop
   */
  startAutomationLoop() {
    this.automationInterval = resourceManager.setInterval(() => {
      this.tick();
    }, 5000, 'AutomationLoop'); // Every 5 seconds
  }
  
  /**
   * Automation tick
   */
  tick() {
    if (this.isEnabled('autoBuyStructures')) {
      this.autoBuyStructures();
    }
    
    if (this.isEnabled('autoUpgrade')) {
      this.autoQueueUpgrades();
    }
    
    if (this.isEnabled('autoSummon')) {
      this.autoSummonGuardians();
    }
    
    if (this.isEnabled('autoPuzzle')) {
      this.autoPuzzlePlay();
    }
  }
  
  /**
   * Check if feature is enabled
   */
  isEnabled(featureKey) {
    const state = stateManager.getState();
    const feature = state.automation[featureKey];
    return feature?.unlocked && feature?.enabled;
  }
  
  /**
   * Unlock a feature
   */
  unlock(featureKey) {
    const feature = this.features[featureKey];
    
    if (!feature) {
      logger.error('AutomationSystem', `Feature ${featureKey} not found`);
      return false;
    }
    
    const state = stateManager.getState();
    
    // Check if already unlocked
    if (state.automation[featureKey]?.unlocked) {
      logger.warn('AutomationSystem', `${feature.name} already unlocked`);
      return false;
    }
    
    // Check cost
    if (state.resources.gems < feature.cost) {
      logger.warn('AutomationSystem', `Not enough gems for ${feature.name} (need ${feature.cost})`);
      eventBus.emit('automation:unlock-failed', { 
        featureKey, 
        reason: 'insufficient-gems',
        cost: feature.cost
      });
      return false;
    }
    
    // Deduct cost
    stateManager.dispatch({
      type: 'REMOVE_RESOURCE',
      payload: { resource: 'gems', amount: feature.cost }
    });
    
    // Track spending
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: { key: 'gemsSpent', amount: feature.cost }
    });
    
    // Unlock feature
    stateManager.dispatch({
      type: 'UNLOCK_AUTOMATION',
      payload: { featureKey }
    });
    
    logger.info('AutomationSystem', `Unlocked: ${feature.name}`);
    
    eventBus.emit('automation:unlocked', { featureKey, feature });
    
    // Show notification
    eventBus.emit('notification:show', {
      type: 'automation',
      title: 'Automation Unlocked!',
      message: `🤖 ${feature.name}`,
      description: feature.description,
      duration: 5000
    });
    
    return true;
  }
  
  /**
   * Toggle feature on/off
   */
  toggle(featureKey) {
    const state = stateManager.getState();
    const feature = state.automation[featureKey];
    
    if (!feature?.unlocked) {
      logger.warn('AutomationSystem', `${featureKey} not unlocked`);
      return false;
    }
    
    const newState = !feature.enabled;
    
    stateManager.dispatch({
      type: 'TOGGLE_AUTOMATION',
      payload: { featureKey, enabled: newState }
    });
    
    logger.info('AutomationSystem', `${featureKey} ${newState ? 'enabled' : 'disabled'}`);
    
    eventBus.emit('automation:toggled', { featureKey, enabled: newState });
    
    return true;
  }
  
  /**
   * Auto-buy structures
   */
  autoBuyStructures() {
    const state = stateManager.getState();
    const structureSystem = require('./StructureSystem.js').default;
    const threshold = state.automation.autoBuyThreshold || 0.8; // 80% of cost
    
    // Get all affordable structures
    const currentRealm = state.realms.current;
    const structures = structureSystem.getStructuresForRealm(currentRealm);
    
    let purchasesMade = 0;
    
    for (let [key, structureData] of Object.entries(structures)) {
      if (!structureSystem.isUnlocked(key)) continue;
      
      const cost = structureSystem.getCost(key);
      const canAfford = state.resources.energy >= cost * threshold;
      
      if (canAfford) {
        const success = structureSystem.buy(key);
        if (success) {
          purchasesMade++;
        }
      }
    }
    
    if (purchasesMade > 0) {
      logger.debug('AutomationSystem', `Auto-bought ${purchasesMade} structures`);
    }
  }
  
  /**
   * Auto-claim quests
   */
  autoClaimQuests() {
    const questSystem = require('./QuestSystem.js').default;
    const activeQuests = questSystem.getActiveQuests();
    
    let claimedCount = 0;
    
    for (let quest of activeQuests) {
      if (quest.completed) {
        const success = questSystem.claim(quest.id);
        if (success) {
          claimedCount++;
        }
      }
    }
    
    if (claimedCount > 0) {
      logger.info('AutomationSystem', `Auto-claimed ${claimedCount} quests`);
    }
  }
  
  /**
   * Auto-queue upgrades
   */
  autoQueueUpgrades() {
    const state = stateManager.getState();
    const upgradeSystem = require('./UpgradeSystem.js').default;
    const upgradeQueueSystem = require('./UpgradeQueueSystem.js').default;
    
    // Check if queue has space
    const queueInfo = upgradeQueueSystem.getQueueInfo();
    if (queueInfo.queue.length >= queueInfo.slots) {
      return; // Queue full
    }
    
    // Get recommended upgrades
    const recommended = upgradeSystem.getRecommendedUpgrades(3);
    
    for (let rec of recommended) {
      if (queueInfo.queue.length >= queueInfo.slots) break;
      
      // Try to buy/queue
      const success = upgradeSystem.buy(rec.key);
      if (success) {
        logger.debug('AutomationSystem', `Auto-queued upgrade: ${rec.key}`);
      }
    }
  }
  
  /**
   * Auto-summon guardians
   */
  autoSummonGuardians() {
    const state = stateManager.getState();
    const guardianSystem = require('./GuardianSystem.js').default;
    
    // Check gem threshold (only summon if >= 1000 gems)
    const gemThreshold = state.automation.autoSummonThreshold || 1000;
    
    if (state.resources.gems >= gemThreshold) {
      const success = guardianSystem.summon();
      if (success) {
        logger.info('AutomationSystem', 'Auto-summoned guardian');
      }
    }
  }
  
  /**
   * Auto-play puzzle
   */
  autoPuzzlePlay() {
    const state = stateManager.getState();
    
    // Check if puzzle is available and not in boss battle
    if (state.currentBoss) {
      return; // Don't auto-play during boss battles
    }
    
    // Check gem cost (auto-puzzle costs gems)
    const cost = 50; // 50 gems per auto-puzzle
    
    if (state.resources.gems < cost) {
      return;
    }
    
    // Simulate puzzle play
    // In real implementation, this would use AI or random moves
    const simulatedScore = Math.floor(Math.random() * 1000) + 500;
    
    // Deduct cost
    stateManager.dispatch({
      type: 'REMOVE_RESOURCE',
      payload: { resource: 'gems', amount: cost }
    });
    
    // Give puzzle reward based on score
    const gemReward = Math.floor(simulatedScore / 50);
    const energyReward = simulatedScore * 5;
    
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: { resource: 'gems', amount: gemReward }
    });
    
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: { resource: 'energy', amount: energyReward }
    });
    
    logger.debug('AutomationSystem', `Auto-puzzle: score ${simulatedScore}, earned ${gemReward} gems`);
  }
  
  /**
   * Set auto-buy threshold
   */
  setAutoBuyThreshold(threshold) {
    if (threshold < 0.5 || threshold > 1) {
      logger.warn('AutomationSystem', `Invalid threshold: ${threshold} (must be 0.5-1.0)`);
      return false;
    }
    
    stateManager.dispatch({
      type: 'SET_AUTO_BUY_THRESHOLD',
      payload: { threshold }
    });
    
    logger.info('AutomationSystem', `Auto-buy threshold set to ${threshold * 100}%`);
    
    return true;
  }
  
  /**
   * Set auto-summon threshold
   */
  setAutoSummonThreshold(gemAmount) {
    if (gemAmount < 100) {
      logger.warn('AutomationSystem', 'Gem threshold too low (min 100)');
      return false;
    }
    
    stateManager.dispatch({
      type: 'SET_AUTO_SUMMON_THRESHOLD',
      payload: { threshold: gemAmount }
    });
    
    logger.info('AutomationSystem', `Auto-summon threshold set to ${gemAmount} gems`);
    
    return true;
  }
  
  /**
   * Get automation stats
   */
  getStats() {
    const state = stateManager.getState();
    
    const stats = {
      totalUnlocked: 0,
      totalEnabled: 0,
      features: {}
    };
    
    for (let [key, feature] of Object.entries(this.features)) {
      const stateFeature = state.automation[key];
      
      if (stateFeature?.unlocked) stats.totalUnlocked++;
      if (stateFeature?.enabled) stats.totalEnabled++;
      
      stats.features[key] = {
        ...feature,
        unlocked: stateFeature?.unlocked || false,
        enabled: stateFeature?.enabled || false
      };
    }
    
    return stats;
  }
  
  /**
   * Get unlockable features
   */
  getUnlockableFeatures() {
    const state = stateManager.getState();
    const unlockable = [];
    
    for (let [key, feature] of Object.entries(this.features)) {
      const stateFeature = state.automation[key];
      
      if (!stateFeature?.unlocked) {
        unlockable.push({
          key,
          ...feature,
          canAfford: state.resources.gems >= feature.cost
        });
      }
    }
    
    return unlockable;
  }
}

// Singleton
const automationSystem = new AutomationSystem();

export default automationSystem;