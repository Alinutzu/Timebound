/**
 * TickManager - Game loop and time management
 */

import CONFIG from '../config.js';
import stateManager from './StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceManager from './ResourceManager.js';
import realmSystem from '../systems/RealmSystem.js';
import upgradeSystem from '../systems/UpgradeSystem.js';
import guardianSystem from '../systems/GuardianSystem.js';

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

  const criticalChance = upgradeSystem.getCriticalChance();
  const isCritical = Math.random() < criticalChance;
  const criticalMultiplier = isCritical ? 2 : 1;
  
  // Get cosmic allProduction bonus (affects ALL resource types)
  const cosmicBonus = state.realms.unlocked.includes('cosmos')
    ? (realmSystem.getRealm('cosmos')?.bonuses?.allProduction || 1.0)
    : 1.0;

  // Energy production
  let energyPerTick = state.production.energy * this.deltaTime * cosmicBonus;
  
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
  
  // Mana production
  const manaPerTick = state.production.mana * this.deltaTime * cosmicBonus;
  if (manaPerTick > 0) {
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: {
        resource: 'mana',
        amount: manaPerTick
      }
    });
  }
  
  // Volcanic energy production
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

  // Tidal energy production
  if (state.realms.unlocked.includes('ocean')) {
    const tidalPerTick = state.production.tidalEnergy * this.deltaTime;
    if (tidalPerTick > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'tidalEnergy',
          amount: tidalPerTick
        }
      });
    }
  }

  // Solar essence production
  if (state.realms.unlocked.includes('desert')) {
    const solarPerTick = state.production.solarEssence * this.deltaTime;
    if (solarPerTick > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'solarEssence',
          amount: solarPerTick
        }
      });
    }
  }

  // Cryo energy production
  if (state.realms.unlocked.includes('tundra')) {
    const cryoPerTick = state.production.cryoEnergy * this.deltaTime;
    if (cryoPerTick > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'cryoEnergy',
          amount: cryoPerTick
        }
      });
    }
  }

  // Cosmic energy production
  if (state.realms.unlocked.includes('cosmos')) {
    const cosmicPerTick = state.production.cosmicEnergy * this.deltaTime;
    if (cosmicPerTick > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'cosmicEnergy',
          amount: cosmicPerTick
        }
      });
    }
  }

  // Gems production
  if (state.production.gems && state.production.gems > 0) {
    const gemBonus = guardianSystem.getSpecialBonuses().gemBonus;
    let gemsPerTick = state.production.gems * this.deltaTime * (1 + gemBonus);
    if (gemsPerTick > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: {
          resource: 'gems',
          amount: gemsPerTick
        }
      });
    }
  }

  // Pearl generation (Ocean realm passive chance)
  if (state.realms.unlocked.includes('ocean')) {
    let pearlChance = realmSystem.getRealm('ocean')?.bonuses?.pearlDropChance || 0.06;
    const pearlHarvestEffect = upgradeSystem.getEffect('pearlHarvest');
    if (pearlHarvestEffect && pearlHarvestEffect.pearlDropBonus) {
      pearlChance += pearlHarvestEffect.pearlDropBonus;
    }
    // Guardian chance bonuses (e.g. coralWarden)
    pearlChance += guardianSystem.getChanceBonus('coralBattery');
    if (Math.random() < pearlChance * this.deltaTime) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'pearls', amount: 1 }
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
  
  const offlinePercent = upgradeSystem.getLevel('offlineProduction') > 0
    ? upgradeSystem.getEffect('offlineProduction')
    : CONFIG.BALANCING.OFFLINE_PRODUCTION_BASE * 100;
  
  const guardianOfflineBonus = guardianSystem.getSpecialBonuses().offlineBonus;
  const offlineMultiplier = (offlinePercent / 100) * (1 + guardianOfflineBonus);
  
  const secondsOffline = cappedTimeDiff / 1000;
  
  const energyEarned = Math.floor(
    state.production.energy * secondsOffline * offlineMultiplier
  );
  
  const manaEarned = Math.floor(
    state.production.mana * secondsOffline * offlineMultiplier
  );
  
  const volcanicEarned = state.realms.unlocked.includes('volcano')
    ? Math.floor(state.production.volcanicEnergy * secondsOffline * offlineMultiplier)
    : 0;

  const tidalEarned = state.realms.unlocked.includes('ocean')
    ? Math.floor(state.production.tidalEnergy * secondsOffline * offlineMultiplier)
    : 0;

  const solarEssenceEarned = state.realms.unlocked.includes('desert')
    ? Math.floor(state.production.solarEssence * secondsOffline * offlineMultiplier)
    : 0;

  const cryoEnergyEarned = state.realms.unlocked.includes('tundra')
    ? Math.floor(state.production.cryoEnergy * secondsOffline * offlineMultiplier)
    : 0;

  const cosmicEnergyEarned = state.realms.unlocked.includes('cosmos')
    ? Math.floor(state.production.cosmicEnergy * secondsOffline * offlineMultiplier)
    : 0;

  const gemsEarned = state.production.gems > 0
    ? Math.floor(state.production.gems * secondsOffline * offlineMultiplier)
    : 0;
  
  logger.info('TickManager', 'Offline progress calculated', {
    timeOffline: cappedTimeDiff,
    offlinePercent: offlinePercent,
    energyEarned,
    manaEarned,
    volcanicEarned,
    tidalEarned,
    solarEssenceEarned,
    cryoEnergyEarned,
    cosmicEnergyEarned,
    gemsEarned
  });
  
  return {
    timeOffline: cappedTimeDiff,
    resources: {
      energy: energyEarned,
      mana: manaEarned,
      volcanicEnergy: volcanicEarned,
      tidalEnergy: tidalEarned,
      solarEssence: solarEssenceEarned,
      cryoEnergy: cryoEnergyEarned,
      cosmicEnergy: cosmicEnergyEarned,
      gems: gemsEarned
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

    if (resources.tidalEnergy > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'tidalEnergy', amount: resources.tidalEnergy }
      });
    }

    if (resources.solarEssence > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'solarEssence', amount: resources.solarEssence }
      });
    }

    if (resources.cryoEnergy > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'cryoEnergy', amount: resources.cryoEnergy }
      });
    }

    if (resources.cosmicEnergy > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'cosmicEnergy', amount: resources.cosmicEnergy }
      });
    }

    if (resources.gems > 0) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource: 'gems', amount: resources.gems }
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