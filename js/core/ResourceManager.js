/**
 * ResourceManager - Manages timeouts, intervals, and listeners
 * Prevents memory leaks by tracking and cleaning up resources
 */

import logger from '../utils/Logger.js';

class ResourceManager {
  constructor() {
    this.timeouts = new Set();
    this.intervals = new Set();
    this.animations = new Set();
    this.listeners = [];
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => this.cleanup());
    
    logger.info('ResourceManager', 'Initialized');
  }
  
  /**
   * Safe setTimeout with automatic tracking
   */
  setTimeout(callback, delay, debugLabel = '') {
    const timeoutId = setTimeout(() => {
      try {
        callback();
      } catch (error) {
        logger.error('ResourceManager', `Error in timeout ${debugLabel}:`, error);
      }
      this.timeouts.delete(timeoutId);
    }, delay);
    
    this.timeouts.add(timeoutId);
    
    if (debugLabel) {
      logger.debug('ResourceManager', `Timeout created: ${debugLabel}`);
    }
    
    return timeoutId;
  }
  
  /**
   * Safe setInterval with automatic tracking
   */
  setInterval(callback, interval, debugLabel = '') {
    const intervalId = setInterval(() => {
      try {
        callback();
      } catch (error) {
        logger.error('ResourceManager', `Error in interval ${debugLabel}:`, error);
      }
    }, interval);
    
    this.intervals.add(intervalId);
    
    if (debugLabel) {
      logger.debug('ResourceManager', `Interval created: ${debugLabel}`);
    }
    
    return intervalId;
  }
  
  /**
   * Safe requestAnimationFrame
   */
  requestAnimationFrame(callback, debugLabel = '') {
    const frameId = requestAnimationFrame(() => {
      try {
        callback();
      } catch (error) {
        logger.error('ResourceManager', `Error in animation ${debugLabel}:`, error);
      }
      this.animations.delete(frameId);
    });
    
    this.animations.add(frameId);
    return frameId;
  }
  
  /**
   * Clear specific timeout
   */
  clearTimeout(timeoutId) {
    clearTimeout(timeoutId);
    this.timeouts.delete(timeoutId);
  }
  
  /**
   * Clear specific interval
   */
  clearInterval(intervalId) {
    clearInterval(intervalId);
    this.intervals.delete(intervalId);
  }
  
  /**
   * Cancel specific animation frame
   */
  cancelAnimationFrame(frameId) {
    cancelAnimationFrame(frameId);
    this.animations.delete(frameId);
  }
  
  /**
   * Add event listener with tracking
   */
  addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    this.listeners.push({
      element,
      event,
      handler,
      options
    });
    
    logger.debug('ResourceManager', `Listener added: ${event} on ${element.tagName}`);
  }
  
  /**
   * Remove specific event listener
   */
  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
    
    const index = this.listeners.findIndex(
      l => l.element === element && l.event === event && l.handler === handler
    );
    
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Cleanup all resources
   */
  cleanup() {
    logger.info('ResourceManager', 'Cleaning up all resources...');
    
    // Clear timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    logger.debug('ResourceManager', 'Timeouts cleared');
    
    // Clear intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    logger.debug('ResourceManager', 'Intervals cleared');
    
    // Clear animations
    this.animations.forEach(id => cancelAnimationFrame(id));
    this.animations.clear();
    logger.debug('ResourceManager', 'Animations cleared');
    
    // Remove listeners
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners = [];
    logger.debug('ResourceManager', 'Listeners removed');
    
    logger.info('ResourceManager', 'Cleanup complete!');
  }
  
  /**
   * Get resource stats
   */
  getStats() {
    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      animations: this.animations.size,
      listeners: this.listeners.length
    };
  }
  
  /**
   * Debug info
   */
  debug() {
    const stats = this.getStats();
    console.log('[ResourceManager] Active resources:', stats);
    console.log('[ResourceManager] Timeouts:', Array.from(this.timeouts));
    console.log('[ResourceManager] Intervals:', Array.from(this.intervals));
    console.log('[ResourceManager] Listeners:', this.listeners);
  }
}

// Singleton
const resourceManager = new ResourceManager();

export default resourceManager;