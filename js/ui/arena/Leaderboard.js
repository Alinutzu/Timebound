import api from '../../services/api.js';
import Formatters from '../../utils/Formatters.js';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderLeaderboard() {
  return `
    <div class="arena-section" id="arena-leaderboard-section">
      <div class="arena-section-header">
        <h3>🏆 Leaderboard</h3>
        <span id="arena-my-rank"></span>
      </div>
      <div id="arena-leaderboard-list" class="arena-leaderboard-list">
        <p class="arena-loading">Loading leaderboard...</p>
      </div>
    </div>
  `;
}

export async function loadLeaderboard() {
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
