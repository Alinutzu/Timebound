/**
 * UpgradesUI - Manages upgrades tab display
 */

import upgradeSystem from '../systems/UpgradeSystem.js';
import upgradeQueueSystem from '../systems/UpgradeQueueSystem.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';
import UpgradeQueueDisplay from './components/UpgradeQueueDisplay.js';

class UpgradesUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`UpgradesUI: Container ${containerId} not found`);
      return;
    }
    
    // Initialize queue display
    new UpgradeQueueDisplay('upgrade-queue-display');
    
    this.render();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('upgrade:purchased', () => this.update());
    eventBus.on('upgrade:completed', () => this.update());
    eventBus.on('upgrade:queued', () => this.update());
    eventBus.on('upgrade:started', () => this.update());
    eventBus.on('state:ADD_RESOURCE', () => this.update());
    eventBus.on('state:REMOVE_RESOURCE', () => this.update());
  }
  
  render() {
    this.container.innerHTML = '';
    
    // Group by category
    const categories = {
      production: [],
      capacity: [],
      synergy: [],
      qol: [],
      unlock: [],
      special: []
    };
    
    const upgrades = upgradeSystem.upgrades;
    
    for (let [key, upgrade] of Object.entries(upgrades)) {
      if (!categories[upgrade.category]) {
        categories[upgrade.category] = [];
      }
      categories[upgrade.category].push(key);
    }
    
    // Render each category
    for (let [category, upgradeKeys] of Object.entries(categories)) {
      if (upgradeKeys.length === 0) continue;
      
      const section = document.createElement('div');
      section.className = 'upgrade-category';
      
      section.innerHTML = `
        <h3 class="category-title">${this.getCategoryName(category)}</h3>
        <div class="upgrades-grid" data-category="${category}"></div>
      `;
      
      const grid = section.querySelector('.upgrades-grid');
      
      for (let key of upgradeKeys) {
        const card = this.createUpgradeCard(key);
        grid.appendChild(card);
      }
      
      this.container.appendChild(section);
    }
  }
  
  createUpgradeCard(upgradeKey) {
    const upgrade = upgradeSystem.getUpgrade(upgradeKey);
    const level = upgradeSystem.getLevel(upgradeKey);
    const cost = upgradeSystem.getCost(upgradeKey);
    const isUnlocked = upgradeSystem.isUnlocked(upgradeKey);
    const isMaxed = upgradeSystem.isMaxed(upgradeKey);
    const canAfford = upgradeSystem.canAfford(upgradeKey);
    const upgradeStatus = upgradeQueueSystem.getUpgradeStatus(upgradeKey);
    const isInProgress = upgradeStatus === 'active' || upgradeStatus === 'queued';
    const effect = upgrade.getDescription(level);
    const upgradeTime = upgradeQueueSystem.getUpgradeTimeFormatted(upgradeKey, level + 1);
    
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.dataset.key = upgradeKey;
    
    if (!isUnlocked) card.classList.add('locked');
    if (isMaxed) card.classList.add('maxed');
    if (isInProgress) card.classList.add('in-progress');
    if (!canAfford && !isMaxed && !isInProgress) card.classList.add('unaffordable');
    
    card.innerHTML = `
      <div class="upgrade-header">
        <span class="upgrade-emoji">${upgrade.emoji}</span>
        <div class="upgrade-info">
          <h4 class="upgrade-name">${upgrade.name}</h4>
          <p class="upgrade-description">${upgrade.description}</p>
        </div>
        <span class="upgrade-level">Lv. ${level}/${upgrade.maxLevel}</span>
      </div>
      
      ${level > 0 ? `
        <div class="upgrade-effect">
          ${effect}
        </div>
      ` : ''}
      
      ${!isMaxed ? `
        <div class="upgrade-preview">
          <span class="preview-arrow">▸</span>
          <span class="preview-detail">${upgrade.getDescription(level + 1)}</span>
        </div>

        <div class="upgrade-cost">
          <span>Cost:</span>
          <span>${Formatters.formatNumber(cost)} ${this.getResourceIcon(upgrade.costResource)}</span>
        </div>
        
        <div class="upgrade-time">
          ⏱️ ${upgradeTime}
        </div>
        
        <button class="btn btn-primary" 
                data-upgrade="${upgradeKey}" 
                ${!isUnlocked || !canAfford || isInProgress ? 'disabled' : ''}>
          ${isInProgress ? (upgradeStatus === 'active' ? '⏳ In Progress' : '📋 Queued') : (level === 0 ? 'Unlock' : 'Upgrade')}
        </button>
      ` : `
        <div class="upgrade-maxed">
          ✅ MAXED OUT
        </div>
      `}
    `;
    
    // Bind buy button
    const buyBtn = card.querySelector('.btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        upgradeSystem.buy(upgradeKey);
      });
    }
    
    return card;
  }
  
  update() {
  const cards = this.container.querySelectorAll('.upgrade-card');

  cards.forEach(card => {
    const upgradeKey = card.dataset.key;
    const upgrade = upgradeSystem.getUpgrade(upgradeKey);
    const level = upgradeSystem.getLevel(upgradeKey);
    const isUnlocked = upgradeSystem.isUnlocked(upgradeKey);
    const canAfford = upgradeSystem.canAfford(upgradeKey);
    const isMaxed = upgradeSystem.isMaxed(upgradeKey);
    const upgradeStatus = upgradeQueueSystem.getUpgradeStatus(upgradeKey);
    const isInProgress = upgradeStatus === 'active' || upgradeStatus === 'queued';
    const cost = upgradeSystem.getCost(upgradeKey);

    const hadMaxedDiv = card.querySelector('.upgrade-maxed');

    if (isMaxed && !hadMaxedDiv) {
      const newCard = this.createUpgradeCard(upgradeKey);
      card.parentNode.replaceChild(newCard, card);
      return;
    }

    if (!isMaxed && hadMaxedDiv) {
      const newCard = this.createUpgradeCard(upgradeKey);
      card.parentNode.replaceChild(newCard, card);
      return;
    }

    if (isInProgress && !card.classList.contains('in-progress')) {
      const newCard = this.createUpgradeCard(upgradeKey);
      card.parentNode.replaceChild(newCard, card);
      return;
    }

    if (!isInProgress && card.classList.contains('in-progress')) {
      const newCard = this.createUpgradeCard(upgradeKey);
      card.parentNode.replaceChild(newCard, card);
      return;
    }

    card.classList.toggle('locked', !isUnlocked);
    card.classList.toggle('unaffordable', !canAfford && !isMaxed && !isInProgress);
    card.classList.toggle('maxed', isMaxed);

    const btn = card.querySelector('.btn');
    if (btn) {
      btn.disabled = !isUnlocked || !canAfford || isInProgress;
      if (!isMaxed) {
        btn.textContent = isInProgress
          ? (upgradeStatus === 'active' ? '⏳ In Progress' : '📋 Queued')
          : (level === 0 ? 'Unlock' : 'Upgrade');
      }
    }

    const costSpan = card.querySelector('.upgrade-cost span:last-child');
    if (costSpan && !isMaxed) {
      costSpan.textContent = `${Formatters.formatNumber(cost)} ${this.getResourceIcon(upgrade.costResource)}`;
    }

    const levelSpan = card.querySelector('.upgrade-level');
    if (levelSpan) {
      levelSpan.textContent = `Lv. ${level}/${upgrade.maxLevel}`;
    }

    const effectContainer = card.querySelector('.upgrade-effect');
    if (effectContainer) {
      if (level > 0) {
        effectContainer.textContent = upgrade.getDescription(level);
      }
    } else if (level > 0) {
      const newEffectDiv = document.createElement('div');
      newEffectDiv.className = 'upgrade-effect';
      newEffectDiv.textContent = upgrade.getDescription(level);
      const header = card.querySelector('.upgrade-header');
      if (header) {
        header.insertAdjacentElement('afterend', newEffectDiv);
      }
    }

    const previewContainer = card.querySelector('.upgrade-preview');
    if (previewContainer) {
      const previewDetail = previewContainer.querySelector('.preview-detail');
      if (previewDetail) {
        previewDetail.textContent = upgrade.getDescription(level + 1);
      }
    }
  });
}
  
  getCategoryName(category) {
    const names = {
      production: '⚡ Production Multipliers',
      capacity: '📦 Resource Capacity',
      synergy: '🔗 Structure Synergies',
      qol: '✨ Quality of Life',
      unlock: '🔓 Unlocks',
      special: '🌟 Special Upgrades'
    };
    return names[category] || category;
  }
  
  getResourceIcon(resource) {
    const icons = {
      energy: '⚡',
      mana: '✨',
      gems: '💎',
      crystals: '💠',
      volcanicEnergy: '🌋',
      tidalEnergy: '🌊',
      solarEssence: '☀️',
      cryoEnergy: '❄️',
      cosmicEnergy: '🌌',
      pearls: '🦪'
    };
    return icons[resource] || '';
  }
}

export default UpgradesUI;