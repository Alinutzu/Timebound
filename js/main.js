/**
 * Main Entry Point
 * Initializes the game and binds UI
 */

import CONFIG from './config.js';
import game from './core/Game.js';
//import eventBus from './utils/EventBus.js';
import eventBus from './utils/EventBus.js';
import notificationHelper from './utils/NotificationHelper.js';
import './systems/NotificationManager.js'; // Inițializează
import logger from './utils/Logger.js';
import stateManager from './core/StateManager.js';
import resourceApi from './api/ResourceAPI.js';
import Formatters from './utils/Formatters.js';
import miniGameAchievementSystem from './systems/MiniGameAchievementSystem.js'; // ✅ ADĂUGAT

// UI Managers
import ResourceDisplay from './ui/components/ResourceDisplay.js';
import StructuresUI from './ui/StructuresUI.js';
import UpgradesUI from './ui/UpgradesUI.js';
import GuardiansUI from './ui/GuardiansUI.js';
import QuestsUI from './ui/QuestsUI.js';
import AchievementsUI from './ui/AchievementsUI.js';
import BossesUI from './ui/BossesUI.js';
import ShopUI from './ui/ShopUI.js';
import ArenaUI from './ui/ArenaUI.js';
import StatisticsUI from './ui/StatisticsUI.js';
import DailyRewardUI from './ui/DailyRewardUI.js';
import AutomationUI from './ui/AutomationUI.js';
import PuzzleUI from './ui/PuzzleUI.js';
import badgeManager from './ui/BadgeManager.js';
import confirmModal from './ui/ConfirmModal.js';


// Component Managers
import NotificationManager from './ui/NotificationManager.js';
import ModalManager from './ui/ModalManager.js';
import TabManager from './ui/TabManager.js';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

/**
 * Initialize application
 */
async function initApp() {
    logger.info('Main', 'Starting application...');
    
    // Show loading screen
    showLoadingScreen();
    
    try {
        // Simulate loading delay
        await sleep(1000);
        
        // Initialize game
        await game.init();
        
        // ✅ ADĂUGAT - Initialize mini-game achievement system
        miniGameAchievementSystem.init();
        logger.info('Main', '✅ Mini-game achievement system initialized');
        
        // Initialize UI
        initUI();
        
        // Bind global events
        bindGlobalEvents();
        
        // Hide loading screen
        hideLoadingScreen();
        
        // Show game container
        document.getElementById('game-container').style.display = 'flex';
        
        logger.info('Main', '✅ Application started successfully!');
        
        // Check for tutorial
        setTimeout(() => {
            checkTutorial();
        }, 1000);
        
        // Check for offline progress
        checkOfflineProgress();
        
        // Check for daily reward
        setTimeout(() => {
            checkDailyReward();
        }, 2000);
        
    } catch (error) {
        logger.error('Main', 'Failed to initialize:', error);
        showError('Failed to load game. Please refresh the page.');
    }
}

/**
 * Show loading screen with progress
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const progress = document.getElementById('loading-progress');
    
    let currentProgress = 0;
    const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
        }
        progress.style.width = `${currentProgress}%`;
    }, 200);
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 300);
}

/**
 * Initialize UI components
 */
function initUI() {
    logger.info('Main', 'Initializing UI...');
    
    // Initialize resource display
    new ResourceDisplay('resource-display');
    
    // Initialize tab manager
    const tabManager = new TabManager();
    
    // Initialize modal manager
    const modalManager = new ModalManager();
    
    // Initialize notification manager
    const notificationManager = new NotificationManager();
    
    // Initialize tab content
    new StructuresUI('structures-container');
    new UpgradesUI('upgrades-container');
    new GuardiansUI('guardians-container');
    new QuestsUI('quests-container');
    new AchievementsUI('achievements-container');
    new BossesUI('bosses-container');
    new PuzzleUI('puzzle-game-container');
    new ShopUI('shop-container');
    new StatisticsUI('statistics-container');
    new ArenaUI('arena-container');
    
    // Update last save time
    updateLastSaveTime();
    setInterval(updateLastSaveTime, 1000);
    
    logger.info('Main', '✅ UI initialized');
}

/**
 * Bind global events
 */
function bindGlobalEvents() {
    // Settings button
    document.getElementById('settings-btn')?.addEventListener('click', () => {
        eventBus.emit('modal:show', { modalId: 'settings-modal' });
    });
    
    // Save button
    document.getElementById('save-btn')?.addEventListener('click', () => {
        game.save();
        showNotification('Game saved!', 'success');
    });
    
    // Ascension button
    document.getElementById('ascension-btn')?.addEventListener('click', () => {
        const ascensionSystem = game.getSystem('ascension');
        const canAscend = ascensionSystem.canAscend();
        
        if (canAscend.can) {
            eventBus.emit('modal:show', { modalId: 'ascension-modal' });
        } else {
            showNotification(`Need ${Formatters.formatNumber(canAscend.remaining)} more energy`, 'warning');
        }
    });
    
    // Automation button
    document.getElementById('automation-btn')?.addEventListener('click', () => {
        eventBus.emit('modal:show', { modalId: 'automation-modal' });
    });
    
    // Daily reward button
    document.getElementById('daily-reward-btn')?.addEventListener('click', () => {
        eventBus.emit('modal:show', { modalId: 'daily-reward-modal' });
    });
    
    document.querySelectorAll('.tab-btn, .bottom-nav-btn, .more-menu-item').forEach(btn => {
     btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    if (tabName && tabName !== 'more') {
      badgeManager.clearBadgeOnTabClick(tabName);
    }
     });
    });

    // Settings modal bindings
    bindSettingsModal();
    
    // Listen for game events
    eventBus.on('game:saved', () => {
        showNotification('Progress saved', 'success', 2000);
    });
    
    eventBus.on('notification:show', (data) => {
        showNotification(data.message, data.type || 'info', data.duration);
    });
}

/**
 * Bind settings modal events
 */
function bindSettingsModal() {
    // Theme change
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
        stateManager.dispatch({
            type: 'UPDATE_SETTING',
            payload: { key: 'theme', value: theme }
        });
    });
    
    // Sound toggle
    document.getElementById('sound-enabled')?.addEventListener('change', (e) => {
        stateManager.dispatch({
            type: 'UPDATE_SETTING',
            payload: { key: 'soundEnabled', value: e.target.checked }
        });
    });
    
    // Music toggle
    document.getElementById('music-enabled')?.addEventListener('change', (e) => {
        stateManager.dispatch({
            type: 'UPDATE_SETTING',
            payload: { key: 'musicEnabled', value: e.target.checked }
        });
    });
    
    // Export save
    document.getElementById('export-save-btn')?.addEventListener('click', () => {
        game.exportSave();
        showNotification('Save exported!', 'success');
    });
    
    // Import save
    document.getElementById('import-save-btn')?.addEventListener('click', () => {
        document.getElementById('import-save-input').click();
    });
    
    document.getElementById('import-save-input')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const success = await game.importSave(file);
            if (success) {
                showNotification('Save imported! Reloading...', 'success');
                setTimeout(() => location.reload(), 2000);
            } else {
                showNotification('Failed to import save', 'error');
            }
        }
    });
    
    // Reset game
    document.getElementById('reset-game-btn')?.addEventListener('click', () => {
  confirmModal.show({
    title: 'Reset Game',
    message: 'Are you ABSOLUTELY SURE? This will delete ALL progress forever!',
    danger: true,
    onConfirm: () => {
      // Double confirmation
      confirmModal.show({
        title: 'Final Warning',
        message: 'LAST CHANCE! This action cannot be undone.  All structures, upgrades, guardians, and progress will be lost! ',
        danger: true,
        onConfirm: () => {
          game.reset();
          showNotification('Game reset complete', 'info');
          setTimeout(() => location.reload(), 1000);
        }
      });
    }
  });
});
}

/**
 * Check tutorial
 */
function checkTutorial() {
    const tutorialSystem = game.getSystem('tutorial');
    const state = stateManager.getState();
    
    if (!state.tutorial.completed && !state.tutorial.skipped) {
        // Tutorial will auto-start via TutorialSystem
    }
}

/**
 * Check offline progress
 */
function checkOfflineProgress() {
    const state = stateManager.getState();
    
    if (state.offlineProgress && state.offlineProgress.resources) {
        // Show offline modal
        setTimeout(() => {
            showOfflineModal(state.offlineProgress);
        }, 1500);
    }
}

/**
 * Check daily reward
 */
function checkDailyReward() {
    const dailyRewardSystem = game.getSystem('dailyReward');
    const canClaim = dailyRewardSystem.canClaim();
    
    if (canClaim.can) {
        // Show notification
        showNotification('Daily reward available!', 'info', 5000);
        
        // Add badge to button
        const btn = document.getElementById('daily-reward-btn');
        if (btn && !btn.querySelector('.badge')) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = '!';
            btn.appendChild(badge);
        }
    }
}

/**
 * Show offline modal
 */
function showOfflineModal(offlineData) {
    const modal = document.getElementById('offline-modal');
    if (!modal) return;
    
    // Update content
    document.getElementById('offline-time').textContent = 
        Formatters.formatTime(offlineData.timeOffline);
    
    const rewardsEl = document.getElementById('offline-rewards');
    rewardsEl.innerHTML = '';
    
    for (let [resource, amount] of Object.entries(offlineData.resources)) {
        if (amount > 0) {
            const div = document.createElement('div');
            div.textContent = Formatters.formatWithSuffix(amount, resource);
            div.style.fontSize = '1.25rem';
            div.style.fontWeight = '600';
            div.style.marginBottom = 'var(--spacing-sm)';
            rewardsEl.appendChild(div);
        }
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Collect button
    document.getElementById('offline-collect-btn').onclick = () => {
        modal.classList.remove('active');
    };
}

/**
 * Update last save time
 */
function updateLastSaveTime() {
    const state = stateManager.getState();
    const lastSaved = state.lastSaved;
    const element = document.getElementById('last-save-time');
    
    if (!element) return;
    
    if (!lastSaved) {
        element.textContent = 'Last saved: Never';
        return;
    }
    
    const timeSince = Date.now() - lastSaved;
    
    if (timeSince < 60000) {
        element.textContent = 'Last saved: Just now';
    } else {
        element.textContent = `Last saved: ${Formatters.formatRelativeTime(lastSaved)}`;
    }
}

/**
 * Show notification (helper)
 */
function showNotification(message, type = 'info', duration = 3000) {
    eventBus.emit('notification:show', {
        message,
        type,
        duration
    });
}

/**
 * Show error
 */
function showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.innerHTML = `
        <div class="loading-content">
            <h2 style="color: var(--danger);">❌ Error</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                Reload Page
            </button>
        </div>
    `;
}

/**
 * Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Make game available globally in debug/cheat mode
if (CONFIG.DEBUG_MODE || CONFIG.ENABLE_CHEATS) {
    window.game = game;
    window.eventBus = eventBus;
    window.stateManager = stateManager;
    window.logger = logger;
    
    // Cheat commands — uses ResourceAPI
    window.cheat = {
        addEnergy: (amount = 1000000) => {
            resourceApi.add('energy', amount);
            console.log(`⚡ +${amount} energy`);
        },
        addGems: (amount = 10000) => {
            resourceApi.add('gems', amount);
            console.log(`💎 +${amount} gems`);
        },
        addCrystals: (amount = 100) => {
            resourceApi.add('crystals', amount);
            console.log(`💠 +${amount} crystals`);
        },
        addMana: (amount = 5000) => {
            resourceApi.add('mana', amount);
            console.log(`✨ +${amount} mana`);
        },
        maxResources: () => {
            resourceApi.add('energy', 10000000);
            resourceApi.add('gems', 100000);
            resourceApi.add('crystals', 10000);
            resourceApi.add('mana', 100000);
            console.log('🎮 All resources maxed!');
        },
        freeSpins: () => {
            stateManager.dispatch({
                type: 'UPDATE_MINI_GAME',
                payload: { game: 'dailySpin', data: { lastSpinDate: '' } }
            });
            console.log('🎡 Spin reset — free spin available!');
        },
        unlockAll: () => {
            console.log('Unlocking all features...');
        },
        ascend: () => {
            const ascensionSystem = game.getSystem('ascension');
            ascensionSystem.confirmAscend();
        }
    };
    
    console.log('%c🎮 Debug Mode Active', 'font-size: 20px; font-weight: bold; color: #10b981;');
    console.log('%cAvailable commands:', 'font-size: 14px; color: #3b82f6;');
    console.log('  cheat.addEnergy(1000000)');
    console.log('  cheat.addGems(10000)');
    console.log('  cheat.addCrystals(100)');
    console.log('  cheat.addMana(5000)');
    console.log('  cheat.maxResources() — all at once');
    console.log('  cheat.freeSpins() — reset daily spin');
    console.log('  cheat.ascend()');
}

// ===== MOBILE SWIPE GESTURES (OPȚIONAL) =====
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  // Disable swipe on mobile — bottom nav is the primary navigation
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav && getComputedStyle(bottomNav).display !== 'none') return;
  
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) < 50) return; // Minimum swipe distance
  
  // Use desktop tabs for swipe order (source of truth)
  const activeTab = document.querySelector('.desktop-tabs .tab-btn.active');
  const allTabs = Array.from(document.querySelectorAll('.desktop-tabs .tab-btn'));
  const currentIndex = allTabs.indexOf(activeTab);
  
  if (diff < 0 && currentIndex < allTabs.length - 1) {
    // Swipe left - next tab
    allTabs[currentIndex + 1].click();
  } else if (diff > 0 && currentIndex > 0) {
    // Swipe right - previous tab
    allTabs[currentIndex - 1].click();
  }
}
// ===== SFÂRȘIT SWIPE GESTURES =====

// ===== HAPTIC FEEDBACK (OPȚIONAL) =====
function vibrate(pattern = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Vibrație la click pe buttons
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn') || e.target.closest('.tab-btn')) {
    vibrate(10);
  }
});
// ===== SFÂRȘIT HAPTIC FEEDBACK =====
