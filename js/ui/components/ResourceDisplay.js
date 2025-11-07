/**
 * ResourceDisplay - Shows resources at top of screen
 */

import stateManager from '../../core/StateManager.js';
import eventBus from '../../utils/EventBus.js';
import Formatters from '../../utils/Formatters.js';

class ResourceDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`ResourceDisplay: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe() {
    // Update on any resource change
    eventBus.on('state:ADD_RESOURCE', () => this.update());
    eventBus.on('state:REMOVE_RESOURCE', () => this.update());
    eventBus.on('state:SET_RESOURCE', () => this.update());
    eventBus.on('production:updated', () => this.update());
  }
  
  /**
   * Initial render
   */
  render() {
    this.container.innerHTML = `
      <div class="resource-display">
        <div class="resource-item" id="energy-display">
          <span class="resource-icon">⚡</span>
          <div class="resource-info">
            <div class="resource-amount" id="energy-amount">0</div>
            <div class="resource-rate" id="energy-rate">0/s</div>
          </div>
          <div class="resource-bar">
            <div class="resource-bar-fill" id="energy-bar"></div>
          </div>
        </div>
        
        <div class="resource-item" id="mana-display">
          <span class="resource-icon">✨</span>
          <div class="resource-info">
            <div class="resource-amount" id="mana-amount">0</div>
            <div class="resource-rate" id="mana-rate">0/s</div>
          </div>
          <div class="resource-bar">
            <div class="resource-bar-fill" id="mana-bar"></div>
          </div>
        </div>
        
        <div class="resource-item" id="gems-display">
          <span class="resource-icon">💎</span>
          <div class="resource-info">
            <div class="resource-amount" id="gems-amount">0</div>
          </div>
        </div>
        
        <div class="resource-item" id="crystals-display" style="display: none;">
          <span class="resource-icon">💠</span>
          <div class="resource-info">
            <div class="resource-amount" id="crystals-amount">0</div>
          </div>
        </div>
        
        <div class="resource-item" id="volcanic-display" style="display: none;">
          <span class="resource-icon">🌋</span>
          <div class="resource-info">
            <div class="resource-amount" id="volcanic-amount">0</div>
            <div class="resource-rate" id="volcanic-rate">0/s</div>
          </div>
          <div class="resource-bar">
            <div class="resource-bar-fill" id="volcanic-bar"></div>
          </div>
        </div>
      </div>
    `;
    
    this.update();
  }
  
  /**
   * Update display
   */
  update() {
    const state = stateManager.getState();
    
    // Energy
    this.updateResource('energy', 
      state.resources.energy, 
      state.caps.energy, 
      state.production.energy
    );
    
    // Mana
    this.updateResource('mana', 
      state.resources.mana, 
      state.caps.mana, 
      state.production.mana
    );
    
    // Gems (no cap or rate)
    const gemsAmount = document.getElementById('gems-amount');
    if (gemsAmount) {
      gemsAmount.textContent = Formatters.formatNumber(state.resources.gems, 0);
    }
    
    // Crystals (show if player has any or has ascended)
    if (state.resources.crystals > 0 || state.ascension.level > 0) {
      const crystalsDisplay = document.getElementById('crystals-display');
      const crystalsAmount = document.getElementById('crystals-amount');
      
      if (crystalsDisplay) crystalsDisplay.style.display = 'flex';
      if (crystalsAmount) {
        crystalsAmount.textContent = Formatters.formatNumber(state.resources.crystals, 0);
      }
    }
    
    // Volcanic (show if volcano unlocked)
    if (state.realms.unlocked.includes('volcano')) {
      const volcanicDisplay = document.getElementById('volcanic-display');
      if (volcanicDisplay) volcanicDisplay.style.display = 'flex';
      
      this.updateResource('volcanic',
        state.resources.volcanicEnergy,
        state.caps.volcanicEnergy,
        state.production.volcanicEnergy
      );
    }
  }
  
  /**
   * Update individual resource
   */
  updateResource(resourceKey, amount, cap, rate) {
    // Amount
    const amountEl = document.getElementById(`${resourceKey}-amount`);
    if (amountEl) {
      amountEl.textContent = `${Formatters.formatNumber(amount)} / ${Formatters.formatNumber(cap)}`;
    }
    
    // Rate
    const rateEl = document.getElementById(`${resourceKey}-rate`);
    if (rateEl && rate !== undefined) {
      rateEl.textContent = `${Formatters.formatNumber(rate)}/s`;
      
      // Color based on rate
      if (rate > 0) {
        rateEl.style.color = '#10b981'; // Green
      } else {
        rateEl.style.color = '#6b7280'; // Gray
      }
    }
    
    // Progress bar
    const barEl = document.getElementById(`${resourceKey}-bar`);
    if (barEl && cap) {
      const percentage = Math.min((amount / cap) * 100, 100);
      barEl.style.width = `${percentage}%`;
      
      // Color based on fullness
      if (percentage >= 100) {
        barEl.style.backgroundColor = '#ef4444'; // Red (full)
      } else if (percentage >= 80) {
        barEl.style.backgroundColor = '#f59e0b'; // Orange
      } else {
        barEl.style.backgroundColor = '#10b981'; // Green
      }
    }
  }
}

export default ResourceDisplay;