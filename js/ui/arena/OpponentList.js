import api from '../../services/api.js';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderOpponents(opponents, selectedGuardianIds, guardians, arena) {
  const list = document.getElementById('arena-opponents-list');
  if (opponents.length === 0) {
    list.innerHTML = `<p class="arena-empty">No opponents found. Try again later!</p>`;
    return;
  }

  const playerPower = selectedGuardianIds.reduce((sum, id) => {
    const g = guardians.find(g => g.id === id);
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
        arena.onBattleResult(result, 'pvp');
      } catch (err) {
        btn.disabled = false;
        if (err.data?.cooldown) {
          arena.setCooldown('pvp', err.data.cooldown);
        }
        arena.showNotification(err.message, 'warning');
      }
    });
  });
}
