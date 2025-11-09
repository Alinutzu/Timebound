/**
 * Game2048 - Classic 2048 puzzle game
 */

import stateManager from '../../core/StateManager.js';
import eventBus from '../../utils/EventBus.js';
import logger from '../../utils/Logger.js';

class Game2048 {
  constructor() {
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    
    this.milestones = {
      512: { gems: 50, crystals: 2, energy: 5000 },
      1024: { gems: 100, crystals: 5, energy: 10000 },
      2048: { gems: 250, crystals: 10, energy: 25000, guardian: 1 }
    };
    
    this.claimedMilestones = new Set();
  }
  
  newGame() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.claimedMilestones.clear();
    
    this.addRandomTile();
    this.addRandomTile();
    
    logger.info('Game2048', 'New game started');
    
    return this.getGameState();
  }
  
  addRandomTile() {
    const emptyCells = [];
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return false;
    
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    
    return true;
  }
  
  move(direction) {
    if (this.gameOver) return null;
    
    const oldGrid = JSON.stringify(this.grid);
    const oldScore = this.score;
    
    switch(direction) {
      case 'left':
        this.moveLeft();
        break;
      case 'right':
        this.moveRight();
        break;
      case 'up':
        this.moveUp();
        break;
      case 'down':
        this.moveDown();
        break;
    }
    
    if (oldGrid !== JSON.stringify(this.grid)) {
      this.addRandomTile();
      
      if (!this.canMove()) {
        this.gameOver = true;
        this.handleGameOver();
      }
      
      if (this.score > oldScore) {
        this.checkMilestones();
      }
      
      return this.getGameState();
    }
    
    return null;
  }
  
  moveLeft() {
    for (let row = 0; row < this.size; row++) {
      let tiles = this.grid[row].filter(val => val !== 0);
      
      for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] === tiles[i + 1]) {
          tiles[i] *= 2;
          tiles[i + 1] = 0;
          this.score += tiles[i];
          
          if (tiles[i] === 2048 && !this.won) {
            this.won = true;
          }
        }
      }
      
      tiles = tiles.filter(val => val !== 0);
      while (tiles.length < this.size) {
        tiles.push(0);
      }
      
      this.grid[row] = tiles;
    }
  }
  
  moveRight() {
    this.grid = this.grid.map(row => row.reverse());
    this.moveLeft();
    this.grid = this.grid.map(row => row.reverse());
  }
  
  moveUp() {
    this.transpose();
    this.moveLeft();
    this.transpose();
  }
  
  moveDown() {
    this.transpose();
    this.moveRight();
    this.transpose();
  }
  
  transpose() {
    const newGrid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        newGrid[col][row] = this.grid[row][col];
      }
    }
    
    this.grid = newGrid;
  }
  
  canMove() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === 0) return true;
        
        if (col < this.size - 1 && this.grid[row][col] === this.grid[row][col + 1]) return true;
        if (row < this.size - 1 && this.grid[row][col] === this.grid[row + 1][col]) return true;
      }
    }
    
    return false;
  }
  
  checkMilestones() {
    const maxTile = Math.max(...this.grid.flat());
    
    for (let [milestone, reward] of Object.entries(this.milestones)) {
      const milestoneValue = parseInt(milestone);
      
      if (maxTile >= milestoneValue && !this.claimedMilestones.has(milestone)) {
        this.claimedMilestones.add(milestone);
        this.grantReward(milestoneValue, reward);
      }
    }
  }
  
  grantReward(milestone, reward) {
    for (let [resource, amount] of Object.entries(reward)) {
      if (resource === 'guardian') {
        eventBus.emit('guardian:summon', { 
          amount,
          source: '2048-game',
          guaranteed: true
        });
      } else {
        stateManager.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resource, amount }
        });
      }
    }
    
    logger.info('Game2048', `Milestone ${milestone} reached!`, reward);
    
    eventBus.emit('notification:show', {
      type: 'reward',
      title: `🎉 ${milestone} Milestone!`,
      message: this.formatReward(reward),
      duration: 5000
    });
  }
  
  handleGameOver() {
    const state = stateManager.getState();
    const highScore = state.miniGames?.game2048?.highScore || 0;
    
    if (this.score > highScore) {
      stateManager.dispatch({
        type: 'UPDATE_MINI_GAME',
        payload: {
          game: 'game2048',
          data: { highScore: this.score }
        }
      });
      
      logger.info('Game2048', 'New high score!', { score: this.score });
    }
    
    stateManager.dispatch({
      type: 'INCREMENT_MINI_GAME_STAT',
      payload: {
        game: 'game2048',
        stat: 'gamesPlayed'
      }
    });
    
    eventBus.emit('game-2048:game-over', { 
      score: this.score,
      isHighScore: this.score > highScore
    });
  }
  
  formatReward(reward) {
    const parts = [];
    
    for (let [resource, amount] of Object.entries(reward)) {
      const icons = {
        gems: '💎',
        energy: '⚡',
        crystals: '💠',
        guardian: '🛡️'
      };
      
      if (resource === 'guardian') {
        parts.push('Guardian!');
      } else {
        parts.push(`${amount} ${icons[resource]}`);
      }
    }
    
    return parts.join(', ');
  }
  
  getGameState() {
    return {
      grid: this.grid,
      score: this.score,
      gameOver: this.gameOver,
      won: this.won,
      canMove: this.canMove()
    };
  }
  
  getStats() {
    const state = stateManager.getState();
    const gameData = state.miniGames?.game2048 || {};
    
    return {
      highScore: gameData.highScore || 0,
      gamesPlayed: gameData.gamesPlayed || 0
    };
  }
}

export default new Game2048();