/**
 * Formatters - Number and time formatting utilities
 */

class Formatters {
  /**
   * Format large numbers
   * @param {number} num - Number to format
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted number
   */
  static formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    
    const absNum = Math.abs(num);
    
    if (absNum >= 1e12) {
      return (num / 1e12).toFixed(decimals) + 'T';
    }
    if (absNum >= 1e9) {
      return (num / 1e9).toFixed(decimals) + 'B';
    }
    if (absNum >= 1e6) {
      return (num / 1e6).toFixed(decimals) + 'M';
    }
    if (absNum >= 1e3) {
      return (num / 1e3).toFixed(decimals) + 'K';
    }
    
    // Small numbers
    if (absNum < 1 && absNum > 0) {
      return num.toFixed(decimals);
    }
    
    return Math.floor(num).toLocaleString();
  }
  
  /**
   * Format with suffix (for display)
   */
  static formatWithSuffix(num, resource = '') {
    const formatted = this.formatNumber(num);
    
    const suffixes = {
      energy: '⚡',
      mana: '✨',
      gems: '💎',
      crystals: '💠',
      volcanic: '🌋'
    };
    
    const suffix = suffixes[resource] || '';
    return `${formatted}${suffix ? ' ' + suffix : ''}`;
  }
  
  /**
   * Format time duration
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time
   */
  static formatTime(ms) {
    if (ms < 0) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
  
  /**
   * Format time remaining (countdown)
   */
  static formatTimeRemaining(ms) {
    if (ms <= 0) return 'Ready!';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    if (minutes > 0) {
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }
  
  /**
   * Format percentage
   */
  static formatPercent(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
  }
  
  /**
   * Format rate (per second)
   */
  static formatRate(value, resource = '') {
    return `${this.formatWithSuffix(value, resource)}/s`;
  }
  
  /**
   * Format date
   */
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
  
  /**
   * Format relative time (ago)
   */
  static formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    return 'just now';
  }
  
  /**
   * Parse formatted number back to value
   */
  static parseNumber(str) {
    if (typeof str === 'number') return str;
    
    const multipliers = {
      'K': 1e3,
      'M': 1e6,
      'B': 1e9,
      'T': 1e12
    };
    
    const match = str.match(/^([\d.]+)([KMBT])?$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const suffix = match[2];
    
    return suffix ? value * multipliers[suffix] : value;
  }
}

export default Formatters;