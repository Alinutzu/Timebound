/**
 * Match3Game - Simple and working Match-3 implementation
 */

import eventBus from '../../utils/EventBus.js';
import logger from '../../utils/Logger.js';

class Match3Game {
  constructor(container, options = {}) {
  this.container = container;
  this.options = {
    mode: options.mode || 'practice',
    bossKey: options.bossKey || null,
    bossName: options.bossName || null,
    maxMoves: options.maxMoves || 20,
    targetScore: options.targetScore || 500,
    difficulty: options.difficulty || 'normal',
    onComplete: options.onComplete || (() => {}),
    onExit: options.onExit || (() => {})
  };
  
  this.gridSize = 8;
  this.gems = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
  this.grid = [];
  this.selectedCell = null;
  this.score = 0;
  this.moves = 0;
  this.combo = 0;
  this.bestCombo = 0;
  this.isProcessing = false;
  this.gameOverTriggered = false; // ✅ ADD THIS
  
  this.init();
}
  
  async init() {
    console.log('🎮 Match3Game: Starting init...');
    this.generateGrid();
    await this.render();
    console.log('✅ Match3Game: Init complete!');
  }
  
  generateGrid() {
    this.grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        let gem;
        do {
          gem = this.gems[Math.floor(Math.random() * this.gems.length)];
        } while (this.wouldCreateMatch(row, col, gem));
        this.grid[row][col] = gem;
      }
    }
  }
  
  wouldCreateMatch(row, col, gem) {
    if (col >= 2 && this.grid[row][col-1] === gem && this.grid[row][col-2] === gem) return true;
    if (row >= 2 && this.grid[row-1][col] === gem && this.grid[row-2][col] === gem) return true;
    return false;
  }
  
  async render() {
    return new Promise((resolve) => {
      const isBoss = this.options.mode === 'boss';
      
      this.container.innerHTML = `
        <div class="match3-game">
          <div class="match3-header">
            <h3>${isBoss ? `⚔️ ${this.options.bossName}` : '🧩 Match-3 Puzzle'}</h3>
          </div>
          
          <div class="match3-stats">
            <div class="match3-stat">
              <span class="label">Score</span>
              <span class="value" id="m3-score">${this.score}</span>
            </div>
            <div class="match3-stat">
              <span class="label">Moves</span>
              <span class="value" id="m3-moves">${this.moves}/${this.options.maxMoves}</span>
            </div>
            <div class="match3-stat">
              <span class="label">Combo</span>
              <span class="value" id="m3-combo">${this.combo}x</span>
            </div>
          </div>
          
          <div class="match3-grid" id="m3-grid"></div>
          
          <div class="match3-controls">
            <button class="btn btn-secondary" id="m3-exit">Exit</button>
          </div>
        </div>
      `;
      
      requestAnimationFrame(() => {
        this.renderGrid();
        this.bindEvents();
        resolve();
      });
    });
  }
  
  renderGrid() {
  const gridEl = document.getElementById('m3-grid');
  if (!gridEl) return;
  
  gridEl.innerHTML = '';
  gridEl.style.display = 'grid';
  gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
  gridEl.style.gap = '4px';
  
  // ✅ Disable grid if game over
  if (this.gameOverTriggered) {
    gridEl.style.pointerEvents = 'none';
    gridEl.style.opacity = '0.5';
  }
  
  for (let row = 0; row < this.gridSize; row++) {
    for (let col = 0; col < this.gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'match3-cell';
      cell.textContent = this.grid[row][col];
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      // ✅ Don't add click listeners if game over
      if (!this.gameOverTriggered) {
        cell.addEventListener('click', () => this.handleCellClick(row, col));
      }
      
      gridEl.appendChild(cell);
    }
  }
}
  
  bindEvents() {
    const exitBtn = document.getElementById('m3-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.options.onExit());
    }
  }
  
  handleCellClick(row, col) {
  console.log('🎯 Cell clicked:', row, col, `Moves: ${this.moves}/${this.options.maxMoves}`);
  
  // ✅ CRITICAL: Check game over BEFORE processing
  if (this.moves >= this.options.maxMoves) {
    console.log('🛑 Max moves reached - ignoring click');
    
    // Trigger game over if not already triggered
    if (!this.gameOverTriggered) {
      this.gameOverTriggered = true;
      this.gameOver();
    }
    return;
  }
  
  if (this.isProcessing) {
    console.log('⏳ Processing - ignoring click');
    return;
  }
  
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  
  if (!this.selectedCell) {
    // First selection
    this.selectedCell = { row, col, el: cell };
    cell.classList.add('selected');
    console.log('✅ First gem selected');
    return;
  }
  
  // Second selection
  const { row: r1, col: c1, el: el1 } = this.selectedCell;
  
  console.log('✅ Second gem selected');
  
  // Deselect if same cell
  if (row === r1 && col === c1) {
    el1.classList.remove('selected');
    this.selectedCell = null;
    return;
  }
  
  // Check adjacent
  const isAdjacent = 
    (Math.abs(row - r1) === 1 && col === c1) ||
    (Math.abs(col - c1) === 1 && row === r1);
  
  console.log('Adjacent:', isAdjacent);
  
  el1.classList.remove('selected');
  
  if (isAdjacent) {
    console.log('🔄 Performing swap...');
    this.swap(r1, c1, row, col);
  } else {
    // Select new gem
    this.selectedCell = { row, col, el: cell };
    cell.classList.add('selected');
  }
}
  
  swap(r1, c1, r2, c2) {
  // ✅ Check if we've already hit max moves
  if (this.moves >= this.options.maxMoves) {
    console.log('🛑 Already at max moves - aborting swap');
    this.selectedCell = null;
    if (!this.gameOverTriggered) {
      this.gameOverTriggered = true;
      this.gameOver();
    }
    return;
  }
  
  this.isProcessing = true;
  
  // Swap gems
  const temp = this.grid[r1][c1];
  this.grid[r1][c1] = this.grid[r2][c2];
  this.grid[r2][c2] = temp;
  
  console.log('✅ Swapped:', temp, '<->', this.grid[r1][c1]);
  
  this.renderGrid();
  
  setTimeout(() => {
    const matches = this.findMatches();
    console.log('Matches found:', matches.length);
    
    if (matches.length > 0) {
      // Valid move - increment AFTER checking
      this.moves++;
      console.log(`📊 Move ${this.moves}/${this.options.maxMoves}`);
      this.updateStats();
      
      // ✅ Check if this was the last move
      if (this.moves >= this.options.maxMoves) {
        console.log('⚠️ This was the last move!');
        // Process matches but trigger game over after
        this.processMatches(matches, true); // Pass flag to indicate last move
      } else {
        this.processMatches(matches, false);
      }
    } else {
      // Swap back
      const temp2 = this.grid[r1][c1];
      this.grid[r1][c1] = this.grid[r2][c2];
      this.grid[r2][c2] = temp2;
      this.renderGrid();
      this.isProcessing = false;
      console.log('❌ No matches - swapped back');
    }
    
    this.selectedCell = null;
  }, 300);
}
  
  findMatches() {
    const matches = [];
    const found = new Set();
    
    // Horizontal
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 2; col++) {
        const gem = this.grid[row][col];
        if (this.grid[row][col+1] === gem && this.grid[row][col+2] === gem) {
          for (let i = 0; i < 3; i++) {
            const key = `${row},${col+i}`;
            if (!found.has(key)) {
              found.add(key);
              matches.push({ row, col: col+i });
            }
          }
        }
      }
    }
    
    // Vertical
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize - 2; row++) {
        const gem = this.grid[row][col];
        if (this.grid[row+1][col] === gem && this.grid[row+2][col] === gem) {
          for (let i = 0; i < 3; i++) {
            const key = `${row+i},${col}`;
            if (!found.has(key)) {
              found.add(key);
              matches.push({ row: row+i, col });
            }
          }
        }
      }
    }
    
    return matches;
  }
  
  processMatches(matches, isLastMove = false) {
  console.log('💥 Processing', matches.length, 'matches', isLastMove ? '(LAST MOVE)' : '');
  
  const points = matches.length * 10;
  this.combo++;
  this.score += points * this.combo;
  this.bestCombo = Math.max(this.bestCombo, this.combo);
  
  // Remove matches
  matches.forEach(m => {
    this.grid[m.row][m.col] = null;
  });
  
  this.renderGrid();
  this.updateStats();
  
  setTimeout(() => {
    this.dropGems();
    this.fillEmpty();
    this.renderGrid();
    
    setTimeout(() => {
      const newMatches = this.findMatches();
      if (newMatches.length > 0) {
        // Continue cascade
        this.processMatches(newMatches, isLastMove);
      } else {
        // Cascade ended
        this.combo = 0;
        this.isProcessing = false;
        this.updateStats();
        
        // ✅ Trigger game over if this was the last move
        if (isLastMove && !this.gameOverTriggered) {
          console.log('🏁 Last move cascade complete - triggering game over');
          this.gameOverTriggered = true;
          setTimeout(() => {
            this.gameOver();
          }, 500);
        }
      }
    }, 300);
  }, 300);
}
  
  dropGems() {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (this.grid[row][col] === null) {
          for (let above = row - 1; above >= 0; above--) {
            if (this.grid[above][col] !== null) {
              this.grid[row][col] = this.grid[above][col];
              this.grid[above][col] = null;
              break;
            }
          }
        }
      }
    }
  }
  
  fillEmpty() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === null) {
          this.grid[row][col] = this.gems[Math.floor(Math.random() * this.gems.length)];
        }
      }
    }
  }
  
  updateStats() {
    const scoreEl = document.getElementById('m3-score');
    const movesEl = document.getElementById('m3-moves');
    const comboEl = document.getElementById('m3-combo');
    
    if (scoreEl) scoreEl.textContent = this.score;
    if (movesEl) movesEl.textContent = `${this.moves}/${this.options.maxMoves}`;
    if (comboEl) comboEl.textContent = `${this.combo}x`;
  }
  
  gameOver() {
  console.log('🏁 ========= GAME OVER =========');
  console.log(`Final Score: ${this.score}`);
  console.log(`Moves Used: ${this.moves}/${this.options.maxMoves}`);
  console.log(`Best Combo: ${this.bestCombo}x`);
  console.log('================================');
  
  // Prevent further moves
  this.isProcessing = true;
  this.gameOverTriggered = true;
  
  // Disable grid interactions
  const gridEl = document.getElementById('m3-grid');
  if (gridEl) {
    gridEl.style.pointerEvents = 'none';
    gridEl.style.opacity = '0.6';
  }
  
  const result = {
    score: this.score,
    moves: this.moves,
    movesUsed: this.moves,
    maxMoves: this.options.maxMoves,
    bestCombo: this.bestCombo,
    totalDamage: Math.floor(this.score / 5),
    success: this.score >= this.options.targetScore
  };
  
  console.log('📊 Final results:', result);
  
  // Show game over overlay
  const container = document.querySelector('.match3-game');
  if (container) {
    const overlay = document.createElement('div');
    overlay.className = 'match3-game-over';
    overlay.innerHTML = `
      <div class="game-over-content">
        <h2>${result.success ? '🎉 Victory!' : '⏱️ Time\'s Up!'}</h2>
        <div class="game-over-stats">
          <div class="stat">
            <span class="label">Score</span>
            <span class="value">${result.score}</span>
          </div>
          <div class="stat">
            <span class="label">Target</span>
            <span class="value">${this.options.targetScore}</span>
          </div>
          <div class="stat">
            <span class="label">Best Combo</span>
            <span class="value">${result.bestCombo}x</span>
          </div>
          ${this.options.mode === 'boss' ? `
            <div class="stat">
              <span class="label">Damage Dealt</span>
              <span class="value">${result.totalDamage}</span>
            </div>
          ` : ''}
        </div>
        <button class="btn btn-primary btn-large" id="game-over-continue">
          Continue
        </button>
      </div>
    `;
    
    container.appendChild(overlay);
    
    // Wait for button click
    document.getElementById('game-over-continue')?.addEventListener('click', () => {
      console.log('✅ Continue button clicked - calling onComplete callback');
      overlay.remove();
      this.options.onComplete(result);
    });
  } else {
    console.warn('⚠️ Container not found, calling onComplete directly');
    this.options.onComplete(result);
  }
}
  
  destroy() {
    this.container.innerHTML = '';
  }
}

export default Match3Game;