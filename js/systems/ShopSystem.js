/**
 * ShopSystem - Handles shop purchases, VIP, ads
 */

import SHOP_ITEMS from '../data/shop.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class ShopSystem {
  constructor() {
    this.items = SHOP_ITEMS;
    this.maxAdsPerDay = 20;
    
    this.initializeState();
    this.checkDailyDeal();
    this.checkVIPExpiry();
    
    logger.info('ShopSystem', 'Initialized');
  }
  
  /**
   * Initialize shop state
   */
  initializeState() {
    const state = stateManager.getState();
    
    if (!state.shop) {
      // Initialize in StateManager getInitialState
    }
  }
  
  /**
   * Purchase gem package (mock)
   */
  purchasePackage(packageId) {
    const pkg = this.items.gemPackages[packageId];
    
    if (!pkg) {
      logger.error('ShopSystem', `Package ${packageId} not found`);
      return false;
    }
    
    // In real implementation, this would trigger IAP
    logger.info('ShopSystem', `Initiating purchase: ${pkg.name} (${pkg.priceDisplay})`);
    
    eventBus.emit('shop:purchase-initiated', { packageId, pkg });
    
    // For demo, complete immediately
    this.completePurchase(packageId);
    
    return true;
  }
  
  /**
   * Complete purchase (called after payment)
   */
  completePurchase(packageId) {
    const pkg = this.items.gemPackages[packageId];
    
    if (!pkg) {
      logger.error('ShopSystem', `Package ${packageId} not found`);
      return false;
    }
    
    // Give gems
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: { resource: 'gems', amount: pkg.gems }
    });
    
    // Give bonuses
    if (pkg.bonus) {
      for (let [resource, amount] of Object.entries(pkg.bonus)) {
        if (resource === 'guardian') {
          // Summon guardians
          const guardianSystem = require('./GuardianSystem.js').default;
          for (let i = 0; i < amount; i++) {
            guardianSystem.summon();
          }
        } else if (resource === 'guaranteedLegendary') {
          // Summon legendary guardian
          this.summonGuaranteedLegendary(amount);
        } else {
          stateManager.dispatch({
            type: 'ADD_RESOURCE',
            payload: { resource, amount }
          });
        }
      }
    }
    
    // Track purchase
    stateManager.dispatch({
      type: 'RECORD_PURCHASE',
      payload: {
        packageId,
        price: pkg.price,
        gems: pkg.gems,
        timestamp: Date.now()
      }
    });
    
    logger.info('ShopSystem', `Purchase completed: ${pkg.name}`);
    
    eventBus.emit('shop:purchase-completed', { packageId, pkg });
    
    // Show success notification
    eventBus.emit('notification:show', {
      type: 'purchase',
      title: 'Purchase Complete!',
      message: `${pkg.gems} 💎 gems added!`,
      duration: 5000
    });
    
    return true;
  }

  // Adaugă după metoda completePurchase()

/**
 * Purchase spin package
 */
purchaseSpinPackage(packageId) {
  const pkg = this.items.miniGamesPackages[packageId];
  
  if (!pkg) {
    logger.error('ShopSystem', `Spin package ${packageId} not found`);
    return false;
  }
  
  // In real implementation, this would trigger IAP
  logger.info('ShopSystem', `Initiating spin purchase: ${pkg.name} (${pkg.priceDisplay})`);
  
  eventBus.emit('shop:purchase-initiated', { packageId, pkg });
  
  // For demo, complete immediately
  this.completeSpinPurchase(packageId);
  
  return true;
}

/**
 * Complete spin purchase (called after payment)
 */
completeSpinPurchase(packageId) {
  const pkg = this.items.miniGamesPackages[packageId];
  
  if (!pkg) {
    logger.error('ShopSystem', `Spin package ${packageId} not found`);
    return false;
  }
  
  if (pkg.unlimited) {
    // Grant unlimited spins for 24h
    stateManager.dispatch({
      type: 'ACTIVATE_UNLIMITED_SPINS',
      payload: {
        expiresAt: Date.now() + pkg.duration
      }
    });
    
    logger.info('ShopSystem', 'Unlimited spins activated for 24h');
  } else {
    // Add purchased spins
    const DailySpinGame = require('../ui/games/DailySpinGame.js').default;
    DailySpinGame.addPurchasedSpins(pkg.spins);
  }
  
  // Give bonuses
  if (pkg.bonus) {
    for (let [resource, amount] of Object.entries(pkg.bonus)) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource, amount }
      });
    }
  }
  
  // Track purchase
  stateManager.dispatch({
    type: 'RECORD_PURCHASE',
    payload: {
      packageId,
      price: pkg.price,
      spins: pkg.spins || 'unlimited',
      timestamp: Date.now()
    }
  });
  
  logger.info('ShopSystem', `Spin purchase completed: ${pkg.name}`);
  
  eventBus.emit('shop:purchase-completed', { packageId, pkg });
  eventBus.emit('daily-spin:purchased-spins', { spins: pkg.spins });
  
  // Show success notification
  const message = pkg.unlimited 
    ? '∞ Unlimited spins for 24h!'
    : `+${pkg.spins} 🎡 extra spins!`;
  
  eventBus.emit('notification:show', {
    type: 'purchase',
    title: 'Purchase Complete!',
    message: message,
    duration: 5000
  });
  
  return true;
}
  
  /**
   * Summon guaranteed legendary
   */
  summonGuaranteedLegendary(count) {
    const guardianPool = require('../data/guardians.js').default;
    
    // Get all legendary guardians
    const legendaryGuardians = Object.entries(guardianPool)
      .filter(([key, data]) => data.rarities.includes('legendary'));
    
    for (let i = 0; i < count; i++) {
      if (legendaryGuardians.length === 0) break;
      
      const [guardianKey, guardianData] = legendaryGuardians[
        Math.floor(Math.random() * legendaryGuardians.length)
      ];
      
      // Roll bonus in legendary range
      const rarityData = require('../data/guardians.js').RARITIES.legendary;
      const [min, max] = rarityData.bonusRange;
      const bonus = Math.floor(Math.random() * (max - min + 1)) + min;
      
      const guardian = {
        id: Date.now() + Math.random(),
        key: guardianKey,
        name: guardianData.name,
        emoji: guardianData.emoji,
        type: guardianData.type,
        rarity: 'legendary',
        bonus: bonus,
        summonedAt: Date.now(),
        special: guardianData.special || null,
        source: 'Shop Purchase'
      };
      
      stateManager.dispatch({
        type: 'ADD_GUARDIAN_DIRECT',
        payload: { guardian }
      });
      
      logger.info('ShopSystem', `Awarded legendary guardian: ${guardian.name}`);
    }
  }
  
  /**
   * Purchase VIP
   */
  purchaseVIP() {
    const vip = this.items.vip;
    
    logger.info('ShopSystem', `Initiating VIP purchase: ${vip.priceDisplay}`);
    
    eventBus.emit('shop:vip-initiated', { vip });
    
    // For demo, activate immediately
    this.activateVIP();
    
    return true;
  }
  
  /**
   * Activate VIP
   */
  activateVIP() {
    const vip = this.items.vip;
    const now = Date.now();
    const expiryTime = now + vip.duration;
    
    stateManager.dispatch({
      type: 'ACTIVATE_VIP',
      payload: {
        expiryTime,
        benefits: vip.benefits
      }
    });
    
    logger.info('ShopSystem', 'VIP activated until', new Date(expiryTime));
    
    eventBus.emit('shop:vip-activated', { expiryTime });
    
    // Show notification
    eventBus.emit('notification:show', {
      type: 'vip',
      title: 'VIP Activated!',
      message: '👑 Welcome to VIP',
      description: 'Enjoy premium benefits for 30 days!',
      duration: 7000
    });
    
    return true;
  }
  
  /**
   * Check VIP expiry
   */
  checkVIPExpiry() {
    const state = stateManager.getState();
    
    if (state.shop.vipActive && Date.now() > state.shop.vipExpiry) {
      stateManager.dispatch({
        type: 'DEACTIVATE_VIP'
      });
      
      logger.info('ShopSystem', 'VIP expired');
      
      eventBus.emit('notification:show', {
        type: 'info',
        title: 'VIP Expired',
        message: 'Your VIP membership has ended',
        duration: 5000
      });
    }
  }
  
  /**
   * Check if VIP is active
   */
  isVIPActive() {
    const state = stateManager.getState();
    return state.shop.vipActive && Date.now() < state.shop.vipExpiry;
  }
  
  /**
   * Get VIP benefits
   */
  getVIPBenefits() {
    if (!this.isVIPActive()) {
      return null;
    }
    
    return this.items.vip.benefits;
  }
  
  /**
   * Watch rewarded ad
   */
  watchAd(adType) {
    const ad = this.items.rewardedAds[adType];
    
    if (!ad) {
      logger.error('ShopSystem', `Ad type ${adType} not found`);
      return false;
    }
    
    const state = stateManager.getState();
    
    // Check daily limit
    const today = new Date().toDateString();
    const lastReset = new Date(state.shop.lastAdReset).toDateString();
    
    if (today !== lastReset) {
      // Reset daily counter
      stateManager.dispatch({
        type: 'RESET_AD_COUNTER'
      });
    }
    
    if (state.shop.adsWatchedToday >= this.maxAdsPerDay) {
      logger.warn('ShopSystem', 'Daily ad limit reached');
      eventBus.emit('shop:ad-limit-reached');
      return false;
    }
    
    // Check ad-specific limit
    const adWatchCount = state.shop.adWatchCount?.[adType] || 0;
    if (adWatchCount >= ad.dailyLimit) {
      logger.warn('ShopSystem', `Daily limit for ${adType} reached`);
      return false;
    }
    
    // Show ad (mock)
    logger.info('ShopSystem', `Showing ad: ${ad.name}`);
    
    eventBus.emit('shop:ad-started', { adType, ad });
    
    // Simulate ad duration (30 seconds)
    this.showMockAd(adType, ad);
    
    return true;
  }
  
  /**
   * Show mock ad with countdown
   */
  showMockAd(adType, ad) {
    let timeLeft = 5; // 5 seconds for demo (real would be 30)
    
    const countdown = setInterval(() => {
      timeLeft--;
      
      eventBus.emit('shop:ad-countdown', { timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(countdown);
        this.completeAd(adType, ad);
      }
    }, 1000);
  }
  
  /**
   * Complete ad watch and give reward
   */
  completeAd(adType, ad) {
    // Give reward
    for (let [resource, amount] of Object.entries(ad.reward)) {
      if (resource === 'multiplier') {
        // Apply temporary multiplier
        this.applyTemporaryMultiplier(amount, ad.reward.duration);
      } else {
        stateManager.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resource, amount }
        });
      }
    }
    
    // Track ad watch
    stateManager.dispatch({
      type: 'INCREMENT_AD_WATCH',
      payload: { adType }
    });
    
    logger.info('ShopSystem', `Ad completed: ${ad.name}`, ad.reward);
    
    eventBus.emit('shop:ad-completed', { adType, reward: ad.reward });
    
    // Show reward notification
    eventBus.emit('notification:show', {
      type: 'reward',
      title: 'Ad Reward!',
      message: this.formatAdReward(ad.reward),
      duration: 3000
    });
  }
  
  /**
   * Apply temporary multiplier
   */
  applyTemporaryMultiplier(multiplier, duration) {
    stateManager.dispatch({
      type: 'APPLY_TEMP_MULTIPLIER',
      payload: {
        multiplier,
        expiresAt: Date.now() + duration
      }
    });
    
    logger.info('ShopSystem', `Applied ${multiplier}x multiplier for ${duration / 1000}s`);
    
    // Schedule removal
    setTimeout(() => {
      stateManager.dispatch({
        type: 'REMOVE_TEMP_MULTIPLIER'
      });
      
      eventBus.emit('notification:show', {
        type: 'info',
        message: 'Multiplier expired',
        duration: 2000
      });
    }, duration);
  }
  
  /**
   * Format ad reward for display
   */
  formatAdReward(reward) {
    const parts = [];
    
    for (let [resource, amount] of Object.entries(reward)) {
      if (resource === 'multiplier') {
        parts.push(`${amount}x production boost`);
      } else {
        const icons = {
          energy: '⚡',
          gems: '💎',
          mana: '✨',
          crystals: '💠'
        };
        parts.push(`${amount} ${icons[resource] || resource}`);
      }
    }
    
    return parts.join(', ');
  }
  
  /**
   * Check and refresh daily deal
   */
  checkDailyDeal() {
    const state = stateManager.getState();
    const now = Date.now();
    
    if (!state.shop.dailyDeal || now - state.shop.dailyDeal.refreshedAt > this.items.dailyDeal.refreshTime) {
      this.refreshDailyDeal();
    }
  }
  
  /**
   * Refresh daily deal
   */
  refreshDailyDeal() {
    const deals = this.items.dailyDeal.deals;
    const randomDeal = deals[Math.floor(Math.random() * deals.length)];
    
    stateManager.dispatch({
      type: 'REFRESH_DAILY_DEAL',
      payload: {
        deal: randomDeal,
        refreshedAt: Date.now()
      }
    });
    
    logger.info('ShopSystem', `Daily deal refreshed: ${randomDeal.name}`);
    
    eventBus.emit('shop:daily-deal-refreshed', { deal: randomDeal });
  }
  
  /**
   * Get shop stats
   */
  getStats() {
    const state = stateManager.getState();
    
    return {
      totalPurchases: state.shop.purchaseHistory.length,
      totalSpent: state.shop.purchaseHistory.reduce((sum, p) => sum + p.price, 0),
      vipActive: this.isVIPActive(),
      vipExpiry: state.shop.vipExpiry,
      adsWatchedToday: state.shop.adsWatchedToday,
      adsRemaining: this.maxAdsPerDay - state.shop.adsWatchedToday
    };
  }
}

// Singleton
const shopSystem = new ShopSystem();

export default shopSystem;