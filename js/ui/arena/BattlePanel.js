import api from '../../services/api.js';

export function renderBattlePanel() {
  return `
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
  `;
}

export function bindBattleEvents(arena) {
  document.getElementById('arena-pve-btn')?.addEventListener('click', async () => {
    const selected = arena.getSelectedGuardianIds();
    if (selected.length === 0) {
      return arena.showNotification('Select at least one guardian', 'warning');
    }
    const btn = document.getElementById('arena-pve-btn');
    btn.disabled = true;
    btn.classList.add('btn-disabled');
    try {
      const result = await api.battlePvE(selected);
      arena.onBattleResult(result, 'pve');
    } catch (err) {
      btn.disabled = false;
      btn.classList.remove('btn-disabled');
      if (err.data?.cooldown) {
        arena.setCooldown('pve', err.data.cooldown);
      }
      arena.showNotification(err.message, 'warning');
    }
  });

  document.getElementById('arena-pvp-btn')?.addEventListener('click', async () => {
    const selected = arena.getSelectedGuardianIds();
    if (selected.length === 0) {
      return arena.showNotification('Select at least one guardian', 'warning');
    }
    try {
      arena.showNotification('Searching for opponent...', 'info');
      const opponents = await api.getOpponents();
      const { renderOpponents } = await import('./OpponentList.js');
      renderOpponents(opponents, selected, arena.guardians, arena);
    } catch (err) {
      arena.showNotification(err.message, 'warning');
    }
  });
}

export function startCooldownTimer(arena) {
  if (arena.cooldownTimer) clearInterval(arena.cooldownTimer);
  arena.cooldownTimer = setInterval(() => {
    const pveBtn = document.getElementById('arena-pve-btn');
    const pvpBtn = document.getElementById('arena-pvp-btn');
    let updated = false;

    if (arena.pveCooldown > 0) {
      arena.pveCooldown--;
      if (pveBtn) pveBtn.textContent = `⏳ ${arena.pveCooldown}s`;
      updated = true;
    } else if (pveBtn) {
      pveBtn.textContent = '⚔️ Train (PvE)';
      pveBtn.disabled = false;
      pveBtn.classList.remove('btn-disabled');
    }

    if (arena.pvpCooldown > 0) {
      arena.pvpCooldown--;
      if (pvpBtn) pvpBtn.textContent = `⏳ ${arena.pvpCooldown}s`;
      updated = true;
    } else if (pvpBtn) {
      pvpBtn.textContent = '🔥 Find Opponent (PvP)';
      pvpBtn.disabled = false;
      pvpBtn.classList.remove('btn-disabled');
    }

    if (!updated) {
      clearInterval(arena.cooldownTimer);
      arena.cooldownTimer = null;
    }
  }, 1000);
}
