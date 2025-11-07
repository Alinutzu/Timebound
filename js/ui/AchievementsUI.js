/**
 * AchievementsUI - Manages achievements tab display
 */

import achievementSystem from '../systems/AchievementSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';

class AchievementsUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentCategory = 'all';
    
    if (!this.container) {
      console.error(`AchievementsUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
    this.bindCategoryButtons();
  }
  
  subscribe() {
    eventBus.on('achievement:unlocked', () => this.render());
    eventBus.on('achievement:claimed', () => this.render());
  }
  
  bindCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        this.switchCategory(category);
        
        // Update button states
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  
  switchCategory(category) {
    this.currentCategory = category;
    this.render();
  }
  
  render() {
    this.updateProgress();
    this.renderAchievements();
    this.updateBadge();
  }
  
  updateProgress() {
    const progress = achievementSystem.getProgress();
    
    document.getElementById('achievements-unlocked').textContent = progress.unlocked;
    document.getElementById('achievements-total').textContent = progress.total;
  }
  
  renderAchievements() {
    this.container.innerHTML = '';
    
    const achievements = this.currentCategory === 'all' 
      ? achievementSystem.achievements 
      : achievementSystem.getByCategory(this.currentCategory);
    
    if (Object.keys(achievements).length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p>No achievements in this category</p>
        </div>
      `;
      return;
    }
    
    // Sort: unlocked first, then by tier
    const sorted = Object.entries(achievements).sort(([keyA, achA], [keyB, achB]) => {
      const stateA = achievementSystem.getAchievementState(keyA);
      const stateB = achievementSystem.getAchievementState(keyB);
      
      if (stateA?.unlocked && !stateB?.unlocked) return -1;
      if (!stateA?.unlocked && stateB?.unlocked) return 1;
      
      const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
      return tierOrder[achB.tier] - tierOrder[achA.tier];
    });
    
    sorted.forEach(([key, achievement]) => {
      const card = this.createAchievementCard(key, achievement);
      this.container.appendChild(card);
    });
  }
  
  createAchievementCard(key, achievement) {
    const state = achievementSystem.getAchievementState(key);
    
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.dataset.key = key;
    
    if (!state?.unlocked) card.classList.add('locked');
    if (state?.unlocked && !state?.claimed) card.classList.add('unlocked');
    if (state?.claimed) card.classList.add('claimed');
    
    // Format rewards
    const rewardParts = [];
    if (achievement.reward.gems) rewardParts.push(`${achievement.reward.gems} 💎`);
    if (achievement.reward.crystals) rewardParts.push(`${achievement.reward.crystals} 💠`);
    if (achievement.reward.energy) rewardParts.push(`${achievement.reward.energy} ⚡`);
    
    card.innerHTML = `
      <div class="achievement-tier-badge ${achievement.tier}">
        ${this.getTierIcon(achievement.tier)}
      </div>
      
      <div class="achievement-content">
        <span class="achievement-emoji">${achievement.emoji}</span>
        <div class="achievement-info">
          <h4 class="achievement-name">${achievement.name}</h4>
          <p class="achievement-description">${achievement.description}</p>
        </div>
      </div>
      
      <div class="achievement-reward">
        Reward: ${rewardParts.join(', ')}
      </div>
      
      ${state?.unlocked && !state?.claimed ? `
        <button class="btn btn-success" onclick="claimAchievement('${key}')">
          ✅ Claim Reward
        </button>
      ` : state?.claimed ? `
        <div class="achievement-claimed">
          ✓ Claimed
        </div>
      ` : `
        <div class="achievement-locked">
          🔒 Locked
        </div>
      `}
    `;
    
    return card;
  }
  
  getTierIcon(tier) {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💿',
      diamond: '💎'
    };
    return icons[tier] || '🏆';
  }
  
  updateBadge() {
    const unclaimedCount = achievementSystem.getUnclaimedCount();
    eventBus.emit('tab:badge-update', { 
      tab: 'achievements', 
      count: unclaimedCount 
    });
  }
}

// Global claim function
window.claimAchievement = (key) => {
  achievementSystem.claim(key);
};

export default AchievementsUI;