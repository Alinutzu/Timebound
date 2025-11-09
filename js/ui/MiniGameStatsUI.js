/**
 * MiniGameStatsUI - Display mini-game statistics and achievements
 */

import miniGameAchievementSystem from '../systems/MiniGameAchievementSystem.js';
import { ACHIEVEMENT_TIERS } from '../data/miniGameAchievements.js';
import formatters from '../utils/Formatters.js';

class MiniGameStatsUI {
  /**
   * Render mini-game achievements section in Achievements UI
   */
  renderMiniGameAchievements(container, gameType) {
    const progress = miniGameAchievementSystem.getProgress(gameType);
    const stats = miniGameAchievementSystem.getGameStats(gameType);
    
    const gameNames = {
      dailySpin: '🎰 Daily Spin',
      game2048: '🎮 2048',
      match3: '🧩 Match-3'
    };
    
    container.innerHTML = `
      <div class="mini-game-achievements">
        <div class="achievement-header">
          <h3>${gameNames[gameType]}</h3>
          <div class="achievement-progress-bar">
            <div class="progress-fill" style="width: ${stats.percentage}%"></div>
            <span class="progress-text">${stats.unlocked}/${stats.total} (${stats.percentage}%)</span>
          </div>
        </div>
        
        <div class="achievements-grid">
          ${progress.map(achievement => this.renderAchievementCard(achievement)).join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Render single achievement card - MATCHES GENERAL ACHIEVEMENTS STRUCTURE
   */
  renderAchievementCard(achievement) {
    const tier = ACHIEVEMENT_TIERS[achievement.tier];
    const unlocked = achievement.unlocked;
    
    // Format rewards (match general achievements format)
    const rewardParts = [];
    if (achievement.reward.gems) rewardParts.push(`${achievement.reward.gems} 💎`);
    if (achievement.reward.crystals) rewardParts.push(`${achievement.reward.crystals} 💠`);
    if (achievement.reward.energy) rewardParts.push(`${formatters.formatNumber(achievement.reward.energy)} ⚡`);
    if (achievement.reward.timeShards) rewardParts.push(`${achievement.reward.timeShards} ⏰`);
    if (achievement.reward.guardian) rewardParts.push(`🛡️ Guardian`);
    
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-tier-badge ${achievement.tier}">
          ${tier.icon}
        </div>
        
        <div class="achievement-content">
          <span class="achievement-emoji">${achievement.icon}</span>
          <div class="achievement-info">
            <h4 class="achievement-name">${achievement.name}</h4>
            <p class="achievement-description">${achievement.description}</p>
          </div>
        </div>
        
        <div class="achievement-reward">
          Reward: ${rewardParts.join(', ')}
        </div>
        
        ${unlocked ? `
          <div class="achievement-claimed">
            ✓ Unlocked${achievement.timestamp ? ` - ${this.formatDate(achievement.timestamp)}` : ''}
          </div>
        ` : `
          <div class="achievement-locked">
            🔒 Locked
          </div>
        `}
      </div>
    `;
  }
  
  /**
   * Format reward display (DEPRECATED - kept for backwards compatibility)
   */
  formatReward(reward) {
    const icons = {
      timeShards: '⏰',
      gems: '💎',
      energy: '⚡',
      crystals: '💠',
      guardian: '🛡️'
    };
    
    const parts = [];
    for (const [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        parts.push(`<span class="reward-item">${icons[resource]} Guardian</span>`);
      } else {
        parts.push(`<span class="reward-item">${formatters.formatNumber(amount)} ${icons[resource]}</span>`);
      }
    }
    
    return parts.join(' ');
  }
  
  /**
   * Format date
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  /**
   * Render mini-game stats in Statistics UI
   */
  renderMiniGameStats(container) {
    const overallStats = miniGameAchievementSystem.getOverallStats();
    
    container.innerHTML = `
      <div class="mini-game-stats-section">
        <h3>🎮 Mini-Game Progress</h3>
        
        <div class="overall-progress">
          <div class="stat-card">
            <div class="stat-value">${overallStats.unlocked}/${overallStats.total}</div>
            <div class="stat-label">Total Achievements</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${overallStats.percentage}%"></div>
            </div>
          </div>
        </div>
        
        <div class="game-stats-grid">
          ${this.renderGameStatCard('dailySpin', '🎰 Daily Spin', overallStats.byGame.dailySpin)}
          ${this.renderGameStatCard('game2048', '🎮 2048', overallStats.byGame.game2048)}
          ${this.renderGameStatCard('match3', '🧩 Match-3', overallStats.byGame.match3)}
        </div>
      </div>
    `;
  }
  
  /**
   * Render game stat card
   */
  renderGameStatCard(gameType, name, stats) {
    return `
      <div class="game-stat-card" data-game="${gameType}">
        <h4>${name}</h4>
        <div class="stat-value">${stats.unlocked}/${stats.total}</div>
        <div class="progress-bar small">
          <div class="progress-fill" style="width: ${stats.percentage}%"></div>
        </div>
        <div class="stat-label">${stats.percentage}% Complete</div>
      </div>
    `;
  }
}

export default new MiniGameStatsUI();