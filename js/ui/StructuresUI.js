/**
 * StructuresUI - Manages the structures tab
 */

import structureSystem from '../systems/StructureSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import StructureCard from './components/StructureCard.js';
import Formatters from '../utils/Formatters.js';

class StructuresUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`StructuresUI: Container ${containerId} not found`);
      return;
    }
    
    this.cards = new Map();
    
    this.render();
    this.subscribe();
  }
  
  /**
   * Subscribe to events
   */
  subscribe() {
    // Re-render when realm changes
    eventBus.on('state:SWITCH_REALM', () => {
      this.render();
    });
    
    // Update when structures unlocked
    eventBus.on('structure:purchased', () => {
      this.checkNewUnlocks();
    });
  }
  
  /**
   * Render structures tab
   */
  render() {
    // Clear existing
    this.container.innerHTML = '';
    this.cards.clear();
    
    // Get structures for current realm
    const state = stateManager.getState();
    const currentRealm = state.realms.current;
    const structures = structureSystem.getStructuresForRealm(currentRealm);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'structures-header';
    header.innerHTML = `
      <h2>🏗️ Structures - ${this.getRealmName(currentRealm)}</h2>
      <p class="structures-subtitle">Build and upgrade structures to increase production</p>
    `;
    this.container.appendChild(header);
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'structures-grid';
    grid.id = 'structures-grid';
    
    // Group by tier
    const tiers = { 1: [], 2: [], 3: [] };
    
    for (let [key, data] of Object.entries(structures)) {
      tiers[data.tier].push(key);
    }
    
    // Render by tier
    for (let tier of [1, 2, 3]) {
      if (tiers[tier].length === 0) continue;
      
      const tierSection = document.createElement('div');
      tierSection.className = 'tier-section';
      tierSection.innerHTML = `<h3 class="tier-label">Tier ${tier}</h3>`;
      
      const tierGrid = document.createElement('div');
      tierGrid.className = 'tier-grid';
      
      for (let key of tiers[tier]) {
        const card = new StructureCard(key);
        this.cards.set(key, card);
        tierGrid.appendChild(card.getElement());
      }
      
      tierSection.appendChild(tierGrid);
      grid.appendChild(tierSection);
    }
    
    this.container.appendChild(grid);
    
    // Add summary
    this.renderSummary();
  }
  
  /**
   * Render production summary
   */
  renderSummary() {
    const state = stateManager.getState();
    
    const summary = document.createElement('div');
    summary.className = 'structures-summary';
    summary.id = 'structures-summary';
    summary.innerHTML = `
      <div class="summary-card">
        <h4>⚡ Energy Production</h4>
        <p class="summary-value">${Formatters.formatNumber(state.production.energy)}/s</p>
      </div>
      
      <div class="summary-card">
        <h4>✨ Mana Production</h4>
        <p class="summary-value">${Formatters.formatNumber(state.production.mana)}/s</p>
      </div>
      
      ${state.realms.unlocked.includes('volcano') ? `
        <div class="summary-card">
          <h4>🌋 Volcanic Production</h4>
          <p class="summary-value">${Formatters.formatNumber(state.production.volcanicEnergy)}/s</p>
        </div>
      ` : ''}
      
      <div class="summary-card">
        <h4>📊 Total Structures</h4>
        <p class="summary-value">${structureSystem.getStats().totalStructures}</p>
      </div>
    `;
    
    this.container.appendChild(summary);
  }
  
  /**
   * Check for newly unlocked structures
   */
  checkNewUnlocks() {
    // Re-render cards that might have unlocked
    for (let [key, card] of this.cards.entries()) {
      card.update();
    }
  }
  
  /**
   * Get realm display name
   */
  getRealmName(realmId) {
    const names = {
      forest: 'Forest Realm',
      volcano: 'Volcanic Realm'
    };
    return names[realmId] || realmId;
  }
  
  /**
   * Destroy UI
   */
  destroy() {
    for (let card of this.cards.values()) {
      card.destroy();
    }
    this.cards.clear();
  }
}


export default StructuresUI;
