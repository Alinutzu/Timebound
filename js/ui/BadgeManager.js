/**
 * BadgeManager - Manages notification badges across tabs
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

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
    eventBus. on('quest:completed', () => this.updateQuestsBadge());
    eventBus.on('quest:claimed', () => this.updateQuestsBadge());
    eventBus.on('achievement:unlocked', () => this.updateAchievementsBadge());
    eventBus.on('achievement:claimed', () => this.updateAchievementsBadge());
    
    // Update on game tick (for completed quests)
    eventBus.on('game:tick', () => {
      // Throttle to once per second
      if (! this.lastUpdate || Date.now() - this. lastUpdate > 1000) {
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
    const completedQuests = state.quests.active.filter(q => q.completed). length;
    
    this.setBadge('quests', completedQuests);
  }
  
  updateAchievementsBadge() {
  const state = stateManager. getState();
  
  // ===== FIX: Adaptare pentru structura de array =====
  // Verifică dacă achievements sunt în formatul vechi (array-based)
  if (Array.isArray(state.achievements?. unlocked)) {
    // Formatul: { unlocked: [], claimed: [] }
    const unlockedAchievements = state.achievements. unlocked || [];
    const claimedAchievements = state.achievements. claimed || [];
    
    // Achievements unlocked dar NU claimed
    const unclaimedCount = unlockedAchievements.filter(
      key => !claimedAchievements.includes(key)
    ).length;
    
    this.setBadge('achievements', unclaimedCount);
    return;
  }
  
  // Fallback: format nou (object-based)
  let unclaimedCount = 0;
  for (let achievement of Object.values(state.achievements)) {
    if (achievement. unlocked && !achievement.claimed) {
      unclaimedCount++;
    }
  }
  
  this.setBadge('achievements', unclaimedCount);
  // ===== SFÂRȘIT FIX =====
}
  
  updateGuardiansBadge() {
    const state = stateManager.getState();
    const canSummon = state.resources.gems >= 100;
    
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
      badge. textContent = value;
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
      badge.style. display = 'none';
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