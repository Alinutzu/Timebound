/**
 * TabManager - Handles tab switching
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class TabManager {
  constructor() {
    this.currentTab = 'structures';
    this.tabs = document.querySelectorAll('.tab-btn');
    this.panels = document.querySelectorAll('.tab-panel');
    
    this.init();
    
    logger.info('TabManager', 'Initialized');
  }
  
  init() {
    // Bind click events
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // Listen for programmatic tab switches
    eventBus.on('tab:switch', (data) => {
      this.switchTab(data.tabName);
    });
  }
  
  switchTab(tabName) {
    if (this.currentTab === tabName) return;
    
    // Update buttons
    this.tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Update panels
    this.panels.forEach(panel => {
      if (panel.id === `tab-${tabName}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
    
    this.currentTab = tabName;
    
    logger.debug('TabManager', `Switched to tab: ${tabName}`);
    
    eventBus.emit('tab:switched', { tabName });
  }
  
  getCurrentTab() {
    return this.currentTab;
  }
  
  updateBadge(tabName, count) {
    const tab = Array.from(this.tabs).find(t => t.dataset.tab === tabName);
    if (!tab) return;
    
    const badge = tab.querySelector('.tab-badge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

export default TabManager;