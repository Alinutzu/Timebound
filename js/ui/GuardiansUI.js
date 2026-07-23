/**
 * GuardiansUI - Manages guardians tab display
 */

import guardianSystem from '../systems/GuardianSystem.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';
import confirmModal from './ConfirmModal.js';

class GuardiansUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.showCollection = false;
    
    if (!this.container) {
      console.error(`GuardiansUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
    
    // Bind summon buttons
    document.getElementById('summon-guardian-btn')?.addEventListener('click', () => {
      this.summonGuardian();
    });
    
    const summonBtn = document.getElementById('summon-guardian-btn');
    if (summonBtn && !document.getElementById('summon-x10-btn')) {
      const x10Btn = document.createElement('button');
      x10Btn.id = 'summon-x10-btn';
      x10Btn.className = 'btn btn-secondary btn-large summon-x10-btn';
      x10Btn.textContent = 'Summon x10 (💰5,000)';
      x10Btn.addEventListener('click', () => this.summonBulk());
      summonBtn.parentNode.insertBefore(x10Btn, summonBtn.nextSibling);
    }
    
    // Collection toggle
    if (!document.getElementById('collection-toggle-btn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'collection-toggle-btn';
      toggleBtn.className = 'btn btn-small btn-secondary';
      toggleBtn.textContent = '📖 Collection';
      toggleBtn.style.marginLeft = '8px';
      toggleBtn.addEventListener('click', () => {
        this.showCollection = !this.showCollection;
        toggleBtn.textContent = this.showCollection ? '📋 My Guardians' : '📖 Collection';
        this.renderGuardians();
      });
      const statsEl = document.getElementById('guardian-stats');
      if (statsEl) statsEl.parentNode.insertBefore(toggleBtn, statsEl.nextSibling);
    }
  }
  
  subscribe() {
    eventBus.on('guardian:summoned', () => this.render());
    eventBus.on('guardian:dismissed', () => this.render());
    eventBus.on('guardian:bulk-summoned', () => this.render());
    eventBus.on('state:ADD_RESOURCE', () => this.updateSummonButton());
  }
  
  render() {
    this.renderStats();
    this.renderGuardians();
    this.updateSummonButton();
  }
  
  renderStats() {
    const statsContainer = document.getElementById('guardian-stats');
    if (!statsContainer) return;
    
    const stats = guardianSystem.getStats();
    const state = stateManager.getState();
    
    statsContainer.innerHTML = `
      <div class="summary-card">
        <h4>Total Guardians</h4>
        <p class="summary-value">${stats.total}</p>
      </div>
      
      <div class="summary-card">
        <h4>⚡ Energy Bonus</h4>
        <p class="summary-value">+${stats.totalBonus.energy}%</p>
      </div>
      
      <div class="summary-card">
        <h4>✨ Mana Bonus</h4>
        <p class="summary-value">+${stats.totalBonus.mana}%</p>
      </div>
      
      <div class="summary-card">
        <h4>🌟 Universal Bonus</h4>
        <p class="summary-value">+${stats.totalBonus.all}%</p>
      </div>
      
      <div class="summary-card">
        <h4>Average Bonus</h4>
        <p class="summary-value">${stats.averageBonus.toFixed(1)}%</p>
      </div>
      
      <div class="summary-card">
        <h4>⭐ Legendary</h4>
        <p class="summary-value">${stats.byRarity.legendary || 0}</p>
      </div>
      
      <div class="summary-card collection-card">
        <h4>📖 Collection</h4>
        <p class="summary-value">${stats.collection.unique}/${stats.collection.total}</p>
      </div>
      
      <div class="summary-card pity-card">
        <h4>🎯 Pity Progress</h4>
        <div class="pity-bar-container">
          <div class="pity-bar-label">Epic</div>
          <div class="pity-bar-track">
            <div class="pity-bar-fill epic" style="width:${Math.min((state.guardianPity?.epic || 0) / 25 * 100, 100)}%"></div>
          </div>
          <span class="pity-bar-text">${state.guardianPity?.epic || 0}/25</span>
        </div>
        <div class="pity-bar-container">
          <div class="pity-bar-label">Legendary</div>
          <div class="pity-bar-track">
            <div class="pity-bar-fill legendary" style="width:${Math.min((state.guardianPity?.legendary || 0) / 50 * 100, 100)}%"></div>
          </div>
          <span class="pity-bar-text">${state.guardianPity?.legendary || 0}/50</span>
        </div>
      </div>
    `;
  }
  
  renderGuardians() {
    if (this.showCollection) {
      this.renderCollection();
      return;
    }
    
    const guardians = guardianSystem.getGuardians();
    
    if (guardians.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 3rem; margin-bottom: 1rem;">🐉</p>
          <h3>No Guardians Yet</h3>
          <p>Summon your first guardian to boost your production!</p>
        </div>
      `;
      return;
    }
    
    // Sort by rarity and bonus
    const sorted = [...guardians].sort((a, b) => {
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return b.bonus - a.bonus;
    });
    
    this.container.innerHTML = '';
    
    sorted.forEach(guardian => {
      const card = this.createGuardianCard(guardian);
      this.container.appendChild(card);
    });
    
    // Fusion section
    const fusionSection = this.createFusionSection(guardians);
    if (fusionSection) this.container.appendChild(fusionSection);
  }
  
  renderCollection() {
    const pool = guardianSystem.guardianPool;
    const owned = guardianSystem.getGuardians();
    const ownedKeys = new Set(owned.map(g => g.key));
    
    this.container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'collection-header';
    header.innerHTML = `<p style="margin-bottom:12px;opacity:0.8">${ownedKeys.size}/${Object.keys(pool).length} guardians collected</p>`;
    this.container.appendChild(header);
    
    Object.entries(pool).forEach(([key, data]) => {
      const card = document.createElement('div');
      const has = ownedKeys.has(key);
      const count = owned.filter(g => g.key === key).length;
      card.className = `guardian-card collection-card ${has ? 'owned' : 'missing'}`;
      card.innerHTML = `
        <div class="guardian-header">
          <span class="guardian-emoji" style="opacity:${has ? 1 : 0.3}">${data.emoji}</span>
          <div class="guardian-info">
            <h4 class="guardian-name">${data.name}</h4>
            <span class="guardian-rarity ${data.rarities[data.rarities.length - 1]}">
              ${data.rarities.map(r => guardianSystem.getRarityName(r)).join('/')}
            </span>
          </div>
        </div>
        <div class="guardian-meta">
          <small>${has ? `Owned: ${count}x` : '🔒 Not collected'}</small>
        </div>
      `;
      this.container.appendChild(card);
    });
  }
  
  createFusionSection(guardians) {
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic'];
    const rarityNames = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic' };
    const available = rarityOrder.filter(r => {
      return guardians.filter(g => g.rarity === r).length >= 3;
    });
    
    if (available.length === 0) return null;
    
    const section = document.createElement('div');
    section.className = 'fusion-section';
    section.innerHTML = `<h4>🔀 Fusion Available</h4><div class="fusion-options"></div>`;
    const options = section.querySelector('.fusion-options');
    
    available.forEach(rarity => {
      const count = guardians.filter(g => g.rarity === rarity).length;
      const fusions = Math.floor(count / 3);
      const nextIdx = { common: 'uncommon', uncommon: 'rare', rare: 'epic', epic: 'legendary' };
      const btn = document.createElement('button');
      btn.className = 'btn btn-small btn-fusion';
      btn.textContent = `Fuse 3 ${rarityNames[rarity]} → 1 ${rarityNames[nextIdx[rarity]]} (${fusions}x)`;
      btn.addEventListener('click', () => {
        const ids = guardians.filter(g => g.rarity === rarity).sort((a, b) => a.bonus - b.bonus).slice(0, 3).map(g => g.id);
        guardianSystem.fuseGuardians(ids);
      });
      options.appendChild(btn);
    });
    
    return section;
  }
  
  createGuardianCard(guardian) {
  const card = document.createElement('div');
  card.className = `guardian-card rarity-${guardian.rarity}`;
  
  const typeName = this.getTypeName(guardian.type);
  
  card.innerHTML = `
    <div class="guardian-header">
      <span class="guardian-emoji">${guardian.emoji}</span>
      <div class="guardian-info">
        <h4 class="guardian-name">${guardian.name}</h4>
        <span class="guardian-rarity ${guardian.rarity}">
          ${guardianSystem.getRarityName(guardian.rarity)}
        </span>
      </div>
    </div>
    
    <div class="guardian-bonus">
      <div class="guardian-bonus-value">+${guardian.bonus}%</div>
      <div class="guardian-bonus-label">${typeName} Production</div>
    </div>
    
    <div class="guardian-meta">
      <small>Summoned: ${new Date(guardian.summonedAt).toLocaleDateString()}</small>
    </div>
    
    <button class="btn btn-small btn-danger guardian-dismiss-btn" data-guardian-id="${guardian.id}">
      Dismiss
    </button>
  `;
  
  // ===== ADAUGĂ EVENT LISTENER =====
  const dismissBtn = card.querySelector('.guardian-dismiss-btn');
  dismissBtn.addEventListener('click', () => {
    this.dismissGuardian(guardian);
  });
    
    return card;
  }

  dismissGuardian(guardian) {
  const rarityLabel = guardianSystem.getRarityName(guardian.rarity);
  let message = `Dismiss ${guardian.emoji} ${rarityLabel} ${guardian.name}? It provides +${guardian.bonus}% ${this.getTypeName(guardian.type)} production and cannot be recovered!`;
  
  if (guardian.rarity === 'legendary') {
    message = `☠️ PERMANENT LOSS ☠️\nYou are about to dismiss a LEGENDARY guardian! ${guardian.emoji} ${guardian.name} provides +${guardian.bonus}% ${this.getTypeName(guardian.type)} production. This action CANNOT be undone!`;
  } else if (guardian.rarity === 'epic') {
    message = `⚠️ You are about to dismiss an EPIC guardian! ${guardian.emoji} ${guardian.name} provides +${guardian.bonus}% ${this.getTypeName(guardian.type)} production. This cannot be undone.`;
  }
  
  confirmModal.show({
    title: `Dismiss ${rarityLabel} Guardian`,
    message: message,
    danger: true,
    onConfirm: () => {
      guardianSystem.dismiss(guardian.id);
      
      eventBus.emit('notification:show', {
        type: 'info',
        title: 'Guardian Dismissed',
        message: `${guardian.name} has left your service`,
        duration: 3000
      });
    }
  });
}
  
  summonGuardian() {
    const success = guardianSystem.summon();
    
    if (!success) return;
    
    const btn = document.getElementById('summon-guardian-btn');
    if (btn) {
      btn.classList.add('btn-loading');
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.classList.remove('btn-loading');
        btn.style.transform = '';
        btn.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.6)';
        setTimeout(() => { btn.style.boxShadow = ''; }, 500);
      }, 300);
    }
  }
  
  summonBulk() {
    const results = guardianSystem.summonBulk(10);
    if (results.length > 0) {
      const x10Btn = document.getElementById('summon-x10-btn');
      if (x10Btn) {
        x10Btn.style.transform = 'scale(0.95)';
        x10Btn.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.6)';
        setTimeout(() => {
          x10Btn.style.transform = '';
          x10Btn.style.boxShadow = '';
        }, 500);
      }
      eventBus.emit('notification:show', {
        type: 'success',
        title: 'Bulk Summon',
        message: `Summoned ${results.length} guardians!`,
        duration: 3000
      });
    }
  }

  updateSummonButton() {
    const btn = document.getElementById('summon-guardian-btn');
    if (!btn) return;
    
    const x10Btn = document.getElementById('summon-x10-btn');
    const state = stateManager.getState();
    const canSummon = guardianSystem.canSummon();
    btn.disabled = !canSummon;
    if (x10Btn) x10Btn.disabled = (state.resources.gems || 0) < guardianSystem.summonCost * 10;
  }
  
  getTypeName(type) {
    const names = {
      energy: 'Energy',
      mana: 'Mana',
      volcanic: 'Volcanic',
      water: 'Water',
      all: 'All Resources',
      gems: 'Gem'
    };
    return names[type] || type;
  }
}

export default GuardiansUI;