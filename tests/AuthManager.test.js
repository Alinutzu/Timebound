/**
 * AuthManager Tests
 *
 * Tests auth state machine, transitions, and event emission.
 * Run: node --test tests/AuthManager.test.js
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ===== MOCKS =====

const mockLogger = {
  _logs: [],
  info(mod, msg) { this._logs.push({ level: 'info', mod, msg }); },
  warn(mod, msg) { this._logs.push({ level: 'warn', mod, msg }); },
  error(mod, msg) { this._logs.push({ level: 'error', mod, msg }); },
  clear() { this._logs = []; }
};

function createMockEventBus() {
  const listeners = new Map();
  const emitted = [];
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
    clear() { listeners.clear(); emitted.length = 0; }
  };
}

function createMockApi(tokenValue = null) {
  let token = tokenValue;
  const errorMap = {};
  return {
    _token: token,
    getToken() { return token; },
    setToken(t) { token = t; this._token = t; },
    clearToken() { token = null; this._token = null; },
    _setError(path, error) { errorMap[path] = error; },
    async request(method, path, body = null) {
      if (errorMap[path]) throw errorMap[path];
      return { token: encodeToken({ username: 'testuser', id: 1 }), user: { username: 'testuser', id: 1 } };
    }
  };
}

// Encode a fake JWT payload
function encodeToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const body = btoa(JSON.stringify(payload));
  const sig = 'fakesig';
  return `${header}.${body}.${sig}`;
}

// Inline AuthManager (mirrors js/api/AuthManager.js)
const STATES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  GUEST: 'GUEST',
  AUTHENTICATED: 'AUTHENTICATED'
};

class AuthManager {
  constructor(api, eventBus, logger) {
    this._api = api;
    this._eb = eventBus;
    this._log = logger;
    this.state = STATES.UNAUTHENTICATED;
    this.user = null;
    this._restoreFromToken();

    this._eb.on('session:expired', () => {
      this._setState(STATES.UNAUTHENTICATED, { user: null });
    });
  }

  _restoreFromToken() {
    const token = this._api.getToken();
    if (!token) {
      this.state = STATES.UNAUTHENTICATED;
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.user = { username: payload.username, id: payload.id };
      this.state = payload.username?.startsWith('guest_') ? STATES.GUEST : STATES.AUTHENTICATED;
    } catch (e) {
      this._log.warn('AuthManager', 'Token decode failed:', e.message);
      this.state = STATES.UNAUTHENTICATED;
      this.user = null;
    }
  }

  _setState(newState, extra = {}) {
    this.state = newState;
    if ('user' in extra) this.user = extra.user;
    this._eb.emit('auth:stateChanged', { state: this.state, user: this.user, ...extra });
    this._log.info('AuthManager', this.state, this.user?.username || '');
  }

  async guest() {
    const data = await this._api.request('POST', '/auth/guest');
    this._api.setToken(data.token);
    this._setState(STATES.GUEST, { user: data.user, isGuest: true });
    return data;
  }

  async login(username, password) {
    const data = await this._api.request('POST', '/auth/login', { username, password });
    this._api.setToken(data.token);
    this._setState(STATES.AUTHENTICATED, { user: data.user, isGuest: false });
    return data;
  }

  async register(username, email, password) {
    const data = await this._api.request('POST', '/auth/register', { username, email, password });
    this._api.setToken(data.token);
    this._setState(STATES.AUTHENTICATED, { user: data.user, isGuest: false });
    return data;
  }

  async convert(username, email, password) {
    const data = await this._api.request('POST', '/auth/convert', { username, email, password });
    this._api.setToken(data.token);
    this._setState(STATES.AUTHENTICATED, { user: data.user, isGuest: false });
    return data;
  }

  logout() {
    this._api.clearToken();
    this._setState(STATES.UNAUTHENTICATED, { user: null });
  }

  getToken() { return this._api.getToken(); }
  isGuest() { return this.state === STATES.GUEST; }
  isAuthenticated() { return this.state === STATES.AUTHENTICATED; }

  restore() {
    this._restoreFromToken();
    return this.state;
  }

  getState() { return this.state; }
  getUser() { return this.user; }
}

// ===== TESTS =====

describe('AuthManager', () => {
  let api, eb, auth;

  beforeEach(() => {
    api = createMockApi(null);
    eb = createMockEventBus();
    mockLogger.clear();
    auth = new AuthManager(api, eb, mockLogger);
  });

  // --- Constructor / restore ---

  describe('constructor', () => {
    it('starts UNAUTHENTICATED when no token', () => {
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
      assert.equal(auth.user, null);
    });

    it('restores GUEST state from guest token', () => {
      const guestToken = encodeToken({ username: 'guest_abc123', id: 42 });
      api = createMockApi(guestToken);
      eb = createMockEventBus();
      auth = new AuthManager(api, eb, mockLogger);
      assert.equal(auth.state, STATES.GUEST);
      assert.equal(auth.user.username, 'guest_abc123');
    });

    it('restores AUTHENTICATED state from user token', () => {
      const userToken = encodeToken({ username: 'player1', id: 7 });
      api = createMockApi(userToken);
      eb = createMockEventBus();
      auth = new AuthManager(api, eb, mockLogger);
      assert.equal(auth.state, STATES.AUTHENTICATED);
      assert.equal(auth.user.username, 'player1');
      assert.equal(auth.user.id, 7);
    });

    it('handles malformed token gracefully', () => {
      api = createMockApi('not.a.valid.token');
      eb = createMockEventBus();
      auth = new AuthManager(api, eb, mockLogger);
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
      assert.equal(auth.user, null);
    });
  });

  // --- guest() ---

  describe('guest()', () => {
    it('transitions to GUEST state', async () => {
      await auth.guest();
      assert.equal(auth.state, STATES.GUEST);
    });

    it('sets user from response', async () => {
      const data = await auth.guest();
      assert.deepEqual(auth.user, data.user);
    });

    it('sets token via api', async () => {
      await auth.guest();
      assert.ok(api.getToken(), 'token should be set');
      assert.ok(api.getToken().includes('.'), 'token should be JWT format');
    });

    it('emits auth:stateChanged', async () => {
      await auth.guest();
      const event = eb.emitted.find(e => e.event === 'auth:stateChanged');
      assert.ok(event, 'should emit auth:stateChanged');
      assert.equal(event.data.state, STATES.GUEST);
    });

    it('isGuest() returns true after guest()', async () => {
      await auth.guest();
      assert.equal(auth.isGuest(), true);
      assert.equal(auth.isAuthenticated(), false);
    });
  });

  // --- login() ---

  describe('login()', () => {
    it('transitions to AUTHENTICATED', async () => {
      await auth.login('user', 'pass');
      assert.equal(auth.state, STATES.AUTHENTICATED);
    });

    it('sets user and token', async () => {
      await auth.login('user', 'pass');
      assert.equal(auth.user.username, 'testuser');
      assert.ok(api.getToken(), 'token should be set');
      assert.ok(api.getToken().includes('.'), 'token should be JWT format');
    });

    it('emits auth:stateChanged', async () => {
      await auth.login('user', 'pass');
      const event = eb.emitted.find(e => e.event === 'auth:stateChanged');
      assert.ok(event);
      assert.equal(event.data.state, STATES.AUTHENTICATED);
      assert.equal(event.data.isGuest, false);
    });

    it('isAuthenticated() returns true', async () => {
      await auth.login('user', 'pass');
      assert.equal(auth.isAuthenticated(), true);
      assert.equal(auth.isGuest(), false);
    });
  });

  // --- register() ---

  describe('register()', () => {
    it('transitions to AUTHENTICATED', async () => {
      await auth.register('newuser', 'email@test.com', 'pass');
      assert.equal(auth.state, STATES.AUTHENTICATED);
    });

    it('emits auth:stateChanged', async () => {
      await auth.register('newuser', 'email@test.com', 'pass');
      const event = eb.emitted.find(e => e.event === 'auth:stateChanged');
      assert.ok(event);
      assert.equal(event.data.state, STATES.AUTHENTICATED);
    });
  });

  // --- convert() ---

  describe('convert()', () => {
    it('transitions from GUEST to AUTHENTICATED', async () => {
      await auth.guest();
      assert.equal(auth.state, STATES.GUEST);
      await auth.convert('newuser', 'email@test.com', 'pass');
      assert.equal(auth.state, STATES.AUTHENTICATED);
    });
  });

  // --- logout() ---

  describe('logout()', () => {
    it('transitions to UNAUTHENTICATED', async () => {
      await auth.login('user', 'pass');
      auth.logout();
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
    });

    it('clears user', async () => {
      await auth.login('user', 'pass');
      auth.logout();
      assert.equal(auth.user, null);
    });

    it('clears token', async () => {
      await auth.login('user', 'pass');
      auth.logout();
      assert.equal(api.getToken(), null);
    });

    it('emits auth:stateChanged', async () => {
      await auth.login('user', 'pass');
      eb.clear();
      auth.logout();
      const event = eb.emitted.find(e => e.event === 'auth:stateChanged');
      assert.ok(event);
      assert.equal(event.data.state, STATES.UNAUTHENTICATED);
    });
  });

  // --- restore() ---

  describe('restore()', () => {
    it('returns current state after restore', async () => {
      await auth.login('user', 'pass');
      const state = auth.restore();
      assert.equal(state, STATES.AUTHENTICATED);
    });

    it('re-evaluates token', () => {
      assert.equal(auth.restore(), STATES.UNAUTHENTICATED);
      const userToken = encodeToken({ username: 'player1', id: 7 });
      api.setToken(userToken);
      const state = auth.restore();
      assert.equal(state, STATES.AUTHENTICATED);
    });
  });

  // --- session:expired ---

  describe('session:expired event', () => {
    it('transitions to UNAUTHENTICATED', async () => {
      await auth.login('user', 'pass');
      assert.equal(auth.state, STATES.AUTHENTICATED);
      eb.emit('session:expired', {});
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
      assert.equal(auth.user, null);
    });
  });

  // --- Query methods ---

  describe('query methods', () => {
    it('getState() returns current state', () => {
      assert.equal(auth.getState(), STATES.UNAUTHENTICATED);
    });

    it('getUser() returns current user', () => {
      assert.equal(auth.getUser(), null);
    });

    it('getToken() delegates to api', async () => {
      assert.equal(auth.getToken(), null);
      await auth.guest();
      assert.ok(api.getToken(), 'token should be set');
    });
  });

  // --- Error cases ---

  describe('error cases', () => {
    it('guest() stays UNAUTHENTICATED when API rejects', async () => {
      api._setError('/auth/guest', new Error('server error'));
      try { await auth.guest(); } catch {}
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
      assert.equal(auth.user, null);
    });

    it('login() stays UNAUTHENTICATED when API rejects', async () => {
      api._setError('/auth/login', new Error('Invalid credentials'));
      try { await auth.login('user', 'wrong'); } catch {}
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
    });

    it('register() stays UNAUTHENTICATED when API rejects', async () => {
      api._setError('/auth/register', new Error('Username taken'));
      try { await auth.register('dup', 'e@e.com', 'pass'); } catch {}
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
    });

    it('convert() stays UNAUTHENTICATED when API rejects', async () => {
      api._setError('/auth/convert', new Error('Conversion failed'));
      try { await auth.convert('user', 'e@e.com', 'pass'); } catch {}
      assert.equal(auth.state, STATES.UNAUTHENTICATED);
    });

    it('convert() transitions from GUEST to AUTHENTICATED on success', async () => {
      await auth.guest();
      assert.equal(auth.state, STATES.GUEST);
      await auth.convert('newuser', 'email@test.com', 'pass');
      assert.equal(auth.state, STATES.AUTHENTICATED);
      assert.equal(auth.user.username, 'testuser');
    });

    it('guest() does not set token when API rejects', async () => {
      api._setError('/auth/guest', new Error('fail'));
      try { await auth.guest(); } catch {}
      assert.equal(api.getToken(), null);
    });

    it('login() does not set token when API rejects', async () => {
      api._setError('/auth/login', new Error('fail'));
      try { await auth.login('user', 'wrong'); } catch {}
      assert.equal(api.getToken(), null);
    });
  });
});
