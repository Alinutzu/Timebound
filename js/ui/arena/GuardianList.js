import api from '../../services/api.js';

const SUMMON_COST = 50;
const LEVELUP_BASE_COST = 10000;
const LEVELUP_COST_MULTIPLIER = 1.5;

function calculateLevelUpCost(level) {
  return Math.floor(LEVELUP_BASE_COST * Math.pow(LEVELUP_COST_MULTIPLIER, level));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderGuardianSection(gems) {
  return `
    <div class="arena-section" id="arena-guardians-section">
      <div class="arena-section-header">
        <h3>🛡️ My Guardians</h3>
        <button class="btn btn-primary" id="arena-summon-btn">✨ Summon (💎${SUMMON_COST})</button>
      </div>
      ${gems < SUMMON_COST ? '<p class="arena-insufficient" id="arena-summon-warning">💎 Insufficient gems! Complete quests or win battles to earn more.</p>' : ''}
      <div id="arena-guardians-list" class="arena-guardians-list">
        <p class="arena-loading">Loading guardians...</p>
      </div>
    </div>
  `;
}

export function updateSummonButton(gems) {
  const btn = document.getElementById('arena-summon-btn');
  const warn = document.getElementById('arena-summon-warning');
  if (!btn) return;
  const canAfford = gems >= SUMMON_COST;
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

export function bindGuardianEvents(arena) {
  document.getElementById('arena-summon-btn')?.addEventListener('click', async () => {
    try {
      const result = await api.summonGuardian();
      arena.gems = result.gems;
      arena.showNotification(`✨ Summoned ${result.guardian.name} (${result.guardian.rarity})`, 'success');
      loadGuardians(arena);
    } catch (err) {
      arena.showNotification(err.message, 'warning');
    }
  });
}

export async function loadGuardians(arena) {
  try {
    arena.guardians = await api.getGuardians();
    renderGuardians(arena);
  } catch (err) {
    document.getElementById('arena-guardians-list').innerHTML = `<p class="arena-error">Failed to load guardians</p>`;
  }
}

export function renderGuardians(arena) {
  const list = document.getElementById('arena-guardians-list');
  if (arena.guardians.length === 0) {
    list.innerHTML = `<p class="arena-empty">No guardians yet. Summon one!</p>`;
    return;
  }

  const prevSelected = arena.selectedGuardianIds || new Set();
  arena.selectedGuardianIds = new Set();

  list.innerHTML = `
    <div class="arena-select-actions">
      <button class="btn btn-small btn-secondary" id="arena-select-all">✅ Select All</button>
      <button class="btn btn-small btn-secondary" id="arena-select-clear">Clear</button>
      <span class="arena-select-count" id="arena-select-count">0 selected</span>
    </div>
  ` + arena.guardians.map(g => {
    const cost = calculateLevelUpCost(g.level);
    const canAfford = arena.energy >= cost;
    const maxLevel = g.level >= 50;
    const safeName = escapeHtml(g.name);
    const safeRarity = escapeHtml(g.rarity);
    const checked = prevSelected.has(g.id) ? 'checked' : '';
    if (checked) arena.selectedGuardianIds.add(g.id);
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
    list.querySelectorAll('.arena-guardian-select').forEach(cb => { cb.checked = true; arena.selectedGuardianIds.add(parseInt(cb.dataset.id)); });
    updateSelectCount(arena);
  });

  document.getElementById('arena-select-clear')?.addEventListener('click', () => {
    list.querySelectorAll('.arena-guardian-select').forEach(cb => { cb.checked = false; });
    arena.selectedGuardianIds.clear();
    updateSelectCount(arena);
  });

  list.querySelectorAll('.arena-guardian-select').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = parseInt(cb.dataset.id);
      if (cb.checked) arena.selectedGuardianIds.add(id);
      else arena.selectedGuardianIds.delete(id);
      updateSelectCount(arena);
    });
  });
  updateSelectCount(arena);

  list.querySelectorAll('.levelup-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const result = await api.levelUpGuardian(parseInt(btn.dataset.id));
        arena.energy = result.energy;
        arena.showNotification(`${result.guardian.name} → Lv.${result.guardian.level}! (-⚡${result.cost.toLocaleString()})`, 'success');
        loadGuardians(arena);
      } catch (err) {
        arena.showNotification(err.message, 'warning');
      }
    });
  });

  list.addEventListener('click', (e) => {
    const card = e.target.closest('.arena-guardian-card');
    if (!card) return;
    const id = parseInt(card.dataset.id);
    if (e.target.closest('.levelup-btn') || e.target.closest('.arena-guardian-select') || e.target.closest('.btn-release-row')) return;
    const g = arena.guardians.find(g => g.id === id);
    if (g) showGuardianDetails(g);
  });

  list.querySelectorAll('.btn-release-row').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const guardian = arena.guardians.find(g => g.id === parseInt(btn.dataset.id));
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
      const confirmed = await showConfirmDialog(`Release ${rarityName} Guardian`, `${warnings[rarity] || warnings.common}`);
      if (!confirmed) return;
      try {
        await api.releaseGuardian(parseInt(btn.dataset.id));
        arena.showNotification('Guardian released', 'info');
        loadGuardians(arena);
      } catch (err) {
        arena.showNotification(err.message, 'warning');
      }
    });
  });
}

function updateSelectCount(arena) {
  const el = document.getElementById('arena-select-count');
  if (el) el.textContent = `${arena.selectedGuardianIds?.size || 0} selected`;
}

function showConfirmDialog(title, message) {
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

function showGuardianDetails(g) {
  const existing = document.querySelector('.guardian-details-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay guardian-details-overlay';
  const cost = calculateLevelUpCost(g.level);
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
