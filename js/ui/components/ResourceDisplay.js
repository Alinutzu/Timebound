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
      <div class="resource-display" id="resource-display"></div>
    `;
    
    this.update();
  }
  
  /**
   * Update display
   */
  update() {
    const state = stateManager.getState();
    const display = document.getElementById('resource-display');
    if (!display) return;
    
    const resources = [
      { key: 'energy', icon: '⚡', label: 'Energy', show: true },
      { key: 'mana', icon: '✨', label: 'Mana', show: true },
      { key: 'gems', icon: '💎', label: 'Gems', show: true, noBar: true, noRate: true },
      { key: 'crystals', icon: '💠', label: 'Crystals', show: state.resources.crystals > 0 || state.ascension.level > 0, noBar: true, noRate: true },
      { key: 'volcanicEnergy', icon: '🌋', label: 'Volcanic', show: state.realms.unlocked.includes('volcano') },
      { key: 'tidalEnergy', icon: '🌊', label: 'Tidal', show: state.realms.unlocked.includes('ocean') },
      { key: 'solarEssence', icon: '☀️', label: 'Solar', show: state.realms.unlocked.includes('desert') },
      { key: 'cryoEnergy', icon: '❄️', label: 'Cryo', show: state.realms.unlocked.includes('tundra') },
      { key: 'cosmicEnergy', icon: '🌌', label: 'Cosmic', show: state.realms.unlocked.includes('cosmos') }
    ];
    
    let html = '';
    for (const res of resources) {
      if (!res.show) continue;
      
      const amount = state.resources[res.key] || 0;
      const cap = state.caps[res.key];
      const rate = state.production[res.key];
      
      const amountText = cap != null
        ? `${Formatters.formatNumber(amount)} / ${Math.floor(cap).toLocaleString()}`
        : Formatters.formatNumber(amount);
      
      const rateText = rate != null ? `${Formatters.formatNumber(rate)}/s` : '';
      const barPercent = cap ? Math.min((amount / cap) * 100, 100) : 0;
      const barColor = barPercent >= 100 ? '#ef4444' : barPercent >= 80 ? '#f59e0b' : '#10b981';
      
      html += `
        <div class="resource-item">
          <span class="resource-icon">${res.icon}</span>
          <div class="resource-info">
            <div class="resource-amount">${amountText}</div>
            ${rateText ? `<div class="resource-rate" style="color: ${rate > 0 ? '#10b981' : '#6b7280'}">${rateText}</div>` : ''}
          </div>
          ${barPercent > 0 && !res.noBar ? `
            <div class="resource-bar">
              <div class="resource-bar-fill" style="width: ${barPercent}%; background-color: ${barColor}"></div>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    display.innerHTML = html;
  }
}

export default ResourceDisplay;