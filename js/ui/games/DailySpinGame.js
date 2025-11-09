/**
 * DailySpinGame - Wheel of Fortune mini-game
 * Resets daily at midnight (00:00)
 */

import stateManager from '../../core/StateManager.js';
import eventBus from '../../utils/EventBus.js';
import logger from '../../utils/Logger.js';

class DailySpinGame {
  constructor() {
    this.spinning = false;
    this.rotation = 0;
    
    // Wheel segments (8 segments)
    this.segments = [
      { id: 1, reward: { gems: 50 }, label: '50💎', color: '#8B5CF6', weight: 20 },
      { id: 2, reward: { energy: 5000 }, label: '5K⚡', color: '#3B82F6', weight: 25 },
      { id: 3, reward: { gems: 100 }, label: '100💎', color: '#8B5CF6', weight: 15 },
      { id: 4, reward: { crystals: 5 }, label: '5💠', color: '#10B981', weight: 10 },
      { id: 5, reward: { gems: 200 }, label: '200💎', color: '#8B5CF6', weight: 10 },
      { id: 6, reward: { energy: 10000 }, label: '10K⚡', color: '#3B82F6', weight: 12 },
      { id: 7, reward: { guardian: 1 }, label: '🛡️Guardian', color: '#F59E0B', weight: 5 },
      { id: 8, reward: { gems: 500 }, label: '500💎', color: '#8B5CF6', weight: 3 }
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
    // Select random reward based on weights
    const selectedSegment = this.selectRandomSegment();
    
    // Calculate final rotation
    const spins = 5; // Full rotations
    const targetAngle = this.segmentAngle * (selectedSegment.id - 1) + (this.segmentAngle / 2);
    const finalRotation = 360 * spins + targetAngle + Math.random() * 20 - 10;
    
    logger.info('DailySpinGame', 'Spinning wheel', { 
      segment: selectedSegment.id,
      reward: selectedSegment.reward,
      rotation: finalRotation
    });
    
    return {
      segment: selectedSegment,
      rotation: finalRotation,
      duration: 4000 // 4 seconds animation
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
    
    // Add rewards
    for (let [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        // Trigger guardian summon
        eventBus.emit('guardian:summon', { 
          amount,
          source: 'daily-spin',
          guaranteed: true
        });
      } else {
        stateManager.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resource, amount }
        });
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