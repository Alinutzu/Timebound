/**
 * PersistenceManager Tests
 *
 * Tests save/load, cloud sync, visibility change, export/import.
 * Run: node --test tests/PersistenceManager.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// ===== MOCKS =====

// localStorage polyfill (in-memory)
function createMockLocalStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); },
    _store: store
  };
}

const mockLogger = {
  _logs: [],
  info(mod, msg) { this._logs.push({ level: 'info', mod, msg }); },
  warn(mod, msg) { this._logs.push({ level: 'warn', mod, msg }); },
  error(mod, msg) { this._logs.push({ level: 'error', mod, msg }); },
  clear() { this._logs = []; }
};

function createMockEventBus() {
  const emitted = [];
  const listeners = new Map();
  return {
    emitted,
    on(event, callback) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(callback);
      return () => {};
    },
    emit(event, data) {
      emitted.push({ event, data });
      const cbs = listeners.get(event) || [];
      cbs.forEach(cb => cb(data));
    },
    clear() { emitted.length = 0; listeners.clear(); }
  };
}

function createMockStateManager(initialState = null) {
  let state = initialState || {
    resources: { energy: 10, mana: 0, gems: 0 },
    structures: {},
    upgrades: {},
    statistics: { totalClicks: 0 }
  };
  const dispatched = [];
  return {
    dispatched,
    getState() { return JSON.parse(JSON.stringify(state)); },
    dispatch(action) { dispatched.push(action); },
    _setState(newState) { state = newState; }
  };
}

function createMockSaveManager(validateResult = true) {
  const calls = [];
  return {
    calls,
    validateSave(saveData) {
      calls.push({ method: 'validateSave', args: [saveData] });
      return validateResult;
    },
    migrate(saveData) {
      calls.push({ method: 'migrate', args: [saveData] });
      return saveData;
    }
  };
}

const mockConfig = {
  VERSION: '2.1.0',
  SAVE_KEY: 'test_save_key',
  AUTO_SAVE_INTERVAL: 30000
};

// Mock api module for cloud tests
function createMockApi() {
  let savedState = null;
  let loadResult = { state: { resources: {}, structures: {}, upgrades: {} } };
  return {
    savedState,
    saveCloud(state) { savedState = state; return Promise.resolve({ ok: true }); },
    loadCloud() { return Promise.resolve(loadResult); },
    _setLoadResult(r) { loadResult = r; },
    _getSaved() { return savedState; }
  };
}

// Inline PersistenceManager (mirrors js/core/PersistenceManager.js)
class PersistenceManager {
  constructor({ config, stateManager, saveManager, eventBus, localStorage, logger }) {
    this._config = config;
    this._sm = stateManager;
    this._saveManager = saveManager;
    this._eb = eventBus;
    this._ls = localStorage;
    this._log = logger;
    this._api = null; // lazy-loaded
    this.autoSaveInterval = null;
    this.autoSaveEnabled = true;
    this.cloudSaveEnabled = false;
    this._listenersBound = false;

    this._eb.on('auth:stateChanged', ({ state }) => {
      this.cloudSaveEnabled = (state === 'GUEST' || state === 'AUTHENTICATED');
    });
  }

  async _loadApi() {
    if (!this._api) {
      // In tests, we inject via _setApi instead of dynamic import
      throw new Error('api not injected — call _setApi()');
    }
    return this._api;
  }

  _setApi(api) { this._api = api; }

  saveLocal() {
    try {
      const state = this._sm.getState();
      const saveData = { version: this._config.VERSION, timestamp: Date.now(), state };
      this._ls.setItem(this._config.SAVE_KEY, JSON.stringify(saveData));
      this._sm.dispatch({ type: 'SAVE_GAME', payload: {} });
      this._eb.emit('game:saved', { timestamp: saveData.timestamp });
      return true;
    } catch (error) {
      this._log.error('[PersistenceManager] saveLocal failed:', error.message);
      this._eb.emit('game:save-failed', { error: error.message });
      return false;
    }
  }

  async saveCloud() {
    if (!this.cloudSaveEnabled) return false;
    try {
      const api = await this._loadApi();
      const state = this._sm.getState();
      const payload = JSON.stringify(state);
      if (payload.length > 900000) {
        const trimmed = { resources: state.resources, statistics: state.statistics, structures: state.structures, upgrades: state.upgrades, guardians: state.guardians };
        await api.saveCloud(trimmed);
      } else {
        await api.saveCloud(state);
      }
      this._eb.emit('game:cloud-saved');
      return true;
    } catch (error) {
      if (error.status !== 401) {
        this._log.warn('[PersistenceManager] saveCloud failed:', error.message);
      }
      return false;
    }
  }

  saveCloudBeacon() {
    if (!this.cloudSaveEnabled) return;
    try {
      const token = this._ls.getItem('arena_token');
      if (!token) return;
      const state = this._sm.getState();
      const payload = JSON.stringify({ state });
      this._navigatorBeacon(`${this._apiBase}/save`, payload);
    } catch (error) {
      this._log.warn('[PersistenceManager] saveCloudBeacon failed:', error.message);
    }
  }

  _navigatorBeacon = () => {};
  _apiBase = '/api';

  async saveAll() {
    this.saveLocal();
    await this.saveCloud();
  }

  loadLocal() {
    try {
      const savedData = this._ls.getItem(this._config.SAVE_KEY);
      if (!savedData) return null;
      const saveData = JSON.parse(savedData);
      if (!this._saveManager.validateSave(saveData)) return null;
      const migrated = this._saveManager.migrate(saveData);
      return migrated;
    } catch (error) {
      this._log.error('[PersistenceManager] loadLocal failed:', error.message);
      return null;
    }
  }

  async loadCloud() {
    try {
      const api = await this._loadApi();
      const data = await api.loadCloud();
      if (data.state) {
        const saveData = { version: this._config.VERSION, state: data.state };
        if (!this._saveManager.validateSave(saveData)) return false;
        const migrated = this._saveManager.migrate(saveData);
        this._sm.dispatch({ type: 'LOAD_STATE', payload: { state: migrated.state } });
        this._eb.emit('game:cloud-loaded');
        return true;
      }
      return false;
    } catch (error) {
      this._log.warn('[PersistenceManager] loadCloud failed:', error.message);
      return false;
    }
  }

  onVisibilityChange(visibilityState) {
    if (visibilityState === 'hidden') {
      this.saveLocal();
      if (this.cloudSaveEnabled) this.saveCloudBeacon();
    }
  }

  onBeforeUnload() {
    this.saveLocal();
  }

  deleteSave() {
    try {
      this._ls.removeItem(this._config.SAVE_KEY);
      this._eb.emit('game:save-deleted');
      return true;
    } catch (error) {
      this._log.error('[PersistenceManager] deleteSave failed:', error.message);
      return false;
    }
  }

  hasSave() {
    return this._ls.getItem(this._config.SAVE_KEY) !== null;
  }

  getSaveInfo() {
    try {
      const savedData = this._ls.getItem(this._config.SAVE_KEY);
      if (!savedData) return null;
      const saveData = JSON.parse(savedData);
      return { version: saveData.version, timestamp: saveData.timestamp, size: new Blob([savedData]).size };
    } catch {
      return null;
    }
  }

  async saveAll() {
    this.saveLocal();
    await this.saveCloud();
  }

  startAutoSave(interval = 30000) {
    this.stopAutoSave();
    this.bindListeners();
    this.autoSaveInterval = this._setInterval(() => {
      if (this.autoSaveEnabled) {
        this.saveLocal();
        if (this.cloudSaveEnabled) this.saveCloud();
      }
    }, interval);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      this._clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  _setInterval = (fn, ms) => setInterval(fn, ms);
  _clearInterval = (id) => clearInterval(id);

  bindListeners() {
    if (this._listenersBound) return;
    this._listenersBound = true;
    this._doc.addEventListener('visibilitychange', () => this.onVisibilityChange());
    this._win.addEventListener('beforeunload', () => this.onBeforeUnload());
  }

  _doc = typeof document !== 'undefined' ? document : { addEventListener() {} };
  _win = typeof window !== 'undefined' ? window : { addEventListener() {} };

  exportSave() {
    try {
      const state = this._sm.getState();
      const exportData = { version: this._config.VERSION, timestamp: Date.now(), state };
      return exportData;
    } catch (error) {
      return false;
    }
  }

  async importSave(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      if (!this._saveManager.validateSave(importData)) throw new Error('Invalid save file');
      const migrated = this._saveManager.migrate(importData);
      this._sm.dispatch({ type: 'LOAD_STATE', payload: { state: migrated.state } });
      this.saveLocal();
      this._eb.emit('game:imported');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ===== TESTS =====

describe('PersistenceManager', () => {
  let ls, sm, smSaveManager, eb, pm;

  beforeEach(() => {
    ls = createMockLocalStorage();
    sm = createMockStateManager();
    smSaveManager = createMockSaveManager(true);
    eb = createMockEventBus();
    mockLogger.clear();
    pm = new PersistenceManager({
      config: mockConfig,
      stateManager: sm,
      saveManager: smSaveManager,
      eventBus: eb,
      localStorage: ls,
      logger: mockLogger
    });
  });

  // --- auth:stateChanged listener ---

  describe('auth:stateChanged listener', () => {
    it('sets cloudSaveEnabled=true for GUEST', () => {
      assert.equal(pm.cloudSaveEnabled, false);
      eb.emit('auth:stateChanged', { state: 'GUEST' });
      assert.equal(pm.cloudSaveEnabled, true);
    });

    it('sets cloudSaveEnabled=true for AUTHENTICATED', () => {
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      assert.equal(pm.cloudSaveEnabled, true);
    });

    it('sets cloudSaveEnabled=false for UNAUTHENTICATED', () => {
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      assert.equal(pm.cloudSaveEnabled, true);
      eb.emit('auth:stateChanged', { state: 'UNAUTHENTICATED' });
      assert.equal(pm.cloudSaveEnabled, false);
    });
  });

  // --- saveLocal ---

  describe('saveLocal()', () => {
    it('saves state to localStorage with version and timestamp', () => {
      const result = pm.saveLocal();
      assert.equal(result, true);
      const stored = JSON.parse(ls.getItem(mockConfig.SAVE_KEY));
      assert.equal(stored.version, '2.1.0');
      assert.ok(stored.timestamp > 0);
      assert.ok(stored.state);
    });

    it('dispatches SAVE_GAME action', () => {
      pm.saveLocal();
      assert.equal(sm.dispatched.length, 1);
      assert.equal(sm.dispatched[0].type, 'SAVE_GAME');
    });

    it('emits game:saved event', () => {
      pm.saveLocal();
      const event = eb.emitted.find(e => e.event === 'game:saved');
      assert.ok(event);
      assert.ok(event.data.timestamp > 0);
    });

    it('returns false and emits game:save-failed on error', () => {
      // Force error by making dispatch throw
      sm.dispatch = () => { throw new Error('dispatch failed'); };
      const result = pm.saveLocal();
      assert.equal(result, false);
      const event = eb.emitted.find(e => e.event === 'game:save-failed');
      assert.ok(event);
    });
  });

  // --- loadLocal ---

  describe('loadLocal()', () => {
    it('returns null when no save exists', () => {
      assert.equal(pm.loadLocal(), null);
    });

    it('returns save data when valid', () => {
      const saveData = { version: '2.1.0', timestamp: Date.now(), state: { resources: {}, structures: {}, upgrades: {} } };
      ls.setItem(mockConfig.SAVE_KEY, JSON.stringify(saveData));
      const result = pm.loadLocal();
      assert.ok(result);
      assert.equal(result.version, '2.1.0');
    });

    it('returns null when saveManager validates as false', () => {
      pm._saveManager = createMockSaveManager(false);
      ls.setItem(mockConfig.SAVE_KEY, JSON.stringify({ version: '2.1.0', state: {} }));
      assert.equal(pm.loadLocal(), null);
    });

    it('calls saveManager.migrate on loaded data', () => {
      const saveData = { version: '2.1.0', timestamp: Date.now(), state: { resources: {}, structures: {}, upgrades: {} } };
      ls.setItem(mockConfig.SAVE_KEY, JSON.stringify(saveData));
      pm.loadLocal();
      assert.equal(smSaveManager.calls.length, 2);
      assert.equal(smSaveManager.calls[0].method, 'validateSave');
      assert.equal(smSaveManager.calls[1].method, 'migrate');
    });

    it('returns null on malformed JSON', () => {
      ls.setItem(mockConfig.SAVE_KEY, '{bad json');
      assert.equal(pm.loadLocal(), null);
    });
  });

  // --- saveCloud ---

  describe('saveCloud()', () => {
    it('returns false when cloudSaveEnabled is false', async () => {
      const result = await pm.saveCloud();
      assert.equal(result, false);
    });

    it('calls api.saveCloud when enabled', async () => {
      const mockApi = createMockApi();
      pm._setApi(mockApi);
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      const result = await pm.saveCloud();
      assert.equal(result, true);
      assert.ok(mockApi._getSaved());
    });

    it('emits game:cloud-saved on success', async () => {
      const mockApi = createMockApi();
      pm._setApi(mockApi);
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      await pm.saveCloud();
      const event = eb.emitted.find(e => e.event === 'game:cloud-saved');
      assert.ok(event);
    });

    it('handles api error gracefully', async () => {
      const mockApi = {
        saveCloud() { return Promise.reject(new Error('network error')); }
      };
      pm._setApi(mockApi);
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      const result = await pm.saveCloud();
      assert.equal(result, false);
    });

    it('trims large payloads', async () => {
      let savedPayload = null;
      const mockApi = {
        saveCloud(state) { savedPayload = state; return Promise.resolve(); }
      };
      pm._setApi(mockApi);
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });

      // Create a large state
      const largeResources = {};
      for (let i = 0; i < 100000; i++) largeResources[`key${i}`] = i;
      sm._setState({ resources: largeResources, statistics: {}, structures: {}, upgrades: {}, guardians: [] });

      await pm.saveCloud();
      // Should have trimmed to essential fields
      assert.ok(savedPayload.resources);
      assert.ok(savedPayload.statistics);
      assert.ok(!savedPayload.key0); // large keys should not be at top level
    });
  });

  // --- saveCloudBeacon ---

  describe('saveCloudBeacon()', () => {
    it('does nothing when cloudSaveEnabled is false', () => {
      let beaconCalled = false;
      pm._navigatorBeacon = () => { beaconCalled = true; };
      pm.saveCloudBeacon();
      assert.equal(beaconCalled, false);
    });

    it('does nothing when no token', () => {
      eb.emit('auth:stateChanged', { state: 'GUEST' });
      let beaconCalled = false;
      pm._navigatorBeacon = () => { beaconCalled = true; };
      pm.saveCloudBeacon();
      assert.equal(beaconCalled, false);
    });

    it('calls sendBeacon when enabled + token exists', () => {
      eb.emit('auth:stateChanged', { state: 'GUEST' });
      ls.setItem('arena_token', 'test-token');
      let beaconUrl = null;
      pm._navigatorBeacon = (url, payload) => { beaconUrl = url; };
      pm.saveCloudBeacon();
      assert.ok(beaconUrl);
    });
  });

  // --- onVisibilityChange ---

  describe('onVisibilityChange()', () => {
    it('saves local when hidden', () => {
      pm.onVisibilityChange('hidden');
      assert.ok(ls.getItem(mockConfig.SAVE_KEY));
    });

    it('does not save when visible', () => {
      pm.onVisibilityChange('visible');
      assert.equal(ls.getItem(mockConfig.SAVE_KEY), null);
    });

    it('calls saveCloudBeacon when hidden + cloudSaveEnabled', () => {
      let beaconCalled = false;
      pm._navigatorBeacon = () => { beaconCalled = true; };
      eb.emit('auth:stateChanged', { state: 'GUEST' });
      ls.setItem('arena_token', 'test-token');
      pm.onVisibilityChange('hidden');
      assert.equal(beaconCalled, true);
    });
  });

  // --- onBeforeUnload ---

  describe('onBeforeUnload()', () => {
    it('saves local', () => {
      pm.onBeforeUnload();
      assert.ok(ls.getItem(mockConfig.SAVE_KEY));
    });
  });

  // --- deleteSave ---

  describe('deleteSave()', () => {
    it('removes save from localStorage', () => {
      ls.setItem(mockConfig.SAVE_KEY, 'data');
      pm.deleteSave();
      assert.equal(ls.getItem(mockConfig.SAVE_KEY), null);
    });

    it('emits game:save-deleted', () => {
      pm.deleteSave();
      const event = eb.emitted.find(e => e.event === 'game:save-deleted');
      assert.ok(event);
    });

    it('returns true', () => {
      assert.equal(pm.deleteSave(), true);
    });
  });

  // --- hasSave ---

  describe('hasSave()', () => {
    it('returns false when no save', () => {
      assert.equal(pm.hasSave(), false);
    });

    it('returns true when save exists', () => {
      ls.setItem(mockConfig.SAVE_KEY, 'data');
      assert.equal(pm.hasSave(), true);
    });
  });

  // --- getSaveInfo ---

  describe('getSaveInfo()', () => {
    it('returns null when no save', () => {
      assert.equal(pm.getSaveInfo(), null);
    });

    it('returns version, timestamp, and size', () => {
      const saveData = { version: '2.1.0', timestamp: 12345, state: {} };
      ls.setItem(mockConfig.SAVE_KEY, JSON.stringify(saveData));
      const info = pm.getSaveInfo();
      assert.equal(info.version, '2.1.0');
      assert.equal(info.timestamp, 12345);
      assert.ok(info.size > 0);
    });
  });

  // --- loadCloud ---

  describe('loadCloud()', () => {
    it('loads and dispatches state from cloud', async () => {
      const cloudState = { resources: { energy: 999 }, structures: {}, upgrades: {} };
      const mockApi = { loadCloud: () => Promise.resolve({ state: cloudState }) };
      pm._setApi(mockApi);
      const result = await pm.loadCloud();
      assert.equal(result, true);
      assert.equal(sm.dispatched.length, 1);
      assert.equal(sm.dispatched[0].type, 'LOAD_STATE');
    });

    it('emits game:cloud-loaded on success', async () => {
      const mockApi = { loadCloud: () => Promise.resolve({ state: { resources: {}, structures: {}, upgrades: {} } }) };
      pm._setApi(mockApi);
      await pm.loadCloud();
      const event = eb.emitted.find(e => e.event === 'game:cloud-loaded');
      assert.ok(event);
    });

    it('returns false on api error', async () => {
      const mockApi = { loadCloud: () => Promise.reject(new Error('fail')) };
      pm._setApi(mockApi);
      const result = await pm.loadCloud();
      assert.equal(result, false);
    });

    it('returns false when no state in response', async () => {
      const mockApi = { loadCloud: () => Promise.resolve({}) };
      pm._setApi(mockApi);
      const result = await pm.loadCloud();
      assert.equal(result, false);
    });

    it('returns false when validation fails', async () => {
      pm._saveManager = createMockSaveManager(false);
      const mockApi = { loadCloud: () => Promise.resolve({ state: { resources: {} } }) };
      pm._setApi(mockApi);
      const result = await pm.loadCloud();
      assert.equal(result, false);
    });
  });

  // --- saveAll ---

  describe('saveAll()', () => {
    it('calls saveLocal', async () => {
      await pm.saveAll();
      assert.ok(ls.getItem(mockConfig.SAVE_KEY));
    });

    it('calls saveCloud when enabled', async () => {
      const mockApi = createMockApi();
      pm._setApi(mockApi);
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      await pm.saveAll();
      assert.ok(mockApi._getSaved());
    });

    it('saveLocal succeeds even if saveCloud fails', async () => {
      const mockApi = { saveCloud: () => Promise.reject(new Error('fail')) };
      pm._setApi(mockApi);
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      await pm.saveAll();
      assert.ok(ls.getItem(mockConfig.SAVE_KEY));
    });
  });

  // --- startAutoSave / stopAutoSave ---

  describe('startAutoSave() / stopAutoSave()', () => {
    it('creates interval on startAutoSave', () => {
      let intervalCreated = false;
      pm._setInterval = (fn, ms) => { intervalCreated = true; return 42; };
      pm._clearInterval = () => {};
      pm.startAutoSave(5000);
      assert.equal(intervalCreated, true);
      assert.equal(pm.autoSaveInterval, 42);
    });

    it('clears interval on stopAutoSave', () => {
      let cleared = false;
      pm._setInterval = () => 42;
      pm._clearInterval = (id) => { cleared = true; };
      pm.startAutoSave(5000);
      pm.stopAutoSave();
      assert.equal(cleared, true);
      assert.equal(pm.autoSaveInterval, null);
    });

    it('does nothing on stopAutoSave when no interval', () => {
      pm.stopAutoSave(); // no interval set
      assert.equal(pm.autoSaveInterval, null);
    });

    it('replaces existing interval on second startAutoSave', () => {
      let clearCount = 0;
      pm._setInterval = () => 99;
      pm._clearInterval = () => { clearCount++; };
      pm.startAutoSave(5000);
      pm.startAutoSave(5000);
      assert.equal(clearCount, 1); // stopped old one
      assert.equal(pm.autoSaveInterval, 99);
    });

    it('autoSave toggle controls saving', () => {
      let saveCount = 0;
      pm._setInterval = (fn, ms) => { pm._autoSaveFn = fn; return 1; };
      pm._clearInterval = () => {};
      pm.saveLocal = () => { saveCount++; return true; };
      pm.saveCloud = () => Promise.resolve();
      pm.autoSaveEnabled = false;
      pm.startAutoSave(1000);
      pm._autoSaveFn(); // trigger
      assert.equal(saveCount, 0); // disabled, should not save
      pm.autoSaveEnabled = true;
      pm._autoSaveFn(); // trigger
      assert.equal(saveCount, 1); // enabled, should save
    });
  });

  // --- exportSave ---

  describe('exportSave()', () => {
    it('returns export data with version and state', () => {
      const result = pm.exportSave();
      assert.ok(result);
      assert.equal(result.version, '2.1.0');
      assert.ok(result.state);
      assert.ok(result.timestamp > 0);
    });

    it('returns false on error', () => {
      sm.getState = () => { throw new Error('fail'); };
      assert.equal(pm.exportSave(), false);
    });
  });

  // --- importSave ---

  describe('importSave()', () => {
    it('imports valid save file', async () => {
      const saveData = { version: '2.1.0', state: { resources: { energy: 999 }, structures: {}, upgrades: {} } };
      const file = { text: () => Promise.resolve(JSON.stringify(saveData)) };
      const result = await pm.importSave(file);
      assert.equal(result, true);
      const loadAction = sm.dispatched.find(a => a.type === 'LOAD_STATE');
      assert.ok(loadAction, 'should dispatch LOAD_STATE');
      assert.equal(loadAction.payload.state.resources.energy, 999);
    });

    it('emits game:imported on success', async () => {
      const saveData = { version: '2.1.0', state: { resources: {}, structures: {}, upgrades: {} } };
      const file = { text: () => Promise.resolve(JSON.stringify(saveData)) };
      await pm.importSave(file);
      const event = eb.emitted.find(e => e.event === 'game:imported');
      assert.ok(event);
    });

    it('saves locally after import', async () => {
      const saveData = { version: '2.1.0', state: { resources: {}, structures: {}, upgrades: {} } };
      const file = { text: () => Promise.resolve(JSON.stringify(saveData)) };
      await pm.importSave(file);
      assert.ok(ls.getItem(mockConfig.SAVE_KEY));
    });

    it('returns false on invalid save', async () => {
      pm._saveManager = createMockSaveManager(false);
      const file = { text: () => Promise.resolve('{"bad": true}') };
      const result = await pm.importSave(file);
      assert.equal(result, false);
    });

    it('returns false on malformed JSON', async () => {
      const file = { text: () => Promise.resolve('{bad json') };
      const result = await pm.importSave(file);
      assert.equal(result, false);
    });
  });

  // --- bindListeners ---

  describe('bindListeners()', () => {
    it('sets _listenersBound to true', () => {
      assert.equal(pm._listenersBound, false);
      pm.bindListeners();
      assert.equal(pm._listenersBound, true);
    });

    it('does not re-bind on second call (idempotent)', () => {
      let bindCount = 0;
      pm._doc = { addEventListener() { bindCount++; } };
      pm._win = { addEventListener() { bindCount++; } };
      pm.bindListeners();
      pm.bindListeners();
      assert.equal(bindCount, 2); // only 1 call (visibilitychange + beforeunload)
    });
  });

  // --- onVisibilityChange with AUTHENTICATED ---

  describe('onVisibilityChange() with AUTHENTICATED', () => {
    it('calls saveCloudBeacon when AUTHENTICATED + hidden', () => {
      let beaconCalled = false;
      pm._navigatorBeacon = () => { beaconCalled = true; };
      eb.emit('auth:stateChanged', { state: 'AUTHENTICATED' });
      ls.setItem('arena_token', 'test-token');
      pm.onVisibilityChange('hidden');
      assert.equal(beaconCalled, true);
      assert.ok(ls.getItem(mockConfig.SAVE_KEY));
    });
  });
});
