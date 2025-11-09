/**
 * MiniGamesHub - Central hub for all mini-games
 */

import dailySpinGame from './DailySpinGame.js';
import game2048 from './Game2048.js';
import eventBus from '../utils/EventBus.js';
import stateManager from '../core/StateManager.js';

class MiniGamesHub {
  constructor() {
    this.games = {
      dailySpin: {
        id: 'dailySpin',
        name: 'Daily Spin',
        emoji: '🎡',
        description: 'Spin the wheel for daily rewards!',
        instance: dailySpinGame,
        category: 'luck'
      },
      game2048: {
        id: 'game2048',
        name: '2048 Puzzle',
        emoji: '🎲',
        description: 'Merge tiles to reach 2048!',
        instance: game2048,
        category: 'puzzle'
      },
      match3: {
        id: 'match3',
        name: 'Match-3',
        emoji: '💎',
        description: 'Match gems to earn rewards!',
        category: 'puzzle',
        // Match3Game already exists
      }
    };
    
    this.currentGame = null;
  }
  
  /**
   * Get all games
   */
  getAllGames() {
    return Object.values(this.games);
  }
  
  /**
   * Get game by ID
   */
  getGame(gameId) {
    return this.games[gameId];
  }
  
  /**
   * Get games by category
   */
  getGamesByCategory(category) {
    return Object.values(this.games).filter(game => game.category === category);
  }
  
  /**
   * Launch game
   */
  launchGame(gameId) {
    const game = this.games[gameId];
    
    if (!game) {
      console.error('Game not found:', gameId);
      return false;
    }
    
    this.currentGame = gameId;
    
    eventBus.emit('mini-game:launched', { gameId, game });
    
    return true;
  }
  
  /**
   * Get stats for all games
   */
  getAllStats() {
    const state = stateManager.getState();
    const miniGamesData = state.miniGames || {};
    
    return {
      dailySpin: dailySpinGame.getStats(),
      game2048: game2048.getStats(),
      totalGamesPlayed: this.getTotalGamesPlayed()
    };
  }
  
  /**
   * Get total games played across all mini-games
   */
  getTotalGamesPlayed() {
    const state = stateManager.getState();
    const miniGamesData = state.miniGames || {};
    
    let total = 0;
    
    for (let game of Object.keys(this.games)) {
      const gameData = miniGamesData[game] || {};
      total += gameData.gamesPlayed || 0;
      total += gameData.totalSpins || 0;
    }
    
    return total;
  }
  
  /**
   * Get daily challenge status (optional feature)
   */
  getDailyChallenges() {
    // TODO: Implement daily challenges
    return {
      available: false,
      challenges: []
    };
  }
}

export default new MiniGamesHub();