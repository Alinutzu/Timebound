/**
 * QuestsUI - Manages quests tab display
 */

import questSystem from '../systems/QuestSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';

class QuestsUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`QuestsUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('quest:completed', () => this.render());
    eventBus.on('quest:claimed', () => this.render());
    eventBus.on('quests:generated', () => this.render());
    eventBus.on('state:UPDATE_QUEST_PROGRESS', () => this.updateProgress());
  }
  
  render() {
    this.updateHeader();
    this.renderQuests();
  }
  
  updateHeader() {
    const stats = questSystem.getStats();
    
    const completedEl = document.getElementById('quests-completed-today');
    const limitEl = document.getElementById('quests-daily-limit');
    
    if (completedEl) completedEl.textContent = stats.completedToday;
    if (limitEl) limitEl.textContent = stats.dailyLimit;
  }
  
  renderQuests() {
    const quests = questSystem.getActiveQuests();
    
    if (quests.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 3rem; margin-bottom: 1rem;">📜</p>
          <h3>No Active Quests</h3>
          <p>Complete your current quests or wait for new ones to appear!</p>
        </div>
      `;
      return;
    }
    
    this.container.innerHTML = '';
    
    quests.forEach(quest => {
      const card = this.createQuestCard(quest);
      this.container.appendChild(card);
    });
  }
  
  createQuestCard(quest) {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.dataset.questId = quest.id;
    
    if (quest.completed) {
      card.classList.add('completed');
    }
    
    const progress = Math.min((quest.progress / quest.amount) * 100, 100);
    
    card.innerHTML = `
      <div class="quest-header">
        <span class="quest-emoji">${quest.emoji}</span>
        <div class="quest-info">
          <h4 class="quest-title">${quest.name}</h4>
          <p class="quest-description">${quest.description}</p>
        </div>
      </div>
      
      <div class="quest-progress ${quest.completed ? 'completed' : ''}">
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="quest-progress-text">
          ${Formatters.formatNumber(quest.progress)} / ${Formatters.formatNumber(quest.amount)}
        </p>
      </div>
      
      <div class="quest-rewards">
        ${this.formatRewards(quest.rewards)}
      </div>
      
      ${quest.completed ? `
        <button class="btn btn-success" onclick="claimQuest('${quest.id}')">
          ✅ Claim Rewards
        </button>
      ` : `
        <button class="btn btn-secondary" disabled>
          In Progress...
        </button>
      `}
    `;
    
    return card;
  }
  
  updateProgress() {
    const cards = this.container.querySelectorAll('.quest-card');
    
    cards.forEach(card => {
      const questId = card.dataset.questId;
      const quests = questSystem.getActiveQuests();
      const quest = quests.find(q => q.id === questId);
      
      if (!quest) return;
      
      // Update progress bar
      const progressBar = card.querySelector('.quest-progress-fill');
      const progressText = card.querySelector('.quest-progress-text');
      
      if (progressBar) {
        const progress = Math.min((quest.progress / quest.amount) * 100, 100);
        progressBar.style.width = `${progress}%`;
      }
      
      if (progressText) {
        progressText.textContent = `${Formatters.formatNumber(quest.progress)} / ${Formatters.formatNumber(quest.amount)}`;
      }
      
      // Update completed state
      if (quest.completed && !card.classList.contains('completed')) {
        card.classList.add('completed');
        
        // Update button
        const btn = card.querySelector('.btn');
        if (btn) {
          btn.className = 'btn btn-success';
          btn.disabled = false;
          btn.textContent = '✅ Claim Rewards';
          btn.onclick = () => claimQuest(quest.id);
        }
      }
    });
  }
  
  formatRewards(rewards) {
    const parts = [];
    
    for (let [resource, amount] of Object.entries(rewards)) {
      const icons = {
        energy: '⚡',
        mana: '✨',
        gems: '💎',
        crystals: '💠'
      };
      
      parts.push(`
        <span class="quest-reward">
          ${Formatters.formatNumber(amount)} ${icons[resource] || resource}
        </span>
      `);
    }
    
    return parts.join('');
  }
}

// Global claim function
window.claimQuest = (questId) => {
  questSystem.claim(questId);
};

export default QuestsUI;