/**
 * PuzzleUI - Manages puzzle tab and mini-games
 * FIXED VERSION: Includes Match3, 2048 AND Fixed Daily Spin
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import Match3Game from './games/Match3Game.js';
import DailySpinGame from './games/DailySpinGame.js';
import Game2048 from './games/Game2048.js';
import stateManager from '../core/StateManager.js';

class PuzzleUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`PuzzleUI: Container ${containerId} not found`);
      return;
    }
    
    this.currentGame = null;
    this.match3Game = null;
    this.dailySpinGame = DailySpinGame;
    this.game2048 = Game2048;
    this.countdownInterval = null;
    
    this.render();
    this.subscribe();
    this.startCountdownUpdate();
    
    logger.info('PuzzleUI', 'Initialized');
  }
  
  subscribe() {
    eventBus.on('boss:battle-started', (data) => this.startBossPuzzle(data));
    eventBus.on('quest:claimed', () => this.render());
    eventBus.on('structure:purchased', () => this.render());
    eventBus.on('ascension:completed', () => this.render());
    eventBus.on('puzzle:won', () => this.render());
    eventBus.on('daily-spin:purchased-spins', () => this.render());
  }
  
  startCountdownUpdate() {
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }
  
  updateCountdown() {
    const countdownEl = document.getElementById('spin-countdown');
    if (countdownEl) countdownEl.innerHTML = this.getCountdownText();
    
    const statusEl = document.getElementById('spin-status');
    if (statusEl) statusEl.innerHTML = this.getSpinStatus();
  }
  
  render() {
    // Renderează meniul principal cu toate cardurile
    this.container.innerHTML = `
      <div class="puzzle-games-grid">
        
        <!-- Match-3 Game Card -->
        <div class="puzzle-game-card" id="match3-card">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🧩</div>
            <h3>Match-3 Puzzle</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Match 3 or more gems to score points</p>
            <p class="puzzle-game-use">Used for: Boss Battles</p>
          </div>
          <div class="puzzle-game-stats">
            <div class="stat">
              <span class="label">Best Score:</span>
              <span class="value" id="match3-best-score">0</span>
            </div>
            <div class="stat">
              <span class="label">Games Played:</span>
              <span class="value" id="match3-games-played">0</span>
            </div>
          </div>
          <button class="btn btn-primary btn-large" id="play-match3-btn">
            🎮 Play Practice Game
          </button>
        </div>
        
        <!-- 2048 Game Card -->
        <div class="puzzle-game-card" id="game2048-card">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🎲</div>
            <h3>2048 Puzzle</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Merge tiles to reach 2048!</p>
            <p class="puzzle-game-use">Rewards: Gems, Crystals, Energy</p>
          </div>
          <div class="puzzle-game-stats">
            <div class="stat">
              <span class="label">High Score:</span>
              <span class="value" id="2048-high-score">${this.game2048.getStats().highScore}</span>
            </div>
            <div class="stat">
              <span class="label">Games Played:</span>
              <span class="value" id="2048-games-played">${this.game2048.getStats().gamesPlayed}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-large" id="play-2048-btn">
            🎮 Play 2048
          </button>
        </div>
        
        <!-- Daily Spin Card -->
        <div class="puzzle-game-card" id="daily-spin-card">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🎡</div>
            <h3>Daily Spin</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Spin the wheel for rewards!</p>
            <p class="puzzle-game-use">FREE daily at midnight! 🕛</p>
          </div>
          <div class="puzzle-game-stats">
            <div class="stat">
              <span class="label">Free Spin:</span>
              <span class="value" id="spin-status">${this.getSpinStatus()}</span>
            </div>
            ${this.getPurchasedSpinsDisplay()}
          </div>
          <div class="spin-countdown" id="spin-countdown" style="
            text-align: center; margin: 10px 0; padding: 8px;
            background: var(--bg-tertiary); border-radius: var(--radius-md);
            font-size: 0.875rem; color: var(--text-secondary);
          ">
            ${this.getCountdownText()}
          </div>
          <button class="btn btn-primary btn-large" id="play-spin-btn">
            🎡 Spin the Wheel
          </button>
        </div>
        
      </div>
      
      <!-- Puzzle Game Container (hidden by default) -->
      <div id="puzzle-game-active" style="display: none;"></div>
    `;
    
    this.bindEvents();
    this.updateStats();
  }
  
  bindEvents() {
    document.getElementById('play-match3-btn')?.addEventListener('click', () => this.startPracticeMatch3());
    document.getElementById('play-2048-btn')?.addEventListener('click', () => this.start2048Game());
    document.getElementById('play-spin-btn')?.addEventListener('click', () => this.startDailySpin());
  }

  // ... (Match3 și 2048 Code - Păstrat intact) ...
  startPracticeMatch3() {
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'none';
    const gameContainer = document.getElementById('puzzle-game-active');
    gameContainer.style.display = 'block';
    
    this.match3Game = new Match3Game(gameContainer, {
      mode: 'practice', maxMoves: 20, targetScore: 500,
      onComplete: (r) => this.onPuzzleComplete(r),
      onExit: () => this.exitPuzzle()
    });
  }

  startBossPuzzle(bossData) { /* ...Codul tău original pentru Boss... */
      const { boss, bossKey } = bossData;
      const puzzleReq = boss.puzzleRequirement;
      const modalContent = document.getElementById('boss-battle-content');
      if (!modalContent) return;
      modalContent.innerHTML = `<div class="boss-battle-header"></div><div id="boss-puzzle-container"></div>`;
      const puzzleContainer = document.getElementById('boss-puzzle-container');
      
      this.match3Game = new Match3Game(puzzleContainer, {
          mode: 'boss', bossKey: bossKey, bossName: boss.name,
          maxMoves: puzzleReq.maxMoves, targetScore: puzzleReq.targetScore, difficulty: puzzleReq.difficulty,
          onComplete: (r) => this.onBossPuzzleComplete(r, bossKey),
          onExit: () => this.exitBossPuzzle()
      });
  }

  onPuzzleComplete(result) {
      stateManager.dispatch({ type: 'INCREMENT_STATISTIC', payload: { key: 'puzzlesPlayed', amount: 1 } });
      const currentHighScore = stateManager.getState().statistics.puzzleHighScore || 0;
      if (result.score > currentHighScore) {
          stateManager.dispatch({ type: 'UPDATE_STATISTIC', payload: { key: 'puzzleHighScore', value: result.score } });
      }
      if (result.won) stateManager.dispatch({ type: 'INCREMENT_STATISTIC', payload: { key: 'puzzlesWon', amount: 1 } });
      this.showPuzzleResults(result);
      eventBus.emit('puzzle:practice-completed', result);
  }

  onBossPuzzleComplete(result, bossKey) {
      eventBus.emit('puzzle:completed', { score: result.score, combo: result.bestCombo, moves: result.movesUsed, bossKey });
      const damage = result.totalDamage || result.score;
      eventBus.emit('notification:show', { message: `💥 ${damage} damage dealt! Combo: ${result.bestCombo}x`, type: 'success', duration: 3000 });
  }

  // ... (2048 Code - Păstrat intact) ...
  start2048Game() {
      const grid = this.container.querySelector('.puzzle-games-grid');
      if (grid) grid.style.display = 'none';
      const gameContainer = document.getElementById('puzzle-game-active');
      gameContainer.style.display = 'block';
      const gameState = this.game2048.newGame();
      this.render2048UI(gameContainer, gameState);
  }

  render2048UI(container, gameState) {
      container.innerHTML = `
        <div class="game-2048-container">
          <div class="game-2048-header">
            <div class="game-2048-score">
              <div class="score-label">Score</div>
              <div class="score-value" id="game2048-score">${gameState.score}</div>
            </div>
            <button class="btn btn-secondary" id="game2048-new-game">New Game</button>
            <button class="btn btn-secondary" id="game2048-exit">Exit</button>
          </div>
          <div class="game-2048-grid" id="game2048-grid">${this.render2048Grid(gameState.grid)}</div>
          <div class="game-2048-controls"><p class="swipe-hint">Use arrow keys</p></div>
        </div>`;
      this.bind2048Controls(container);
  }

  render2048Grid(grid) {
      let html = '';
      for (let row of grid) { for (let cell of row) {
          const value = cell || '';
          html += `<div class="grid-cell ${cell ? '' : 'empty'}" data-value="${cell}">${value}</div>`;
      }}
      return html;
  }
  
  bind2048Controls(container) { /* ...Logica de controale 2048... */ 
      const handleKeyPress = (e) => {
          const keyMap = { 'ArrowUp':'up', 'ArrowDown':'down', 'ArrowLeft':'left', 'ArrowRight':'right', 'w':'up', 's':'down', 'a':'left', 'd':'right' };
          if (keyMap[e.key]) { e.preventDefault(); this.move2048(keyMap[e.key]); }
      };
      if (container._keyHandler) document.removeEventListener('keydown', container._keyHandler);
      document.addEventListener('keydown', handleKeyPress);
      container._keyHandler = handleKeyPress;
      
      document.getElementById('game2048-new-game')?.addEventListener('click', () => {
          const newState = this.game2048.newGame();
          this.render2048UI(container, newState);
      });
      document.getElementById('game2048-exit')?.addEventListener('click', () => this.exit2048Game(container));
  }

  move2048(direction) {
      const result = this.game2048.move(direction);
      if (result) {
          document.getElementById('game2048-score').textContent = result.score;
          document.getElementById('game2048-grid').innerHTML = this.render2048Grid(result.grid);
          if (result.gameOver) setTimeout(() => this.show2048GameOver(result), 500);
      }
  }

  show2048GameOver(result) {
      const container = document.getElementById('puzzle-game-active');
      const isHighScore = result.score > (this.game2048.getStats().highScore || 0);
      container.innerHTML = `
        <div class="puzzle-results">
          <h2>${result.won ? '🎉 You Won!' : '😔 Game Over'}</h2>
          <div class="puzzle-results-stats"><span class="value">${result.score}</span></div>
          ${isHighScore ? '<p>🏆 New High Score!</p>' : ''}
          <button class="btn btn-primary" id="2048-play-again">Play Again</button>
          <button class="btn btn-secondary" id="2048-results-exit">Exit</button>
        </div>`;
      document.getElementById('2048-play-again').onclick = () => this.start2048Game();
      document.getElementById('2048-results-exit').onclick = () => this.exitPuzzle();
  }
  
  exit2048Game(container) {
      if (container._keyHandler) document.removeEventListener('keydown', container._keyHandler);
      this.exitPuzzle();
  }

  // ==========================================
  // 🎡 ZONA DAILY SPIN - FIXED
  // ==========================================
  
  startDailySpin() {
    const check = this.dailySpinGame.canSpin();
    
    if (!check.can) {
      const formatted = this.dailySpinGame.formatTimeRemaining(check.nextFreeIn);
      eventBus.emit('notification:show', { message: `⏰ Next free spin in ${formatted}`, type: 'info', duration: 3000 });
      return;
    }
    
    logger.info('PuzzleUI', 'Starting Daily Spin');
    
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'none';
    
    const gameContainer = document.getElementById('puzzle-game-active');
    gameContainer.style.display = 'block';
    
    // Generăm UI-ul dinamic pentru segmente
    gameContainer.innerHTML = `
      <div class="daily-spin-container">
        <h2>🎡 Daily Spin</h2>
        <div class="spin-info"><p>Spin the wheel for rewards!</p></div>
        
        <div class="wheel-container">
          <div class="wheel-pointer"></div>
          <div class="wheel" id="spin-wheel">
            ${this.renderWheelSegments()}
            <div class="wheel-center">🎡</div>
          </div>
        </div>
        
        <div class="spin-controls">
          <button class="btn btn-primary btn-large" id="spin-btn">🎡 SPIN!</button>
          <button class="btn btn-secondary" id="spin-exit">Exit</button>
        </div>
      </div>
    `;
    
    // ALINIEREA INIȚIALĂ FIXĂ (-22.5 grade + rotația salvată)
    const wheel = document.getElementById('spin-wheel');
    const initialOffset = 22.5;
    const savedRot = this.dailySpinGame.currentRotation || 0;
    wheel.style.transform = `rotate(${initialOffset + savedRot}deg)`;
    
    document.getElementById('spin-btn').addEventListener('click', () => this.executeSpin());
    document.getElementById('spin-exit').addEventListener('click', () => this.exitPuzzle());
  }
  
  renderWheelSegments() {
    const segments = this.dailySpinGame.segments;
    return segments.map((segment, index) => {
      // Calculăm unghiul strict pe baza indexului
      const angle = index * 45; 
      return `
        <div class="wheel-segment" style="
          transform: rotate(${angle}deg);
          background: ${segment.color};
        ">
          <!-- Textul rotit 45deg ca să fie lizibil în felie -->
          <span class="wheel-segment-label">${segment.label}</span>
        </div>
      `;
    }).join('');
  }
  
  executeSpin() {
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;
    
    const spinResult = this.dailySpinGame.useSpin();
    
    if (!spinResult) {
      if (spinBtn) spinBtn.disabled = false;
      eventBus.emit('notification:show', { message: '❌ No spins available!', type: 'error', duration: 3000 });
      return;
    }
    
    const wheel = document.getElementById('spin-wheel');
    if (wheel) {
      const initialOffset = 22.5; // Offset constant
      
      wheel.style.transition = `transform ${spinResult.duration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
      // Rotația finală include offset-ul vizual
      wheel.style.transform = `rotate(${initialOffset + spinResult.rotation}deg)`;
      
      // TIMEOUT PENTRU MODAL (Fix)
      setTimeout(() => {
        this.dailySpinGame.grantReward(spinResult.segment);
        this.showSpinResult(spinResult.segment);
      }, spinResult.duration);
    }
  }
  
  showSpinResult(segment) {
    const container = document.getElementById('puzzle-game-active');
    
    // Creăm overlay
    const overlay = document.createElement('div');
    overlay.className = 'puzzle-results';
    // Stiluri inline pentru siguranță, se pot muta în CSS
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '100';
    overlay.style.background = 'rgba(0,0,0,0.9)';

    overlay.innerHTML = `
      <h2>🎉 You Won!</h2>
      <div class="spin-result-icon" style="font-size: 3rem; margin: 20px;">${segment.label}</div>
      <div class="puzzle-results-stats">
        <p>Congratulations! You received:</p>
        <div class="reward-display">
          ${this.formatSpinReward(segment.reward)}
        </div>
      </div>
      <button class="btn btn-primary btn-large" id="spin-result-close">
        Collect
      </button>
    `;
    
    container.appendChild(overlay);
    
    document.getElementById('spin-result-close').onclick = () => {
        overlay.remove();
        this.exitPuzzle();
    };
  }
  
  // Helpers
  getSpinStatus() {
    const res = this.dailySpinGame.canSpin();
    if(res.type === 'free' && res.can) return '✅ Available';
    if(res.type === 'purchased' && res.can) return `🎟️ ${res.spinsRemaining} Extra`;
    return '🔒 Tomorrow';
  }
  
  getCountdownText() {
    const res = this.dailySpinGame.canSpin();
    if(res.nextFreeIn > 0) return `⏰ ${this.dailySpinGame.formatTimeRemaining(res.nextFreeIn)}`;
    if(res.can) return '🎉 Free spin!';
    return '';
  }

  getPurchasedSpinsDisplay() {
    const stats = this.dailySpinGame.getStats ? this.dailySpinGame.getStats() : {};
    const purchased = stats.purchasedSpins || 0;
    if (purchased > 0) return `<div class="stat"><span class="label">Extra:</span><span class="value">${purchased}</span></div>`;
    return '';
  }

  formatSpinReward(reward) {
    let html = '';
    for (let [res, amt] of Object.entries(reward)) {
      const icon = res==='gems'?'💎': res==='energy'?'⚡': res==='guardian'?'🛡️':'💠';
      html += `<div class="reward-item">${amt} ${icon}</div>`;
    }
    return html;
  }
  
  // Helpers comune
  showPuzzleResults(result) {
    const container = document.getElementById('puzzle-game-active');
    container.innerHTML = `
      <div class="puzzle-results">
        <h2>🎉 Complete!</h2>
        <div class="result-stat"><span class="label">Score:</span><span class="value">${result.score}</span></div>
        <button class="btn btn-primary" id="puzzle-close">Continue</button>
      </div>`;
    document.getElementById('puzzle-close').onclick = () => this.exitPuzzle();
  }
  
  exitPuzzle() {
    const gameContainer = document.getElementById('puzzle-game-active');
    if (gameContainer) {
      gameContainer.style.display = 'none';
      gameContainer.innerHTML = '';
    }
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'grid';
    
    if (this.match3Game) {
      this.match3Game.destroy();
      this.match3Game = null;
    }
    this.render();
  }
  
  exitBossPuzzle() {
      eventBus.emit('modal:hide', { modalId: 'boss-battle-modal' });
      if (this.match3Game) { this.match3Game.destroy(); this.match3Game = null; }
  }
  
  updateStats() {
      const state = stateManager.getState();
      const stats = state.statistics || {};
      const el1 = document.getElementById('match3-best-score');
      if(el1) el1.textContent = stats.puzzleHighScore || 0;
      const el2 = document.getElementById('match3-games-played');
      if(el2) el2.textContent = stats.puzzlesPlayed || 0;
  }

  destroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }
}

export default PuzzleUI;