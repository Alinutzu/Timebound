/**
 * UpgradeQueueSystem - Time-gated upgrade progression
 * Upgrades take time to complete, can be queued, and speed-boosted with gems
 */

import CONFIG from '../config.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceManager from '../core/ResourceManager.js';

class UpgradeQueueSystem {
  constructor() {
    this.maxQueueSize = 3; // Can queue up to 3 upgrades
    this.instantLevels = 3; // First 3 levels are instant
    
    this.initializeState();
    this.subscribeToEvents();
    this.startQueueProcessor();
    
    logger.info('UpgradeQueueSystem', 'Initialized');
  }
  
  /**
   * Initialize state
   */
  initializeState() {
    const state = stateManager.getState();
    
    if (!state.upgradeQueue) {
      // Add to state
      stateManager.dispatch({
        type: 'INIT_UPGRADE_QUEUE',
        payload: {
          queue: [],
          slots: 1, // Can be upgraded with gems
          activeUpgrade: null
        }
      });
    }
  }
  
  /**
   * Subscribe to events
   */
  subscribeToEvents() {
    // Process queue every tick
    eventBus.on('game:tick', () => {
      this.processQueue();
    });
  }
  
  /**
   * Calculate upgrade time based on level
   */
  calculateUpgradeTime(upgradeKey, targetLevel) {
    // First few levels are instant
    if (targetLevel <= this.instantLevels) {
      return 0;
    }
    
    // Base time formula (in seconds)
    // Level 4: 60s (1 min)
    // Level 5: 180s (3 min)
    // Level 6: 420s (7 min)
    // Level 7: 900s (15 min)
    // Level 8: 1800s (30 min)
    // Level 10: 5400s (90 min)
    // Level 15: 21600s (6 hours)
    // Level 20: 43200s (12 hours)
    
    const baseTime = 30; // 30 seconds base
    const levelMultiplier = Math.pow(1.8, targetLevel - this.instantLevels);
    
    const timeInSeconds = Math.floor(baseTime * levelMultiplier);
    
    // Cap at 24 hours
    return Math.min(timeInSeconds * 1000, 86400000); // Convert to ms
  }
  
  /**
   * Get upgrade time in human-readable format
   */
  getUpgradeTimeFormatted(upgradeKey, targetLevel) {
    const ms = this.calculateUpgradeTime(upgradeKey, targetLevel);
    
    if (ms === 0) return 'Instant';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
  
  /**
   * Check if upgrade is instant
   */
  isInstant(upgradeKey, targetLevel) {
    return targetLevel <= this.instantLevels;
  }
  
  /**
   * Check if can queue upgrade
   */
  canQueue(upgradeKey) {
    const state = stateManager.getState();
    const queue = state.upgradeQueue?.queue || [];
    const slots = state.upgradeQueue?.slots || 1;
    
    // Check queue size
    if (queue.length >= slots) {
      return { can: false, reason: 'queue-full' };
    }
    
    // Check if already in queue
    const alreadyQueued = queue.some(item => item.upgradeKey === upgradeKey);
    if (alreadyQueued) {
      return { can: false, reason: 'already-queued' };
    }
    
    // Check if currently upgrading
    if (state.upgradeQueue?.activeUpgrade?.upgradeKey === upgradeKey) {
      return { can: false, reason: 'already-upgrading' };
    }
    
    return { can: true };
  }
  
  /**
   * Queue an upgrade
   */
  queueUpgrade(upgradeKey, cost, costResource) {
    const canQueue = this.canQueue(upgradeKey);
    
    if (!canQueue.can) {
      logger.warn('UpgradeQueueSystem', `Cannot queue ${upgradeKey}: ${canQueue.reason}`);
      eventBus.emit('upgrade:queue-failed', { upgradeKey, reason: canQueue.reason });
      return false;
    }
    
    const upgradeSystem = require('./UpgradeSystem.js').default;
    const currentLevel = upgradeSystem.getLevel(upgradeKey);
    const targetLevel = currentLevel + 1;
    const upgradeTime = this.calculateUpgradeTime(upgradeKey, targetLevel);
    
    const queueItem = {
      upgradeKey,
      targetLevel,
      cost,
      costResource,
      duration: upgradeTime,
      queuedAt: Date.now()
    };
    
    // If instant, complete immediately
    if (upgradeTime === 0) {
      this.completeUpgrade(queueItem);
      return true;
    }
    
    // Add to queue
    stateManager.dispatch({
      type: 'ADD_TO_UPGRADE_QUEUE',
      payload: { item: queueItem }
    });
    
    logger.info('UpgradeQueueSystem', `Queued ${upgradeKey} (${this.getUpgradeTimeFormatted(upgradeKey, targetLevel)})`);
    eventBus.emit('upgrade:queued', queueItem);
    
    // Start processing if nothing is currently upgrading
    this.startNextUpgrade();
    
    return true;
  }
  
  /**
   * Start next upgrade from queue
   */
  startNextUpgrade() {
    const state = stateManager.getState();
    
    // Check if already upgrading
    if (state.upgradeQueue?.activeUpgrade) {
      return;
    }
    
    const queue = state.upgradeQueue?.queue || [];
    if (queue.length === 0) {
      return;
    }
    
    // Take first item from queue
    const nextUpgrade = queue[0];
    
    // Remove from queue and set as active
    stateManager.dispatch({
      type: 'START_UPGRADE',
      payload: {
        upgrade: {
          ...nextUpgrade,
          startedAt: Date.now(),
          completesAt: Date.now() + nextUpgrade.duration
        }
      }
    });
    
    logger.info('UpgradeQueueSystem', `Started upgrade: ${nextUpgrade.upgradeKey}`);
    eventBus.emit('upgrade:started', nextUpgrade);
  }
  
  /**
   * Process active upgrade (called every tick)
   */
  processQueue() {
    const state = stateManager.getState();
    const activeUpgrade = state.upgradeQueue?.activeUpgrade;
    
    if (!activeUpgrade) {
      return;
    }
    
    const now = Date.now();
    
    // Check if completed
    if (now >= activeUpgrade.completesAt) {
      this.completeUpgrade(activeUpgrade);
    }
  }
  
  /**
   * Complete an upgrade
   */
  completeUpgrade(upgrade) {
    // Apply the upgrade
    stateManager.dispatch({
      type: 'BUY_UPGRADE',
      payload: {
        upgradeKey: upgrade.upgradeKey,
        upgradeCost: upgrade.cost,
        costResource: upgrade.costResource
      }
    });
    
    // Clear active upgrade
    stateManager.dispatch({
      type: 'COMPLETE_UPGRADE',
      payload: { upgradeKey: upgrade.upgradeKey }
    });
    
    logger.info('UpgradeQueueSystem', `Completed upgrade: ${upgrade.upgradeKey} → Level ${upgrade.targetLevel}`);
    eventBus.emit('upgrade:completed', upgrade);
    
    // Start next upgrade in queue
    this.startNextUpgrade();
  }
  
  /**
   * Cancel queued upgrade (refund resources)
   */
  cancelQueuedUpgrade(upgradeKey) {
    const state = stateManager.getState();
    const queue = state.upgradeQueue?.queue || [];
    
    const item = queue.find(q => q.upgradeKey === upgradeKey);
    
    if (!item) {
      logger.warn('UpgradeQueueSystem', `Upgrade ${upgradeKey} not in queue`);
      return false;
    }
    
    // Refund cost
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: {
        resource: item.costResource,
        amount: item.cost
      }
    });
    
    // Remove from queue
    stateManager.dispatch({
      type: 'REMOVE_FROM_UPGRADE_QUEUE',
      payload: { upgradeKey }
    });
    
    logger.info('UpgradeQueueSystem', `Cancelled upgrade: ${upgradeKey} (refunded ${item.cost})`);
    eventBus.emit('upgrade:cancelled', { upgradeKey, refund: item.cost });
    
    return true;
  }
  
  /**
   * Speed up active upgrade with gems
   */
  speedUp(useGems = true) {
    const state = stateManager.getState();
    const activeUpgrade = state.upgradeQueue?.activeUpgrade;
    
    if (!activeUpgrade) {
      logger.warn('UpgradeQueueSystem', 'No active upgrade to speed up');
      return false;
    }
    
    const now = Date.now();
    const remainingTime = activeUpgrade.completesAt - now;
    
    if (remainingTime <= 0) {
      // Already done, just complete it
      this.completeUpgrade(activeUpgrade);
      return true;
    }
    
    // Calculate gem cost (1 gem per minute remaining, minimum 10 gems)
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    const gemCost = Math.max(10, remainingMinutes);
    
    if (useGems) {
      // Check if player has enough gems
      if (state.resources.gems < gemCost) {
        logger.warn('UpgradeQueueSystem', `Not enough gems (need ${gemCost})`);
        eventBus.emit('upgrade:speedup-failed', { reason: 'insufficient-gems', cost: gemCost });
        return false;
      }
      
      // Deduct gems
      stateManager.dispatch({
        type: 'REMOVE_RESOURCE',
        payload: { resource: 'gems', amount: gemCost }
      });
      
      // Track spending
      stateManager.dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: { key: 'gemsSpent', amount: gemCost }
      });
    }
    
    // Complete immediately
    this.completeUpgrade(activeUpgrade);
    
    logger.info('UpgradeQueueSystem', `Sped up ${activeUpgrade.upgradeKey} for ${gemCost} gems`);
    eventBus.emit('upgrade:sped-up', { upgradeKey: activeUpgrade.upgradeKey, gemCost });
    
    return true;
  }
  
  /**
   * Get remaining time for active upgrade
   */
  getRemainingTime() {
    const state = stateManager.getState();
    const activeUpgrade = state.upgradeQueue?.activeUpgrade;
    
    if (!activeUpgrade) {
      return 0;
    }
    
    const now = Date.now();
    return Math.max(0, activeUpgrade.completesAt - now);
  }
  
  /**
   * Get progress percentage
   */
  getProgress() {
    const state = stateManager.getState();
    const activeUpgrade = state.upgradeQueue?.activeUpgrade;
    
    if (!activeUpgrade) {
      return 0;
    }
    
    const now = Date.now();
    const elapsed = now - activeUpgrade.startedAt;
    const total = activeUpgrade.duration;
    
    return Math.min(100, (elapsed / total) * 100);
  }
  
  /**
   * Get queue info
   */
  getQueueInfo() {
    const state = stateManager.getState();
    
    return {
      active: state.upgradeQueue?.activeUpgrade || null,
      queue: state.upgradeQueue?.queue || [],
      slots: state.upgradeQueue?.slots || 1,
      remainingTime: this.getRemainingTime(),
      progress: this.getProgress()
    };
  }
  
  /**
   * Upgrade queue slots (with gems)
   */
  upgradeQueueSlots() {
    const state = stateManager.getState();
    const currentSlots = state.upgradeQueue?.slots || 1;
    
    if (currentSlots >= 5) {
      logger.warn('UpgradeQueueSystem', 'Maximum queue slots reached');
      return false;
    }
    
    // Cost: 1000 gems per slot
    const cost = 1000 * currentSlots;
    
    if (state.resources.gems < cost) {
      logger.warn('UpgradeQueueSystem', `Not enough gems for slot upgrade (need ${cost})`);
      return false;
    }
    
    // Deduct gems
    stateManager.dispatch({
      type: 'REMOVE_RESOURCE',
      payload: { resource: 'gems', amount: cost }
    });
    
    // Increase slots
    stateManager.dispatch({
      type: 'UPGRADE_QUEUE_SLOTS',
      payload: { slots: currentSlots + 1 }
    });
    
    logger.info('UpgradeQueueSystem', `Upgraded queue slots to ${currentSlots + 1}`);
    eventBus.emit('upgrade:slots-upgraded', { slots: currentSlots + 1 });
    
    return true;
  }
  
  /**
   * Start queue processor
   */
  startQueueProcessor() {
    // Process every second
    this.processorInterval = resourceManager.setInterval(() => {
      this.processQueue();
    }, 1000, 'UpgradeQueueProcessor');
  }
}

// Singleton
const upgradeQueueSystem = new UpgradeQueueSystem();

export default upgradeQueueSystem;