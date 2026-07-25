export function renderBattleResult(result) {
  const won = result.result === 'win';
  const ratingChange = result.attackerChange || result.ratingChange || 0;
  const playerPower = result.playerPower || result.attackerPower || 0;
  const enemyPower = result.enemyPower || result.defenderPower || 0;
  const diff = playerPower - enemyPower;
  const closeCall = Math.abs(diff) < 50;
  const enemyName = result.enemyName || (result.defender ? `@${result.defender}` : 'Enemy');

  return `
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
}

export function animateBattleResult(won) {
  const el = document.getElementById('arena-battle-result');
  if (!el) return;
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
