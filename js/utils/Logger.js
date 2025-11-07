/**
 * Logger - Centralized logging with categories and levels
 */

import CONFIG from '../config.js';

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.categories = new Set();
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[CONFIG.LOG_LEVEL] || this.levels.info;
  }
  
  /**
   * Log with category
   */
  log(category, message, data = null, level = 'info') {
    const levelValue = this.levels[level] || this.levels.info;
    
    // Check if should log
    if (levelValue > this.currentLevel) return;
    
    const logEntry = {
      category,
      message,
      data,
      level,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString()
    };
    
    // Store
    this.logs.push(logEntry);
    this.categories.add(category);
    
    // Maintain size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Console output
    if (CONFIG.DEBUG_MODE) {
      const style = this.getStyle(level);
      const prefix = `[${category}]`;
      
      if (data) {
        console.log(`%c${prefix} ${message}`, style, data);
      } else {
        console.log(`%c${prefix} ${message}`, style);
      }
    }
  }
  
  /**
   * Shorthand methods
   */
  error(category, message, data) {
    this.log(category, message, data, 'error');
  }
  
  warn(category, message, data) {
    this.log(category, message, data, 'warn');
  }
  
  info(category, message, data) {
    this.log(category, message, data, 'info');
  }
  
  debug(category, message, data) {
    this.log(category, message, data, 'debug');
  }
  
  /**
   * Get logs by category
   */
  getByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }
  
  /**
   * Get logs by level
   */
  getByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * Get recent logs
   */
  getRecent(count = 10) {
    return this.logs.slice(-count);
  }
  
  /**
   * Export logs
   */
  export() {
    const data = {
      version: CONFIG.VERSION,
      exportedAt: new Date().toISOString(),
      categories: Array.from(this.categories),
      logs: this.logs
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_logs_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
    this.categories.clear();
  }
  
  /**
   * Console styles
   */
  getStyle(level) {
    const styles = {
      error: 'color: #ef4444; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      info: 'color: #3b82f6;',
      debug: 'color: #6b7280;'
    };
    return styles[level] || styles.info;
  }
}

// Singleton
const logger = new Logger();

export default logger;