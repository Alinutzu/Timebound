/**
 * BadgeManager - Manages notification badges across tabs (desktop + mobile)
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceApi from '../api/ResourceAPI.js';

class BadgeManager {
  constructor() {
    this.badges = {
      quests: document.getElementById('quests-badge'),
      achievements: document.getElementById('achievements-badge'),
      guardians: document.getElementById('guardians-badge')
    };
    
    this.subscribeToEvents();
    this.updateAllBadges();
    
    logger.info('BadgeManager', 'Initialized');
  }
  
  subscribeToEvents() {
    // Update on state changes
    eventBus.on('quest:completed', () => this.updateQuestsBadge());
    eventBus.on('quest:claimed', () => this.updateQuestsBadge());
    eventBus.on('achievement:unlocked', () => this.updateAchievementsBadge());
    eventBus.on('achievement:claimed', () => this.updateAchievementsBadge());
    
    // Update on game tick (for completed quests)
    eventBus.on('game:tick', () => {
      // Throttle to once per second
      if (!this.lastUpdate || Date.now() - this.lastUpdate > 1000) {
        this.updateAllBadges();
        this.lastUpdate = Date.now();
      }
    });
  }
  
  updateAllBadges() {
    this.updateQuestsBadge();
    this.updateAchievementsBadge();
    this.updateGuardiansBadge();
  }
  
  updateQuestsBadge() {
    const state = stateManager.getState();
    const completedQuests = state.quests.active.filter(q => q.completed).length;
    
    this.setBadge('quests', completedQuests);
    
    // Update more menu badge if exists
    this.updateMoreBadgeForTab('quests', completedQuests);
  }
  
  updateAchievementsBadge() {
    const state = stateManager.getState();
    let unclaimedCount = 0;
    
    // Adaptare pentru structura de array
    if (Array.isArray(state.achievements?.unlocked)) {
      const unlockedAchievements = state.achievements.unlocked || [];
      const claimedAchievements = state.achievements.claimed || [];
      
      unclaimedCount = unlockedAchievements.filter(
        key => !claimedAchievements.includes(key)
      ).length;
    } else {
      // Fallback: format nou (object-based)
      for (let achievement of Object.values(state.achievements)) {
        if (achievement.unlocked && !achievement.claimed) {
          unclaimedCount++;
        }
      }
    }
    
    this.setBadge('achievements', unclaimedCount);
    
    // Update more menu badge
    this.updateMoreBadgeForTab('achievements', unclaimedCount);
  }
  
  updateGuardiansBadge() {
    const canSummon = resourceApi.canAfford('gems', 100);
    
    // Show "!" if can summon guardian
    if (canSummon) {
      this.setBadge('guardians', '!');
    } else {
      this.hideBadge('guardians');
    }
  }
  
  setBadge(badgeKey, value) {
    const badge = this.badges[badgeKey];
    if (!badge) return;
    
    if (value && value !== 0) {
      badge.textContent = value;
      badge.style.display = 'inline-block';
      
      // Add pulse animation
      badge.classList.add('badge-pulse');
      setTimeout(() => badge.classList.remove('badge-pulse'), 300);
    } else {
      this.hideBadge(badgeKey);
    }
  }
  
  hideBadge(badgeKey) {
    const badge = this.badges[badgeKey];
    if (badge) {
      badge.style.display = 'none';
    }
  }
  
  // Update badge in more menu (for tabs hidden in More)
  updateMoreBadgeForTab(tabName, count) {
    const moreBadge = document.getElementById(`more-${tabName}-badge`);
    if (!moreBadge) return;
    
    if (count > 0) {
      moreBadge.textContent = count;
      moreBadge.style.display = 'flex';
    } else {
      moreBadge.style.display = 'none';
    }
    
    // Also update bottom nav badge for main tabs
    const bottomBadge = document.getElementById(`bottom-${tabName}-badge`);
    if (bottomBadge) {
      if (count > 0) {
        bottomBadge.textContent = count;
        bottomBadge.style.display = 'flex';
      } else {
        bottomBadge.style.display = 'none';
      }
    }
    
    // Update "More" button badge
    this.updateMoreButtonBadge();
  }
  
  // Update the "More" button badge with total count
  updateMoreButtonBadge() {
    const moreBadge = document.getElementById('bottom-more-badge');
    if (!moreBadge) return;
    
    let totalCount = 0;
    
    // Check all badges in more menu
    const moreBadges = document.querySelectorAll('.more-badge');
    moreBadges.forEach(badge => {
      if (badge.style.display !== 'none') {
        totalCount += parseInt(badge.textContent) || 0;
      }
    });
    
    if (totalCount > 0) {
      moreBadge.textContent = totalCount;
      moreBadge.style.display = 'flex';
    } else {
      moreBadge.style.display = 'none';
    }
  }
  
  // Clear badge when tab is clicked
  clearBadgeOnTabClick(tabName) {
    const badge = this.badges[tabName];
    if (badge) {
      // Don't clear immediately - let the system update it naturally
      setTimeout(() => {
        if (tabName === 'quests') this.updateQuestsBadge();
        if (tabName === 'achievements') this.updateAchievementsBadge();
      }, 100);
    }
  }
}

const badgeManager = new BadgeManager();

export default badgeManager;
