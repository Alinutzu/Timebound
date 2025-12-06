/**
 * Wrapper pentru notificări - folosește configurarea
 */

import notificationManager from '../systems/NotificationManager.js';
import { shouldShowNotification, NOTIFICATION_CONFIG } from '../config/NotificationConfig.js';

export function showNotification(type, { title, message, description = '' }) {
  // Verifică dacă ar trebui să apară
  if (!shouldShowNotification(type)) {
    return;
  }
  
  const config = NOTIFICATION_CONFIG[type];
  
  notificationManager.show({
    type: config.priority >= 3 ? type : 'info',
    title,
    message,
    description,
    duration: config.duration
  });
}

// Export pentru compatibilitate
export default {
  show: showNotification,
  clear: () => notificationManager.clearAll()
};