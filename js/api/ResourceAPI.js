/**
 * ResourceAPI - Centralized access point for all game resources
 *
 * Every module that needs to read or modify resources MUST go through this API.
 * This replaces direct access to state.resources.* scattered across 15+ files.
 *
 * Usage:
 *   import resourceApi from '../api/ResourceAPI.js';
 *   resourceApi.add('energy', 100);
 *   resourceApi.spend('gems', 50);
 *   const gems = resourceApi.get('gems');
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

const VALID_RESOURCES = [
  'energy', 'mana', 'gems', 'crystals',
  'volcanicEnergy', 'tidalEnergy', 'solarEssence',
  'cryoEnergy', 'cosmicEnergy', 'pearls'
];

class ResourceAPI {
  constructor() {
    this._listeners = [];
    this._setupListeners();
  }

  _setupListeners() {
    // Relay state changes as resource:changed events for easier consumption
    const unsub1 = stateManager.subscribe('ADD_RESOURCE', (state) => {
      eventBus.emit('resource:changed', { state });
    });
    const unsub2 = stateManager.subscribe('REMOVE_RESOURCE', (state) => {
      eventBus.emit('resource:changed', { state });
    });
    const unsub3 = stateManager.subscribe('SET_RESOURCE', (state) => {
      eventBus.emit('resource:changed', { state });
    });

    this._listeners.push(unsub1, unsub2, unsub3);
  }

  /**
   * Validate resource name
   */
  _validate(resource) {
    if (!VALID_RESOURCES.includes(resource)) {
      logger.warn('ResourceAPI', `Invalid resource: "${resource}"`);
      return false;
    }
    return true;
  }

  /**
   * Get current amount of a resource
   * @param {string} resource - Resource name
   * @returns {number} Current amount (0 if invalid resource)
   */
  get(resource) {
    if (!this._validate(resource)) return 0;
    const state = stateManager.getState();
    return state.resources[resource] || 0;
  }

  /**
   * Get all resources at once
   * @returns {object} Copy of all resources { energy, mana, gems, ... }
   */
  getAll() {
    const state = stateManager.getState();
    return { ...state.resources };
  }

  /**
   * Get the cap for a resource
   * @param {string} resource
   * @returns {number|Infinity}
   */
  getCap(resource) {
    if (!this._validate(resource)) return Infinity;
    const state = stateManager.getState();
    return state.caps[resource] ?? Infinity;
  }

  /**
   * Get production rate for a resource
   * @param {string} resource
   * @returns {number}
   */
  getRate(resource) {
    if (!this._validate(resource)) return 0;
    const state = stateManager.getState();
    return state.production[resource] || 0;
  }

  /**
   * Add resources (respects caps)
   * @param {string} resource
   * @param {number} amount - Must be positive
   * @returns {boolean} Success
   */
  add(resource, amount) {
    if (!this._validate(resource)) return false;
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      logger.warn('ResourceAPI', `Invalid amount for add: ${amount}`);
      return false;
    }

    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: { resource, amount }
    });

    return true;
  }

  /**
   * Spend resources (cannot go below 0)
   * @param {string} resource
   * @param {number} amount - Must be positive
   * @returns {boolean} Whether the spend was successful
   */
  spend(resource, amount) {
    if (!this._validate(resource)) return false;
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      logger.warn('ResourceAPI', `Invalid amount for spend: ${amount}`);
      return false;
    }

    const current = this.get(resource);
    if (current < amount) {
      logger.debug('ResourceAPI', `Not enough ${resource}: have ${current}, need ${amount}`);
      return false;
    }

    stateManager.dispatch({
      type: 'REMOVE_RESOURCE',
      payload: { resource, amount }
    });

    return true;
  }

  /**
   * Set resources to exact value (bypasses cap check — use carefully)
   * @param {string} resource
   * @param {number} amount
   * @returns {boolean}
   */
  set(resource, amount) {
    if (!this._validate(resource)) return false;
    if (typeof amount !== 'number' || !isFinite(amount)) {
      logger.warn('ResourceAPI', `Invalid amount for set: ${amount}`);
      return false;
    }

    stateManager.dispatch({
      type: 'SET_RESOURCE',
      payload: { resource, amount: Math.max(0, amount) }
    });

    return true;
  }

  /**
   * Check if player can afford a cost
   * @param {string} resource
   * @param {number} amount
   * @returns {boolean}
   */
  canAfford(resource, amount) {
    return this.get(resource) >= amount;
  }

  /**
   * Batch spend multiple resources at once
   * @param {Array<{resource: string, amount: number}>} costs
   * @returns {boolean} Whether ALL spends succeeded
   */
  spendMultiple(costs) {
    // First check all can be afforded
    for (const { resource, amount } of costs) {
      if (!this.canAfford(resource, amount)) {
        return false;
      }
    }
    // Then execute all
    for (const { resource, amount } of costs) {
      stateManager.dispatch({
        type: 'REMOVE_RESOURCE',
        payload: { resource, amount }
      });
    }
    return true;
  }

  /**
   * Sync — reads from stateManager (for future cloud sync integration)
   * Currently a no-op since we always read from stateManager.
   */
  sync() {
    // Future: merge cloud state with local state
    eventBus.emit('resource:synced', { resources: this.getAll() });
  }

  /**
   * Cleanup subscriptions
   */
  destroy() {
    this._listeners.forEach(unsub => unsub());
    this._listeners = [];
  }
}

// Singleton
const resourceApi = new ResourceAPI();
export default resourceApi;
