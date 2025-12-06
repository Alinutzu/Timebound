/**
 * NotificationManager - Smart notification filtering
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class NotificationManager {
  constructor() {
    this.container = document.getElementById('notification-container');
    this.queue = [];
    this.activeNotifications = [];
    this.maxNotifications = window.innerWidth <= 768 ? 2 : 4; // Max 2 pe mobile, 4 pe desktop
    
    // Prioritățile notificărilor
    this.priorities = {
      'critical': 5,      // Erori importante
      'achievement': 4,   // Achievement-uri
      'ascension': 4,     // Ascension
      'quest': 3,         // Quest completat
      'reward': 3,        // Daily reward
      'upgrade': 2,       // Upgrade completat
      'purchase': 1,      // Cumpărare structură
      'info': 0          // Info generală
    };
    
    // Cooldown pentru același tip de notificare
    this.cooldowns = {};
    this.cooldownTime = 3000; // 3 secunde între același tip
    
    this.subscribeToEvents();
    logger.info('NotificationManager', 'Initialized');
  }
  
  subscribeToEvents() {
    // Reascultă la resize pentru a ajusta maxNotifications
    window.addEventListener('resize', () => {
      this.maxNotifications = window.innerWidth <= 768 ? 2 : 4;
    });
  }
  
  /**
   * Show notification with smart filtering
   */
  show({ type = 'info', title, message, description = '', duration = 3000 }) {
    // Verifică cooldown
    if (this.isOnCooldown(type)) {
      logger.debug('NotificationManager', `Notification ${type} on cooldown, skipping`);
      return;
    }
    
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      description,
      duration,
      priority: this.priorities[type] || 0,
      timestamp: Date.now()
    };
    
    // Adaugă în queue
    this.queue.push(notification);
    this.setCooldown(type);
    
    // Procesează queue-ul
    this.processQueue();
  }
  
  /**
   * Process notification queue based on priority
   */
  processQueue() {
    // Sortează după prioritate
    this.queue. sort((a, b) => b.priority - a.priority);
    
    // Afișează doar dacă avem loc
    while (this.activeNotifications.length < this.maxNotifications && this.queue.length > 0) {
      const notification = this.queue.shift();
      this.displayNotification(notification);
    }
  }
  
  /**
   * Display notification DOM
   */
  displayNotification(notification) {
    const el = document.createElement('div');
    el.className = `notification ${notification.type}`;
    el.dataset.id = notification.id;
    
    // Construiește conținutul - MAI COMPACT pe mobile
    const isMobile = window.innerWidth <= 768;
    
    el.innerHTML = `
      <div class="notification-header">
        <h4 class="notification-title">${notification.title}</h4>
        <button class="notification-close" aria-label="Close">&times;</button>
      </div>
      <p class="notification-message">${notification.message}</p>
      ${! isMobile && notification.description ?  `<p class="notification-description">${notification.description}</p>` : ''}
    `;
    
    // Close button
    el.querySelector('.notification-close').addEventListener('click', () => {
      this.closeNotification(notification.id);
    });
    
    // Auto-close
    setTimeout(() => {
      this.closeNotification(notification.id);
    }, notification.duration);
    
    this.container.appendChild(el);
    this.activeNotifications.push(notification);
    
    logger.debug('NotificationManager', `Displayed: ${notification.title}`);
  }
  
  /**
   * Close notification
   */
  closeNotification(id) {
    const el = this.container.querySelector(`[data-id="${id}"]`);
    if (! el) return;
    
    el.classList.add('closing');
    
    setTimeout(() => {
      el.remove();
      this.activeNotifications = this.activeNotifications.filter(n => n.id !== id);
      
      // Procesează queue-ul din nou
      this.processQueue();
    }, 300);
  }
  
  /**
   * Cooldown management
   */
  isOnCooldown(type) {
    return this.cooldowns[type] && Date.now() - this.cooldowns[type] < this.cooldownTime;
  }
  
  setCooldown(type) {
    this.cooldowns[type] = Date.now();
  }
  
  /**
   * Clear all notifications
   */
  clearAll() {
    this.container.innerHTML = '';
    this. activeNotifications = [];
    this.queue = [];
  }
}

const notificationManager = new NotificationManager();

export default notificationManager;