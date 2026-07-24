import api from '../services/api.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

const STATES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  GUEST: 'GUEST',
  AUTHENTICATED: 'AUTHENTICATED'
};

class AuthManager {
  constructor() {
    this.state = STATES.UNAUTHENTICATED;
    this.user = null;
    this._restoreFromToken();

    eventBus.on('session:expired', () => {
      this._setState(STATES.UNAUTHENTICATED, { user: null });
    });
  }

  _restoreFromToken() {
    const token = api.getToken();
    if (!token) {
      this.state = STATES.UNAUTHENTICATED;
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.user = { username: payload.username, id: payload.id };
      this.state = payload.username?.startsWith('guest_') ? STATES.GUEST : STATES.AUTHENTICATED;
    } catch (e) {
      logger.warn('[AuthManager] Token decode failed:', e.message);
      this.state = STATES.UNAUTHENTICATED;
      this.user = null;
    }
  }

  _setState(newState, extra = {}) {
    this.state = newState;
    if (extra.user) this.user = extra.user;
    eventBus.emit('auth:stateChanged', { state: this.state, user: this.user, ...extra });
    logger.info('[AuthManager]', this.state, this.user?.username || '');
  }

  async guest() {
    const data = await api.request('POST', '/auth/guest');
    api.setToken(data.token);
    this._setState(STATES.GUEST, { user: data.user, isGuest: true });
    return data;
  }

  async login(username, password) {
    const data = await api.request('POST', '/auth/login', { username, password });
    api.setToken(data.token);
    this._setState(STATES.AUTHENTICATED, { user: data.user, isGuest: false });
    return data;
  }

  async register(username, email, password) {
    const data = await api.request('POST', '/auth/register', { username, email, password });
    api.setToken(data.token);
    this._setState(STATES.AUTHENTICATED, { user: data.user, isGuest: false });
    return data;
  }

  async convert(username, email, password) {
    const data = await api.request('POST', '/auth/convert', { username, email, password });
    api.setToken(data.token);
    this._setState(STATES.AUTHENTICATED, { user: data.user, isGuest: false });
    return data;
  }

  logout() {
    api.clearToken();
    this._setState(STATES.UNAUTHENTICATED, { user: null });
  }

  getToken() {
    return api.getToken();
  }

  isGuest() {
    return this.state === STATES.GUEST;
  }

  isAuthenticated() {
    return this.state === STATES.AUTHENTICATED;
  }

  restore() {
    this._restoreFromToken();
    return this.state;
  }

  getState() {
    return this.state;
  }

  getUser() {
    return this.user;
  }
}

const authManager = new AuthManager();
export default authManager;
export { STATES };
