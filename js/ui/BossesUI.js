/**
 * BossesUI - Manages bosses tab display
 */

import bossSystem from '../systems/BossSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';

class BossesUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`BossesUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('boss:unlocked', () => this.render());
    eventBus.on('boss:defeated', () => this.render());
    eventBus.on('boss:damage-dealt', (data) => this.updateBossHP(data));
  }
  
  render() {
    const bosses = bossSystem.bosses;
    this.container.innerHTML = '';
    
    for (let [key, boss] of Object.entries(bosses)) {
      if (boss.locked) continue;
      
      const card = this.createBossCard(key, boss);
      this.container.appendChild(card);
    }
  }
  
  createBossCard(key, boss) {
    const state = bossSystem.getBossState(key);
    
    const card = document.createElement('div');
    card.className = 'boss-card';
    card.dataset.bossKey = key;
    
    if (!state?.unlocked) card.classList.add('locked');
    
    const hpPercentage = state ? (state.currentHP / state.maxHP) * 100 : 100;
    const isDefeated = state && state.currentHP <= 0;
    
    // Format rewards
    const rewards = boss.rewards.firstTime;
    const rewardParts = [];
    if (rewards.gems) rewardParts.push(`${rewards.gems} 💎`);
    if (rewards.crystals) rewardParts.push(`${rewards.crystals} 💠`);
    if (rewards.energy) rewardParts.push(`${Formatters.formatNumber(rewards.energy)} ⚡`);
    if (rewards.guaranteedGuardian) {
      rewardParts.push(`${rewards.guaranteedGuardian.rarity} Guardian`);
    }
    
    card.innerHTML = `
      <div class="boss-tier-badge">
        Tier ${boss.tier}
      </div>
      
      <div class="boss-header">
        <div class="boss-emoji">${boss.emoji}</div>
        <h3 class="boss-name">${boss.name}</h3>
        <p class="boss-description">${boss.description}</p>
      </div>
      
      ${state?.unlocked ? `
        <div class="boss-hp-bar">
          <div class="boss-hp-label">
            <span>HP:</span>
            <span>${Formatters.formatNumber(state.currentHP)} / ${Formatters.formatNumber(state.maxHP)}</span>
          </div>
          <div class="boss-hp-bar-bg">
            <div class="boss-hp-bar-fill" style="width: ${hpPercentage}%"></div>
          </div>
        </div>
        
        ${state.attempts > 0 ? `
          <div class="boss-stats">
            <p>Attempts: ${state.attempts}</p>
            <p>Best Score: ${state.bestScore}</p>
            ${state.defeatedCount > 0 ? `<p>Times Defeated: ${state.defeatedCount}</p>` : ''}
          </div>
        ` : ''}
        
        <div class="boss-rewards">
          <h4>${isDefeated ? 'Repeat Rewards:' : 'First Clear Rewards:'}</h4>
          <div class="boss-reward-list">
            ${rewardParts.map(r => `<span class="boss-reward-item">${r}</span>`).join('')}
          </div>
        </div>
        
        <button class="btn btn-danger btn-large" onclick="challengeBoss('${key}')">
          ⚔️ ${isDefeated ? 'Challenge Again' : 'Challenge Boss'}
        </button>
      ` : `
        <div class="boss-locked-info">
          <p>🔒 Requirements:</p>
          <ul>
            ${this.getUnlockRequirements(boss).map(req => `<li>${req}</li>`).join('')}
          </ul>
        </div>
      `}
    `;
    
    return card;
  }
  
  updateBossHP(data) {
    const card = this.container.querySelector(`[data-boss-key="${data.bossKey}"]`);
    if (!card) return;
    
    const hpBar = card.querySelector('.boss-hp-bar-fill');
    const hpLabel = card.querySelector('.boss-hp-label span:last-child');
    
    if (hpBar) {
      const percentage = (data.currentHP / data.maxHP) * 100;
      hpBar.style.width = `${percentage}%`;
    }
    
    if (hpLabel) {
      hpLabel.textContent = `${Formatters.formatNumber(data.currentHP)} / ${Formatters.formatNumber(data.maxHP)}`;
    }
  }
  
  getUnlockRequirements(boss) {
    const requirements = [];
    const condition = boss.unlockCondition;
    
    if (!condition) return ['Always available'];
    
    if (condition.production) {
      for (let [resource, amount] of Object.entries(condition.production)) {
        requirements.push(`${Formatters.formatNumber(amount)} ${resource}/s`);
      }
    }
    
    if (condition.structures) {
      if (condition.structures.total) {
        requirements.push(`${condition.structures.total} total structure levels`);
      }
    }
    
    if (condition.ascension) {
      requirements.push(`Ascension Level ${condition.ascension.level}`);
    }
    
    if (condition.realms) {
      for (let [realm, req] of Object.entries(condition.realms)) {
        if (req === 'unlocked') {
          requirements.push(`Unlock ${realm} realm`);
        }
      }
    }
    
    if (condition.bosses) {
      for (let [bossId, req] of Object.entries(condition.bosses)) {
        if (req === 'defeated') {
          const bossData = bossSystem.bosses[bossId];
          requirements.push(`Defeat ${bossData?.name || bossId}`);
        }
      }
    }
    
    return requirements;
  }
}

// Global challenge function
window.challengeBoss = (bossKey) => {
  bossSystem.startBattle(bossKey);
  eventBus.emit('modal:show', { modalId: 'boss-battle-modal' });
};

export default BossesUI;