/**
 * Notification Configuration - ce notificări să apară
 */

export const NOTIFICATION_CONFIG = {
  // Achievements - ÎNTOTDEAUNA
  achievement: {
    enabled: true,
    priority: 4,
    duration: 5000,
    showOnMobile: true
  },
  
  // Ascension - ÎNTOTDEAUNA
  ascension: {
    enabled: true,
    priority: 4,
    duration: 8000,
    showOnMobile: true
  },
  
  // Quest completat - DA
  questCompleted: {
    enabled: true,
    priority: 3,
    duration: 3000,
    showOnMobile: true
  },
  
  // Quest claimed - NU pe mobile (vezi în badge)
  questClaimed: {
    enabled: true,
    priority: 2,
    duration: 2000,
    showOnMobile: false
  },
  
  // Daily Reward - DA
  dailyReward: {
    enabled: true,
    priority: 3,
    duration: 4000,
    showOnMobile: true
  },
  
  // Upgrade completat - NU pe mobile (prea multe)
  upgradeCompleted: {
    enabled: true,
    priority: 2,
    duration: 2000,
    showOnMobile: false
  },
  
  // Structure purchased - NU niciodată (prea des)
  structurePurchased: {
    enabled: false,
    priority: 1,
    duration: 1500,
    showOnMobile: false
  },
  
  // Save game - NU niciodată
  gameSaved: {
    enabled: false,
    priority: 0,
    duration: 1000,
    showOnMobile: false
  },
  
  // Offline progress - DA
  offlineProgress: {
    enabled: true,
    priority: 3,
    duration: 5000,
    showOnMobile: true
  },
  
  // Critical hit - NU (prea des)
  criticalHit: {
    enabled: false,
    priority: 1,
    duration: 1500,
    showOnMobile: false
  },
  
  // Lucky gems - DA (e rar)
  luckyGems: {
    enabled: true,
    priority: 3,
    duration: 3000,
    showOnMobile: true
  }
};

/**
 * Check if notification should be shown
 */
export function shouldShowNotification(notificationType) {
  const config = NOTIFICATION_CONFIG[notificationType];
  if (!config || !config.enabled) return false;
  
  const isMobile = window.innerWidth <= 768;
  if (isMobile && ! config.showOnMobile) return false;
  
  return true;
}