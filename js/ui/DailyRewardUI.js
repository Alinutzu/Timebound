/**
 * DailyRewardUI - Daily rewards modal
 */

import dailyRewardSystem from '../systems/DailyRewardSystem.js';
import eventBus from '../utils/EventBus.js';

class DailyRewardUI {
  constructor() {
    this.init();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('modal:shown', (data) => {
      if (data.modalId === 'daily-reward-modal') {
        this.render();
      }
    });
    
    eventBus.on('daily-reward:claimed', () => {
      this.render();
    });
    
    eventBus.on('daily-reward:available', () => {
      eventBus.emit('modal:show', { modalId: 'daily-reward-modal' });
    });
  }
  
  init() {
    // Will render when modal opens
  }
  
  render() {
    const container = document.getElementById('daily-rewards-grid');
    if (!container) return;
    
    const rewards = dailyRewardSystem.getAllRewards();
    const canClaim = dailyRewardSystem.canClaim();
    
    container.innerHTML = '';
    
    rewards.forEach(reward => {
      const item = document.createElement('div');
      item.className = 'daily-reward-item';
      
      if (reward.claimed) item.classList.add('claimed');
      if (reward.current) item.classList.add('current');
      if (reward.next && canClaim.can) item.classList.add('available');
      
      // Format rewards
      const rewardParts = [];
      if (reward.rewards.gems) rewardParts.push(`${reward.rewards.gems} 💎`);
      if (reward.rewards.energy) rewardParts.push(`${reward.rewards.energy} ⚡`);
      if (reward.rewards.mana) rewardParts.push(`${reward.rewards.mana} ✨`);
      if (reward.rewards.crystals) rewardParts.push(`${reward.rewards.crystals} 💠`);
      if (reward.rewards.guardian) rewardParts.push('Guardian');
      
      item.innerHTML = `
        <div class="daily-reward-day">Day ${reward.day}</div>
        <div class="daily-reward-emoji">${reward.emoji}</div>
        <div class="daily-reward-content">
          ${rewardParts.map(r => `<div>${r}</div>`).join('')}
        </div>
      `;
      
      // Add click handler for available reward
      if (reward.next && canClaim.can) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          dailyRewardSystem.claim();
        });
      }
      
      container.appendChild(item);
    });
  }
}

// Initialize
new DailyRewardUI();

export default DailyRewardUI;