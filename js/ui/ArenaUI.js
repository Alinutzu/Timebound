import api from '../services/api.js';
import eventBus from '../utils/EventBus.js';
import stateManager from '../core/StateManager.js';
import Formatters from '../utils/Formatters.js';
import { io } from 'socket.io-client';
import authManager from '../api/AuthManager.js';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://familyhub.go.ro';

class ArenaUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('ArenaUI: container not found');
      return;
    }
    this.guardians = [];
    this.opponents = [];
    this.connecting = false;
    this.energy = 0;
    this.gems = 0;
    this.pveCooldown = 0;
    this.pvpCooldown = 0;
    this.cooldownTimer = null;
    this.autoSaveTimer = null;
    this.socket = null;
    this.selectedGuardianIds = new Set();
    this.guardianDetails = null;
    this.loginOnly = false;

    eventBus.on('auth:stateChanged', ({ state }) => {
      if (state === 'UNAUTHENTICATED') {
        this.stopAutoSave();
        this.disconnectSocket();
        if (this.cooldownTimer) {
          clearInterval(this.cooldownTimer);
          this.cooldownTimer = null;
        }
        this.connecting = false;
        this.render();
      }
    });

    this.render();
  }

  connectSocket() {
    if (this.socket?.connected) return;
    const token = authManager.getToken();
    if (!token) return;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10
    });
    this.socket.on('connect', () => {
      this.socket.emit('auth', { token });
    });
    this.socket.on('challenge_received', (data) => {
      eventBus.emit('notification:show', {
        message: `⚔️ ${data.fromUsername} challenges you!`,
        type: 'warning',
        duration: 8000
      });
    });
    this.socket.on('battle_start', (data) => {
      eventBus.emit('notification:show', {
        message: `⚔️ Battle started vs ${data.opponent}!`,
        type: 'info',
        duration: 5000
      });
    });
    this.socket.on('online_count', (count) => {
      const badge = document.getElementById('arena-badge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
      }
    });
    this.socket.on('auth_error', () => {
      authManager.logout();
    });
    this.socket.on('disconnect', () => {});
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  static SUMMON_COST = 50;
  static LEVELUP_BASE_COST = 10000;
  static LEVELUP_COST_MULTIPLIER = 1.5;

  static calculateLevelUpCost(level) {
    return Math.floor(ArenaUI.LEVELUP_BASE_COST * Math.pow(ArenaUI.LEVELUP_COST_MULTIPLIER, level));
  }

  async autoLoadCloud() {
    try {
      const data = await api.loadCloud();
      if (data.state) {
        stateManager.dispatch({ type: 'LOAD_STATE', payload: { state: data.state } });
        eventBus.emit('cloud:loaded');
        this.showNotification('☁️ Cloud save loaded', 'info');
      }
    } catch (e) {}
  }

  async autoSave() {
    if (!authManager.getToken()) return;
    try {
      const state = stateManager.getState();
      const payload = JSON.stringify(state);
      if (payload.length > 900000) {
        const trimmed = { resources: state.resources, stats: state.stats, structures: state.structures, upgrades: state.upgrades, guardians: state.guardians };
        await api.saveCloud(trimmed);
      } else {
        await api.saveCloud(state);
      }
    } catch (e) {}
  }

  startAutoSave() {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => this.autoSave(), 30000);
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  startCooldownTimer() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const pveBtn = document.getElementById('arena-pve-btn');
      const pvpBtn = document.getElementById('arena-pvp-btn');
      let updated = false;

      if (this.pveCooldown > 0) {
        this.pveCooldown--;
        if (pveBtn) pveBtn.textContent = `⏳ ${this.pveCooldown}s`;
        updated = true;
      } else if (pveBtn) {
        pveBtn.textContent = '⚔️ Train (PvE)';
        pveBtn.disabled = false;
        pveBtn.classList.remove('btn-disabled');
      }

      if (this.pvpCooldown > 0) {
        this.pvpCooldown--;
        if (pvpBtn) pvpBtn.textContent = `⏳ ${this.pvpCooldown}s`;
        updated = true;
      } else if (pvpBtn) {
        pvpBtn.textContent = '🔥 Find Opponent (PvP)';
        pvpBtn.disabled = false;
        pvpBtn.classList.remove('btn-disabled');
      }

      if (!updated) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }

  render() {
    const token = authManager.getToken();
    this.container.innerHTML = `
      <div class="arena-container">
        ${this.connecting ? this.renderConnecting() : (token ? this.renderDashboard() : this.renderLogin(this.loginOnly))}
      </div>
    `;
    this.bindEvents();
  }

  async autoGuest() {
    this.connecting = true;
    this.container.innerHTML = `
      <div class="arena-container">
        <div class="arena-connecting">
          <div class="loading-spinner"></div>
          <p>Connecting to Arena...</p>
        </div>
      </div>
    `;
    try {
      const data = await authManager.guest();
      if (data.user) {
        this.energy = data.user.energy || 0;
        this.gems = data.user.gems || 0;
      }
      this.connecting = false;
      this.connectSocket();
      this.render();
      await this.autoLoadCloud();
    } catch (err) {
      this.connecting = false;
      this.container.innerHTML = `
        <div class="arena-container">
          ${this.renderLogin()}
          <p class="arena-error">Could not connect. Try again.</p>
        </div>
      `;
      this.bindEvents();
    }
  }

  renderConnecting() {
    return `
      <div class="arena-connecting">
        <div class="loading-spinner"></div>
        <p>Connecting to Arena...</p>
      </div>
    `;
  }

  renderLogin(loginOnly = false) {
    return `
      <div class="arena-header">
        <h2>⚔️ Arena</h2>
        <p>Battle other players with your guardians!</p>
      </div>
      <div class="arena-login">
        ${!loginOnly ? `
        <div class="arena-login-tabs">
          <button class="arena-auth-btn active" data-auth="login">Login</button>
          <button class="arena-auth-btn" data-auth="register">Register</button>
        </div>
        ` : ''}
        <form id="arena-auth-form">
          <input type="text" id="arena-username" placeholder="Username" required autocomplete="username">
          <input type="email" id="arena-email" placeholder="Email (only for register)" style="display:${loginOnly ? 'none' : 'none'}" autocomplete="email">
          <input type="password" id="arena-password" placeholder="Password" required autocomplete="current-password">
          <button type="submit" class="btn btn-primary btn-large">Connect</button>
        </form>
        <p class="arena-error" id="arena-error"></p>
        ${!loginOnly ? `
        <div class="arena-guest-option">
          <hr style="border-color:#30363d;margin:16px 0">
          <button class="btn btn-secondary btn-large" id="arena-guest-btn">👤 Continue as Guest</button>
        </div>
        ` : '<p style="margin-top:16px;text-align:center"><button class="btn btn-secondary" id="arena-back-to-guest">← Back</button></p>'}
      </div>
    `;
  }

  renderDashboard() {
    const guest = authManager.isGuest();
    return `
      <div class="arena-header">
        <h2>⚔️ Arena ${guest ? '<span class="arena-guest-badge">GUEST</span>' : ''}</h2>
        <div class="arena-header-actions">
          <span id="arena-gems-display" class="arena-gems">💎 ${this.gems.toLocaleString()}</span>
          <span id="arena-energy-display" class="arena-energy">⚡ ${this.energy.toLocaleString()}</span>
          <span id="arena-username-display"></span>
          ${guest
            ? '<button class="btn btn-small btn-primary" id="arena-register-btn">🔑 Login</button>'
            : '<button class="btn btn-small btn-danger" id="arena-logout">Logout</button>'}
          <button class="btn btn-small btn-secondary" id="arena-save-cloud">☁️ Save</button>
          <button class="btn btn-small btn-secondary" id="arena-load-cloud">☁️ Load</button>
        </div>
      </div>
      ${guest ? '<div class="arena-guest-banner">🔓 Guest mode — <button class="btn btn-small btn-primary" id="arena-register-btn-banner">Register</button> to save your progress permanently!</div>' : ''}
      <div class="arena-dashboard">
        <div class="arena-section" id="arena-guardians-section">
          <div class="arena-section-header">
            <h3>🛡️ My Guardians</h3>
            <button class="btn btn-primary" id="arena-summon-btn">✨ Summon (💎${ArenaUI.SUMMON_COST})</button>
          </div>
          ${this.gems < ArenaUI.SUMMON_COST ? '<p class="arena-insufficient" id="arena-summon-warning">💎 Insufficient gems! Complete quests or win battles to earn more.</p>' : ''}
          <div id="arena-guardians-list" class="arena-guardians-list">
            <p class="arena-loading">Loading guardians...</p>
          </div>
        </div>
        <div class="arena-section" id="arena-battle-section">
          <div class="arena-section-header">
            <h3>⚔️ Battle</h3>
          </div>
          <div class="arena-battle-actions">
            <button class="btn btn-success" id="arena-pve-btn">⚔️ Train (PvE)</button>
            <button class="btn btn-danger" id="arena-pvp-btn">🔥 Find Opponent (PvP)</button>
          </div>
          <div id="arena-battle-result"></div>
          <div id="arena-opponents-list"></div>
        </div>
        <div class="arena-section" id="arena-history-section">
          <div class="arena-section-header">
            <h3>📜 Battle History</h3>
            <button class="btn btn-small btn-secondary" id="arena-history-toggle">Show</button>
          </div>
          <div id="arena-history-list" style="display:none">
            <p class="arena-loading">Loading history...</p>
          </div>
        </div>
        <div class="arena-section" id="arena-leaderboard-section">
          <div class="arena-section-header">
            <h3>🏆 Leaderboard</h3>
            <span id="arena-my-rank"></span>
          </div>
          <div id="arena-leaderboard-list" class="arena-leaderboard-list">
            <p class="arena-loading">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const token = authManager.getToken();

    if (!token) {
      this.bindAuthEvents();
    } else {
      this.bindDashboardEvents();
      this.loadDashboard();
    }
  }

  bindAuthEvents() {
    const tabs = this.container.querySelectorAll('.arena-auth-btn');
    const emailField = document.getElementById('arena-email');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        emailField.style.display = tab.dataset.auth === 'register' ? 'block' : 'none';
      });
    });

    document.getElementById('arena-guest-btn')?.addEventListener('click', () => {
      this.loginOnly = false;
      this.autoGuest();
    });

    document.getElementById('arena-back-to-guest')?.addEventListener('click', () => {
      this.loginOnly = false;
      this.render();
    });

    const tokenFromStorage = authManager.getToken();
    if (tokenFromStorage) {
      this.connectSocket();
    }

    document.getElementById('arena-auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('arena-username').value;
      const password = document.getElementById('arena-password').value;
      const errorEl = document.getElementById('arena-error');
      const active = this.container.querySelector('.arena-auth-btn.active');

      try {
        let data;
        if (active && active.dataset.auth === 'register') {
          const email = document.getElementById('arena-email').value;
          data = await authManager.register(username, email, password);
        } else {
          data = await authManager.login(username, password);
        }
        this.loginOnly = false;
        if (data.user) {
          this.energy = data.user.energy || 0;
          this.gems = data.user.gems || 0;
        }
        this.connectSocket();
        this.render();
        await this.autoLoadCloud();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  }

  bindDashboardEvents() {
    document.getElementById('arena-logout')?.addEventListener('click', () => {
      authManager.logout();
    });

    document.getElementById('arena-register-btn')?.addEventListener('click', () => {
      authManager.logout();
      this.loginOnly = true;
      this.render();
    });

    document.getElementById('arena-register-btn-banner')?.addEventListener('click', () => this.showRegisterForm());

    this.updateSummonButton();

    document.getElementById('arena-summon-btn')?.addEventListener('click', async () => {
      try {
        const result = await api.summonGuardian();
        this.gems = result.gems;
        this.updateResourceDisplay();
        this.showNotification(`✨ Summoned ${result.guardian.name} (${result.guardian.rarity})`, 'success');
        this.loadGuardians();
      } catch (err) {
        this.showNotification(err.message, 'warning');
      }
    });

    document.getElementById('arena-pve-btn')?.addEventListener('click', async () => {
      const selected = this.getSelectedGuardianIds();
      if (selected.length === 0) {
        return this.showNotification('Select at least one guardian', 'warning');
      }
      const btn = document.getElementById('arena-pve-btn');
      btn.disabled = true;
      btn.classList.add('btn-disabled');
      try {
        const result = await api.battlePvE(selected);
        if (result.cooldown) this.pveCooldown = result.cooldown;
        if (result.gems != null) this.gems = result.gems;
        if (result.energy != null) this.energy = result.energy;
        this.updateResourceDisplay();
        this.showBattleResult(result);
        if (result.guardians) {
          result.guardians.forEach(updated => {
            const idx = this.guardians.findIndex(g => g.id === updated.id);
            if (idx !== -1) Object.assign(this.guardians[idx], updated);
          });
        }
        this.renderGuardians();
        this.loadLeaderboard();
        this.startCooldownTimer();
      } catch (err) {
        btn.disabled = false;
        btn.classList.remove('btn-disabled');
        if (err.data?.cooldown) {
          this.pveCooldown = err.data.cooldown;
          this.startCooldownTimer();
        }
        this.showNotification(err.message, 'warning');
      }
    });

    document.getElementById('arena-pvp-btn')?.addEventListener('click', async () => {
      const selected = this.getSelectedGuardianIds();
      if (selected.length === 0) {
        return this.showNotification('Select at least one guardian', 'warning');
      }
      try {
        this.showNotification('Searching for opponent...', 'info');
        const opponents = await api.getOpponents();
        this.renderOpponents(opponents, selected);
      } catch (err) {
        this.showNotification(err.message, 'warning');
      }
    });

    document.getElementById('arena-history-toggle')?.addEventListener('click', async () => {
      const list = document.getElementById('arena-history-list');
      const btn = document.getElementById('arena-history-toggle');
      if (list.style.display === 'none') {
        list.style.display = 'block';
        btn.textContent = 'Hide';
        await this.loadBattleHistory();
      } else {
        list.style.display = 'none';
        btn.textContent = 'Show';
      }
    });

    document.getElementById('arena-save-cloud')?.addEventListener('click', async () => {
      try {
        const state = stateManager.getState();
        await api.saveCloud(state);
        this.showNotification('Game saved to cloud!', 'success');
      } catch (err) {
        this.showNotification(err.message, 'warning');
      }
    });

    document.getElementById('arena-load-cloud')?.addEventListener('click', async () => {
      try {
        const data = await api.loadCloud();
        if (data.state) {
          stateManager.dispatch({ type: 'LOAD_STATE', payload: { state: data.state } });
          this.showNotification('Game loaded from cloud!', 'success');
        }
      } catch (err) {
        this.showNotification(err.message, 'warning');
      }
    });
  }

  async loadDashboard() {
    this.connectSocket();
    this.startAutoSave();
    try {
      const user = authManager.getUser();
      if (user) {
        document.getElementById('arena-username-display').textContent = `👤 ${user.username}`;
      }
    } catch {
      authManager.logout();
      return;
    }
    try {
      const user = await api.getUser();
      this.energy = user.energy || 0;
      this.gems = user.gems || 0;
      this.updateResourceDisplay();
    } catch (e) {
      if (e.status === 401) {
        authManager.logout();
        return;
      }
    }
    await Promise.all([this.loadGuardians(), this.loadLeaderboard()]);
  }

  updateResourceDisplay() {
    const energyEl = document.getElementById('arena-energy-display');
    if (energyEl) energyEl.textContent = `⚡ ${this.energy.toLocaleString()}`;
    const gemsEl = document.getElementById('arena-gems-display');
    if (gemsEl) gemsEl.textContent = `💎 ${this.gems.toLocaleString()}`;
    this.updateSummonButton();
  }

  updateSummonButton() {
    const btn = document.getElementById('arena-summon-btn');
    const warn = document.getElementById('arena-summon-warning');
    if (!btn) return;
    const canAfford = this.gems >= ArenaUI.SUMMON_COST;
    if (canAfford) {
      btn.disabled = false;
      btn.classList.remove('btn-disabled');
      if (warn) warn.style.display = 'none';
    } else {
      btn.disabled = true;
      btn.classList.add('btn-disabled');
      if (warn) warn.style.display = 'block';
    }
  }

  async loadGuardians() {
    try {
      this.guardians = await api.getGuardians();
      this.renderGuardians();
    } catch (err) {
      document.getElementById('arena-guardians-list').innerHTML = `<p class="arena-error">Failed to load guardians</p>`;
    }
  }

  renderGuardians() {
    const list = document.getElementById('arena-guardians-list');
    if (this.guardians.length === 0) {
      list.innerHTML = `<p class="arena-empty">No guardians yet. Summon one!</p>`;
      return;
    }

    const prevSelected = this.selectedGuardianIds || new Set();
    this.selectedGuardianIds = new Set();

    list.innerHTML = `
      <div class="arena-select-actions">
        <button class="btn btn-small btn-secondary" id="arena-select-all">✅ Select All</button>
        <button class="btn btn-small btn-secondary" id="arena-select-clear">Clear</button>
        <span class="arena-select-count" id="arena-select-count">0 selected</span>
      </div>
    ` + this.guardians.map(g => {
      const cost = ArenaUI.calculateLevelUpCost(g.level);
      const canAfford = this.energy >= cost;
      const maxLevel = g.level >= 50;
      const safeName = escapeHtml(g.name);
      const safeRarity = escapeHtml(g.rarity);
      const checked = prevSelected.has(g.id) ? 'checked' : '';
      if (checked) this.selectedGuardianIds.add(g.id);
      return `
      <div class="arena-guardian-card ${g.rarity}" data-id="${g.id}">
        <div class="arena-guardian-info">
          <span class="arena-guardian-name guardian-details-trigger" data-id="${g.id}">${safeName}</span>
          <span class="arena-guardian-rarity ${g.rarity}">${safeRarity}</span>
        </div>
        <div class="arena-guardian-stats">
          <span>❤️ ${g.hp}/${g.max_hp}</span>
          <span>⚔️ ${g.attack}</span>
          <span>🛡️ ${g.defense}</span>
          <span>⬆️ Lv.${g.level}</span>
        </div>
        <div class="arena-guardian-actions">
          <input type="checkbox" class="arena-guardian-select" data-id="${g.id}" ${checked}>
          ${maxLevel
            ? '<button class="btn btn-small btn-secondary" disabled>MAX</button>'
            : `<button class="btn btn-small btn-primary levelup-btn ${canAfford ? '' : 'btn-disabled'}" data-id="${g.id}" ${canAfford ? '' : 'disabled'}>⚡${cost.toLocaleString()}</button>`
          }
        </div>
        <button class="btn btn-small btn-danger btn-release-row" data-id="${g.id}">🗑️ Release</button>
      </div>
    `}).join('');

    document.getElementById('arena-select-all')?.addEventListener('click', () => {
      list.querySelectorAll('.arena-guardian-select').forEach(cb => { cb.checked = true; this.selectedGuardianIds.add(parseInt(cb.dataset.id)); });
      this.updateSelectCount();
    });

    document.getElementById('arena-select-clear')?.addEventListener('click', () => {
      list.querySelectorAll('.arena-guardian-select').forEach(cb => { cb.checked = false; });
      this.selectedGuardianIds.clear();
      this.updateSelectCount();
    });

    list.querySelectorAll('.arena-guardian-select').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = parseInt(cb.dataset.id);
        if (cb.checked) this.selectedGuardianIds.add(id);
        else this.selectedGuardianIds.delete(id);
        this.updateSelectCount();
      });
    });
    this.updateSelectCount();

    list.querySelectorAll('.levelup-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const result = await api.levelUpGuardian(parseInt(btn.dataset.id));
          this.energy = result.energy;
          this.updateResourceDisplay();
          this.showNotification(`${result.guardian.name} → Lv.${result.guardian.level}! (-⚡${result.cost.toLocaleString()})`, 'success');
          this.loadGuardians();
        } catch (err) {
          this.showNotification(err.message, 'warning');
        }
      });
    });

    list.addEventListener('click', (e) => {
      const card = e.target.closest('.arena-guardian-card');
      if (!card) return;
      const id = parseInt(card.dataset.id);
      if (e.target.closest('.levelup-btn') || e.target.closest('.arena-guardian-select') || e.target.closest('.btn-release-row')) return;
      const g = this.guardians.find(g => g.id === id);
      if (g) this.showGuardianDetails(g);
    });

    list.querySelectorAll('.btn-release-row').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const guardian = this.guardians.find(g => g.id === parseInt(btn.dataset.id));
        const name = guardian ? guardian.name : 'this guardian';
        const rarity = guardian ? guardian.rarity : 'unknown';
        const rarities = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
        const rarityName = rarities[rarity] || rarity;
        const warnings = {
          common: 'Are you sure? This action cannot be undone.',
          uncommon: 'Are you sure? This action cannot be undone.',
          rare: 'Are you sure? This Rare guardian will be lost forever!',
          epic: '⚠️ This Epic guardian is valuable! Are you absolutely sure?',
          legendary: '❌ LEGENDARY GUARDIAN! Are you absolutely sure you want to release this? This is permanent!'
        };
        const confirmed = await this.showConfirmDialog(`Release ${rarityName} Guardian`, `${warnings[rarity] || warnings.common}`);
        if (!confirmed) return;
        try {
          await api.releaseGuardian(parseInt(btn.dataset.id));
          this.showNotification('Guardian released', 'info');
          this.loadGuardians();
        } catch (err) {
          this.showNotification(err.message, 'warning');
        }
      });
    });
  }

  showConfirmDialog(title, message) {
    return new Promise(resolve => {
      const existing = document.querySelector('.confirm-dialog-overlay');
      if (existing) existing.remove();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay confirm-dialog-overlay';
      overlay.innerHTML = `
        <div class="modal-content confirm-dialog">
          <h3 style="margin-top:0">${title}</h3>
          <p style="color:var(--text-secondary);margin:var(--spacing-md) 0">${message}</p>
          <div class="confirm-dialog-actions">
            <button class="btn btn-danger confirm-yes">Yes, Release</button>
            <button class="btn btn-secondary confirm-no">Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('.confirm-yes').addEventListener('click', () => { overlay.remove(); resolve(true); });
      overlay.querySelector('.confirm-no').addEventListener('click', () => { overlay.remove(); resolve(false); });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
    });
  }

  showGuardianDetails(g) {
    const existing = document.querySelector('.guardian-details-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay guardian-details-overlay';
    const cost = ArenaUI.calculateLevelUpCost(g.level);
    const power = g.attack + g.defense + g.hp;
    const maxLevel = g.level >= 50;
    const rarityColors = { common: '#9ca3af', uncommon: '#10b981', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' };
    const color = rarityColors[g.rarity] || '#9ca3af';

    overlay.innerHTML = `
      <div class="modal-content guardian-details-modal" style="border-top: 4px solid ${color}">
        <div class="guardian-details-header" style="text-align:center;margin-bottom:16px">
          <div style="font-size:1.4rem;font-weight:800;color:${color}">${escapeHtml(g.name)}</div>
          <div class="arena-guardian-rarity ${g.rarity}" style="display:inline-block;margin-top:4px">${escapeHtml(g.rarity)}</div>
        </div>
        <div class="guardian-details-grid">
          <div class="guardian-detail-card">
            <span class="detail-label">Level</span>
            <span class="detail-value">${g.level}${maxLevel ? ' ⭐ MAX' : ''}</span>
          </div>
          <div class="guardian-detail-card">
            <span class="detail-label">❤️ HP</span>
            <span class="detail-value">${g.hp.toLocaleString()} / ${g.max_hp.toLocaleString()}</span>
          </div>
          <div class="guardian-detail-card">
            <span class="detail-label">⚔️ Attack</span>
            <span class="detail-value">${g.attack.toLocaleString()}</span>
          </div>
          <div class="guardian-detail-card">
            <span class="detail-label">🛡️ Defense</span>
            <span class="detail-value">${g.defense.toLocaleString()}</span>
          </div>
          <div class="guardian-detail-card detail-card-highlight" style="border-color:${color}">
            <span class="detail-label">⚡ Total Power</span>
            <span class="detail-value" style="color:${color}">${power.toLocaleString()}</span>
          </div>
        </div>
        <div class="guardian-details-footer" style="margin-top:16px;text-align:center">
          ${maxLevel
            ? '<p style="color:var(--text-secondary)">⭐ This guardian has reached max level!</p>'
            : `<p style="color:var(--text-secondary);font-size:0.85rem">Next level cost: ⚡${cost.toLocaleString()} | ⬆️ Lv.${g.level + 1}</p>`
          }
          <button class="btn btn-secondary guardian-details-close" style="margin-top:8px">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.guardian-details-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  updateSelectCount() {
    const el = document.getElementById('arena-select-count');
    if (el) el.textContent = `${this.selectedGuardianIds?.size || 0} selected`;
  }

  getSelectedGuardianIds() {
    return Array.from(this.selectedGuardianIds || []);
  }

  renderOpponents(opponents, selectedGuardianIds) {
    const list = document.getElementById('arena-opponents-list');
    if (opponents.length === 0) {
      list.innerHTML = `<p class="arena-empty">No opponents found. Try again later!</p>`;
      return;
    }

    const playerPower = selectedGuardianIds.reduce((sum, id) => {
      const g = this.guardians.find(g => g.id === id);
      return sum + (g ? g.attack + g.defense + g.hp : 0);
    }, 0);

    list.innerHTML = `
      <div class="arena-opponents-header">
        <h4>Select opponent</h4>
        <span class="arena-player-power">Your Power: ⚡${playerPower.toLocaleString()}</span>
      </div>
      <div class="arena-opponents-grid">
        ${opponents.map(o => {
          const oppPower = o.guardian_power || 0;
          const diff = playerPower - oppPower;
          let difficulty, diffLabel, diffClass;
          if (oppPower === 0) { difficulty = '❓'; diffLabel = 'Unknown'; diffClass = 'diff-unknown'; }
          else if (diff > 200) { difficulty = '🟢'; diffLabel = 'Easy'; diffClass = 'diff-easy'; }
          else if (diff > -100) { difficulty = '🟡'; diffLabel = 'Fair'; diffClass = 'diff-fair'; }
          else { difficulty = '🔴'; diffLabel = 'Hard'; diffClass = 'diff-hard'; }
          return `
          <div class="arena-opponent-card ${diffClass}">
            <div class="arena-opponent-info">
              <strong>${escapeHtml(o.username)}</strong>
              <span>Rating: ${o.rating}</span>
              <span>Power: ${oppPower.toLocaleString() || 'N/A'}</span>
              <span>W:${o.wins} L:${o.losses}</span>
              <span class="arena-diff-badge ${diffClass}">${difficulty} ${diffLabel}</span>
            </div>
            <button class="btn btn-danger btn-small challenge-btn" data-defender="${o.user_id}">Challenge!</button>
          </div>
        `}).join('')}
      </div>
    `;

    list.querySelectorAll('.challenge-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          const result = await api.battlePvP(selectedGuardianIds, parseInt(btn.dataset.defender));
          if (result.cooldown) this.pvpCooldown = result.cooldown;
          if (result.gems != null) this.gems = result.gems;
          this.updateResourceDisplay();
          this.showBattleResult(result);
          this.loadGuardians();
          this.loadLeaderboard();
          this.startCooldownTimer();
        } catch (err) {
          btn.disabled = false;
          if (err.data?.cooldown) {
            this.pvpCooldown = err.data.cooldown;
            this.startCooldownTimer();
          }
          this.showNotification(err.message, 'warning');
        }
      });
    });
  }

  async loadLeaderboard() {
    try {
      const [leaderboard, myRank] = await Promise.all([
        api.getLeaderboard(20),
        api.getMyRank().catch(() => null)
      ]);

      const rankEl = document.getElementById('arena-my-rank');
      if (myRank) {
        rankEl.textContent = `#${myRank.rank} | Rating: ${myRank.rating} | W:${myRank.wins} L:${myRank.losses}`;
      }

      const list = document.getElementById('arena-leaderboard-list');
      list.innerHTML = `
        <table class="arena-leaderboard-table">
          <thead>
            <tr><th>#</th><th>Player</th><th>Rating</th><th>W/L</th><th>Power</th></tr>
          </thead>
          <tbody>
            ${leaderboard.entries.map((e, i) => `
              <tr>
                <td>${i + 1 + leaderboard.offset}</td>
                <td>${escapeHtml(e.username)}</td>
                <td>${e.rating}</td>
                <td>${e.wins}/${e.losses}</td>
                <td>${e.guardian_power}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      document.getElementById('arena-leaderboard-list').innerHTML = `<p class="arena-error">Failed to load leaderboard</p>`;
    }
  }

  async loadBattleHistory() {
    try {
      const data = await api.getBattleHistory(20);
      const list = document.getElementById('arena-history-list');
      if (!data.entries || data.entries.length === 0) {
        list.innerHTML = `<p class="arena-empty">No battles yet. Start fighting!</p>`;
        return;
      }
      list.innerHTML = `
        <table class="arena-history-table">
          <thead>
            <tr><th>Result</th><th>Type</th><th>Opponent</th><th>Power</th><th>Rewards</th></tr>
          </thead>
          <tbody>
            ${data.entries.map(e => `
              <tr class="history-row-${e.result}">
                <td><span class="history-badge ${e.result}">${e.result === 'win' ? '✅' : '❌'} ${e.result.toUpperCase()}</span></td>
                <td>${e.type === 'pvp' ? '⚔️ PvP' : '🤖 PvE'}</td>
                <td>${escapeHtml(e.enemyName)}</td>
                <td>${e.playerPower?.toLocaleString() || '-'}</td>
                <td>${[
                  e.expReward ? `⭐+${e.expReward}` : '',
                  e.gemsReward ? `💎+${e.gemsReward}` : ''
                ].filter(Boolean).join(' ') || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch {
      document.getElementById('arena-history-list').innerHTML = `<p class="arena-error">Failed to load history</p>`;
    }
  }

  showRegisterForm() {
    const existingOverlay = document.querySelector('.modal-overlay');
    if (existingOverlay) existingOverlay.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content arena-register-modal">
        <h2>📝 Register Your Account</h2>
        <p>Convert your guest progress to a permanent account!</p>
        <form id="arena-convert-form">
          <input type="text" id="arena-convert-username" placeholder="Username" required>
          <input type="email" id="arena-convert-email" placeholder="Email" required>
          <input type="password" id="arena-convert-password" placeholder="Password (min 6 chars)" required>
          <div class="arena-convert-actions">
            <button type="submit" class="btn btn-primary">Register</button>
            <button type="button" class="btn btn-secondary" id="arena-convert-cancel">Cancel</button>
          </div>
        </form>
        <p class="arena-error" id="arena-convert-error"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#arena-convert-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#arena-convert-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('arena-convert-username').value;
      const email = document.getElementById('arena-convert-email').value;
      const password = document.getElementById('arena-convert-password').value;
      const errorEl = document.getElementById('arena-convert-error');

      try {
        const data = await authManager.convert(username, email, password);
        this.disconnectSocket();
        overlay.remove();
        this.render();
        await this.autoLoadCloud();
        this.showNotification('Account created! Progress saved permanently.', 'success');
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  }

  showBattleResult(result) {
    const el = document.getElementById('arena-battle-result');
    const won = result.result === 'win';
    const ratingChange = result.attackerChange || result.ratingChange || 0;
    const playerPower = result.playerPower || result.attackerPower || 0;
    const enemyPower = result.enemyPower || result.defenderPower || 0;
    const diff = playerPower - enemyPower;
    const closeCall = Math.abs(diff) < 50;
    const enemyName = result.enemyName || (result.defender ? `@${result.defender}` : 'Enemy');

    el.innerHTML = `
      <div class="arena-battle-result ${won ? 'victory' : 'defeat'} ${closeCall ? 'close-call' : ''}">
        <div class="battle-animation">
          <div class="battle-emblem">${won ? '🏆' : '💀'}</div>
          ${closeCall ? '<div class="battle-close-call">⚡ CLOSE CALL!</div>' : ''}
        </div>
        <h3 class="battle-title ${won ? 'victory-title' : 'defeat-title'}">
          ${won ? 'VICTORY' : 'DEFEAT'}
        </h3>
        <div class="battle-vs">${won ? 'You beat' : 'You lost to'} <strong>${enemyName}</strong></div>
        <p class="battle-message">${result.message || ''}</p>
        <div class="battle-stats-grid">
          <div class="battle-stat-card ${won ? 'win' : ''}">
            <span class="stat-label">⚔️ Your Power</span>
            <span class="stat-value">${playerPower.toLocaleString()}</span>
          </div>
          <div class="battle-stat-card vs-divider">
            <span class="stat-label">⚡</span>
            <span class="stat-value">VS</span>
          </div>
          <div class="battle-stat-card ${won ? '' : 'win'}">
            <span class="stat-label">👹 ${enemyName}</span>
            <span class="stat-value">${enemyPower.toLocaleString()}</span>
          </div>
        </div>
        <div class="battle-rewards">
          ${result.expReward ? `<span class="reward-badge">⭐ +${result.expReward} EXP</span>` : ''}
          ${result.gemsReward ? `<span class="reward-badge">💎 +${result.gemsReward}</span>` : ''}
          ${result.energyReward ? `<span class="reward-badge">⚡ +${result.energyReward}</span>` : ''}
          ${result.gemsWager ? `<span class="reward-badge ${result.result === 'win' ? 'rating-up' : 'rating-down'}">💎 ${result.result === 'win' ? '+' : '-'}${result.gemsWager} Wager</span>` : ''}
          ${ratingChange ? `<span class="reward-badge ${ratingChange > 0 ? 'rating-up' : 'rating-down'}">📊 ${ratingChange > 0 ? '+' : ''}${ratingChange} Rating</span>` : ''}
          ${result.cooldown ? `<span class="reward-badge cooldown-badge">⏳ ${result.cooldown}s cooldown</span>` : ''}
        </div>
      </div>
    `;

    if (won) {
      el.querySelector('.battle-emblem')?.animate([
        { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
        { transform: 'scale(1.2) rotate(10deg)', opacity: 1, offset: 0.5 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 }
      ], { duration: 600, easing: 'ease-out' });
    } else {
      el.querySelector('.battle-emblem')?.animate([
        { transform: 'translateY(-20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 400, easing: 'ease-out' });
    }

    el.scrollIntoView({ behavior: 'smooth' });
  }

  showNotification(message, type) {
    eventBus.emit('notification:show', { message, type, duration: 3000 });
  }
}

export default ArenaUI;
