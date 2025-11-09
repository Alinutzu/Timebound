/**
 * DailySpinGame - Wheel of Fortune mini-game
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
      { id: 7, reward: { guardian: 1 }, label: 'Guardian', color: '#F59E0B', weight: 5 },
      { id: 8, reward: { gems: 500 }, label: '500💎', color: '#8B5CF6', weight: 3 }
    ];
    
    this.segmentAngle = 360 / this.segments.length;
    this.cooldown = 86400000; // 24 hours
    this.gemSpinCost = 50;
  }
  
  canSpin() {
    const state = stateManager.getState();
    const lastSpin = state.miniGames?.dailySpin?.lastSpin || 0;
    const now = Date.now();
    const timeSinceLastSpin = now - lastSpin;
    
    if (timeSinceLastSpin >= this.cooldown) {
      return { can: true, type: 'free' };
    }
    
    if (state.resources.gems >= this.gemSpinCost) {
      return { 
        can: true, 
        type: 'paid', 
        cost: this.gemSpinCost,
        nextFreeIn: this.cooldown - timeSinceLastSpin
      };
    }
    
    return { 
      can: false, 
      nextFreeIn: this.cooldown - timeSinceLastSpin
    };
  }
  
  spin(isPaid = false) {
    const canSpinResult = this.canSpin();
    
    if (!canSpinResult.can) {
      eventBus.emit('notification:show', {
        type: 'error',
        message: 'Cannot spin yet!',
        duration: 2000
      });
      return null;
    }
    
    if (isPaid) {
      stateManager.dispatch({
        type: 'SPEND_RESOURCE',
        payload: { resource: 'gems', amount: this.gemSpinCost }
      });
      
      logger.info('DailySpinGame', 'Paid spin used', { cost: this.gemSpinCost });
    } else {
      stateManager.dispatch({
        type: 'UPDATE_MINI_GAME',
        payload: {
          game: 'dailySpin',
          data: { lastSpin: Date.now() }
        }
      });
    }
    
    const selectedSegment = this.selectRandomSegment();
    
    const spins = 5;
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
      duration: 4000
    };
  }
  
  selectRandomSegment() {
    const totalWeight = this.segments.reduce((sum, seg) => sum + seg.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let segment of this.segments) {
      random -= segment.weight;
      if (random <= 0) {
        return segment;
      }
    }
    
    return this.segments[0];
  }
  
  grantReward(segment) {
    const reward = segment.reward;
    
    for (let [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
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
    
    stateManager.dispatch({
      type: 'INCREMENT_MINI_GAME_STAT',
      payload: {
        game: 'dailySpin',
        stat: 'totalSpins'
      }
    });
    
    logger.info('DailySpinGame', 'Reward granted', reward);
    
    eventBus.emit('daily-spin:reward-granted', { reward, segment });
    
    this.showRewardNotification(reward);
    
    return reward;
  }
  
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
  
  getStats() {
    const state = stateManager.getState();
    const spinData = state.miniGames?.dailySpin || {};
    
    return {
      lastSpin: spinData.lastSpin || 0,
      totalSpins: spinData.totalSpins || 0,
      canSpin: this.canSpin()
    };
  }
}

export default new DailySpinGame();