/**
 * ShopUI - Manages shop tab display
 */

import shopSystem from '../systems/ShopSystem.js';
import eventBus from '../utils/EventBus.js';
import Formatters from '../utils/Formatters.js';

class ShopUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`ShopUI: Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.subscribe();
  }
  
  subscribe() {
    eventBus.on('shop:purchase-completed', () => this.render());
    eventBus.on('shop:vip-activated', () => this.render());
  }
  
  render() {
    this.container.innerHTML = `
      ${this.renderVIPSection()}
      ${this.renderGemPackages()}
      ${this.renderRewardedAds()}
    `;
  }
  
  renderVIPSection() {
    const vip = shopSystem.items.vip;
    const isActive = shopSystem.isVIPActive();
    
    return `
      <div class="shop-section vip-section">
        <h3>👑 VIP Membership</h3>
        
        ${isActive ? `
          <div class="vip-active">
            <p>✅ VIP Active</p>
            <p>Expires: ${new Date(shopSystem.getStats().vipExpiry).toLocaleString()}</p>
          </div>
        ` : `
          <div class="vip-benefits">
            <p>${vip.description}</p>
            <ul>
              ${vip.benefitsDisplay.map(benefit => `<li>✓ ${benefit}</li>`).join('')}
            </ul>
            <button class="btn btn-primary btn-large" onclick="purchaseVIP()">
              Buy VIP - ${vip.priceDisplay}
            </button>
          </div>
        `}
      </div>
    `;
  }
  
  renderGemPackages() {
    const packages = shopSystem.items.gemPackages;
    
    let html = '<div class="shop-section"><h3>💎 Gem Packages</h3><div class="shop-grid">';
    
    for (let [id, pkg] of Object.entries(packages)) {
      html += `
        <div class="shop-item ${pkg.popular ? 'popular' : ''}">
          ${pkg.popular ? '<div class="popular-badge">POPULAR</div>' : ''}
          ${pkg.bonusPercentage ? `<div class="bonus-badge">+${pkg.bonusPercentage}% BONUS</div>` : ''}
          
          <div class="shop-item-icon">${pkg.emoji}</div>
          <h4>${pkg.name}</h4>
          <p class="shop-item-description">${pkg.description}</p>
          
          <div class="shop-item-content">
            <div class="gem-amount">${pkg.gems} 💎</div>
            
            ${pkg.bonus ? `
              <div class="bonus-items">
                ${pkg.bonus.energy ? `<div>+${Formatters.formatNumber(pkg.bonus.energy)} ⚡</div>` : ''}
                ${pkg.bonus.mana ? `<div>+${Formatters.formatNumber(pkg.bonus.mana)} ✨</div>` : ''}
                ${pkg.bonus.crystals ? `<div>+${pkg.bonus.crystals} 💠</div>` : ''}
                ${pkg.bonus.guardian ? `<div>+${pkg.bonus.guardian} Guardian${pkg.bonus.guardian > 1 ? 's' : ''}</div>` : ''}
              </div>
            ` : ''}
          </div>
          
          <div class="shop-item-price">${pkg.priceDisplay}</div>
          <button class="btn btn-success" onclick="purchasePackage('${id}')">
            Purchase
          </button>
        </div>
      `;
    }
    
    html += '</div></div>';
    return html;
  }
  
  renderRewardedAds() {
    const ads = shopSystem.items.rewardedAds;
    const stats = shopSystem.getStats();
    
    let html = `
      <div class="shop-section">
        <h3>📺 Rewarded Ads</h3>
        <p>Watch ads to earn free rewards! (${stats.adsWatchedToday}/${shopSystem.maxAdsPerDay} today)</p>
        <div class="shop-grid">
    `;
    
    for (let [id, ad] of Object.entries(ads)) {
      const canWatch = stats.adsRemaining > 0;
      
      let rewardText = '';
      if (ad.reward.energy) rewardText = `${Formatters.formatNumber(ad.reward.energy)} ⚡`;
      if (ad.reward.gems) rewardText = `${ad.reward.gems} 💎`;
      if (ad.reward.multiplier) rewardText = `${ad.reward.multiplier}x for ${ad.reward.duration / 60000} min`;
      
      html += `
        <div class="shop-item ad-item">
          <div class="shop-item-icon">${ad.emoji}</div>
          <h4>${ad.name}</h4>
          <p>${ad.description}</p>
          
          <div class="ad-reward">
            Reward: ${rewardText}
          </div>
          
          <button class="btn btn-primary" 
                  onclick="watchAd('${id}')" 
                  ${!canWatch ? 'disabled' : ''}>
            ${canWatch ? '▶️ Watch Ad' : '✓ Watched'}
          </button>
        </div>
      `;
    }
    
    html += '</div></div>';
    return html;
  }
}

// Global functions
window.purchaseVIP = () => {
  shopSystem.purchaseVIP();
};

window.purchasePackage = (packageId) => {
  shopSystem.purchasePackage(packageId);
};

window.watchAd = (adType) => {
  shopSystem.watchAd(adType);
};

export default ShopUI;