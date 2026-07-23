/**
 * TabManager - Handles tab switching (desktop + mobile bottom nav + more menu)
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class TabManager {
  constructor() {
    this.currentTab = 'structures';
    this.desktopTabs = document.querySelectorAll('.desktop-tabs .tab-btn');
    this.bottomNavBtns = document.querySelectorAll('.bottom-nav-btn');
    this.moreMenuItems = document.querySelectorAll('.more-menu-item');
    this.panels = document.querySelectorAll('.tab-panel');
    this.moreMenuOverlay = document.getElementById('more-menu-overlay');
    this.moreMenuBtn = document.getElementById('more-menu-btn');
    this.moreMenuClose = document.getElementById('more-menu-close');
    
    this.init();
    
    logger.info('TabManager', 'Initialized');
  }
  
  init() {
    // Desktop tabs
    this.desktopTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
    
    // Bottom nav buttons
    this.bottomNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        if (tabName === 'more') {
          this.openMoreMenu();
        } else {
          this.switchTab(tabName);
        }
      });
    });
    
    // More menu items
    this.moreMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        this.switchTab(item.dataset.tab);
        this.closeMoreMenu();
      });
    });
    
    // More menu close
    if (this.moreMenuClose) {
      this.moreMenuClose.addEventListener('click', () => this.closeMoreMenu());
    }
    
    // Close more menu on overlay click
    if (this.moreMenuOverlay) {
      this.moreMenuOverlay.addEventListener('click', (e) => {
        if (e.target === this.moreMenuOverlay) {
          this.closeMoreMenu();
        }
      });
    }
    
    // Listen for programmatic tab switches
    eventBus.on('tab:switch', (data) => {
      this.switchTab(data.tabName);
    });
  }
  
  switchTab(tabName) {
    if (this.currentTab === tabName) return;
    
    // Update desktop tabs
    this.desktopTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update bottom nav buttons
    this.bottomNavBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update panels
    this.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
    
    this.currentTab = tabName;
    
    logger.debug('TabManager', `Switched to tab: ${tabName}`);
    
    eventBus.emit('tab:switched', { tabName });
  }
  
  openMoreMenu() {
    if (this.moreMenuOverlay) {
      this.moreMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  closeMoreMenu() {
    if (this.moreMenuOverlay) {
      this.moreMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  getCurrentTab() {
    return this.currentTab;
  }
  
  // Update badge on bottom nav
  updateBottomBadge(tabName, count) {
    const badge = document.getElementById(`bottom-${tabName}-badge`);
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
    
    // Update "More" badge count
    this.updateMoreBadge();
  }
  
  // Update the "More" button badge with total count of all badges in More menu
  updateMoreBadge() {
    const moreBadge = document.getElementById('bottom-more-badge');
    if (!moreBadge) return;
    
    let totalCount = 0;
    
    // Check achievements badge in more menu
    const achBadge = document.getElementById('more-achievements-badge');
    if (achBadge && achBadge.style.display !== 'none') {
      totalCount += parseInt(achBadge.textContent) || 0;
    }
    
    // Add other badges from more menu if they exist
    // (bosses, puzzle, shop, statistics don't have badges currently)
    
    if (totalCount > 0) {
      moreBadge.textContent = totalCount;
      moreBadge.style.display = 'flex';
    } else {
      moreBadge.style.display = 'none';
    }
  }
  
  // Legacy method - update badge on desktop tab
  updateBadge(tabName, count) {
    const tab = Array.from(this.desktopTabs).find(t => t.dataset.tab === tabName);
    if (!tab) return;
    
    const badge = tab.querySelector('.tab-badge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
    
    // Also update bottom nav badge
    this.updateBottomBadge(tabName, count);
  }
}

export default TabManager;
