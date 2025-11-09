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

  this.specialGems = {
  bomb: '💣',        // Match 4 in line
  lightning: '⚡',   // Match 5 in line
  star: '🌟',       // L or T shape
  rainbow: '🌈'     // Match 5+ or special combos
};

// Drag & Drop state
this.dragState = {
  isDragging: false,
  startCell: null,
  currentCell: null
};

this.specialGemTypes = new Map(); // Track special gem positions
  
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

  /**
 * Check for special gem patterns
 */
checkForSpecialPattern(matches) {
  if (matches.length >= 5) {
    return { type: 'rainbow', emoji: this.specialGems.rainbow };
  }
  
  if (matches.length === 4) {
    // Check if it's a line (all same row or column)
    const sameRow = matches.every(m => m.row === matches[0].row);
    const sameCol = matches.every(m => m.col === matches[0].col);
    
    if (sameRow || sameCol) {
      return { type: 'lightning', emoji: this.specialGems.lightning };
    }
  }
  
  // Check for L or T shape (3 horizontal + 3 vertical intersecting)
  const rowCount = new Map();
  const colCount = new Map();
  
  matches.forEach(m => {
    rowCount.set(m.row, (rowCount.get(m.row) || 0) + 1);
    colCount.set(m.col, (colCount.get(m.col) || 0) + 1);
  });
  
  const hasIntersection = Array.from(rowCount.values()).some(c => c >= 3) && 
                          Array.from(colCount.values()).some(c => c >= 3);
  
  if (hasIntersection && matches.length >= 5) {
    return { type: 'star', emoji: this.specialGems.star };
  }
  
  if (matches.length >= 4) {
    return { type: 'bomb', emoji: this.specialGems.bomb };
  }
  
  return null;
}

/**
 * Create special gem at position
 */
createSpecialGem(row, col, type) {
  const key = `${row},${col}`;
  this.specialGemTypes.set(key, type);
  this.grid[row][col] = this.specialGems[type];
  
  console.log(`✨ Created ${type} special gem at ${row},${col}`);

  stateManager.dispatch({
  type: 'TRACK_SPECIAL_GEM_CREATED',
  payload: {
    game: 'match3',
    gemType: type
  }
});

}

/**
 * Activate special gem effects
 */
activateSpecialGem(row, col) {
  const key = `${row},${col}`;
  const type = this.specialGemTypes.get(key);
  
  if (!type) return [];
  
  console.log(`💥 Activating ${type} at ${row},${col}`);
  
  const toRemove = [];
  
  switch(type) {
    case 'bomb':
      // 3x3 explosion
      for (let r = Math.max(0, row - 1); r <= Math.min(this.gridSize - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(this.gridSize - 1, col + 1); c++) {
          toRemove.push({ row: r, col: c });
        }
      }
      break;
      
    case 'lightning':
      // Clear entire row and column
      for (let c = 0; c < this.gridSize; c++) {
        toRemove.push({ row, col: c });
      }
      for (let r = 0; r < this.gridSize; r++) {
        toRemove.push({ row: r, col });
      }
      break;
      
    case 'star':
      // 5x5 explosion
      for (let r = Math.max(0, row - 2); r <= Math.min(this.gridSize - 1, row + 2); r++) {
        for (let c = Math.max(0, col - 2); c <= Math.min(this.gridSize - 1, col + 2); c++) {
          toRemove.push({ row: r, col: c });
        }
      }
      break;
      
    case 'rainbow':
      // Clear all gems of one random color
      const targetGem = this.gems[Math.floor(Math.random() * this.gems.length)];
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          if (this.grid[r][c] === targetGem) {
            toRemove.push({ row: r, col: c });
          }
        }
      }
      break;
  }
  
  this.specialGemTypes.delete(key);
  
  // Show floating text
  this.showFloatingText(row, col, `${type.toUpperCase()}!`, 'special');
  
  return toRemove;
}

/**
 * Show floating text animation
 */
showFloatingText(row, col, text, type = 'score') {
  const gridEl = document.getElementById('m3-grid');
  if (!gridEl) return;
  
  const cell = gridEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;
  
  const rect = cell.getBoundingClientRect();
  
  const floatingText = document.createElement('div');
  floatingText.className = `floating-text ${type}`;
  floatingText.textContent = text;
  floatingText.style.left = rect.left + rect.width / 2 + 'px';
  floatingText.style.top = rect.top + 'px';
  
  document.body.appendChild(floatingText);
  
  setTimeout(() => floatingText.remove(), 1500);
}

renderGrid() {
  const gridEl = document.getElementById('m3-grid');
  if (!gridEl) return;
  
  gridEl.innerHTML = '';
  gridEl.style.display = 'grid';
  gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
  gridEl.style.gap = '4px';
  
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
      
      const key = `${row},${col}`;
      if (this.specialGemTypes.has(key)) {
        cell.classList.add('special-gem');
        cell.classList.add(this.specialGemTypes.get(key));
      }
      
      if (!this.gameOverTriggered) {
        // Drag & Drop events
        cell.addEventListener('mousedown', (e) => this.handleDragStart(e, row, col));
        cell.addEventListener('mousemove', (e) => this.handleDragMove(e, row, col));
        cell.addEventListener('mouseup', (e) => this.handleDragEnd(e, row, col));
        cell.addEventListener('mouseleave', (e) => this.handleDragLeave(e, row, col));
        
        // Touch events for mobile
        cell.addEventListener('touchstart', (e) => this.handleDragStart(e, row, col));
        cell.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        cell.addEventListener('touchend', (e) => this.handleDragEnd(e, row, col));
        
        // Fallback: keep click for special gems
        cell.addEventListener('click', (e) => {
          if (!this.dragState.isDragging && this.specialGemTypes.has(key)) {
            this.handleCellClick(row, col);
          }
        });
      }
      
      gridEl.appendChild(cell);
    }
  }
}

/**
 * Drag & Drop handlers
 */
handleDragStart(e, row, col) {
  if (this.isProcessing || this.gameOverTriggered) return;
  
  e.preventDefault();
  
  this.dragState.isDragging = true;
  this.dragState.startCell = { row, col };
  
  const cell = e.target.closest('.match3-cell');
  if (cell) {
    cell.classList.add('selected');
  }
  
  console.log('🎯 Drag started:', row, col);
}

handleDragMove(e, row, col) {
  if (!this.dragState.isDragging) return;
  
  const { startCell } = this.dragState;
  if (!startCell) return;
  
  // Check if moved to adjacent cell
  const isAdjacent = 
    (Math.abs(row - startCell.row) === 1 && col === startCell.col) ||
    (Math.abs(col - startCell.col) === 1 && row === startCell.row);
  
  if (isAdjacent) {
    this.dragState.currentCell = { row, col };
    
    // Highlight target
    const targetCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (targetCell && !targetCell.classList.contains('drag-target')) {
      document.querySelectorAll('.drag-target').forEach(c => c.classList.remove('drag-target'));
      targetCell.classList.add('drag-target');
    }
  }
}

handleDragLeave(e, row, col) {
  if (!this.dragState.isDragging) return;
  
  const cell = e.target.closest('.match3-cell');
  if (cell) {
    cell.classList.remove('drag-target');
  }
}

handleDragEnd(e, row, col) {
  if (!this.dragState.isDragging) return;
  
  e.preventDefault();
  
  const { startCell, currentCell } = this.dragState;
  
  // Clear highlights
  document.querySelectorAll('.match3-cell').forEach(c => {
    c.classList.remove('selected', 'drag-target');
  });
  
  if (startCell && currentCell) {
    const isAdjacent = 
      (Math.abs(currentCell.row - startCell.row) === 1 && currentCell.col === startCell.col) ||
      (Math.abs(currentCell.col - startCell.col) === 1 && currentCell.row === startCell.row);
    
    if (isAdjacent) {
      console.log('🔄 Swapping via drag:', startCell, '←→', currentCell);
      this.swap(startCell.row, startCell.col, currentCell.row, currentCell.col);
    }
  }
  
  // Reset drag state
  this.dragState.isDragging = false;
  this.dragState.startCell = null;
  this.dragState.currentCell = null;
}

handleTouchMove(e) {
  if (!this.dragState.isDragging) return;
  
  e.preventDefault();
  
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const cell = element?.closest('.match3-cell');
  
  if (cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    this.handleDragMove(e, row, col);
  }
}
  
  bindEvents() {
    const exitBtn = document.getElementById('m3-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.options.onExit());
    }
  }
  
  handleCellClick(row, col) {
  console.log('🎯 Cell clicked:', row, col);
  
  if (this.moves >= this.options.maxMoves) {
    if (!this.gameOverTriggered) {
      this.gameOverTriggered = true;
      this.gameOver();
    }
    return;
  }
  
  if (this.isProcessing) return;
  
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const key = `${row},${col}`;
  
  // Check if clicking a special gem
  if (this.specialGemTypes.has(key)) {
    console.log('⚡ Activating special gem!');
    this.moves++;
    this.isProcessing = true;
    
    const specialMatches = this.activateSpecialGem(row, col);
    this.processMatches(specialMatches, this.moves >= this.options.maxMoves);
    
    this.selectedCell = null;
    return;
  }
  
  if (!this.selectedCell) {
    this.selectedCell = { row, col, el: cell };
    cell.classList.add('selected');
    return;
  }
  
  const { row: r1, col: c1, el: el1 } = this.selectedCell;
  
  if (row === r1 && col === c1) {
    el1.classList.remove('selected');
    this.selectedCell = null;
    return;
  }
  
  const isAdjacent = 
    (Math.abs(row - r1) === 1 && col === c1) ||
    (Math.abs(col - c1) === 1 && row === r1);
  
  el1.classList.remove('selected');
  
  if (isAdjacent) {
    this.swap(r1, c1, row, col);
  } else {
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
  
  const specialPattern = this.checkForSpecialPattern(matches);
  
  const points = matches.length * 10;
  this.combo++;
  this.score += points * this.combo;
  this.bestCombo = Math.max(this.bestCombo, this.combo);
  
  // ✨ ADAUGĂ ASTA - Floating text pentru punctaj
  if (matches.length > 0) {
    const centerMatch = matches[Math.floor(matches.length / 2)];
    const totalPoints = points * this.combo;
    this.showFloatingText(centerMatch.row, centerMatch.col, `+${totalPoints}`, 'score');
    
    // Extra feedback pentru combo mare
    if (this.combo >= 5) {
      setTimeout(() => {
        this.showFloatingText(centerMatch.row, centerMatch.col, `${this.combo}x COMBO!`, 'special');
      }, 200);
    }
  }
  
  // Create special gem if pattern found
  if (specialPattern && matches.length >= 4) {
    const centerMatch = matches[Math.floor(matches.length / 2)];
    this.createSpecialGem(centerMatch.row, centerMatch.col, specialPattern.type);
    
    // Show notification - deja exista
    this.showFloatingText(centerMatch.row, centerMatch.col, `${specialPattern.type.toUpperCase()}!`, 'special');
  }
  
  // Remove matches
  matches.forEach(m => {
    this.grid[m.row][m.col] = null;
    const key = `${m.row},${m.col}`;
    this.specialGemTypes.delete(key);
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
        this.processMatches(newMatches, isLastMove);
      } else {
        this.combo = 0;
        this.isProcessing = false;
        this.updateStats();
        
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

// Track game completion for achievements
const isPerfect = this.score >= 3000 && this.options.mode === 'boss';

stateManager.dispatch({
  type: 'TRACK_MATCH3_GAME',
  payload: {
    score: this.score,
    combo: this.bestCombo,
    isPerfect
  }
});

// Emit stats update for achievement checking
eventBus.emit('mini-game:stats-updated', { game: 'match3' });

// Emit completion event (pentru boss battles)
eventBus.emit('match3:game-complete', { result });


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