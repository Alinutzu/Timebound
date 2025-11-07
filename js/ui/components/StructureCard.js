/**
 * StructureCard - Individual structure display and purchase
 */

import structureSystem from '../../systems/StructureSystem.js';
import stateManager from '../../core/StateManager.js';
import eventBus from '../../utils/EventBus.js';
import Formatters from '../../utils/Formatters.js';

class StructureCard {
  constructor(structureKey) {
    this.structureKey = structureKey;
    this.structure = structureSystem.getStructure(structureKey);
    this.element = null;
    
    this.render();
    this.subscribe();
  }
  
  /**
   * Subscribe to events
   */
  subscribe() {
    eventBus.on('structure:purchased', (data) => {
      if (data.structureKey === this.structureKey) {
        this.update();
      }
    });
    
    eventBus.on('state:ADD_RESOURCE', () => this.update());
    eventBus.on('state:REMOVE_RESOURCE', () => this.update());
    eventBus.on('production:updated', () => this.update());
  }
  
  /**
   * Render card
   */
  render() {
    const level = structureSystem.getLevel(this.structureKey);
    const cost = structureSystem.getCost(this.structureKey);
    const production = structureSystem.getProduction(this.structureKey);
    const isUnlocked = structureSystem.isUnlocked(this.structureKey);
    const canAfford = structureSystem.canAfford(this.structureKey);
    
    this.element = document.createElement('div');
    this.element.className = 'structure-card';
    this.element.dataset.key = this.structureKey;
    this.element.dataset.tier = this.structure.tier;
    
    if (!isUnlocked) {
      this.element.classList.add('locked');
    }
    
    if (!canAfford) {
      this.element.classList.add('unaffordable');
    }
    
    this.element.innerHTML = `
      <div class="structure-header">
        <span class="structure-emoji">${this.structure.emoji}</span>
        <div class="structure-title">
          <h3 class="structure-name">${this.structure.name}</h3>
          <p class="structure-description">${this.structure.description}</p>
        </div>
        <span class="structure-level">Lv. ${level}</span>
      </div>
      
      <div class="structure-stats">
        <div class="stat">
          <span class="stat-label">Production:</span>
          <span class="stat-value" id="production-${this.structureKey}">
            ${Formatters.formatNumber(production)}/s
          </span>
        </div>
        
        <div class="stat">
          <span class="stat-label">Cost:</span>
          <span class="stat-value" id="cost-${this.structureKey}">
            ${Formatters.formatNumber(cost)} ${this.getCostIcon()}
          </span>
        </div>
      </div>
      
      <div class="structure-actions">
        <button class="btn btn-primary buy-btn" id="buy-${this.structureKey}" ${!isUnlocked || !canAfford ? 'disabled' : ''}>
          ${level === 0 ? 'Build' : 'Upgrade'}
        </button>
        
        <button class="btn btn-secondary buy-max-btn" id="buy-max-${this.structureKey}" ${!isUnlocked || level === 0 ? 'disabled' : ''}>
          Buy Max
        </button>
      </div>
      
      ${!isUnlocked ? this.renderUnlockCondition() : ''}
    `;
    
    // Add event listeners
    this.attachListeners();
    
    return this.element;
  }
  
  /**
   * Attach event listeners
   */
  attachListeners() {
    // Buy button
    const buyBtn = this.element.querySelector(`#buy-${this.structureKey}`);
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        structureSystem.buy(this.structureKey);
      });
    }
    
    // Buy max button
    const buyMaxBtn = this.element.querySelector(`#buy-max-${this.structureKey}`);
    if (buyMaxBtn) {
      buyMaxBtn.addEventListener('click', () => {
        structureSystem.buyMax(this.structureKey);
      });
    }
    
    // Tooltip on hover
    this.element.addEventListener('mouseenter', () => {
      this.showTooltip();
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }
  
  /**
   * Update card
   */
  update() {
    const level = structureSystem.getLevel(this.structureKey);
    const cost = structureSystem.getCost(this.structureKey);
    const production = structureSystem.getProduction(this.structureKey);
    const isUnlocked = structureSystem.isUnlocked(this.structureKey);
    const canAfford = structureSystem.canAfford(this.structureKey);
    
    // Update level
    const levelEl = this.element.querySelector('.structure-level');
    if (levelEl) {
      levelEl.textContent = `Lv. ${level}`;
    }
    
    // Update production
    const productionEl = document.getElementById(`production-${this.structureKey}`);
    if (productionEl) {
      productionEl.textContent = `${Formatters.formatNumber(production)}/s`;
    }
    
    // Update cost
    const costEl = document.getElementById(`cost-${this.structureKey}`);
    if (costEl) {
      costEl.textContent = `${Formatters.formatNumber(cost)} ${this.getCostIcon()}`;
    }
    
    // Update button states
    const buyBtn = this.element.querySelector(`#buy-${this.structureKey}`);
    if (buyBtn) {
      buyBtn.disabled = !isUnlocked || !canAfford;
      buyBtn.textContent = level === 0 ? 'Build' : 'Upgrade';
    }
    
    const buyMaxBtn = this.element.querySelector(`#buy-max-${this.structureKey}`);
    if (buyMaxBtn) {
      buyMaxBtn.disabled = !isUnlocked || level === 0;
    }
    
    // Update classes
    if (isUnlocked) {
      this.element.classList.remove('locked');
    } else {
      this.element.classList.add('locked');
    }
    
    if (canAfford) {
      this.element.classList.remove('unaffordable');
    } else {
      this.element.classList.add('unaffordable');
    }
  }
  
  /**
   * Get cost resource icon
   */
  getCostIcon() {
    const icons = {
      energy: '⚡',
      mana: '✨',
      gems: '💎',
      crystals: '💠',
      volcanicEnergy: '🌋'
    };
    return icons[this.structure.costResource] || '';
  }
  
  /**
   * Render unlock condition
   */
  renderUnlockCondition() {
    const condition = this.structure.unlockCondition;
    if (!condition) return '';
    
    let requirements = [];
    
    if (condition.resources) {
      for (let [resource, amount] of Object.entries(condition.resources)) {
        requirements.push(`${Formatters.formatNumber(amount)} ${resource}`);
      }
    }
    
    if (condition.structures) {
      for (let [structure, level] of Object.entries(condition.structures)) {
        const structureData = structureSystem.getStructure(structure);
        requirements.push(`${structureData.name} Lv.${level}`);
      }
    }
    
    if (condition.upgrades) {
      for (let [upgrade, level] of Object.entries(condition.upgrades)) {
        requirements.push(`Unlock: ${upgrade}`);
      }
    }
    
    if (condition.ascension) {
      requirements.push(`Ascension Lv.${condition.ascension.level}`);
    }
    
    return `
      <div class="unlock-condition">
        <span class="unlock-label">🔒 Requires:</span>
        <ul class="unlock-requirements">
          ${requirements.map(req => `<li>${req}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  /**
   * Show tooltip
   */
  showTooltip() {
    // TODO: Implement tooltip with detailed info
    // - Total production contribution
    // - Multipliers breakdown
    // - Next level stats
  }
  
  /**
   * Hide tooltip
   */
  hideTooltip() {
    // TODO: Hide tooltip
  }
  
  /**
   * Get DOM element
   */
  getElement() {
    return this.element;
  }
  
  /**
   * Destroy card
   */
  destroy() {
    // Remove event listeners
    const buyBtn = this.element.querySelector(`#buy-${this.structureKey}`);
    if (buyBtn) {
      buyBtn.replaceWith(buyBtn.cloneNode(true));
    }
    
    const buyMaxBtn = this.element.querySelector(`#buy-max-${this.structureKey}`);
    if (buyMaxBtn) {
      buyMaxBtn.replaceWith(buyMaxBtn.cloneNode(true));
    }
    
    // Remove element
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default StructureCard;