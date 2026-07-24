import CONFIG from '../config.js';
import stateManager from './StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

const SAVE_KEY = CONFIG.SAVE_KEY;

class PersistenceManager {
  constructor() {
    this.autoSaveInterval = null;
    this.autoSaveEnabled = true;
    this.cloudSaveEnabled = false;
    this._listenersBound = false;
  }

  saveLocal() {
    try {
      const state = stateManager.getState();
      const saveData = {
        version: CONFIG.VERSION,
        timestamp: Date.now(),
        state
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      stateManager.dispatch({ type: 'SAVE_GAME', payload: {} });
      eventBus.emit('game:saved', { timestamp: saveData.timestamp });
      return true;
    } catch (error) {
      logger.error('[PersistenceManager] saveLocal failed:', error.message);
      eventBus.emit('game:save-failed', { error: error.message });
      return false;
    }
  }

  async saveCloud() {
    if (!this.cloudSaveEnabled) return false;
    try {
      const state = stateManager.getState();
      const { default: api } = await import('../services/api.js');
      const payload = JSON.stringify(state);
      if (payload.length > 900000) {
        const trimmed = { resources: state.resources, stats: state.stats, structures: state.structures, upgrades: state.upgrades, guardians: state.guardians };
        await api.saveCloud(trimmed);
      } else {
        await api.saveCloud(state);
      }
      eventBus.emit('game:cloud-saved');
      return true;
    } catch (error) {
      if (error.status !== 401) {
        logger.warn('[PersistenceManager] saveCloud failed:', error.message);
      }
      return false;
    }
  }

  async saveAll() {
    this.saveLocal();
    await this.saveCloud();
  }

  loadLocal() {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) return null;
      const saveData = JSON.parse(savedData);
      if (!saveData || !saveData.version || !saveData.state) return null;
      if (!saveData.state.resources || !saveData.state.structures || !saveData.state.upgrades) return null;
      return saveData;
    } catch (error) {
      logger.error('[PersistenceManager] loadLocal failed:', error.message);
      return null;
    }
  }

  async loadCloud() {
    try {
      const { default: api } = await import('../services/api.js');
      const data = await api.loadCloud();
      if (data.state) {
        stateManager.dispatch({ type: 'LOAD_STATE', payload: { state: data.state } });
        eventBus.emit('game:cloud-loaded');
        return true;
      }
      return false;
    } catch (error) {
      logger.warn('[PersistenceManager] loadCloud failed:', error.message);
      return false;
    }
  }

  onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.saveLocal();
      if (this.cloudSaveEnabled) this.saveCloud();
    }
  }

  onBeforeUnload() {
    this.saveLocal();
  }

  bindListeners() {
    if (this._listenersBound) return;
    this._listenersBound = true;
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    window.addEventListener('beforeunload', () => this.onBeforeUnload());
  }

  startAutoSave(interval = CONFIG.AUTO_SAVE_INTERVAL) {
    this.stopAutoSave();
    this.bindListeners();
    this.autoSaveInterval = setInterval(() => {
      if (this.autoSaveEnabled) {
        this.saveLocal();
        if (this.cloudSaveEnabled) this.saveCloud();
      }
    }, interval);
    logger.info('[PersistenceManager] Auto-save started');
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  setCloudEnabled(enabled) {
    this.cloudSaveEnabled = enabled;
  }

  exportSave() {
    try {
      const state = stateManager.getState();
      const exportData = { version: CONFIG.VERSION, timestamp: Date.now(), state };
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `idle_game_save_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      logger.error('[PersistenceManager] export failed:', error.message);
      return false;
    }
  }

  async importSave(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      if (!importData || !importData.version || !importData.state) throw new Error('Invalid save file');
      stateManager.dispatch({ type: 'LOAD_STATE', payload: { state: importData.state } });
      this.saveLocal();
      eventBus.emit('game:imported');
      return true;
    } catch (error) {
      logger.error('[PersistenceManager] import failed:', error.message);
      return false;
    }
  }

  deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      eventBus.emit('game:save-deleted');
      return true;
    } catch (error) {
      logger.error('[PersistenceManager] deleteSave failed:', error.message);
      return false;
    }
  }

  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  getSaveInfo() {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) return null;
      const saveData = JSON.parse(savedData);
      return { version: saveData.version, timestamp: saveData.timestamp, size: new Blob([savedData]).size };
    } catch {
      return null;
    }
  }
}

const persistenceManager = new PersistenceManager();
export default persistenceManager;
