/**
 * StructuresUI - Manages the structures tab
 */

import structureSystem from '../systems/StructureSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import StructureCard from './components/StructureCard.js';
import Formatters from '../utils/Formatters.js';
import realmSystem from '../systems/RealmSystem.js';

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
    
    eventBus.on('state:UNLOCK_REALM', () => {
      this.render();
    });
    
    // Update when structures unlocked
    eventBus.on('structure:purchased', () => {
      this.checkNewUnlocks();
    });
    
    // Delegate realm button clicks
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.realm-btn');
      if (btn) {
        const realmId = btn.dataset.realm;
        if (realmSystem.isUnlocked(realmId)) {
          realmSystem.switchTo(realmId);
        } else {
          const result = realmSystem.unlock(realmId);
          if (!result) {
            const state = stateManager.getState();
            const realm = realmSystem.getRealm(realmId);
            const cost = realm?.unlockCost?.crystals;
            if (cost && state.resources.crystals < cost) {
              eventBus.emit('notification:show', {
                type: 'warning',
                message: `Need ${cost} 💠 to unlock ${realm.name}`
              });
            } else {
              eventBus.emit('notification:show', {
                type: 'warning',
                message: `Requirements not met for ${realm?.name || realmId}`
              });
            }
          }
        }
      }
    });
  }
  
  /**
   * Render structures tab
   */
  render() {
    // Clear existing
    this.container.innerHTML = '';
    this.cards.clear();
    
    const state = stateManager.getState();
    const currentRealm = state.realms.current;
    
    // Realm selector
    const selector = this.renderRealmSelector(state, currentRealm);
    this.container.appendChild(selector);
    
    // Get structures for current realm
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
    const tiers = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    
    for (let [key, data] of Object.entries(structures)) {
      tiers[data.tier].push(key);
    }
    
    // Render by tier
    for (let tier of [1, 2, 3, 4, 5]) {
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
  
  renderRealmSelector(state, currentRealm) {
    const container = document.createElement('div');
    container.className = 'realm-selector';
    
    const realmOrder = ['forest', 'volcano', 'ocean', 'desert', 'tundra', 'cosmos'];
    
    for (const id of realmOrder) {
      const realm = realmSystem.getRealm(id);
      if (!realm) continue;
      
      const btn = document.createElement('button');
      btn.className = 'realm-btn';
      if (currentRealm === id) btn.classList.add('active');
      if (!state.realms.unlocked.includes(id)) btn.classList.add('locked');
      btn.dataset.realm = id;
      
      if (state.realms.unlocked.includes(id)) {
        btn.textContent = `${realm.emoji || ''} ${realm.name}`;
      } else {
        btn.innerHTML = `${realm.emoji || ''} ${realm.name}`;
        if (realm.unlockCost) {
          const costEntry = Object.entries(realm.unlockCost)[0];
          if (costEntry) {
            const span = document.createElement('span');
            span.className = 'unlock-cost';
            span.textContent = `${costEntry[1]} 💠`;
            btn.appendChild(span);
          }
        }
      }
      
      container.appendChild(btn);
    }
    
    return container;
  }
  
  /**
   * Render production summary
   */
  renderSummary() {
    const state = stateManager.getState();
    
    const summary = document.createElement('div');
    summary.className = 'structures-summary';
    summary.id = 'structures-summary';
    
    const resourceCards = [
      { key: 'energy', label: '⚡ Energy', production: state.production.energy },
      { key: 'mana', label: '✨ Mana', production: state.production.mana },
      { key: 'volcanicEnergy', label: '🌋 Volcanic', production: state.production.volcanicEnergy, realm: 'volcano' },
      { key: 'tidalEnergy', label: '🌊 Tidal', production: state.production.tidalEnergy, realm: 'ocean' },
      { key: 'solarEssence', label: '🏜️ Solar', production: state.production.solarEssence, realm: 'desert' },
      { key: 'cryoEnergy', label: '❄️ Cryo', production: state.production.cryoEnergy, realm: 'tundra' },
      { key: 'cosmicEnergy', label: '🌌 Cosmic', production: state.production.cosmicEnergy, realm: 'cosmos' }
    ];
    
    for (const rc of resourceCards) {
      if (rc.realm && !state.realms.unlocked.includes(rc.realm)) continue;
      const card = document.createElement('div');
      card.className = 'summary-card';
      card.innerHTML = `
        <h4>${rc.label} Production</h4>
        <p class="summary-value">${Formatters.formatNumber(rc.production)}/s</p>
      `;
      summary.appendChild(card);
    }
    
    const statsCard = document.createElement('div');
    statsCard.className = 'summary-card';
    statsCard.innerHTML = `
      <h4>📊 Total Structures</h4>
      <p class="summary-value">${structureSystem.getStats().totalStructures}</p>
    `;
    summary.appendChild(statsCard);
    
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
      volcano: 'Volcanic Realm',
      ocean: 'Ocean Depths',
      desert: 'Desert Expanse',
      tundra: 'Frozen Tundra',
      cosmos: 'Cosmic Expanse'
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
