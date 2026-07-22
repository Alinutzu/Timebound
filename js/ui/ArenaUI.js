import api from '../services/api.js';
import eventBus from '../utils/EventBus.js';
import stateManager from '../core/StateManager.js';
import Formatters from '../utils/Formatters.js';

class ArenaUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('ArenaUI: container not found');
      return;
    }
    this.guardians = [];
    this.opponents = [];
    this.isGuest = false;
    this.connecting = false;
    this.energy = 0;
    this.gems = 0;
    this.pveCooldown = 0;
    this.pvpCooldown = 0;
    this.cooldownTimer = null;
    this.autoSaveTimer = null;
    this.render();
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
        this.showNotification('☁️ Cloud save loaded', 'info');
      }
    } catch (e) {}
  }

  async autoSave() {
    if (!api.getToken()) return;
    try {
      const state = stateManager.getState();
      await api.saveCloud(state);
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
    const token = api.getToken();
    this.container.innerHTML = `
      <div class="arena-container">
        ${this.connecting ? this.renderConnecting() : (token ? this.renderDashboard() : this.renderLogin())}
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
      const data = await api.guest();
      api.setToken(data.token);
      this.isGuest = data.isGuest;
      this.connecting = false;
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

  renderLogin() {
    return `
      <div class="arena-header">
        <h2>⚔️ Arena</h2>
        <p>Battle other players with your guardians!</p>
      </div>
      <div class="arena-login">
        <div class="arena-login-tabs">
          <button class="arena-auth-btn active" data-auth="login">Login</button>
          <button class="arena-auth-btn" data-auth="register">Register</button>
        </div>
        <form id="arena-auth-form">
          <input type="text" id="arena-username" placeholder="Username" required>
          <input type="email" id="arena-email" placeholder="Email (only for register)" style="display:none">
          <input type="password" id="arena-password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary btn-large">Connect</button>
        </form>
        <p class="arena-error" id="arena-error"></p>
        <div class="arena-guest-option">
          <hr style="border-color:#30363d;margin:16px 0">
          <button class="btn btn-secondary btn-large" id="arena-guest-btn">👤 Continue as Guest</button>
        </div>
      </div>
    `;
  }

  renderDashboard() {
    return `
      <div class="arena-header">
        <h2>⚔️ Arena ${this.isGuest ? '<span class="arena-guest-badge">GUEST</span>' : ''}</h2>
        <div class="arena-header-actions">
          <span id="arena-gems-display" class="arena-gems">💎 ${this.gems.toLocaleString()}</span>
          <span id="arena-energy-display" class="arena-energy">⚡ ${this.energy.toLocaleString()}</span>
          <span id="arena-username-display"></span>
          ${this.isGuest ? '<button class="btn btn-small btn-primary" id="arena-register-btn">📝 Register</button>' : ''}
          <button class="btn btn-small btn-secondary" id="arena-save-cloud">☁️ Save</button>
          <button class="btn btn-small btn-secondary" id="arena-load-cloud">☁️ Load</button>
          <button class="btn btn-small btn-danger" id="arena-logout">Logout</button>
        </div>
      </div>
      ${this.isGuest ? '<div class="arena-guest-banner">🔓 Guest mode — <button class="btn btn-small btn-primary" id="arena-register-btn-banner">Register</button> to save your progress permanently!</div>' : ''}
      <div class="arena-dashboard">
        <div class="arena-section" id="arena-guardians-section">
          <div class="arena-section-header">
            <h3>🛡️ My Guardians</h3>
            <button class="btn btn-primary" id="arena-summon-btn">✨ Summon (💎${ArenaUI.SUMMON_COST})</button>
          </div>
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
    const token = api.getToken();

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
      this.autoGuest();
    });

    document.getElementById('arena-auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('arena-username').value;
      const password = document.getElementById('arena-password').value;
      const errorEl = document.getElementById('arena-error');
      const active = this.container.querySelector('.arena-auth-btn.active');

      try {
        let data;
        if (active.dataset.auth === 'register') {
          const email = document.getElementById('arena-email').value;
          data = await api.register(username, email, password);
        } else {
          data = await api.login(username, password);
        }
        api.setToken(data.token);
        this.isGuest = false;
        this.render();
        await this.autoLoadCloud();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  }

  bindDashboardEvents() {
    document.getElementById('arena-logout')?.addEventListener('click', () => {
      this.stopAutoSave();
      api.clearToken();
      this.isGuest = false;
      this.connecting = false;
      this.render();
    });

    const registerBtn = document.getElementById('arena-register-btn') || document.getElementById('arena-register-btn-banner');
    registerBtn?.addEventListener('click', () => this.showRegisterForm());

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
        this.updateResourceDisplay();
        this.showBattleResult(result);
        this.loadGuardians();
        this.startCooldownTimer();
      } catch (err) {
        btn.disabled = false;
        btn.classList.remove('btn-disabled');
        const data = err.message.match(/\d+/);
        if (data) {
          this.pveCooldown = parseInt(data[0]);
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
    this.startAutoSave();
    const username = JSON.parse(atob(api.getToken().split('.')[1])).username;
    document.getElementById('arena-username-display').textContent = `👤 ${username}`;
    try {
      const user = await api.getUser();
      this.energy = user.energy || 0;
      this.gems = user.gems || 0;
      this.updateResourceDisplay();
    } catch (e) {}
    await Promise.all([this.loadGuardians(), this.loadLeaderboard()]);
  }

  updateResourceDisplay() {
    const energyEl = document.getElementById('arena-energy-display');
    if (energyEl) energyEl.textContent = `⚡ ${this.energy.toLocaleString()}`;
    const gemsEl = document.getElementById('arena-gems-display');
    if (gemsEl) gemsEl.textContent = `💎 ${this.gems.toLocaleString()}`;
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

    list.innerHTML = this.guardians.map(g => {
      const cost = ArenaUI.calculateLevelUpCost(g.level);
      const canAfford = this.energy >= cost;
      const maxLevel = g.level >= 50;
      return `
      <div class="arena-guardian-card ${g.rarity}" data-id="${g.id}">
        <div class="arena-guardian-info">
          <span class="arena-guardian-name">${g.name}</span>
          <span class="arena-guardian-rarity ${g.rarity}">${g.rarity}</span>
        </div>
        <div class="arena-guardian-stats">
          <span>❤️ ${g.hp}/${g.max_hp}</span>
          <span>⚔️ ${g.attack}</span>
          <span>🛡️ ${g.defense}</span>
          <span>⬆️ Lv.${g.level}</span>
        </div>
        <div class="arena-guardian-actions">
          <input type="checkbox" class="arena-guardian-select" data-id="${g.id}">
          ${maxLevel
            ? '<button class="btn btn-small btn-secondary" disabled>MAX</button>'
            : `<button class="btn btn-small btn-primary levelup-btn ${canAfford ? '' : 'btn-disabled'}" data-id="${g.id}" ${canAfford ? '' : 'disabled'}>⚡${cost.toLocaleString()}</button>`
          }
          <button class="btn btn-small btn-danger release-btn" data-id="${g.id}">Release</button>
        </div>
      </div>
    `}).join('');

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

    list.querySelectorAll('.release-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
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

  getSelectedGuardianIds() {
    return Array.from(this.container.querySelectorAll('.arena-guardian-select:checked'))
      .map(cb => parseInt(cb.dataset.id));
  }

  renderOpponents(opponents, selectedGuardianIds) {
    const list = document.getElementById('arena-opponents-list');
    if (opponents.length === 0) {
      list.innerHTML = `<p class="arena-empty">No opponents found. Try again later!</p>`;
      return;
    }

    list.innerHTML = `
      <h4>Select opponent:</h4>
      <div class="arena-opponents-grid">
        ${opponents.map(o => `
          <div class="arena-opponent-card">
            <div class="arena-opponent-info">
              <strong>${o.username}</strong>
              <span>Rating: ${o.rating}</span>
              <span>Power: ${o.guardian_power}</span>
              <span>W:${o.wins} L:${o.losses}</span>
            </div>
            <button class="btn btn-danger btn-small challenge-btn" data-defender="${o.user_id}">Challenge!</button>
          </div>
        `).join('')}
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
          const data = err.message.match(/\d+/);
          if (data) {
            this.pvpCooldown = parseInt(data[0]);
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
                <td>${e.username}</td>
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

  showRegisterForm() {
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
        const data = await api.convertGuest(username, email, password);
        api.setToken(data.token);
        this.isGuest = false;
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
