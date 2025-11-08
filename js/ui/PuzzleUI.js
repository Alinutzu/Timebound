/**
 * PuzzleUI - Manages puzzle tab and mini-games
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import Match3Game from './games/Match3Game.js';
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
    
    this.render();
    this.subscribe();
    
    logger.info('PuzzleUI', 'Initialized');
  }
  
  subscribe() {
    // Listen for boss battles requiring puzzle
    eventBus.on('boss:battle-started', (data) => {
      this.startBossPuzzle(data);
    });
  }
  
  render() {
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
        
        <!-- More games coming soon -->
        <div class="puzzle-game-card locked">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🎲</div>
            <h3>2048</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Coming Soon!</p>
            <p class="puzzle-game-use">Rewards: Energy Boost</p>
          </div>
          <div class="locked-overlay">
            <span>🔒 Coming Soon</span>
          </div>
        </div>
        
        <div class="puzzle-game-card locked">
          <div class="puzzle-game-header">
            <div class="puzzle-game-icon">🎰</div>
            <h3>Daily Spin</h3>
          </div>
          <div class="puzzle-game-description">
            <p>Coming Soon!</p>
            <p class="puzzle-game-use">Rewards: Gems & Buffs</p>
          </div>
          <div class="locked-overlay">
            <span>🔒 Coming Soon</span>
          </div>
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
    const playBtn = document.getElementById('play-match3-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.startPracticeMatch3();
      });
    }
  }
  
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
  
  startPracticeMatch3() {
    logger.info('PuzzleUI', 'Starting practice Match-3');
    
    // Hide game cards
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'none';
    
    // Show game container
    const gameContainer = document.getElementById('puzzle-game-active');
    if (gameContainer) {
      gameContainer.style.display = 'block';
      
      // Create Match-3 game (practice mode)
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
  
  // Get the container INSIDE the modal
  const modalContent = document.getElementById('boss-battle-content');
  if (!modalContent) {
    logger.error('PuzzleUI', 'Boss battle content container not found!');
    return;
  }
  
  // Create a dedicated puzzle container
  modalContent.innerHTML = `
    <div class="boss-battle-header">
      <!-- Boss info -->
    </div>
    <div id="boss-puzzle-container"></div>
  `;
  
  // Get the puzzle container
  const puzzleContainer = document.getElementById('boss-puzzle-container');
  if (!puzzleContainer) {
    logger.error('PuzzleUI', 'Puzzle container not found!');
    return;
  }
  
  // Create Match-3 game in the correct container
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
  
  // Update statistics
  const statisticsSystem = game.getSystem('statistics');
  if (statisticsSystem) {
    // Increment games played
    stateManager.dispatch({
      type: 'INCREMENT_STATISTIC',
      payload: { key: 'puzzlesPlayed', amount: 1 }
    });
    
    // Update high score if needed
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
  }
  
  // Show results
  this.showPuzzleResults(result);
  
  // Emit event
  eventBus.emit('puzzle:practice-completed', result);
}
  
  onBossPuzzleComplete(result, bossKey) {
  logger.info('PuzzleUI', 'Boss puzzle completed', result);
  
  // Emit to boss system
  eventBus.emit('puzzle:completed', {
    score: result.score,
    combo: result.bestCombo,
    moves: result.movesUsed,
    bossKey
  });
  
  // Show damage notification
  const damage = result.totalDamage || result.score;
  
  eventBus.emit('notification:show', {
    message: `💥 ${damage} damage dealt! Combo: ${result.bestCombo}x`,
    type: 'success',
    duration: 3000
  });
}
  
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
    
    document.getElementById('puzzle-results-close').addEventListener('click', () => {
      this.exitPuzzle();
    });
  }
  
  exitPuzzle() {
    // Hide game container
    const gameContainer = document.getElementById('puzzle-game-active');
    if (gameContainer) {
      gameContainer.style.display = 'none';
      gameContainer.innerHTML = '';
    }
    
    // Show game cards
    const grid = this.container.querySelector('.puzzle-games-grid');
    if (grid) grid.style.display = 'grid';
    
    // Cleanup
    if (this.match3Game) {
      this.match3Game.destroy();
      this.match3Game = null;
    }
    
    this.render();
  }
  
  exitBossPuzzle() {
    // Close boss battle modal
    eventBus.emit('modal:hide', { modalId: 'boss-battle-modal' });
    
    // Cleanup
    if (this.match3Game) {
      this.match3Game.destroy();
      this.match3Game = null;
    }
  }
}

export default PuzzleUI;