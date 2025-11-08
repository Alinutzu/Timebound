/**
 * BossUI - Handles boss battle modal content
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class BossUI {
  constructor() {
    this.subscribe();
    logger.info('BossUI', 'Initialized');
  }
  
  subscribe() {
    eventBus.on('boss:battle-started', (data) => {
      this.showBattleUI(data);
    });
    
    eventBus.on('boss:damage-dealt', (data) => {
      this.updateBossHP(data);
    });
    
    eventBus.on('boss:defeated', (data) => {
      this.showVictory(data);
    });
  }
  
  showBattleUI(data) {
  const { boss, bossState } = data;
  
  // Update modal title
  const title = document.getElementById('boss-battle-title');
  if (title) {
    title.innerHTML = `⚔️ ${boss.emoji} ${boss.name} <span class="boss-tier">Tier ${boss.tier}</span>`;
  }
  
  // Get puzzle container inside modal
  const modalContent = document.getElementById('boss-battle-content');
  if (!modalContent) {
    logger.error('BossUI', 'Boss battle content not found!');
    return;
  }
  
  // Create boss battle UI with HP bar at the top
  modalContent.innerHTML = `
    <div class="boss-battle-wrapper">
      <!-- Boss HP Display -->
      <div class="boss-battle-header">
        <div class="boss-info-top">
          <div class="boss-name-tier">
            <span class="boss-name">${boss.emoji} ${boss.name}</span>
            <span class="boss-tier-badge">Tier ${boss.tier}</span>
          </div>
          <p class="boss-description">${boss.description}</p>
        </div>
        
        <div class="boss-hp-display">
          <div class="boss-hp-label">
            <span>Boss HP</span>
            <span id="boss-hp-text" class="boss-hp-numbers">
              ${Math.floor(bossState.currentHP)} / ${bossState.maxHP}
            </span>
          </div>
          <div class="boss-hp-bar-bg">
            <div class="boss-hp-bar-fill ${bossState.currentHP < bossState.maxHP * 0.3 ? 'critical' : ''}" 
                 id="boss-hp-bar" 
                 style="width: ${(bossState.currentHP / bossState.maxHP) * 100}%">
            </div>
          </div>
          <div class="boss-hp-percentage">
            ${Math.floor((bossState.currentHP / bossState.maxHP) * 100)}%
          </div>
        </div>
        
        ${boss.lore ? `<p class="boss-lore">"${boss.lore}"</p>` : ''}
      </div>
      
      <!-- Puzzle Container -->
      <div id="boss-puzzle-container" class="boss-puzzle-wrapper">
        <!-- Match-3 game will be rendered here -->
      </div>
    </div>
  `;
  
  logger.info('BossUI', `Boss battle UI created for ${boss.name}`, {
    currentHP: bossState.currentHP,
    maxHP: bossState.maxHP
  });
}
  
  updateBossHP(data) {
  const { currentHP, maxHP, damage } = data;
  
  logger.info('BossUI', `Updating boss HP: ${currentHP}/${maxHP}, damage: ${damage}`);
  
  const hpBar = document.getElementById('boss-hp-bar');
  const hpText = document.getElementById('boss-hp-text');
  
  if (hpBar) {
    const percentage = Math.max(0, (currentHP / maxHP) * 100);
    hpBar.style.width = `${percentage}%`;
    
    // Add/remove critical class
    if (percentage < 30) {
      hpBar.classList.add('critical');
    } else {
      hpBar.classList.remove('critical');
    }
    
    // Shake animation
    hpBar.classList.add('shake');
    setTimeout(() => hpBar.classList.remove('shake'), 500);
  }
  
  if (hpText) {
    hpText.textContent = `${Math.floor(Math.max(0, currentHP))} / ${maxHP}`;
  }
  
  // Update percentage
  const percentageEl = document.querySelector('.boss-hp-percentage');
  if (percentageEl) {
    percentageEl.textContent = `${Math.floor(Math.max(0, (currentHP / maxHP) * 100))}%`;
  }
  
  // Show floating damage
  if (damage && hpBar) {
    const rect = hpBar.getBoundingClientRect();
    this.showFloatingDamage(rect.left + rect.width / 2, rect.top, damage);
  }
}

showFloatingDamage(x, y, damage) {
  const floatingText = document.createElement('div');
  floatingText.className = 'floating-damage';
  floatingText.textContent = `-${Math.floor(damage)}`;
  floatingText.style.left = `${x}px`;
  floatingText.style.top = `${y}px`;
  
  document.body.appendChild(floatingText);
  
  setTimeout(() => {
    floatingText.remove();
  }, 1500);
}
  
  showVictory(data) {
    const { boss, isFirstDefeat, rewards } = data;
    
    const content = document.getElementById('boss-battle-content');
    if (!content) return;
    
    const rewardsList = [];
    if (rewards.gems) rewardsList.push(`${rewards.gems} 💎`);
    if (rewards.crystals) rewardsList.push(`${rewards.crystals} 💠`);
    if (rewards.energy) rewardsList.push(`${rewards.energy} ⚡`);
    if (rewards.guaranteedGuardian) {
      rewardsList.push(`${rewards.guaranteedGuardian.rarity} Guardian`);
    }
    
    content.innerHTML = `
      <div class="boss-victory">
        <h2>🎉 ${isFirstDefeat ? 'FIRST VICTORY!' : 'VICTORY!'}</h2>
        <div class="boss-victory-boss">
          <div class="boss-emoji">${boss.emoji}</div>
          <h3>${boss.name} Defeated!</h3>
        </div>
        <div class="boss-rewards">
          <h4>Rewards:</h4>
          <div class="boss-reward-list">
            ${rewardsList.map(r => `<div class="reward-item">${r}</div>`).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-large" id="boss-victory-close">
          Continue
        </button>
      </div>
    `;
    
    document.getElementById('boss-victory-close').addEventListener('click', () => {
      eventBus.emit('modal:hide', { modalId: 'boss-battle-modal' });
    });
  }
}

// Initialize
new BossUI();

export default BossUI;