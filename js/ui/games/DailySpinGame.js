/**
 * DailySpinGame - Wheel of Fortune mini-game
 * Resets daily at midnight (00:00)
 */

import stateManager from '../../core/StateManager.js';
import eventBus from '../../utils/EventBus.js';
import logger from '../../utils/Logger.js';
import resourceApi from '../../api/ResourceAPI.js';

class DailySpinGame {
    constructor() {
    this.spinning = false;
    this.currentRotation = 0; // ✅ CRUCIAL: Ține minte rotația ca să nu sară
    
    // ✅ SEGMENTE CORECTE: ID-urile trebuie să fie 0, 1, 2... 7 (nu 1-8)
    this.segments = [
      { id: 0, label: '50💎',      reward: { gems: 20 },      color: '#8B5CF6', weight: 20 },
      { id: 1, label: '5K⚡',      reward: { energy: 5000 },  color: '#3B82F6', weight: 25 },
      { id: 2, label: '100💎',     reward: { gems: 40 },     color: '#8B5CF6', weight: 15 },
      { id: 3, label: '5💠',       reward: { crystals: 5 },   color: '#10B981', weight: 10 },
      { id: 4, label: '200💎',     reward: { gems: 80 },     color: '#8B5CF6', weight: 10 },
      { id: 5, label: '10K⚡',     reward: { energy: 10000 }, color: '#3B82F6', weight: 12 },
      { id: 6, label: '🛡️Guardian',reward: { guardian: 1 },   color: '#F59E0B', weight: 5 },
      { id: 7, label: '500💎',     reward: { gems: 200 },     color: '#8B5CF6', weight: 3 }
    ];
    
    this.segmentAngle = 360 / this.segments.length;
  }
  
  /**
   * Get time until midnight reset
   */
  getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    return midnight.getTime() - now.getTime();
  }
  
  /**
   * Get today's date string for comparison
   */
  getTodayDateString() {
    return new Date().toDateString(); // "Sat Nov 09 2025"
  }
  
  /**
   * Check if player can spin (FREE - resets at midnight)
   */
  canSpin() {
    const state = stateManager.getState();
    const lastSpinDate = state.miniGames?.dailySpin?.lastSpinDate || '';
    const today = this.getTodayDateString();
    
    // Check if already spun today (FREE spin)
    const hasSpunToday = lastSpinDate === today;
    
    // Check purchased spins
    const purchasedSpins = state.miniGames?.dailySpin?.purchasedSpins || 0;
    
    if (!hasSpunToday) {
      // Free spin available
      return { 
        can: true, 
        type: 'free',
        nextFreeIn: 0,
        purchasedSpins: purchasedSpins
      };
    }
    
    if (purchasedSpins > 0) {
      // Has purchased spins
      return {
        can: true,
        type: 'purchased',
        spinsRemaining: purchasedSpins,
        nextFreeIn: this.getTimeUntilMidnight()
      };
    }
    
    // No spins available
    return { 
      can: false, 
      type: 'none',
      nextFreeIn: this.getTimeUntilMidnight(),
      reason: 'already_spun_today'
    };
  }
  
  /**
   * Use a spin (free or purchased)
   */
  useSpin() {
    const canSpinResult = this.canSpin();
    
    if (!canSpinResult.can) {
      return null;
    }
    
    if (canSpinResult.type === 'free') {
      // Mark today as spun
      stateManager.dispatch({
        type: 'UPDATE_MINI_GAME',
        payload: {
          game: 'dailySpin',
          data: { 
            lastSpinDate: this.getTodayDateString(),
            lastSpin: Date.now()
          }
        }
      });
      
      logger.info('DailySpinGame', 'Used FREE spin');
    } else if (canSpinResult.type === 'purchased') {
      // Consume purchased spin
      stateManager.dispatch({
        type: 'DECREMENT_PURCHASED_SPINS',
        payload: { game: 'dailySpin' }
      });
      
      logger.info('DailySpinGame', 'Used PURCHASED spin', { remaining: canSpinResult.spinsRemaining - 1 });
    }
    
    return this.spin();
  }
  
  /**
   * Spin the wheel (internal logic)
   */
    spin() {
    // 1. Alegem segmentul random (folosind funcția ta existentă)
    const selectedSegment = this.selectRandomSegment();
    
    // 2. Calculăm unde este segmentul fizic (ex: ID 1 e la 45 grade)
    const segmentPos = selectedSegment.id * this.segmentAngle;
    
    // 3. Calculăm cât trebuie rotit INVERS ca să ajungă la 0 (sus)
    const targetBase = (360 - segmentPos) % 360;
    
    // 4. Calculăm distanța față de unde a rămas roata ultima dată (currentRotation)
    const currentMod = this.currentRotation % 360;
    let distance = targetBase - currentMod;
    
    // Mergem doar înainte (sensul ceasului)
    if (distance < 0) {
      distance += 360;
    }
    
    // 5. Adăugăm 5 ture complete pentru suspans
    const spins = 5 * 360;
    
    // 6. Actualizăm memoria rotației totale
    this.currentRotation += spins + distance;
    
    logger.info('DailySpinGame', 'Spin calculated', { 
      target: selectedSegment.label, 
      rotation: this.currentRotation 
    });
    
    return {
      segment: selectedSegment,
      rotation: this.currentRotation,
      duration: 4000
    };
  }
  
  /**
   * Select random segment based on weights
   */
  selectRandomSegment() {
    const totalWeight = this.segments.reduce((sum, seg) => sum + seg.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let segment of this.segments) {
      random -= segment.weight;
      if (random <= 0) {
        return segment;
      }
    }
    
    return this.segments[0]; // Fallback
  }
  
  /**
   * Grant reward after spin completes
   */
  grantReward(segment) {
    const reward = segment.reward;
    
    // Grant rewards via ResourceAPI
    for (let [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        eventBus.emit('guardian:summon', { 
          amount,
          source: 'daily-spin',
          guaranteed: true
        });
      } else {
        resourceApi.add(resource, amount);
      }
    }
    
    // Track stats
    stateManager.dispatch({
      type: 'INCREMENT_MINI_GAME_STAT',
      payload: {
        game: 'dailySpin',
        stat: 'totalSpins'
      }
    });
    
    logger.info('DailySpinGame', 'Reward granted', reward);

    // Track rewards for achievements
const gemAmount = reward.gems || 0;
const hasGuardian = reward.guardian ? true : false;

stateManager.dispatch({
  type: 'TRACK_SPIN_REWARD',
  payload: {
    gemAmount,
    hasGuardian
  }
});
    
    eventBus.emit('daily-spin:reward-granted', { reward, segment });
    
    // Show notification
    this.showRewardNotification(reward);
    
    return reward;
  }
  
  /**
   * Show reward notification
   */
  showRewardNotification(reward) {
    const parts = [];
    
    for (let [resource, amount] of Object.entries(reward)) {
      const icons = {
        gems: '💎',
        energy: '⚡',
        crystals: '💠',
        guardian: '🛡️'
      };
      
      if (resource === 'guardian') {
        parts.push('Guardian!');
      } else {
        parts.push(`${amount} ${icons[resource]}`);
      }
    }
    
    eventBus.emit('notification:show', {
      type: 'reward',
      title: '🎡 Spin Reward!',
      message: parts.join(', '),
      duration: 5000
    });
  }
  
  /**
   * Add purchased spins (called from shop)
   */
  addPurchasedSpins(count) {
    stateManager.dispatch({
      type: 'ADD_PURCHASED_SPINS',
      payload: { 
        game: 'dailySpin',
        count: count
      }
    });
    
    logger.info('DailySpinGame', `Added ${count} purchased spins`);
    
    eventBus.emit('notification:show', {
      type: 'purchase',
      title: 'Spins Added!',
      message: `+${count} Extra Spins! 🎡`,
      duration: 3000
    });
  }
  
  /**
   * Get stats
   */
  getStats() {
    const state = stateManager.getState();
    const spinData = state.miniGames?.dailySpin || {};
    
    return {
      lastSpinDate: spinData.lastSpinDate || '',
      lastSpin: spinData.lastSpin || 0,
      totalSpins: spinData.totalSpins || 0,
      purchasedSpins: spinData.purchasedSpins || 0,
      canSpin: this.canSpin()
    };
  }
  
  /**
   * Format time remaining (for display)
   */
  formatTimeRemaining(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export default new DailySpinGame();