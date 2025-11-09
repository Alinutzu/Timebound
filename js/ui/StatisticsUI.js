/**
 * StatisticsUI - Manages statistics tab display
 */

import statisticsSystem from '../systems/StatisticsSystem.js';
import eventBus from '../utils/EventBus.js';
import miniGameStatsUI from './MiniGameStatsUI.js'; // ✅ ADĂUGAT

class StatisticsUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`StatisticsUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
    
    // Bind export button
    document.getElementById('export-stats-btn')?.addEventListener('click', () => {
      statisticsSystem.exportStats();
    });
  }
  
  subscribe() {
    // Update stats periodically
    setInterval(() => {
      this.render();
    }, 5000);
  }
  
  // ✅ MODIFICAT - render() cu mini-game stats
  render() {
    const stats = statisticsSystem.getAllStats();
    
    this.container.innerHTML = '';
    
    for (let [category, data] of Object.entries(stats)) {
      const section = this.createCategorySection(category, data);
      this.container.appendChild(section);
    }
    
    // Add milestones
    this.renderMilestones();
    
    // ✅ ADĂUGAT - Render mini-game statistics
    const miniGameContainer = document.createElement('div');
    miniGameContainer.id = 'mini-game-statistics';
    this.container.appendChild(miniGameContainer);
    
    miniGameStatsUI.renderMiniGameStats(miniGameContainer);
  }
  
  createCategorySection(category, data) {
    const section = document.createElement('div');
    section.className = 'statistics-category';
    
    const categoryNames = {
      general: '📊 General',
      resources: '💎 Resources',
      structures: '🏗️ Structures',
      upgrades: '⬆️ Upgrades',
      guardians: '🐉 Guardians',
      quests: '📜 Quests',
      puzzles: '🧩 Puzzles',
      bosses: '⚔️ Bosses',
      achievements: '🏆 Achievements',
      shop: '💰 Shop'
    };
    
    section.innerHTML = `
      <h3>${categoryNames[category] || category}</h3>
      <div class="statistics-grid">
        ${Object.entries(data).map(([key, value]) => `
          <div class="stat-card">
            <div class="stat-card-label">${key}</div>
            <div class="stat-card-value">${value}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    return section;
  }
  
  renderMilestones() {
    const milestones = statisticsSystem.getMilestones();
    
    if (milestones.length === 0) return;
    
    const section = document.createElement('div');
    section.className = 'statistics-category';
    
    section.innerHTML = `
      <h3>🌟 Milestones Reached</h3>
      <div class="milestones-grid">
        ${milestones.map(m => `
          <div class="milestone-card">
            <span class="milestone-emoji">${m.emoji}</span>
            <span class="milestone-name">${m.name}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    this.container.appendChild(section);
  }
}

export default StatisticsUI;