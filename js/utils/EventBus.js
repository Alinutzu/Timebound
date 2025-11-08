/**
 * EventBus - Pub/Sub Pattern
 * Permite comunicare decuplată între componente
 * 
 * Usage:
 *   eventBus.on('structure:purchased', (data) => { ... });
 *   eventBus.emit('structure:purchased', { key: 'solarPanel', level: 5 });
 */

import CONFIG from '../config.js';

class EventBus {
  constructor() {
    this.events = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Handler function
   * @param {object} context - Optional context for 'this'
   * @returns {function} Unsubscribe function
   */
  on(event, callback, context = null) {
  // --- START FIX PERMANENT ---
  // BLOCĂM ORICE ALT LISTENER PENTRU 'notification:show' DUPĂ CE PRIMUL S-A ÎNREGISTRAT
  if (event === 'notification:show' && this.events.has('notification:show')) {
    console.warn("🛡️ BLOCAT! Am prevenit înregistrarea listener-ului duplicat/problematic pentru 'notification:show'.");
    // Pur și simplu nu înregistrăm acest al doilea listener și returnăm o funcție goală.
    return () => {};
  }
  // --- SFÂRȘIT FIX PERMANENT ---

  if (!this.events.has(event)) {
    this.events.set(event, []);
  }

  const handler = { callback, context };
  this.events.get(event).push(handler);

  // Returnează o funcție de dezabonare
  return () => {
    this.off(event, callback);
  };
}

  
  /**
   * Unsubscribe from event
   */
  off(event, callback) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    const index = handlers.findIndex(h => h.callback === callback);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    // Cleanup empty event arrays
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }
  
  /**
   * Emit an event
   */
  emit(event, data = null) {
    // Log in debug mode
    if (CONFIG.DEBUG_MODE && CONFIG.LOG_LEVEL === 'debug') {
      console.log(`[EventBus] ${event}`, data);
    }
    
    // Store in history
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now()
    });
    
    // Maintain history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    // Call handlers
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    handlers.forEach(({ callback, context }) => {
      try {
        callback.call(context, data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for '${event}':`, error);
      }
    });
  }
  
  /**
   * Remove all listeners for an event
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  /**
   * Get event history
   */
  getHistory(event = null) {
    if (event) {
      return this.eventHistory.filter(e => e.event === event);
    }
    return [...this.eventHistory];
  }
  
  /**
   * Debug info
   */
  debug() {
    console.log('[EventBus] Registered events:', Array.from(this.events.keys()));
    console.log('[EventBus] Recent history:', this.eventHistory.slice(-10));
  }
}

// Singleton instance
const eventBus = new EventBus();


export default eventBus;
