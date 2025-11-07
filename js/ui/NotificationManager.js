/**
 * NotificationManager - Displays toast notifications
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class NotificationManager {
  constructor() {
    this.container = document.getElementById('notification-container');
    this.notifications = [];
    this.maxNotifications = 5;
    
    this.init();
    
    logger.info('NotificationManager', 'Initialized');
  }
  
  init() {
    if (!this.container) {
      logger.error('NotificationManager', 'Notification container not found');
      return;
    }
    
    // Listen for notification events
    eventBus.on('notification:show', (data) => {
      this.show(data);
    });
  }
  
  show(data) {
    const {
      title = '',
      message = '',
      description = '',
      type = 'info',
      duration = 3000
    } = data;
    
    // Remove oldest if at max
    if (this.notifications.length >= this.maxNotifications) {
      this.remove(this.notifications[0]);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.animationDuration = `${duration}ms`;
    
    // Create content
    let content = '';
    
    if (title) {
      content += `
        <div class="notification-header">
          <h4 class="notification-title">${title}</h4>
          <button class="notification-close">&times;</button>
        </div>
      `;
    }
    
    if (message) {
      content += `<p class="notification-message">${message}</p>`;
    }
    
    if (description) {
      content += `<p class="notification-description">${description}</p>`;
    }
    
    notification.innerHTML = content;
    
    // Add to container
    this.container.appendChild(notification);
    this.notifications.push(notification);
    
    // Bind close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.remove(notification);
      });
    }
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, duration);
    }
    
    logger.debug('NotificationManager', `Showing ${type} notification: ${message}`);
  }
  
  remove(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.classList.add('closing');
    
    setTimeout(() => {
      notification.remove();
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300);
  }
  
  clear() {
    this.notifications.forEach(notification => {
      notification.remove();
    });
    this.notifications = [];
  }
}

export default NotificationManager;