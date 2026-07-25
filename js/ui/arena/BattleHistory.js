import api from '../../services/api.js';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderBattleHistory() {
  return `
    <div class="arena-section" id="arena-history-section">
      <div class="arena-section-header">
        <h3>📜 Battle History</h3>
        <button class="btn btn-small btn-secondary" id="arena-history-toggle">Show</button>
      </div>
      <div id="arena-history-list" style="display:none">
        <p class="arena-loading">Loading history...</p>
      </div>
    </div>
  `;
}

export function bindBattleHistoryEvents() {
  document.getElementById('arena-history-toggle')?.addEventListener('click', async () => {
    const list = document.getElementById('arena-history-list');
    const btn = document.getElementById('arena-history-toggle');
    if (list.style.display === 'none') {
      list.style.display = 'block';
      btn.textContent = 'Hide';
      await loadBattleHistory();
    } else {
      list.style.display = 'none';
      btn.textContent = 'Show';
    }
  });
}

async function loadBattleHistory() {
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
