/**
 * AutomationUI - Automation features modal
 */

import automationSystem from '../systems/AutomationSystem.js';
import eventBus from '../utils/EventBus.js';

class AutomationUI {
  constructor() {
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('modal:shown', (data) => {
      if (data.modalId === 'automation-modal') {
        this.render();
      }
    });
    
    eventBus.on('automation:unlocked', () => this.render());
    eventBus.on('automation:toggled', () => this.render());
  }
  
  render() {
    const container = document.getElementById('automation-features');
    if (!container) return;
    
    const stats = automationSystem.getStats();
    
    container.innerHTML = `
      <div class="automation-summary">
        <p>${stats.totalUnlocked}/${Object.keys(stats.features).length} features unlocked</p>
        <p>${stats.totalEnabled} currently active</p>
      </div>
      
      ${Object.entries(stats.features).map(([key, feature]) => `
        <div class="automation-feature ${feature.unlocked ? 'unlocked' : 'locked'}">
          <div class="automation-header">
            <div class="automation-info">
              <h4>${feature.name}</h4>
              <p>${feature.description}</p>
            </div>
            
            ${!feature.unlocked ? `
              <div class="automation-cost">${feature.cost} 💎</div>
            ` : ''}
          </div>
          
          <div class="automation-actions">
            ${!feature.unlocked ? `
              <button class="btn btn-primary" onclick="unlockAutomation('${key}')">
                Unlock
              </button>
            ` : `
              <div class="automation-toggle">
                <input type="checkbox" 
                       id="auto-${key}" 
                       ${feature.enabled ? 'checked' : ''}
                       onchange="toggleAutomation('${key}')">
                <label for="auto-${key}">
                  ${feature.enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            `}
          </div>
        </div>
      `).join('')}
    `;
  }
}

// Global functions
window.unlockAutomation = (featureKey) => {
  automationSystem.unlock(featureKey);
};

window.toggleAutomation = (featureKey) => {
  automationSystem.toggle(featureKey);
};

// Initialize
new AutomationUI();

export default AutomationUI;