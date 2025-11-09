/**
 * AchievementsUI - Manages achievements tab display
 */

import achievementSystem from '../systems/AchievementSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import miniGameStatsUI from './MiniGameStatsUI.js';
import ACHIEVEMENTS from '../data/achievements.js';

class AchievementsUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentCategory = 'all';
    this.currentMainTab = 'general'; // 'general' or 'mini-games'
    
    if (!this.container) {
      console.error(`AchievementsUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('achievement:unlocked', () => this.render());
    eventBus.on('achievement:claimed', () => this.render());
    eventBus.on('mini-game-achievement:unlocked', () => this.render());
  }
  
  render() {
    if (!this.container) {
      console.error('AchievementsUI: Container not found!');
      return;
    }
    
    // Clear și rebuild complet
    this.container.innerHTML = `
      <div class="achievements-wrapper">
        <!-- Main Tabs: General vs Mini-Games -->
        <div class="achievements-main-tabs">
          <button class="achievement-main-tab ${this.currentMainTab === 'general' ? 'active' : ''}" data-main-tab="general">
            🏆 General Achievements
          </button>
          <button class="achievement-main-tab ${this.currentMainTab === 'mini-games' ? 'active' : ''}" data-main-tab="mini-games">
            🎮 Mini-Game Achievements
          </button>
        </div>
        
        <!-- Content Area -->
        <div class="achievements-content-area">
          ${this.currentMainTab === 'general' ? this.renderGeneralAchievements() : this.renderMiniGameSection()}
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  renderGeneralAchievements() {
    // Filtrează achievements după categorie
    const achievements = this.currentCategory === 'all' 
      ? ACHIEVEMENTS
      : Object.fromEntries(
          Object.entries(ACHIEVEMENTS).filter(([key, ach]) => ach.category === this.currentCategory)
        );
    
    if (!achievements || Object.keys(achievements).length === 0) {
      return `
        <div class="empty-state">
          <p>No achievements in this category</p>
        </div>
      `;
    }
    
    // Sort: unlocked first, then by tier
    const sorted = Object.entries(achievements).sort(([keyA, achA], [keyB, achB]) => {
      const stateA = achievementSystem.getAchievementState(keyA);
      const stateB = achievementSystem.getAchievementState(keyB);
      
      if (stateA?.unlocked && !stateB?.unlocked) return -1;
      if (!stateA?.unlocked && stateB?.unlocked) return 1;
      
      const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
      return (tierOrder[achB.tier] || 0) - (tierOrder[achA.tier] || 0);
    });
    
    return `
      <!-- Category Filters -->
      <div class="category-filters">
        <button class="category-btn ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
          All
        </button>
        <button class="category-btn ${this.currentCategory === 'tutorial' ? 'active' : ''}" data-category="tutorial">
          Tutorial
        </button>
        <button class="category-btn ${this.currentCategory === 'production' ? 'active' : ''}" data-category="production">
          Production
        </button>
        <button class="category-btn ${this.currentCategory === 'structures' ? 'active' : ''}" data-category="structures">
          Structures
        </button>
        <button class="category-btn ${this.currentCategory === 'upgrades' ? 'active' : ''}" data-category="upgrades">
          Upgrades
        </button>
        <button class="category-btn ${this.currentCategory === 'guardians' ? 'active' : ''}" data-category="guardians">
          Guardians
        </button>
        <button class="category-btn ${this.currentCategory === 'quests' ? 'active' : ''}" data-category="quests">
          Quests
        </button>
        <button class="category-btn ${this.currentCategory === 'bosses' ? 'active' : ''}" data-category="bosses">
          Bosses
        </button>
        <button class="category-btn ${this.currentCategory === 'special' ? 'active' : ''}" data-category="special">
          Special
        </button>
      </div>
      
      <!-- Achievements Grid -->
      <div class="achievements-grid">
        ${sorted.map(([key, achievement]) => this.renderAchievementCardHTML(key, achievement)).join('')}
      </div>
    `;
  }
  
  renderMiniGameSection() {
    return `
      <div class="mini-game-tabs">
        <button class="mini-game-tab active" data-game="dailySpin">
          🎰 Daily Spin
        </button>
        <button class="mini-game-tab" data-game="game2048">
          🎮 2048
        </button>
        <button class="mini-game-tab" data-game="match3">
          🧩 Match-3
        </button>
      </div>
      <div class="mini-game-tab-content" id="mini-game-achievements-content"></div>
    `;
  }
  
  renderAchievementCardHTML(key, achievement) {
    const state = stateManager.getState();
    const isUnlocked = state.achievements?.unlocked?.includes(key);
    const isClaimed = state.achievements?.claimed?.includes(key);
    
    let cardClass = 'achievement-card';
    if (!isUnlocked) cardClass += ' locked';
    if (isUnlocked && !isClaimed) cardClass += ' unlocked';
    if (isClaimed) cardClass += ' claimed';
    
    // Format rewards
    const rewardParts = [];
    if (achievement.reward.gems) rewardParts.push(`${achievement.reward.gems} 💎`);
    if (achievement.reward.crystals) rewardParts.push(`${achievement.reward.crystals} 💠`);
    if (achievement.reward.energy) rewardParts.push(`${achievement.reward.energy} ⚡`);
    if (achievement.reward.timeShards) rewardParts.push(`${achievement.reward.timeShards} ⏰`);
    
    return `
      <div class="${cardClass}" data-key="${key}">
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
        
        ${isUnlocked && !isClaimed ? `
          <button class="btn btn-success" onclick="claimAchievement('${key}')">
            ✅ Claim Reward
          </button>
        ` : isClaimed ? `
          <div class="achievement-claimed">
            ✓ Claimed
          </div>
        ` : `
          <div class="achievement-locked">
            🔒 Locked
          </div>
        `}
      </div>
    `;
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
  
  bindEvents() {
    // Main tabs (General vs Mini-Games)
    const mainTabs = this.container.querySelectorAll('.achievement-main-tab');
    mainTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentMainTab = tab.dataset.mainTab;
        this.render();
      });
    });
    
    // Category filters (pentru General tab)
    const categoryBtns = this.container.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.category;
        this.render();
      });
    });
    
    // Mini-game tabs
    const miniGameTabs = this.container.querySelectorAll('.mini-game-tab');
    miniGameTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        miniGameTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const gameType = tab.dataset.game;
        const content = document.getElementById('mini-game-achievements-content');
        if (content) {
          miniGameStatsUI.renderMiniGameAchievements(content, gameType);
        }
      });
    });
    
    // Render initial mini-game content
    if (this.currentMainTab === 'mini-games') {
      setTimeout(() => {
        const content = document.getElementById('mini-game-achievements-content');
        if (content) {
          miniGameStatsUI.renderMiniGameAchievements(content, 'dailySpin');
        }
      }, 100);
    }
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