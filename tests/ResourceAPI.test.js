/**
 * ResourceAPI Tests
 *
 * Tests the centralized resource access layer.
 * Run: node --test tests/ResourceAPI.test.js
 *
 * These tests mock StateManager and EventBus to test ResourceAPI logic
 * without needing the full browserify bundle.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ===== MOCKS =====

let mockState = {};
let dispatchedActions = [];

function createMockStateManager(initialResources = {}) {
  dispatchedActions = [];
  mockState = {
    resources: {
      energy: 10,
      mana: 0,
      gems: 0,
      crystals: 0,
      volcanicEnergy: 0,
      tidalEnergy: 0,
      solarEssence: 0,
      cryoEnergy: 0,
      cosmicEnergy: 0,
      pearls: 0,
      ...initialResources
    },
    caps: {
      energy: 50000,
      mana: 1000,
      volcanicEnergy: 50000,
      tidalEnergy: 50000,
      solarEssence: 50000,
      cryoEnergy: 50000,
      cosmicEnergy: 50000
    },
    production: {
      energy: 0, mana: 0, volcanicEnergy: 0, tidalEnergy: 0,
      solarEssence: 0, cryoEnergy: 0, cosmicEnergy: 0
    }
  };

  return {
    dispatch(action) {
      dispatchedActions.push(action);
      // Simulate reducer behavior for ADD/REMOVE/SET_RESOURCE
      if (action.type === 'ADD_RESOURCE') {
        const { resource, amount } = action.payload;
        const cap = mockState.caps[resource] ?? Infinity;
        mockState.resources[resource] = Math.min(
          (mockState.resources[resource] || 0) + amount,
          cap
        );
      } else if (action.type === 'REMOVE_RESOURCE') {
        const { resource, amount } = action.payload;
        mockState.resources[resource] = Math.max(
          (mockState.resources[resource] || 0) - amount,
          0
        );
      } else if (action.type === 'SET_RESOURCE') {
        mockState.resources[action.payload.resource] = action.payload.amount;
      }
    },
    getState() {
      return JSON.parse(JSON.stringify(mockState));
    },
    subscribe() { return () => {}; }
  };
}

const mockEventBus = {
  emitted: [],
  emit(event, data) { this.emitted.push({ event, data }); },
  on() { return () => {}; }
};

const mockLogger = {
  _logs: [],
  warn(mod, msg) { this._logs.push({ level: 'warn', mod, msg }); },
  info(mod, msg) { this._logs.push({ level: 'info', mod, msg }); },
  debug(mod, msg) { this._logs.push({ level: 'debug', mod, msg }); },
  error(mod, msg) { this._logs.push({ level: 'error', mod, msg }); }
};

// Inline ResourceAPI that uses our mocks
class ResourceAPI {
  constructor(stateManager, eventBus, logger) {
    this._sm = stateManager;
    this._eb = eventBus;
    this._log = logger;
  }

  _validate(resource) {
    const VALID = ['energy','mana','gems','crystals','volcanicEnergy','tidalEnergy','solarEssence','cryoEnergy','cosmicEnergy','pearls'];
    if (!VALID.includes(resource)) {
      this._log.warn('ResourceAPI', `Invalid resource: "${resource}"`);
      return false;
    }
    return true;
  }

  get(resource) {
    if (!this._validate(resource)) return 0;
    const state = this._sm.getState();
    return state.resources[resource] || 0;
  }

  getAll() {
    const state = this._sm.getState();
    return { ...state.resources };
  }

  getCap(resource) {
    if (!this._validate(resource)) return Infinity;
    const state = this._sm.getState();
    return state.caps[resource] ?? Infinity;
  }

  getRate(resource) {
    if (!this._validate(resource)) return 0;
    const state = this._sm.getState();
    return state.production[resource] || 0;
  }

  add(resource, amount) {
    if (!this._validate(resource)) return false;
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      this._log.warn('ResourceAPI', `Invalid amount for add: ${amount}`);
      return false;
    }
    this._sm.dispatch({ type: 'ADD_RESOURCE', payload: { resource, amount } });
    return true;
  }

  spend(resource, amount) {
    if (!this._validate(resource)) return false;
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      this._log.warn('ResourceAPI', `Invalid amount for spend: ${amount}`);
      return false;
    }
    const current = this.get(resource);
    if (current < amount) {
      this._log.debug('ResourceAPI', `Not enough ${resource}: have ${current}, need ${amount}`);
      return false;
    }
    this._sm.dispatch({ type: 'REMOVE_RESOURCE', payload: { resource, amount } });
    return true;
  }

  set(resource, amount) {
    if (!this._validate(resource)) return false;
    if (typeof amount !== 'number' || !isFinite(amount)) {
      this._log.warn('ResourceAPI', `Invalid amount for set: ${amount}`);
      return false;
    }
    this._sm.dispatch({ type: 'SET_RESOURCE', payload: { resource, amount: Math.max(0, amount) } });
    return true;
  }

  canAfford(resource, amount) {
    return this.get(resource) >= amount;
  }

  spendMultiple(costs) {
    for (const { resource, amount } of costs) {
      if (!this.canAfford(resource, amount)) return false;
    }
    for (const { resource, amount } of costs) {
      this._sm.dispatch({ type: 'REMOVE_RESOURCE', payload: { resource, amount } });
    }
    return true;
  }
}

// ===== TESTS =====

describe('ResourceAPI', () => {
  let sm, eb, api;

  beforeEach(() => {
    sm = createMockStateManager();
    eb = { emitted: [], emit(e, d) { this.emitted.push({ event: e, data: d }); }, on() { return () => {}; } };
    api = new ResourceAPI(sm, eb, mockLogger);
  });

  // --- GET ---

  describe('get()', () => {
    it('returns current resource value', () => {
      assert.equal(api.get('energy'), 10);
    });

    it('returns 0 for unknown resource', () => {
      assert.equal(api.get('nonexistent'), 0);
    });

    it('returns 0 for invalid resource name', () => {
      assert.equal(api.get(''), 0);
      assert.equal(api.get('ENERGY'), 0);
    });
  });

  // --- GET ALL ---

  describe('getAll()', () => {
    it('returns all resources', () => {
      const all = api.getAll();
      assert.equal(all.energy, 10);
      assert.equal(all.gems, 0);
      assert.equal(typeof all, 'object');
    });

    it('returns a copy, not reference', () => {
      const all = api.getAll();
      all.energy = 999;
      assert.equal(api.get('energy'), 10); // unchanged
    });
  });

  // --- ADD ---

  describe('add()', () => {
    it('adds resources', () => {
      api.add('energy', 50);
      assert.equal(api.get('energy'), 60);
    });

    it('respects cap', () => {
      // Set energy near cap (50000) — must modify underlying state, not clone
      mockState.resources.energy = 49990;
      api.add('energy', 50);
      assert.equal(api.get('energy'), 50000);
    });

    it('rejects negative amount', () => {
      assert.equal(api.add('energy', -10), false);
      assert.equal(api.get('energy'), 10);
    });

    it('rejects zero amount', () => {
      assert.equal(api.add('energy', 0), false);
    });

    it('rejects NaN', () => {
      assert.equal(api.add('energy', NaN), false);
    });

    it('rejects Infinity', () => {
      assert.equal(api.add('energy', Infinity), false);
    });

    it('rejects invalid resource', () => {
      assert.equal(api.add('invalidResource', 10), false);
    });

    it('dispatches ADD_RESOURCE action', () => {
      dispatchedActions = [];
      api.add('gems', 25);
      assert.equal(dispatchedActions.length, 1);
      assert.equal(dispatchedActions[0].type, 'ADD_RESOURCE');
      assert.equal(dispatchedActions[0].payload.resource, 'gems');
      assert.equal(dispatchedActions[0].payload.amount, 25);
    });
  });

  // --- SPEND ---

  describe('spend()', () => {
    beforeEach(() => {
      sm = createMockStateManager({ energy: 100, gems: 50 });
      api = new ResourceAPI(sm, eb, mockLogger);
    });

    it('deducts resources', () => {
      api.spend('energy', 30);
      assert.equal(api.get('energy'), 70);
    });

    it('returns true on success', () => {
      assert.equal(api.spend('energy', 10), true);
    });

    it('returns false when insufficient funds', () => {
      assert.equal(api.spend('gems', 100), false);
    });

    it('does not deduct when insufficient', () => {
      api.spend('gems', 100);
      assert.equal(api.get('gems'), 50); // unchanged
    });

    it('rejects negative amount', () => {
      assert.equal(api.spend('energy', -5), false);
      assert.equal(api.get('energy'), 100);
    });

    it('rejects zero amount', () => {
      assert.equal(api.spend('energy', 0), false);
    });

    it('allows spending exact balance', () => {
      assert.equal(api.spend('gems', 50), true);
      assert.equal(api.get('gems'), 0);
    });

    it('rejects invalid resource', () => {
      assert.equal(api.spend('diamonds', 10), false);
    });
  });

  // --- SET ---

  describe('set()', () => {
    it('sets exact value', () => {
      api.set('energy', 999);
      assert.equal(api.get('energy'), 999);
    });

    it('clamps negative to 0', () => {
      api.set('energy', -50);
      assert.equal(api.get('energy'), 0);
    });

    it('rejects NaN', () => {
      assert.equal(api.set('energy', NaN), false);
    });

    it('rejects Infinity', () => {
      assert.equal(api.set('energy', Infinity), false);
    });
  });

  // --- CAN AFFORD ---

  describe('canAfford()', () => {
    beforeEach(() => {
      sm = createMockStateManager({ gems: 100 });
      api = new ResourceAPI(sm, eb, mockLogger);
    });

    it('returns true when can afford', () => {
      assert.equal(api.canAfford('gems', 100), true);
    });

    it('returns true when has more', () => {
      assert.equal(api.canAfford('gems', 50), true);
    });

    it('returns false when cannot afford', () => {
      assert.equal(api.canAfford('gems', 101), false);
    });

    it('returns false for invalid resource', () => {
      assert.equal(api.canAfford('invalid', 1), false);
    });
  });

  // --- SPEND MULTIPLE ---

  describe('spendMultiple()', () => {
    beforeEach(() => {
      sm = createMockStateManager({ energy: 100, gems: 50 });
      api = new ResourceAPI(sm, eb, mockLogger);
    });

    it('spends multiple resources', () => {
      const result = api.spendMultiple([
        { resource: 'energy', amount: 30 },
        { resource: 'gems', amount: 20 }
      ]);
      assert.equal(result, true);
      assert.equal(api.get('energy'), 70);
      assert.equal(api.get('gems'), 30);
    });

    it('fails if any resource insufficient (atomic)', () => {
      const result = api.spendMultiple([
        { resource: 'energy', amount: 30 },
        { resource: 'gems', amount: 200 } // can't afford
      ]);
      assert.equal(result, false);
      // Nothing should be deducted (atomic check)
      assert.equal(api.get('energy'), 100);
      assert.equal(api.get('gems'), 50);
    });
  });

  // --- EDGE CASES ---

  describe('edge cases', () => {
    it('handles fractional amounts', () => {
      sm = createMockStateManager({ energy: 10 });
      api = new ResourceAPI(sm, eb, mockLogger);
      api.add('energy', 0.5);
      assert.equal(api.get('energy'), 10.5);
    });

    it('handles very large numbers', () => {
      api.set('energy', 1e15);
      assert.equal(api.get('energy'), 1e15);
    });

    it('handles string resource gracefully', () => {
      assert.equal(api.get('123'), 0);
      assert.equal(api.add('123', 10), false);
    });
  });

  // --- GET RATE ---

  describe('getRate()', () => {
    it('returns production rate for valid resource', () => {
      mockState.production.energy = 5.5;
      assert.equal(api.getRate('energy'), 5.5);
    });

    it('returns 0 for resource with no production', () => {
      assert.equal(api.getRate('gems'), 0);
    });

    it('returns 0 for invalid resource', () => {
      assert.equal(api.getRate('invalidResource'), 0);
    });
  });

  // --- SPEND MULTIPLE edge cases ---

  describe('spendMultiple() edge cases', () => {
    it('returns true for empty array', () => {
      assert.equal(api.spendMultiple([]), true);
    });

    it('returns true with single item', () => {
      sm = createMockStateManager({ energy: 100 });
      api = new ResourceAPI(sm, eb, mockLogger);
      assert.equal(api.spendMultiple([{ resource: 'energy', amount: 50 }]), true);
      assert.equal(api.get('energy'), 50);
    });
  });

  // --- GET CAP ---

  describe('getCap()', () => {
    it('returns cap for valid resource', () => {
      assert.equal(api.getCap('energy'), 50000);
    });

    it('returns Infinity for invalid resource', () => {
      assert.equal(api.getCap('invalidResource'), Infinity);
    });
  });

  // --- WARN logging ---

  describe('warning logging', () => {
    it('warns on invalid resource name', () => {
      mockLogger._logs = [];
      api.get('diamonds');
      const warn = mockLogger._logs.find(l => l.level === 'warn' && l.msg.includes('diamonds'));
      assert.ok(warn, 'should log warning for invalid resource');
    });

    it('warns on invalid add amount', () => {
      mockLogger._logs = [];
      api.add('energy', -5);
      const warn = mockLogger._logs.find(l => l.level === 'warn' && l.msg.includes('Invalid amount'));
      assert.ok(warn, 'should log warning for invalid amount');
    });

    it('warns on invalid spend amount', () => {
      mockLogger._logs = [];
      api.spend('energy', NaN);
      const warn = mockLogger._logs.find(l => l.level === 'warn' && l.msg.includes('Invalid amount'));
      assert.ok(warn, 'should log warning for invalid amount');
    });

    it('warns on invalid set amount', () => {
      mockLogger._logs = [];
      api.set('energy', Infinity);
      const warn = mockLogger._logs.find(l => l.level === 'warn' && l.msg.includes('Invalid amount'));
      assert.ok(warn, 'should log warning for invalid amount');
    });
  });
});
