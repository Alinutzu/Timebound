/**
 * AscensionUI - Ascension/Prestige modal
 */

import ascensionSystem from '../systems/AscensionSystem.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';

class AscensionUI {
  constructor() {
    this.init();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('modal:shown', (data) => {
      if (data.modalId === 'ascension-modal') {
        this.render();
      }
    });
  }
  
  init() {
    // Bind confirm button when modal is created
    setTimeout(() => {
      const confirmBtn = document.getElementById('ascension-confirm-btn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          this.confirmAscension();
        });
      }
    }, 1000);
  }
  
  render() {
    const container = document.getElementById('ascension-preview');
    if (!container) return;
    
    const preview = ascensionSystem.getAscensionPreview();
    
    container.innerHTML = `
      <div class="ascension-info">
        <div class="ascension-level">
          Level ${preview.currentLevel} → ${preview.newLevel}
        </div>
        <div class="ascension-crystals">
          +${preview.crystalsEarned} 💠 Crystals
        </div>
        <p>Total Crystals: ${preview.totalCrystals} 💠</p>
      </div>
      
      <div class="ascension-bonuses">
        <h3>✨ Permanent Bonuses</h3>
        <div class="bonus-grid">
          <div class="bonus-item">
            <div class="bonus-label">Production</div>
            <div class="bonus-value">
              ${Formatters.formatPercent(preview.bonuses.production.current - 1)}
              <span class="bonus-arrow">→</span>
              ${Formatters.formatPercent(preview.bonuses.production.new - 1)}
            </div>
          </div>
          
          <div class="bonus-item">
            <div class="bonus-label">Capacity</div>
            <div class="bonus-value">
              ${Formatters.formatPercent(preview.bonuses.capacity.current - 1)}
              <span class="bonus-arrow">→</span>
              ${Formatters.formatPercent(preview.bonuses.capacity.new - 1)}
            </div>
          </div>
        </div>
      </div>
      
      <div class="ascension-warning">
        <h4>⚠️ You Will Lose:</h4>
        <ul>
          <li>All Energy (${Formatters.formatNumber(preview.willLose.energy)})</li>
          <li>All Mana (${Formatters.formatNumber(preview.willLose.mana)})</li>
          <li>All Structure Levels (${preview.willLose.structures} total)</li>
          <li>All Upgrade Levels (${preview.willLose.upgrades} total)</li>
          ${preview.willLose.volcanicEnergy > 0 ? 
            `<li>All Volcanic Energy (${Formatters.formatNumber(preview.willLose.volcanicEnergy)})</li>` 
            : ''}
        </ul>
      </div>
      
      <div class="ascension-keep">
        <h4>✅ You Will Keep:</h4>
        <ul>
          <li>All Gems (${Formatters.formatNumber(preview.willKeep.gems)})</li>
          <li>All Crystals (${preview.willKeep.crystals})</li>
          <li>All Guardians (${preview.willKeep.guardians})</li>
          <li>All Achievements (${preview.willKeep.achievements})</li>
          <li>All Unlocked Realms (${preview.willKeep.realms})</li>
          <li>Boss Progress (${preview.willKeep.bossProgress} defeated)</li>
        </ul>
      </div>
      
      <div class="ascension-actions">
        <button class="btn btn-secondary" onclick="closeAscensionModal()">
          Cancel
        </button>
        <button class="btn btn-primary btn-large" id="ascension-confirm-btn">
          ✨ Ascend Now
        </button>
      </div>
    `;
  }
  
  confirmAscension() {
    if (!confirm('Are you ABSOLUTELY SURE you want to ascend? This will reset most of your progress!')) {
      return;
    }
    
    ascensionSystem.confirmAscend();
    eventBus.emit('modal:hide', { modalId: 'ascension-modal' });
  }
}

// Global close function
window.closeAscensionModal = () => {
  eventBus.emit('modal:hide', { modalId: 'ascension-modal' });
};

// Initialize
new AscensionUI();

export default AscensionUI;