/**
 * UpgradeQueueDisplay - Shows upgrade queue status
 */

import upgradeQueueSystem from '../../systems/UpgradeQueueSystem.js';
import upgradeSystem from '../../systems/UpgradeSystem.js';
import eventBus from '../../utils/EventBus.js';
import Formatters from '../../utils/Formatters.js';

class UpgradeQueueDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`UpgradeQueueDisplay: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
    this.startUpdateLoop();
  }
  
  subscribe() {
    eventBus.on('upgrade:started', () => this.update());
    eventBus.on('upgrade:completed', () => this.update());
    eventBus.on('upgrade:queued', () => this.update());
    eventBus.on('upgrade:cancelled', () => this.update());
    eventBus.on('upgrade:sped-up', () => this.update());
  }
  
  render() {
    this.container.innerHTML = `
      <div class="upgrade-queue-panel">
        <div class="queue-header">
          <h3>🔬 Upgrade Queue</h3>
          <button class="btn btn-small" id="upgrade-queue-slots-btn">
            Upgrade Slots (1000 💎)
          </button>
        </div>
        
        <div id="active-upgrade-section">
          <!-- Active upgrade will appear here -->
        </div>
        
        <div id="queued-upgrades-section">
          <!-- Queued upgrades will appear here -->
        </div>
      </div>
    `;
    
    this.update();
    
    // Attach listeners
    const slotsBtn = document.getElementById('upgrade-queue-slots-btn');
    if (slotsBtn) {
      slotsBtn.addEventListener('click', () => {
        upgradeQueueSystem.upgradeQueueSlots();
      });
    }
  }
  
  update() {
    const queueInfo = upgradeQueueSystem.getQueueInfo();
    
    this.updateActiveUpgrade(queueInfo.active);
    this.updateQueue(queueInfo.queue, queueInfo.slots);
  }
  
  updateActiveUpgrade(activeUpgrade) {
    const section = document.getElementById('active-upgrade-section');
    if (!section) return;
    
    if (!activeUpgrade) {
      section.innerHTML = `
        <div class="no-active-upgrade">
          <p>No upgrade in progress</p>
          <p class="text-secondary">Purchase an upgrade to start</p>
        </div>
      `;
      return;
    }
    
    const upgrade = upgradeSystem.getUpgrade(activeUpgrade.upgradeKey);
    const remainingTime = upgradeQueueSystem.getRemainingTime();
    const progress = upgradeQueueSystem.getProgress();
    
    section.innerHTML = `
      <div class="active-upgrade-card">
        <div class="upgrade-header">
          <span class="upgrade-emoji">${upgrade.emoji}</span>
          <div class="upgrade-info">
            <h4>${upgrade.name}</h4>
            <p>Level ${activeUpgrade.targetLevel - 1} → ${activeUpgrade.targetLevel}</p>
          </div>
        </div>
        
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" id="queue-progress-fill" style="width: ${progress}%"></div>
          </div>
          <p class="time-remaining" id="queue-time-remaining">
            ${Formatters.formatTime(remainingTime)} remaining
          </p>
        </div>
        
        <div class="upgrade-actions">
          <button class="btn btn-warning btn-speed-up" id="speed-up-btn">
            ⚡ Speed Up (${this.calculateSpeedUpCost(remainingTime)} 💎)
          </button>
        </div>
      </div>
    `;
    
    // Attach speed up listener
    const speedUpBtn = document.getElementById('speed-up-btn');
    if (speedUpBtn) {
      speedUpBtn.addEventListener('click', () => {
        if (confirm('Speed up this upgrade with gems?')) {
          upgradeQueueSystem.speedUp();
        }
      });
    }
  }
  
  updateQueue(queue, slots) {
    const section = document.getElementById('queued-upgrades-section');
    if (!section) return;
    
    if (queue.length === 0) {
      section.innerHTML = `
        <div class="queue-empty">
          <p>Queue: 0/${slots}</p>
        </div>
      `;
      return;
    }
    
    let html = `<div class="queue-header"><h4>Queued (${queue.length}/${slots})</h4></div>`;
    
    queue.forEach((item, index) => {
      const upgrade = upgradeSystem.getUpgrade(item.upgradeKey);
      
      html += `
        <div class="queued-upgrade-item">
          <span class="queue-position">#${index + 1}</span>
          <span class="upgrade-emoji">${upgrade.emoji}</span>
          <div class="upgrade-info">
            <p class="upgrade-name">${upgrade.name}</p>
            <p class="upgrade-duration">
              ${Formatters.formatTime(item.duration)}
            </p>
          </div>
          <button class="btn btn-small btn-danger" onclick="cancelQueuedUpgrade('${item.upgradeKey}')">
            ❌
          </button>
        </div>
      `;
    });
    
    section.innerHTML = html;
  }
  
  calculateSpeedUpCost(remainingTime) {
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    return Math.max(10, remainingMinutes);
  }
  
  startUpdateLoop() {
    setInterval(() => {
      const timeEl = document.getElementById('queue-time-remaining');
      if (timeEl) {
        const remainingTime = upgradeQueueSystem.getRemainingTime();
        timeEl.textContent = `${Formatters.formatTime(remainingTime)} remaining`;
      }
      
      const progressFill = document.getElementById('queue-progress-fill');
      if (progressFill) {
        const progress = upgradeQueueSystem.getProgress();
        progressFill.style.width = `${progress}%`;
      }
    }, 1000);
  }
}

// Global function for cancel button
window.cancelQueuedUpgrade = (upgradeKey) => {
  if (confirm('Cancel this upgrade? Resources will be refunded.')) {
    upgradeQueueSystem.cancelQueuedUpgrade(upgradeKey);
  }
};

export default UpgradeQueueDisplay;