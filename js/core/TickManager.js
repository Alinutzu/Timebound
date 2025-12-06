/**
 * TickManager - Game loop and time management
 */

import CONFIG from '../config.js';
import stateManager from './StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceManager from './ResourceManager.js';

class TickManager {
  constructor() {
    this.isRunning = false;
    this.tickInterval = null;
    this.lastTick = Date.now();
    this.tickCount = 0;
    this.deltaTime = 0;
    
    // Performance tracking
    this.performance = {
      averageTickTime: 0,
      maxTickTime: 0,
      tickTimes: []
    };
    
    logger.info('TickManager', 'Initialized');
  }
  
  /**
   * Start game loop
   */
  start() {
    if (this.isRunning) {
      logger.warn('TickManager', 'Already running');
      return;
    }
    
    this.isRunning = true;
    this.lastTick = Date.now();
    
    // Use setInterval for consistent timing
    this.tickInterval = resourceManager.setInterval(() => {
      this.tick();
    }, CONFIG.TICK_RATE, 'GameLoop');
    
    logger.info('TickManager', `Game loop started (${CONFIG.TICK_RATE}ms per tick)`);
    eventBus.emit('game:started');
  }
  
  /**
   * Stop game loop
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.tickInterval) {
      resourceManager.clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    
    logger.info('TickManager', 'Game loop stopped');
    eventBus.emit('game:stopped');
  }
  
  /**
   * Main game tick
   */
  tick() {
    const tickStart = performance.now();
    const now = Date.now();
    
    // Calculate delta time (in seconds)
    this.deltaTime = (now - this.lastTick) / 1000;
    this.lastTick = now;
    
    // Prevent huge jumps (e.g., tab was inactive)
    if (this.deltaTime > 1) {
      this.deltaTime = 1;
    }
    
    try {
      // Emit tick event with delta time
      eventBus.emit('game:tick', { 
        deltaTime: this.deltaTime,
        tickCount: this.tickCount
      });
      
      // Update play time
      this.updatePlayTime();
      
      // Production tick (resources generation)
      this.productionTick();
      
      // Update statistics
      this.updateStatistics();
      
      this.tickCount++;
      
      // Performance tracking
      const tickEnd = performance.now();
      const tickTime = tickEnd - tickStart;
      this.trackPerformance(tickTime);
      
    } catch (error) {
      logger.error('TickManager', 'Error in game tick:', error);
    }
  }
  
  /**
   * Production tick - generate resources
   */
  productionTick() {
  const state = stateManager.getState();

  // ===== FIX: Apply critical energy chance =====
  const upgradeSystem = require('../systems/UpgradeSystem.js').default;
  const criticalChance = upgradeSystem.getCriticalChance(); // Returns 0-0.20 (0-20%)
  const isCritical = Math.random() < criticalChance;
  const criticalMultiplier = isCritical ? 2 : 1;
  // ===== END FIX =====
  
  // Energy production
  let energyPerTick = state. production.energy * this.deltaTime;
  
  // ✅ Apply critical multiplier
  if (isCritical && energyPerTick > 0) {
    energyPerTick *= criticalMultiplier;
    // Optional: emit event for visual effect
    eventBus.emit('production:critical', { resource: 'energy', amount: energyPerTick });
  }
  
  if (energyPerTick > 0) {
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: {
        resource: 'energy',
        amount: energyPerTick  // ✅ Acum include critical! 
      }
    });
    
    // Update lifetime energy
    stateManager.dispatch({
      type: 'UPDATE_LIFETIME_ENERGY',
      payload: { amount: energyPerTick }
    });
  }
  
  // Mana production (same as before)
  const manaPerTick = state.production.mana * this.deltaTime;
  if (manaPerTick > 0) {
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: {
        resource: 'mana',
        amount: manaPerTick
      }
    });
  }
  
  // Volcanic energy production (same as before)
  if (state.realms.unlocked.includes('volcano')) {
    const volcanicPerTick = state.production.volcanicEnergy * this.deltaTime;
    if (volcanicPerTick > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'volcanicEnergy',
          amount: volcanicPerTick
        }
      });
    }
  }
}
  
  /**
   * Update play time statistics
   */
  updatePlayTime() {
    const deltaMs = this.deltaTime * 1000;
    
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: {
        key: 'totalPlayTime',
        amount: deltaMs
      }
    });
  }
  
  /**
   * Update statistics
   */
  updateStatistics() {
    const state = stateManager.getState();
    
    // Update highest energy/s
    if (state.production.energy > state.statistics.highestEnergyPerSecond) {
      stateManager.dispatch({
        type: 'UPDATE_STATISTIC',
        payload: {
          key: 'highestEnergyPerSecond',
          value: state.production.energy
        }
      });
    }
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(tickTime) {
    this.performance.tickTimes.push(tickTime);
    
    // Keep only last 100 ticks
    if (this.performance.tickTimes.length > 100) {
      this.performance.tickTimes.shift();
    }
    
    // Calculate average
    this.performance.averageTickTime = 
      this.performance.tickTimes.reduce((a, b) => a + b, 0) / 
      this.performance.tickTimes.length;
    
    // Track max
    if (tickTime > this.performance.maxTickTime) {
      this.performance.maxTickTime = tickTime;
    }
    
    // Warn if tick is slow
    if (tickTime > CONFIG.TICK_RATE * 0.8) {
      logger.warn('TickManager', `Slow tick: ${tickTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Calculate offline progress
   */
  calculateOfflineProgress(lastPlayed) {
  const now = Date.now();
  const timeDiff = now - lastPlayed;
  
  if (timeDiff < 60000) {
    return null;
  }
  
  const cappedTimeDiff = Math.min(timeDiff, CONFIG.BALANCING.OFFLINE_TIME_CAP);
  const state = stateManager.getState();
  
  // ===== FIX: Use upgrade effect directly =====
  const upgradeSystem = require('../systems/UpgradeSystem.js'). default;
  const offlinePercent = upgradeSystem.getLevel('offlineProduction') > 0
    ? upgradeSystem.getEffect('offlineProduction') // Returns 10, 20, 30...100
    : CONFIG.BALANCING.OFFLINE_PRODUCTION_BASE * 100; // 50%
  
  const offlineMultiplier = offlinePercent / 100; // Convert to decimal
  // ===== END FIX =====
  
  const secondsOffline = cappedTimeDiff / 1000;
  
  const energyEarned = Math.floor(
    state.production.energy * secondsOffline * offlineMultiplier
  );
  
  const manaEarned = Math.floor(
    state.production.mana * secondsOffline * offlineMultiplier
  );
  
  const volcanicEarned = state.realms.unlocked.includes('volcano')
    ? Math. floor(state.production.volcanicEnergy * secondsOffline * offlineMultiplier)
    : 0;
  
  logger.info('TickManager', 'Offline progress calculated', {
    timeOffline: cappedTimeDiff,
    offlinePercent: offlinePercent,
    energyEarned,
    manaEarned,
    volcanicEarned
  });
  
  return {
    timeOffline: cappedTimeDiff,
    resources: {
      energy: energyEarned,
      mana: manaEarned,
      volcanicEnergy: volcanicEarned
    },
    wasCapped: timeDiff > CONFIG.BALANCING.OFFLINE_TIME_CAP
  };
}
  
  /**
   * Apply offline progress
   */
  applyOfflineProgress(offlineData) {
    if (!offlineData) return;
    
    const { resources } = offlineData;
    
    if (resources.energy > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'energy', amount: resources.energy }
      });
      
      stateManager.dispatch({
        type: 'UPDATE_LIFETIME_ENERGY',
        payload: { amount: resources.energy }
      });
    }
    
    if (resources.mana > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'mana', amount: resources.mana }
      });
    }
    
    if (resources.volcanicEnergy > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'volcanicEnergy', amount: resources.volcanicEnergy }
      });
    }
    
    eventBus.emit('game:offline-progress', offlineData);
  }
  
  /**
   * Get performance stats
   */
  getPerformanceStats() {
    return {
      ...this.performance,
      tickCount: this.tickCount,
      isRunning: this.isRunning,
      currentFPS: this.performance.averageTickTime > 0 
        ? 1000 / this.performance.averageTickTime 
        : 0
    };
  }
  
  /**
   * Reset performance tracking
   */
  resetPerformance() {
    this.performance = {
      averageTickTime: 0,
      maxTickTime: 0,
      tickTimes: []
    };
  }
}

// Singleton
const tickManager = new TickManager();

export default tickManager;