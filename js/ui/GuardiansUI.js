/**
 * GuardiansUI - Manages guardians tab display
 */

import guardianSystem from '../systems/GuardianSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';
import confirmModal from './ConfirmModal.js';

class GuardiansUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`GuardiansUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
    
    // Bind summon button
    document.getElementById('summon-guardian-btn')?.addEventListener('click', () => {
      this.summonGuardian();
    });
  }
  
  subscribe() {
    eventBus.on('guardian:summoned', () => this.render());
    eventBus.on('guardian:dismissed', () => this.render());
    eventBus.on('state:ADD_RESOURCE', () => this.updateSummonButton());
  }
  
  render() {
    this.renderStats();
    this.renderGuardians();
    this.updateSummonButton();
  }
  
  renderStats() {
    const statsContainer = document.getElementById('guardian-stats');
    if (!statsContainer) return;
    
    const stats = guardianSystem.getStats();
    const state = stateManager.getState();
    
    statsContainer.innerHTML = `
      <div class="summary-card">
        <h4>Total Guardians</h4>
        <p class="summary-value">${stats.total}</p>
      </div>
      
      <div class="summary-card">
        <h4>⚡ Energy Bonus</h4>
        <p class="summary-value">+${stats.totalBonus.energy}%</p>
      </div>
      
      <div class="summary-card">
        <h4>✨ Mana Bonus</h4>
        <p class="summary-value">+${stats.totalBonus.mana}%</p>
      </div>
      
      <div class="summary-card">
        <h4>🌟 Universal Bonus</h4>
        <p class="summary-value">+${stats.totalBonus.all}%</p>
      </div>
      
      <div class="summary-card">
        <h4>Average Bonus</h4>
        <p class="summary-value">${stats.averageBonus.toFixed(1)}%</p>
      </div>
      
      <div class="summary-card">
        <h4>⭐ Legendary</h4>
        <p class="summary-value">${stats.byRarity.legendary || 0}</p>
      </div>
    `;
  }
  
  renderGuardians() {
    const guardians = guardianSystem.getGuardians();
    
    if (guardians.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 3rem; margin-bottom: 1rem;">🐉</p>
          <h3>No Guardians Yet</h3>
          <p>Summon your first guardian to boost your production!</p>
        </div>
      `;
      return;
    }
    
    // Sort by rarity and bonus
    const sorted = [...guardians].sort((a, b) => {
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return b.bonus - a.bonus;
    });
    
    this.container.innerHTML = '';
    
    sorted.forEach(guardian => {
      const card = this.createGuardianCard(guardian);
      this.container.appendChild(card);
    });
  }
  
  createGuardianCard(guardian) {
  const card = document.createElement('div');
  card.className = `guardian-card rarity-${guardian.rarity}`;
  
  const typeName = this.getTypeName(guardian.type);
  
  card.innerHTML = `
    <div class="guardian-header">
      <span class="guardian-emoji">${guardian.emoji}</span>
      <div class="guardian-info">
        <h4 class="guardian-name">${guardian.name}</h4>
        <span class="guardian-rarity ${guardian.rarity}">
          ${guardianSystem.getRarityName(guardian.rarity)}
        </span>
      </div>
    </div>
    
    <div class="guardian-bonus">
      <div class="guardian-bonus-value">+${guardian.bonus}%</div>
      <div class="guardian-bonus-label">${typeName} Production</div>
    </div>
    
    <div class="guardian-meta">
      <small>Summoned: ${new Date(guardian.summonedAt).toLocaleDateString()}</small>
    </div>
    
    <button class="btn btn-small btn-danger guardian-dismiss-btn" data-guardian-id="${guardian.id}">
      Dismiss
    </button>
  `;
  
  // ===== ADAUGĂ EVENT LISTENER =====
  const dismissBtn = card.querySelector('.guardian-dismiss-btn');
  dismissBtn.addEventListener('click', () => {
    this.dismissGuardian(guardian);
  });
    
    return card;
  }

  dismissGuardian(guardian) {
  confirmModal.show({
    title: 'Dismiss Guardian',
    message: `Are you sure you want to dismiss ${guardian.emoji} ${guardian.name}?  This guardian provides +${guardian.bonus}% ${this.getTypeName(guardian. type)} production and cannot be recovered! `,
    danger: true,
    onConfirm: () => {
      guardianSystem.dismiss(guardian.id);
      
      // Show notification
      eventBus.emit('notification:show', {
        type: 'info',
        title: 'Guardian Dismissed',
        message: `${guardian.name} has left your service`,
        duration: 3000
      });
    }
  });
}
  
  summonGuardian() {
    const success = guardianSystem.summon();
    
    if (!success) {
      // Notification will be shown by GuardianSystem
      return;
    }
    
    // Show animation
    const btn = document.getElementById('summon-guardian-btn');
    if (btn) {
      btn.classList.add('btn-loading');
      setTimeout(() => {
        btn.classList.remove('btn-loading');
      }, 1000);
    }
  }
  
  updateSummonButton() {
    const btn = document.getElementById('summon-guardian-btn');
    if (!btn) return;
    
    const canSummon = guardianSystem.canSummon();
    btn.disabled = !canSummon;
  }
  
  getTypeName(type) {
    const names = {
      energy: 'Energy',
      mana: 'Mana',
      volcanic: 'Volcanic',
      all: 'All Resources',
      gems: 'Gem'
    };
    return names[type] || type;
  }
}

export default GuardiansUI;