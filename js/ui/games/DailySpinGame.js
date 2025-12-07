/**
 * DailySpinGame - Logică Corectată pentru Aliniere Perfectă
 */
import stateManager from '../../core/StateManager.js';
import eventBus from '../../utils/EventBus.js';
import logger from '../../utils/Logger.js';

class DailySpinGame {
  constructor() {
    this.currentRotation = 0; // Memorează rotația totală
    
    // Configurația segmentelor - FIXATE cu ID-uri 0-7
    this.segments = [
      { id: 0, label: '50💎',      reward: { gems: 50 },      color: '#8B5CF6', weight: 20 },
      { id: 1, label: '5K⚡',      reward: { energy: 5000 },  color: '#3B82F6', weight: 25 },
      { id: 2, label: '100💎',     reward: { gems: 100 },     color: '#8B5CF6', weight: 15 },
      { id: 3, label: '5💠',       reward: { crystals: 5 },   color: '#10B981', weight: 10 },
      { id: 4, label: '200💎',     reward: { gems: 200 },     color: '#8B5CF6', weight: 10 },
      { id: 5, label: '10K⚡',     reward: { energy: 10000 }, color: '#3B82F6', weight: 12 },
      { id: 6, label: '🛡️Guardian',reward: { guardian: 1 },   color: '#F59E0B', weight: 5 },
      { id: 7, label: '500💎',     reward: { gems: 500 },     color: '#8B5CF6', weight: 3 }
    ];
    
    this.segmentAngle = 360 / this.segments.length; // 45 grade
  }
  
  canSpin() {
    const state = stateManager.getState();
    const lastSpin = state.miniGames?.dailySpin?.lastSpinDate || '';
    const today = new Date().toDateString();
    const purchased = state.miniGames?.dailySpin?.purchasedSpins || 0;
    
    if (lastSpin !== today) return { can: true, type: 'free', nextFreeIn: 0 };
    if (purchased > 0) return { can: true, type: 'purchased', spinsRemaining: purchased };
    
    const now = new Date();
    const midnight = new Date(now).setHours(24,0,0,0);
    return { can: false, type: 'none', nextFreeIn: midnight - now.getTime() };
  }
  
  useSpin() {
    const check = this.canSpin();
    if (!check.can) return null;
    
    if (check.type === 'free') {
      stateManager.dispatch({ type: 'UPDATE_MINI_GAME', payload: { game: 'dailySpin', data: { lastSpinDate: new Date().toDateString() } } });
    } else {
      stateManager.dispatch({ type: 'DECREMENT_PURCHASED_SPINS', payload: { game: 'dailySpin' } });
    }
    
    return this.calculateSpin();
  }
  
  calculateSpin() {
    const selected = this.selectRandomSegment();
    
    // 1. Calculăm unghiul țintă invers
    // ID 0 este la 0 grade. ID 1 este la 45 grade.
    // Ca ID 1 să ajungă la pointer (0 grade), roata trebuie rotită -45 (sau 315) grade.
    const targetBase = (360 - (selected.id * this.segmentAngle)) % 360;
    
    // 2. Calculăm diferența față de rotația curentă
    const currentMod = this.currentRotation % 360;
    let distance = targetBase - currentMod;
    if (distance < 0) distance += 360;
    
    // 3. Adăugăm ture complete (5 ture)
    const spins = 5 * 360;
    
    // 4. Actualizăm rotația totală
    this.currentRotation += spins + distance;
    
    // 5. IMPORTANT: Adăugăm un mic offset de 22.5 grade la final în UI
    // pentru a centra segmentul sub pointer (vezi PuzzleUI.js)

    return {
      segment: selected,
      rotation: this.currentRotation,
      duration: 4000
    };
  }
  
  selectRandomSegment() {
    const totalWeight = this.segments.reduce((sum, s) => sum + s.weight, 0);
    let r = Math.random() * totalWeight;
    for (let s of this.segments) {
      r -= s.weight;
      if (r <= 0) return s;
    }
    return this.segments[0];
  }
  
  grantReward(segment) {
    const reward = segment.reward;
    Object.entries(reward).forEach(([res, amt]) => {
      if(res === 'guardian') eventBus.emit('guardian:summon', { amount: amt, source: 'spin', guaranteed: true });
      else stateManager.dispatch({ type: 'ADD_RESOURCE', payload: { resource: res, amount: amt } });
    });
    return reward;
  }
  
  formatTimeRemaining(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }
}

export default new DailySpinGame();