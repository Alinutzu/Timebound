/**
 * PuzzleUI - Manages puzzle tab and mini-games
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import Match3Game from './games/Match3Game.js';
import DailySpinGame from './games/DailySpinGame.js';
import Game2048 from './games/Game2048.js';
import stateManager from '../core/StateManager.js';
import game from '../core/Game.js';

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
    
    this.render();
    this.subscribe();
    
    logger.info('PuzzleUI', 'Initialized');
  }
  
  subscribe() {
    // Listen for boss battles requiring puzzle
    eventBus.on('boss:battle-started', (data) => {
      this.startBossPuzzle(data);
    });
    
    // Re-render când se deblochează jocuri
    eventBus.on('quest:claimed', () => this.render());
    eventBus.on('structure:purchased', () => this.render());
    eventBus.on('ascension:completed', () => this.render());
    eventBus.on('puzzle:won', () => this.render());
  }
  
  render() {
    // Check unlock conditions
    const dailySpinUnlocked = this.checkDailySpinUnlock();
    const game2048Unlocked = this.check2048Unlock();
    
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
        <div class="puzzle-game-card ${!game2048Unlocked ? 'locked' : ''}" id="game2048-card">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🎲</div>
            <h3>2048 Puzzle</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Merge tiles to reach 2048!</p>
            <p class="puzzle-game-use">Rewards: Gems, Crystals, Energy</p>
          </div>
          ${game2048Unlocked ? `
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
          ` : `
            <div class="unlock-requirements">
              <h4>🔒 Unlock Requirements:</h4>
              <ul>
                <li class="${this.hasAscended() ? 'completed' : ''}">
                  Ascend at least once ${this.hasAscended() ? '✓' : ''}
                </li>
                <li class="${this.hasWonMatch3(3) ? 'completed' : ''}">
                  Win 3 Match-3 games ${this.hasWonMatch3(3) ? '✓' : ''}
                </li>
              </ul>
            </div>
            <div class="locked-overlay">
              <span>🔒 Complete requirements to unlock</span>
            </div>
          `}
        </div>
        
        <!-- Daily Spin Card -->
        <div class="puzzle-game-card ${!dailySpinUnlocked ? 'locked' : ''}" id="daily-spin-card">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🎡</div>
            <h3>Daily Spin</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Spin the wheel for rewards!</p>
            <p class="puzzle-game-use">Rewards: Gems, Energy, Crystals, Guardians</p>
          </div>
          ${dailySpinUnlocked ? `
            <div class="puzzle-game-stats">
              <div class="stat">
                <span class="label">Total Spins:</span>
                <span class="value" id="spin-total">${this.dailySpinGame.getStats().totalSpins || 0}</span>
              </div>
              <div class="stat">
                <span class="label">Status:</span>
                <span class="value" id="spin-status">
                  ${this.dailySpinGame.canSpin().can ? '✅ Ready' : '⏰ Cooldown'}
                </span>
              </div>
            </div>
            <button class="btn btn-primary btn-large" id="play-spin-btn">
              🎡 Spin the Wheel
            </button>
          ` : `
            <div class="unlock-requirements">
              <h4>🔒 Unlock Requirements:</h4>
              <ul>
                <li class="${this.hasCompletedQuests(5) ? 'completed' : ''}">
                  Complete 5 quests ${this.hasCompletedQuests(5) ? '✓' : ''}
                </li>
                <li class="${this.hasStructureLevel(10) ? 'completed' : ''}">
                  Reach level 10 in any structure ${this.hasStructureLevel(10) ? '✓' : ''}
                </li>
              </ul>
            </div>
            <div class="locked-overlay">
              <span>🔒 Complete requirements to unlock</span>
            </div>
          `}
        </div>
        
      </div>
      
      <!-- Puzzle Game Container (hidden by default) -->
      <div id="puzzle-game-active" style="display: none;">
        <!-- Game will render here -->
      </div>
    `;
    
    // Bind events
    this.bindEvents();
    
    // Load stats
    this.updateStats();
  }
  
  bindEvents() {
    // Match-3 button
    const playMatch3Btn = document.getElementById('play-match3-btn');
    if (playMatch3Btn) {
      playMatch3Btn.addEventListener('click', () => {
        this.startPracticeMatch3();
      });
    }
    
    // 2048 button
    const play2048Btn = document.getElementById('play-2048-btn');
    if (play2048Btn) {
      play2048Btn.addEventListener('click', () => {
        this.start2048Game();
      });
    }
    
    // Daily Spin button
    const playSpinBtn = document.getElementById('play-spin-btn');
    if (playSpinBtn) {
      playSpinBtn.addEventListener('click', () => {
        this.startDailySpin();
      });
    }
  }
  
  // ===== UNLOCK CONDITIONS =====
  
  checkDailySpinUnlock() {
    return this.hasCompletedQuests(5) && this.hasStructureLevel(10);
  }
  
  check2048Unlock() {
    return this.hasAscended() && this.hasWonMatch3(3);
  }
  
  hasCompletedQuests(count) {
    const state = stateManager.getState();
    const completedQuests = state.quests?.completed?.length || 0;
    return completedQuests >= count;
  }
  
  hasStructureLevel(level) {
    const state = stateManager.getState();
    const structures = state.structures || {};
    return Object.values(structures).some(s => s.level >= level);
  }
  
  hasAscended() {
    const state = stateManager.getState();
    return (state.ascension?.level || 0) >= 1;
  }
  
  hasWonMatch3(count) {
    const state = stateManager.getState();
    return (state.statistics?.puzzlesWon || 0) >= count;
  }
  
  // ===== STATS UPDATE =====
  
  updateStats() {
    const state = stateManager.getState();
    const stats = state.statistics || {};
    
    const bestScore = stats.puzzleHighScore || 0;
    const gamesPlayed = stats.puzzlesPlayed || 0;
    
    const bestScoreEl = document.getElementById('match3-best-score');
    const gamesPlayedEl = document.getElementById('match3-games-played');
    
    if (bestScoreEl) bestScoreEl.textContent = bestScore;
    if (gamesPlayedEl) gamesPlayedEl.textContent = gamesPlayed;
  }
  
  // ===== MATCH-3 GAME (keep existing) =====
  
  startPracticeMatch3() {
    logger.info('PuzzleUI', 'Starting practice Match-3');
    
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'none';
    
    const gameContainer = document.getElementById('puzzle-game-active');
    if (gameContainer) {
      gameContainer.style.display = 'block';
      
      this.match3Game = new Match3Game(gameContainer, {
        mode: 'practice',
        maxMoves: 20,
        targetScore: 500,
        onComplete: (result) => {
          this.onPuzzleComplete(result);
        },
        onExit: () => {
          this.exitPuzzle();
        }
      });
    }
  }
  
  startBossPuzzle(bossData) {
    const { boss, bossKey } = bossData;
    
    logger.info('PuzzleUI', `Starting boss puzzle for ${boss.name}`);
    
    const puzzleReq = boss.puzzleRequirement;
    
    const modalContent = document.getElementById('boss-battle-content');
    if (!modalContent) {
      logger.error('PuzzleUI', 'Boss battle content container not found!');
      return;
    }
    
    modalContent.innerHTML = `
      <div class="boss-battle-header"></div>
      <div id="boss-puzzle-container"></div>
    `;
    
    const puzzleContainer = document.getElementById('boss-puzzle-container');
    if (!puzzleContainer) {
      logger.error('PuzzleUI', 'Puzzle container not found!');
      return;
    }
    
    this.match3Game = new Match3Game(puzzleContainer, {
      mode: 'boss',
      bossKey: bossKey,
      bossName: boss.name,
      maxMoves: puzzleReq.maxMoves,
      targetScore: puzzleReq.targetScore,
      difficulty: puzzleReq.difficulty,
      onComplete: (result) => {
        this.onBossPuzzleComplete(result, bossKey);
      },
      onExit: () => {
        this.exitBossPuzzle();
      }
    });
  }
  
  onPuzzleComplete(result) {
    logger.info('PuzzleUI', 'Practice puzzle completed', result);
    
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: { key: 'puzzlesPlayed', amount: 1 }
    });
    
    const currentHighScore = stateManager.getState().statistics.puzzleHighScore || 0;
    if (result.score > currentHighScore) {
      stateManager.dispatch({
        type: 'UPDATE_STATISTIC',
        payload: { key: 'puzzleHighScore', value: result.score }
      });
      
      eventBus.emit('notification:show', {
        message: '🏆 New High Score!',
        type: 'success',
        duration: 3000
      });
    }
    
    if (result.won) {
      stateManager.dispatch({
        type: 'INCREMENT_STATISTIC',
        payload: { key: 'puzzlesWon', amount: 1 }
      });
    }
    
    this.showPuzzleResults(result);
    eventBus.emit('puzzle:practice-completed', result);
  }
  
  onBossPuzzleComplete(result, bossKey) {
    logger.info('PuzzleUI', 'Boss puzzle completed', result);
    
    eventBus.emit('puzzle:completed', {
      score: result.score,
      combo: result.bestCombo,
      moves: result.movesUsed,
      bossKey
    });
    
    const damage = result.totalDamage || result.score;
    
    eventBus.emit('notification:show', {
      message: `💥 ${damage} damage dealt! Combo: ${result.bestCombo}x`,
      type: 'success',
      duration: 3000
    });
  }
  
  // ===== 2048 GAME =====
  
  start2048Game() {
    if (!this.check2048Unlock()) {
      eventBus.emit('notification:show', {
        message: '🔒 Complete requirements to unlock 2048!',
        type: 'error',
        duration: 3000
      });
      return;
    }
    
    logger.info('PuzzleUI', 'Starting 2048 game');
    
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'none';
    
    const gameContainer = document.getElementById('puzzle-game-active');
    if (gameContainer) {
      gameContainer.style.display = 'block';
      
      const gameState = this.game2048.newGame();
      this.render2048UI(gameContainer, gameState);
    }
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
      
      <div class="game-2048-grid" id="game2048-grid">
        ${this.render2048Grid(gameState.grid)}
      </div>
      
      <div class="game-2048-controls">
        <p class="swipe-hint">Use arrow keys or swipe to move tiles</p>
      </div>
    </div>
  `;
  
  this.bind2048Controls(container);
}
  
  render2048Grid(grid) {
    let html = '';
    for (let row of grid) {
      for (let cell of row) {
        const value = cell || '';
        html += `<div class="grid-cell ${cell ? '' : 'empty'}" data-value="${cell}">${value}</div>`;
      }
    }
    return html;
  }
  
  bind2048Controls(container) {
  const handleKeyPress = (e) => {
    console.log('Key detected in 2048:', e.key); // DEBUG
    
    const keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'w': 'up',
      'W': 'up',
      's': 'down',
      'S': 'down',
      'a': 'left',
      'A': 'left',
      'd': 'right',
      'D': 'right'
    };
    
    const direction = keyMap[e.key];
    if (direction) {
      e.preventDefault();
      console.log('Moving:', direction); // DEBUG
      this.move2048(direction);
    }
  };
  
  // Remove any old handlers first
  if (container._keyHandler) {
    document.removeEventListener('keydown', container._keyHandler);
  }
  
  document.addEventListener('keydown', handleKeyPress);
  container._keyHandler = handleKeyPress;
  
  // Touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  
  const gridEl = container.querySelector('#game2048-grid'); // SCHIMBAT
  
  if (gridEl) {
    gridEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
    
    gridEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        this.move2048(diffX > 0 ? 'right' : 'left');
      } else {
        this.move2048(diffY > 0 ? 'down' : 'up');
      }
    });
  }
  
  document.getElementById('game2048-new-game')?.addEventListener('click', () => {
    const newState = this.game2048.newGame();
    this.render2048UI(container, newState);
  });
  
  document.getElementById('game2048-exit')?.addEventListener('click', () => {
    this.exit2048Game(container);
  });
}

move2048(direction) {
  const result = this.game2048.move(direction);
  
  if (result) {
    const scoreEl = document.getElementById('game2048-score'); // SCHIMBAT
    if (scoreEl) scoreEl.textContent = result.score;
    
    const gridEl = document.getElementById('game2048-grid'); // SCHIMBAT
    if (gridEl) gridEl.innerHTML = this.render2048Grid(result.grid);
    
    if (result.gameOver) {
      setTimeout(() => {
        this.show2048GameOver(result);
      }, 500);
    }
  }
}
  
  show2048GameOver(result) {
    const container = document.getElementById('puzzle-game-active');
    if (!container) return;
    
    const isHighScore = result.score > (this.game2048.getStats().highScore || 0);
    
    container.innerHTML = `
      <div class="puzzle-results">
        <h2>${result.won ? '🎉 You Won!' : '😔 Game Over'}</h2>
        <div class="puzzle-results-stats">
          <div class="result-stat">
            <span class="label">Final Score:</span>
            <span class="value">${result.score}</span>
          </div>
          ${isHighScore ? '<p class="high-score-badge">🏆 New High Score!</p>' : ''}
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" id="2048-play-again">Play Again</button>
          <button class="btn btn-secondary" id="2048-results-exit">Exit</button>
        </div>
      </div>
    `;
    
    document.getElementById('2048-play-again')?.addEventListener('click', () => {
      this.start2048Game();
    });
    
    document.getElementById('2048-results-exit')?.addEventListener('click', () => {
      this.exitPuzzle();
    });
  }
  
  exit2048Game(container) {
    if (container._keyHandler) {
      document.removeEventListener('keydown', container._keyHandler);
    }
    this.exitPuzzle();
  }
  
  // ===== DAILY SPIN =====
  
  startDailySpin() {
    if (!this.checkDailySpinUnlock()) {
      eventBus.emit('notification:show', {
        message: '🔒 Complete requirements to unlock Daily Spin!',
        type: 'error',
        duration: 3000
      });
      return;
    }
    
    const canSpinResult = this.dailySpinGame.canSpin();
    
    if (!canSpinResult.can) {
      const hoursLeft = Math.ceil(canSpinResult.nextFreeIn / 3600000);
      eventBus.emit('notification:show', {
        message: `⏰ Next free spin in ${hoursLeft}h`,
        type: 'info',
        duration: 3000
      });
      return;
    }
    
    logger.info('PuzzleUI', 'Starting Daily Spin');
    
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'none';
    
    const gameContainer = document.getElementById('puzzle-game-active');
    if (gameContainer) {
      gameContainer.style.display = 'block';
      this.renderDailySpinUI(gameContainer);
    }
  }
  
  renderDailySpinUI(container) {
    container.innerHTML = `
      <div class="daily-spin-container">
        <h2>🎡 Daily Spin</h2>
        <div class="spin-info">
          <p>Spin the wheel for amazing rewards!</p>
        </div>
        
        <div class="wheel-container">
          <div class="wheel-pointer"></div>
          <div class="wheel" id="spin-wheel">
            ${this.renderWheelSegments()}
            <div class="wheel-center">🎡</div>
          </div>
        </div>
        
        <div class="spin-controls">
          <button class="btn btn-primary btn-large" id="spin-btn">
            🎡 SPIN!
          </button>
          <button class="btn btn-secondary" id="spin-exit">Exit</button>
        </div>
      </div>
    `;
    
    document.getElementById('spin-btn')?.addEventListener('click', () => {
      this.executeSpin();
    });
    
    document.getElementById('spin-exit')?.addEventListener('click', () => {
      this.exitPuzzle();
    });
  }
  
  renderWheelSegments() {
    const segments = this.dailySpinGame.segments;
    let html = '';
    
    segments.forEach((segment, index) => {
      const angle = (360 / segments.length) * index;
      html += `
        <div class="wheel-segment" style="
          transform: rotate(${angle}deg);
          background: ${segment.color};
        ">
          <span class="wheel-segment-label">${segment.label}</span>
        </div>
      `;
    });
    
    return html;
  }
  
  executeSpin() {
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;
    
    const spinResult = this.dailySpinGame.spin(false);
    
    if (!spinResult) {
      if (spinBtn) spinBtn.disabled = false;
      return;
    }
    
    const wheel = document.getElementById('spin-wheel');
    if (wheel) {
      wheel.style.transition = `transform ${spinResult.duration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
      wheel.style.transform = `rotate(${spinResult.rotation}deg)`;
      
      setTimeout(() => {
        this.dailySpinGame.grantReward(spinResult.segment);
        this.showSpinResult(spinResult.segment);
      }, spinResult.duration);
    }
  }
  
  showSpinResult(segment) {
    const container = document.getElementById('puzzle-game-active');
    if (!container) return;
    
    container.innerHTML = `
      <div class="puzzle-results">
        <h2>🎉 You Won!</h2>
        <div class="spin-result-icon">${segment.label}</div>
        <div class="puzzle-results-stats">
          <p>Congratulations! You received:</p>
          <div class="reward-display">
            ${this.formatSpinReward(segment.reward)}
          </div>
        </div>
        <button class="btn btn-primary btn-large" id="spin-result-close">
          Collect
        </button>
      </div>
    `;
    
    document.getElementById('spin-result-close')?.addEventListener('click', () => {
      this.exitPuzzle();
    });
  }
  
  formatSpinReward(reward) {
    const icons = {
      gems: '💎',
      energy: '⚡',
      crystals: '💠',
      guardian: '🛡️'
    };
    
    let html = '';
    for (let [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        html += `<div class="reward-item">🛡️ Guardian Summon!</div>`;
      } else {
        html += `<div class="reward-item">${amount} ${icons[resource]}</div>`;
      }
    }
    
    return html;
  }
  
  // ===== SHARED =====
  
  showPuzzleResults(result) {
    const gameContainer = document.getElementById('puzzle-game-active');
    if (!gameContainer) return;
    
    gameContainer.innerHTML = `
      <div class="puzzle-results">
        <h2>🎉 Game Complete!</h2>
        <div class="puzzle-results-stats">
          <div class="result-stat">
            <span class="label">Score:</span>
            <span class="value">${result.score}</span>
          </div>
          <div class="result-stat">
            <span class="label">Moves Used:</span>
            <span class="value">${result.movesUsed} / ${result.maxMoves}</span>
          </div>
          <div class="result-stat">
            <span class="label">Best Combo:</span>
            <span class="value">${result.bestCombo}x</span>
          </div>
        </div>
        <button class="btn btn-primary btn-large" id="puzzle-results-close">
          Continue
        </button>
      </div>
    `;
    
    document.getElementById('puzzle-results-close')?.addEventListener('click', () => {
      this.exitPuzzle();
    });
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
    
    if (this.match3Game) {
      this.match3Game.destroy();
      this.match3Game = null;
    }
  }
}

export default PuzzleUI;