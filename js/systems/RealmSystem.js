/**
 * RealmSystem - Handles realm switching and unlocking
 */

import REALMS from '../data/realms.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class RealmSystem {
  constructor() {
    this.realms = REALMS;
    
    this.initializeState();
    
    logger.info('RealmSystem', 'Initialized with realms:', Object.keys(this.realms));
  }
  
  /**
   * Initialize realm state
   */
  initializeState() {
    const state = stateManager.getState();
    
    // Ensure forest is unlocked
    if (!state.realms.unlocked.includes('forest')) {
      stateManager.dispatch({
        type: 'UNLOCK_REALM',
        payload: { realmId: 'forest', cost: 0 }
      });
    }
  }
  
  /**
   * Get realm data
   */
  getRealm(realmId) {
    return this.realms[realmId];
  }
  
  /**
   * Get current realm
   */
  getCurrentRealm() {
    const state = stateManager.getState();
    return this.realms[state.realms.current];
  }
  
  /**
   * Check if realm is unlocked
   */
  isUnlocked(realmId) {
    const state = stateManager.getState();
    return state.realms.unlocked.includes(realmId);
  }
  
  /**
   * Check if can unlock realm
   */
  canUnlock(realmId) {
    const realm = this.realms[realmId];
    
    if (!realm) {
      return { can: false, reason: 'invalid-realm' };
    }
    
    if (realm.locked) {
      return { can: false, reason: 'not-implemented' };
    }
    
    if (this.isUnlocked(realmId)) {
      return { can: false, reason: 'already-unlocked' };
    }
    
    const state = stateManager.getState();
    const condition = realm.unlockCondition;
    
    if (!condition) {
      return { can: true }; // No requirements
    }
    
    // Check ascension requirement
    if (condition.ascension) {
      if (state.ascension.level < condition.ascension.level) {
        return { 
          can: false, 
          reason: 'ascension-required',
          required: condition.ascension.level,
          current: state.ascension.level
        };
      }
    }
    
    // Check boss requirements
    if (condition.bosses) {
      for (let [bossId, requirement] of Object.entries(condition.bosses)) {
        const bossState = state.bosses[bossId];
        
        if (requirement === 'defeated' && !bossState?.defeated) {
          return {
            can: false,
            reason: 'boss-required',
            bossId
          };
        }
      }
    }
    
    // Check realm requirements
    if (condition.realms) {
      for (let [realmId, requirement] of Object.entries(condition.realms)) {
        if (requirement === 'unlocked' && !this.isUnlocked(realmId)) {
          return {
            can: false,
            reason: 'realm-required',
            realmId
          };
        }
      }
    }
    
    // Check cost
    if (realm.unlockCost) {
      for (let [resource, amount] of Object.entries(realm.unlockCost)) {
        if (state.resources[resource] < amount) {
          return {
            can: false,
            reason: 'insufficient-resources',
            resource,
            required: amount,
            current: state.resources[resource]
          };
        }
      }
    }
    
    return { can: true };
  }
  
  /**
   * Unlock a realm
   */
  unlock(realmId) {
    const canUnlock = this.canUnlock(realmId);
    
    if (!canUnlock.can) {
      logger.warn('RealmSystem', `Cannot unlock ${realmId}:`, canUnlock.reason);
      eventBus.emit('realm:unlock-failed', { realmId, reason: canUnlock.reason });
      return false;
    }
    
    const realm = this.realms[realmId];
    let cost = 0;
    
    if (realm.unlockCost) {
      for (let [resource, amount] of Object.entries(realm.unlockCost)) {
        cost = amount; // Assuming single resource cost
      }
    }
    
    // Unlock realm
    stateManager.dispatch({
      type: 'UNLOCK_REALM',
      payload: { realmId, cost }
    });
    
    logger.info('RealmSystem', `Unlocked realm: ${realm.name}`);
    
    // Show notification
    eventBus.emit('notification:show', {
      type: 'realm',
      title: 'Realm Unlocked!',
      message: `${realm.emoji} ${realm.name}`,
      description: realm.lore,
      duration: 7000
    });
    
    eventBus.emit('realm:unlocked', { realmId, realm });
    
    return true;
  }
  
  /**
   * Switch to a realm
   */
  switchTo(realmId) {
    if (!this.isUnlocked(realmId)) {
      logger.warn('RealmSystem', `Realm ${realmId} is not unlocked`);
      eventBus.emit('realm:switch-failed', { realmId, reason: 'locked' });
      return false;
    }
    
    const state = stateManager.getState();
    
    if (state.realms.current === realmId) {
      logger.warn('RealmSystem', `Already in realm ${realmId}`);
      return false;
    }
    
    stateManager.dispatch({
      type: 'SWITCH_REALM',
      payload: { realmId }
    });
    
    const realm = this.realms[realmId];
    
    logger.info('RealmSystem', `Switched to realm: ${realm.name}`);
    
    eventBus.emit('realm:switched', { realmId, realm });
    
    return true;
  }
  
  /**
   * Get unlocked realms
   */
  getUnlockedRealms() {
    const state = stateManager.getState();
    return state.realms.unlocked.map(id => this.realms[id]);
  }
  
  /**
   * Get available realms (can be unlocked)
   */
  getAvailableRealms() {
    const available = [];
    
    for (let [id, realm] of Object.entries(this.realms)) {
      if (realm.locked) continue;
      
      if (this.isUnlocked(id)) continue;
      
      const canUnlock = this.canUnlock(id);
      
      available.push({
        id,
        realm,
        canUnlock: canUnlock.can,
        reason: canUnlock.reason
      });
    }
    
    return available;
  }
  
  /**
   * Get realm bonuses
   */
  getRealmBonuses(realmId = null) {
    const state = stateManager.getState();
    const currentRealmId = realmId || state.realms.current;
    const realm = this.realms[currentRealmId];
    
    return realm?.bonuses || {};
  }
  
  /**
   * Get realm stats
   */
  getStats() {
    const state = stateManager.getState();
    
    return {
      current: state.realms.current,
      unlocked: state.realms.unlocked.length,
      total: Object.keys(this.realms).filter(id => !this.realms[id].locked).length,
      percentage: (state.realms.unlocked.length / Object.keys(this.realms).filter(id => !this.realms[id].locked).length) * 100
    };
  }
}

// Singleton
const realmSystem = new RealmSystem();

export default realmSystem;