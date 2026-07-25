import api from '../services/api.js';
import eventBus from '../utils/EventBus.js';
import authManager from '../api/AuthManager.js';
import logger from '../utils/Logger.js';
import persistenceManager from '../core/PersistenceManager.js';
import { io } from 'socket.io-client';

import { renderGuardianSection, bindGuardianEvents, loadGuardians, updateSummonButton } from './arena/GuardianList.js';
import { renderBattlePanel, bindBattleEvents, startCooldownTimer } from './arena/BattlePanel.js';
import { renderBattleResult, animateBattleResult } from './arena/BattleResult.js';
import { renderLeaderboard, loadLeaderboard } from './arena/Leaderboard.js';
import { renderBattleHistory, bindBattleHistoryEvents } from './arena/BattleHistory.js';

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
    this.socket = null;
    this.selectedGuardianIds = new Set();
    this.loginOnly = false;

    eventBus.on('auth:stateChanged', ({ state }) => {
      if (state === 'UNAUTHENTICATED') {
        persistenceManager.setCloudEnabled(false);
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
    if (!authManager.getToken()) return;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10
    });
    this.socket.on('connect', () => {
      const freshToken = authManager.getToken();
      if (!freshToken) { this.socket.disconnect(); return; }
      this.socket.emit('auth', { token: freshToken });
    });
    this.socket.on('challenge_received', (data) => {
      eventBus.emit('notification:show', { message: `⚔️ ${data.fromUsername} challenges you!`, type: 'warning', duration: 8000 });
    });
    this.socket.on('battle_start', (data) => {
      eventBus.emit('notification:show', { message: `⚔️ Battle started vs ${data.opponent}!`, type: 'info', duration: 5000 });
    });
    this.socket.on('online_count', (count) => {
      const badge = document.getElementById('arena-badge');
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline' : 'none'; }
    });
    this.socket.on('auth_error', () => { authManager.logout(); });
    this.socket.on('disconnect', () => {});
  }

  disconnectSocket() {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
  }

  async autoLoadCloud() {
    const ok = await persistenceManager.loadCloud();
    if (ok) this.showNotification('☁️ Cloud save loaded', 'info');
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
      if (data.user) { this.energy = data.user.energy || 0; this.gems = data.user.gems || 0; }
      this.connecting = false;
      this.connectSocket();
      this.render();
      await this.autoLoadCloud();
    } catch (err) {
      this.connecting = false;
      this.container.innerHTML = `<div class="arena-container">${this.renderLogin()}<p class="arena-error">Could not connect. Try again.</p></div>`;
      this.bindEvents();
    }
  }

  renderConnecting() {
    return `<div class="arena-connecting"><div class="loading-spinner"></div><p>Connecting to Arena...</p></div>`;
  }

  renderLogin(loginOnly = false) {
    return `
      <div class="arena-header">
        <h2>⚔️ Arena</h2>
        <p>Battle other players with your guardians!</p>
      </div>
      <div class="arena-login">
        ${!loginOnly ? `<div class="arena-login-tabs">
          <button class="arena-auth-btn active" data-auth="login">Login</button>
          <button class="arena-auth-btn" data-auth="register">Register</button>
        </div>` : ''}
        <form id="arena-auth-form">
          <input type="text" id="arena-username" placeholder="Username" required autocomplete="username">
          <input type="email" id="arena-email" placeholder="Email (only for register)" style="display:${loginOnly ? 'none' : 'none'}" autocomplete="email">
          <input type="password" id="arena-password" placeholder="Password" required autocomplete="current-password">
          <button type="submit" class="btn btn-primary btn-large">Connect</button>
        </form>
        <p class="arena-error" id="arena-error"></p>
        ${!loginOnly ? `<div class="arena-guest-option">
          <hr style="border-color:#30363d;margin:16px 0">
          <button class="btn btn-secondary btn-large" id="arena-guest-btn">👤 Continue as Guest</button>
        </div>` : '<p style="margin-top:16px;text-align:center"><button class="btn btn-secondary" id="arena-back-to-guest">← Back</button></p>'}
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
        ${renderGuardianSection(this.gems)}
        ${renderBattlePanel()}
        ${renderBattleHistory()}
        ${renderLeaderboard()}
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
    document.getElementById('arena-guest-btn')?.addEventListener('click', () => { this.loginOnly = false; this.autoGuest(); });
    document.getElementById('arena-back-to-guest')?.addEventListener('click', () => { this.loginOnly = false; this.render(); });
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
        if (data.user) { this.energy = data.user.energy || 0; this.gems = data.user.gems || 0; }
        this.connectSocket();
        this.render();
        await this.autoLoadCloud();
      } catch (err) { errorEl.textContent = err.message; }
    });
  }

  bindDashboardEvents() {
    document.getElementById('arena-logout')?.addEventListener('click', () => { authManager.logout(); });
    document.getElementById('arena-register-btn')?.addEventListener('click', () => { authManager.logout(); this.loginOnly = true; this.render(); });
    document.getElementById('arena-register-btn-banner')?.addEventListener('click', () => this.showRegisterForm());
    document.getElementById('arena-save-cloud')?.addEventListener('click', async () => {
      try { await persistenceManager.saveCloud(); this.showNotification('Game saved to cloud!', 'success'); }
      catch (err) { this.showNotification(err.message, 'warning'); }
    });
    document.getElementById('arena-load-cloud')?.addEventListener('click', async () => {
      try { const ok = await persistenceManager.loadCloud(); if (ok) this.showNotification('Game loaded from cloud!', 'success'); }
      catch (err) { this.showNotification(err.message, 'warning'); }
    });

    bindGuardianEvents(this);
    bindBattleEvents(this);
    bindBattleHistoryEvents();
    updateSummonButton(this.gems);
  }

  async loadDashboard() {
    this.connectSocket();
    try {
      const user = authManager.getUser();
      if (user) document.getElementById('arena-username-display').textContent = `👤 ${user.username}`;
    } catch { authManager.logout(); return; }
    try {
      const user = await api.getUser();
      this.energy = user.energy || 0;
      this.gems = user.gems || 0;
    } catch (e) {
      if (e.status === 401) { authManager.logout(); return; }
    }
    await Promise.all([loadGuardians(this), loadLeaderboard()]);
  }

  onBattleResult(result, type) {
    if (result.cooldown) {
      if (type === 'pve') this.pveCooldown = result.cooldown;
      else this.pvpCooldown = result.cooldown;
    }
    if (result.gems != null) this.gems = result.gems;
    if (result.energy != null) this.energy = result.energy;
    const el = document.getElementById('arena-battle-result');
    el.innerHTML = renderBattleResult(result);
    animateBattleResult(result.result === 'win');
    if (result.guardians) {
      result.guardians.forEach(updated => {
        const idx = this.guardians.findIndex(g => g.id === updated.id);
        if (idx !== -1) Object.assign(this.guardians[idx], updated);
      });
    }
    loadGuardians(this);
    loadLeaderboard();
    startCooldownTimer(this);
  }

  setCooldown(type, seconds) {
    if (type === 'pve') this.pveCooldown = seconds;
    else this.pvpCooldown = seconds;
    startCooldownTimer(this);
  }

  getSelectedGuardianIds() {
    return Array.from(this.selectedGuardianIds || []);
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
        await authManager.convert(username, email, password);
        this.disconnectSocket();
        overlay.remove();
        this.render();
        await this.autoLoadCloud();
        this.showNotification('Account created! Progress saved permanently.', 'success');
      } catch (err) { errorEl.textContent = err.message; }
    });
  }

  showNotification(message, type) {
    eventBus.emit('notification:show', { message, type, duration: 3000 });
  }
}

export default ArenaUI;
