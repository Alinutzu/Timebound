/**
 * DailyRewardSystem - Daily login rewards with streak tracking
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class DailyRewardSystem {
  constructor() {
    this.rewards = this.getRewardStructure();
    
    this.checkDailyReward();
    
    logger.info('DailyRewardSystem', 'Initialized');
  }
  
  /**
   * Get 7-day reward structure
   */
  getRewardStructure() {
    return [
      {
        day: 1,
        rewards: {
          gems: 25,
          energy: 1000
        },
        emoji: '🎁'
      },
      {
        day: 2,
        rewards: {
          gems: 50,
          energy: 2500,
          mana: 50
        },
        emoji: '🎁'
      },
      {
        day: 3,
        rewards: {
          gems: 75,
          energy: 5000,
          mana: 100
        },
        emoji: '🎁'
      },
      {
        day: 4,
        rewards: {
          gems: 100,
          energy: 10000,
          mana: 200,
          crystals: 1
        },
        emoji: '🎁'
      },
      {
        day: 5,
        rewards: {
          gems: 150,
          energy: 20000,
          mana: 500,
          crystals: 3
        },
        emoji: '🎁'
      },
      {
        day: 6,
        rewards: {
          gems: 200,
          energy: 50000,
          mana: 1000,
          crystals: 5
        },
        emoji: '🎁'
      },
      {
        day: 7,
        rewards: {
          gems: 500,
          energy: 100000,
          mana: 5000,
          crystals: 20,
          guardian: 1 // Random guardian
        },
        emoji: '🏆',
        special: true
      }
    ];
  }
  
  /**
   * Check if can claim daily reward
   */
  canClaim() {
    const state = stateManager.getState();
    const now = Date.now();
    const lastClaim = state.dailyRewards.lastClaim;
    
    if (!lastClaim) {
      return { can: true, reason: 'first-time' };
    }
    
    const timeSince = now - lastClaim;
    const oneDay = 86400000; // 24h in ms
    const twoDays = 172800000; // 48h in ms
    
    // Already claimed today
    if (timeSince < oneDay) {
      return {
        can: false,
        reason: 'already-claimed',
        nextClaimIn: oneDay - timeSince
      };
    }
    
    // Missed a day - streak broken
    if (timeSince > twoDays) {
      return {
        can: true,
        reason: 'streak-broken',
        streakReset: true
      };
    }
    
    // Can claim next day
    return { can: true, reason: 'next-day' };
  }
  
  /**
   * Claim daily reward
   */
  claim() {
    const canClaimResult = this.canClaim();
    
    if (!canClaimResult.can) {
      logger.warn('DailyRewardSystem', 'Cannot claim:', canClaimResult.reason);
      eventBus.emit('daily-reward:claim-failed', canClaimResult);
      return false;
    }
    
    const state = stateManager.getState();
    let streak = state.dailyRewards.streak;
    
    // Reset streak if broken
    if (canClaimResult.streakReset) {
      streak = 0;
    }
    
    // Increment streak
    streak++;
    
    // Cap at 7 days
    if (streak > 7) {
      streak = 1; // Start new cycle
    }
    
    // Get reward for current day
    const dayReward = this.rewards[streak - 1];
    
    // Give rewards
    for (let [resource, amount] of Object.entries(dayReward.rewards)) {
      if (resource === 'guardian') {
        // Summon random guardian
        const guardianSystem = require('./GuardianSystem.js').default;
        for (let i = 0; i < amount; i++) {
          guardianSystem.summon();
        }
      } else {
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
    }
    
    // Update state
    stateManager.dispatch({
      type: 'CLAIM_DAILY_REWARD',
      payload: {
        streak,
        lastClaim: Date.now(),
        day: streak
      }
    });
    
    logger.info('DailyRewardSystem', `Claimed day ${streak} reward`, dayReward.rewards);
    
    eventBus.emit('daily-reward:claimed', {
      day: streak,
      rewards: dayReward.rewards,
      isSpecial: dayReward.special
    });
    
    // Show notification
    this.showClaimNotification(streak, dayReward);
    
    return true;
  }
  
  /**
   * Show claim notification
   */
  showClaimNotification(day, reward) {
    const rewardText = this.formatRewards(reward.rewards);
    
    eventBus.emit('notification:show', {
      type: 'daily-reward',
      title: reward.special ? '🏆 7-Day Streak!' : `${reward.emoji} Day ${day} Reward`,
      message: rewardText,
      duration: 7000
    });
  }
  
  /**
   * Format rewards for display
   */
  formatRewards(rewards) {
    const parts = [];
    
    for (let [resource, amount] of Object.entries(rewards)) {
      if (resource === 'guardian') {
        parts.push(`${amount} Guardian${amount > 1 ? 's' : ''}`);
      } else {
        const icons = {
          gems: '💎',
          energy: '⚡',
          mana: '✨',
          crystals: '💠'
        };
        parts.push(`${amount} ${icons[resource] || resource}`);
      }
    }
    
    return parts.join(', ');
  }
  
  /**
 * Check daily reward on game start
 */
checkDailyReward() {
  const state = stateManager.getState();
  const canClaimResult = this.canClaim();
  const now = Date.now();

  // ✅ PRIORITATE 1: Dacă ai claimed deja azi, STOP!
  if (canClaimResult.reason === 'already-claimed') {
    logger.info('DailyRewardSystem', 'Reward already claimed today, no modal');
    return;
  }

  // ✅ PRIORITATE 2: Verifică dacă modalul a fost deja arătat azi
  const lastModalShown = state.dailyRewards.lastModalShown || 0;
  const timeSinceModal = now - lastModalShown;
  const oneDay = 86400000; // 24h in ms

  // Dacă ai văzut modalul în ultimele 24h (chiar dacă n-ai claimed), nu-l mai arăta
  if (timeSinceModal < oneDay) {
    logger. info('DailyRewardSystem', `Modal already shown ${Math.floor(timeSinceModal/1000/60)} minutes ago - not showing again`);
    return;
  }

  // ✅ PRIORITATE 3: Poți revendica și modalul n-a fost arătat azi = SHOW MODAL!
  if (canClaimResult.can) {
    // Marchează că ai arătat modalul ACUM
    stateManager.dispatch({
      type: 'DAILY_REWARD_MODAL_SHOWN',
      payload: { timestamp: now }
    });

    logger.info('DailyRewardSystem', 'Showing daily reward modal');

    setTimeout(() => {
      eventBus.emit('daily-reward:available');
    }, 2000); // Delay to let game load
  }
}
  
  /**
   * Get current streak
   */
  getStreak() {
    const state = stateManager.getState();
    return state.dailyRewards.streak || 0;
  }
  
  /**
   * Get next reward preview
   */
  getNextReward() {
    const state = stateManager.getState();
    const currentStreak = state.dailyRewards.streak || 0;
    const nextDay = currentStreak >= 7 ? 1 : currentStreak + 1;
    
    return this.rewards[nextDay - 1];
  }
  
  /**
   * Get all rewards (for UI display)
   */
  getAllRewards() {
    const state = stateManager.getState();
    const currentStreak = state.dailyRewards.streak || 0;
    
    return this.rewards.map((reward, index) => {
      const day = index + 1;
      return {
        ...reward,
        claimed: day <= currentStreak,
        current: day === currentStreak,
        next: day === currentStreak + 1
      };
    });
  }
  
  /**
   * Get stats
   */
  getStats() {
    const state = stateManager.getState();
    const canClaimResult = this.canClaim();
    
    return {
      streak: state.dailyRewards.streak || 0,
      lastClaim: state.dailyRewards.lastClaim,
      canClaim: canClaimResult.can,
      nextClaimIn: canClaimResult.nextClaimIn || 0,
      totalClaimed: state.dailyRewards.claimed?.length || 0
    };
  }
}

// Singleton
const dailyRewardSystem = new DailyRewardSystem();


export default dailyRewardSystem;
