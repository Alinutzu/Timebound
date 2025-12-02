/**
 * Shop definitions - IAP packages, VIP, etc. 
 */

const SHOP_ITEMS = {
  // ===== GEM PACKAGES =====
  gemPackages: {
    starter: {
      id: 'starter',
      name: 'Starter Pack',
      description: 'Perfect for beginners',
      gems: 500,
      bonus: {
        energy: 5000, // Redus de la 10000
        mana: 50 // Redus de la 100
      },
      price: 0.99,
      priceDisplay: '$0. 99',
      emoji: '💎',
      popular: false
    },
    
    medium: {
      id: 'medium',
      name: 'Medium Pack',
      description: 'Good value for active players',
      gems: 1200,
      bonus: {
        energy: 15000, // Redus de la 25000
        mana: 150, // Redus de la 250
        crystals: 3 // Redus de la 5
      },
      price: 1.99,
      priceDisplay: '$1.99',
      emoji: '💎',
      popular: true,
      bonusPercentage: 20
    },
    
    large: {
      id: 'large',
      name: 'Large Pack',
      description: 'Best value!',
      gems: 3000,
      bonus: {
        energy: 50000, // Redus de la 100000
        mana: 500, // Redus de la 1000
        crystals: 10, // Redus de la 15
        guardian: 1
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 50
    },
    
    mega: {
      id: 'mega',
      name: 'Mega Pack',
      description: 'For serious players',
      gems: 7500,
      bonus: {
        energy: 250000, // Redus de la 500000
        mana: 2500, // Redus de la 5000
        crystals: 30, // Redus de la 50
        guardian: 2 // Redus de la 3
      },
      price: 9.99,
      priceDisplay: '$9.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 100
    },
    
    ultimate: {
      id: 'ultimate',
      name: 'Ultimate Pack',
      description: 'The best deal',
      gems: 20000,
      bonus: {
        energy: 1000000, // Redus de la 2000000
        mana: 10000, // Redus de la 20000
        crystals: 120, // Redus de la 200
        guardian: 6, // Redus de la 10
        guaranteedLegendary: 1
      },
      price: 19.99,
      priceDisplay: '$19.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 150,
      special: true
    }
  },
  
  // ===== VIP SUBSCRIPTION =====
  vip: {
    id: 'vip',
    name: 'VIP Membership',
    description: 'Premium benefits for 30 days',
    price: 4.99,
    priceDisplay: '$4.99/month',
    duration: 2592000000, // 30 days
    emoji: '👑',
    
    benefits: {
      offlineProduction: 0.75, // Redus de la 1.0 (100% → 75%)
      dailyGems: 30, // Redus de la 50
      questSlots: 4, // Redus de la 5 (+1 în loc de +2)
      upgradeQueueSlots: 4, // Redus de la 5
      guardianDiscount: 0.20, // Redus de la 0.5 (50% → 20%)
      noAds: true,
      exclusiveCosmetics: true
    },
    
    benefitsDisplay: [
      '75% offline production', // Updated
      '30 gems daily', // Updated
      '+1 quest slot', // Updated
      '+1 upgrade queue slot', // Updated
      '20% off guardian summons', // Updated
      'No ads',
      'Exclusive cosmetics'
    ]
  },
  
  // ===== LIMITED TIME OFFERS =====
  limitedOffers: [
    {
      id: 'welcome_offer',
      name: 'Welcome Offer',
      description: 'New player special - 24h only!',
      gems: 1500, // Redus de la 2000
      bonus: {
        energy: 50000, // Redus de la 100000
        crystals: 12, // Redus de la 20
        guardian: 1 // Redus de la 2
      },
      price: 2.99,
      priceDisplay: '$2.99',
      emoji: '🎁',
      duration: 86400000, // 24h
      condition: {
        playTime: { max: 3600000 } // First hour
      },
      discount: 70
    },
    
    {
      id: 'ascension_boost',
      name: 'Ascension Boost',
      description: 'Just ascended? Get a head start!',
      gems: 800, // Redus de la 1000
      bonus: {
        energy: 250000, // Redus de la 500000
        crystals: 30, // Redus de la 50
        quickStart: true
      },
      price: 3.99,
      priceDisplay: '$3.99',
      emoji: '✨',
      duration: 1800000, // 30 min offer window
      condition: {
        justAscended: true
      },
      discount: 50
    },
    
    // ✅ NOU - Weekend Deal
    {
      id: 'weekend_special',
      name: 'Weekend Special',
      description: 'Weekend only - Double rewards!',
      gems: 2500,
      bonus: {
        energy: 100000,
        mana: 1000,
        crystals: 20,
        guardian: 2
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '🎉',
      duration: 172800000, // 48h (weekend)
      condition: {
        dayOfWeek: [6, 0] // Saturday & Sunday
      },
      discount: 60
    }
  ],
  
  // ===== REWARDED ADS =====
  rewardedAds: {
    energyBoost: {
      id: 'energyBoost',
      name: 'Energy Boost',
      description: 'Watch ad for energy',
      reward: {
        energy: 2500 // Redus de la 5000
      },
      cooldown: 300000, // 5 min
      dailyLimit: 8, // Redus de la 10
      emoji: '⚡'
    },
    
    gemReward: {
      id: 'gemReward',
      name: 'Free Gems',
      description: 'Watch ad for gems',
      reward: {
        gems: 15 // Redus de la 25
      },
      cooldown: 600000, // 10 min
      dailyLimit: 4, // Redus de la 5
      emoji: '💎'
    },
    
    doubleReward: {
      id: 'doubleReward',
      name: 'Double Rewards',
      description: '1. 5x all production for 10 minutes', // Updated description
      reward: {
        multiplier: 1.5, // Redus de la 2 (100% → 50%)
        duration: 600000 // 10 min
      },
      cooldown: 3600000, // Crescut la 1h (de la 30 min)
      dailyLimit: 2, // Redus de la 3
      emoji: '✨'
    },
    
    // ✅ NOU - Mana Boost
    manaBoost: {
      id: 'manaBoost',
      name: 'Mana Surge',
      description: 'Watch ad for mana',
      reward: {
        mana: 100
      },
      cooldown: 450000, // 7.5 min
      dailyLimit: 6,
      emoji: '✨'
    }
  },
  
  // ===== DAILY DEAL =====
  dailyDeal: {
    refreshTime: 86400000, // 24h
    deals: [
      {
        id: 'energy_sale',
        name: 'Energy Sale',
        gems: 400, // Redus de la 500
        bonus: { energy: 50000 }, // Redus de la 100000
        price: 0.99,
        discount: 50
      },
      {
        id: 'crystal_deal',
        name: 'Crystal Deal',
        gems: 800, // Redus de la 1000
        bonus: { crystals: 15 }, // Redus de la 25
        price: 1.99,
        discount: 60
      },
      {
        id: 'guardian_special',
        name: 'Guardian Special',
        gems: 600, // Redus de la 800
        bonus: { guardian: 3 }, // Redus de la 5
        price: 2.99,
        discount: 40
      },
      // ✅ NOU - Mana Deal
      {
        id: 'mana_bundle',
        name: 'Mana Bundle',
        gems: 500,
        bonus: { 
          mana: 500,
          energy: 25000
        },
        price: 1.49,
        discount: 55
      }
    ]
  },
  
  // ===== MINI-GAMES PACKAGES =====
  miniGamesPackages: {
    extraSpins3: {
      id: 'extra_spins_3',
      name: '3 Extra Spins',
      description: 'Get 3 additional spins for the Daily Wheel!',
      spins: 3,
      bonus: {
        gems: 50 // Redus de la 100
      },
      price: 0.99,
      priceDisplay: '$0.99',
      emoji: '🎡',
      popular: false
    },
    
    extraSpins10: {
      id: 'extra_spins_10',
      name: '10 Extra Spins',
      description: 'Best value! 10 spins + bonus gems',
      spins: 10,
      bonus: {
        gems: 300, // Redus de la 500
        energy: 5000 // Redus de la 10000
      },
      price: 2.99,
      priceDisplay: '$2. 99',
      emoji: '🎡',
      popular: true,
      bonusPercentage: 30
    },
    
    unlimitedSpins24h: {
      id: 'unlimited_spins_24h',
      name: 'Unlimited Spins - 24h',
      description: 'Spin as much as you want for 24 hours!',
      unlimited: true,
      duration: 86400000, // 24h
      bonus: {
        gems: 500 // Redus de la 1000
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '🎡✨',
      special: true
    },
    
    // ✅ NOU - 2048 Undo Pack
    game2048UndoPack: {
      id: '2048_undo_pack',
      name: '2048 Undo Pack',
      description: '10 undo moves for 2048 game',
      undoMoves: 10,
      bonus: {
        gems: 100
      },
      price: 1.99,
      priceDisplay: '$1.99',
      emoji: '↩️',
      popular: false
    },
    
    // ✅ NOU - Match-3 Power-Up Bundle
    match3PowerUpBundle: {
      id: 'match3_powerup_bundle',
      name: 'Match-3 Power-Ups',
      description: 'Get 5 of each special gem power-up! ',
      powerUps: {
        bomb: 5,
        lightning: 5,
        rainbow: 2
      },
      bonus: {
        gems: 200
      },
      price: 2.99,
      priceDisplay: '$2.99',
      emoji: '💥',
      popular: true
    }
  },
  
  // ===== COSMETICS & CUSTOMIZATION =====
  cosmetics: {
    themes: [
      {
        id: 'dark_nebula',
        name: 'Dark Nebula Theme',
        description: 'Cosmic dark theme with animated stars',
        price: 500,
        currency: 'gems',
        emoji: '🌌',
        category: 'theme'
      },
      {
        id: 'ocean_waves',
        name: 'Ocean Waves Theme',
        description: 'Soothing blue ocean theme',
        price: 400,
        currency: 'gems',
        emoji: '🌊',
        category: 'theme'
      },
      {
        id: 'lava_flow',
        name: 'Lava Flow Theme',
        description: 'Hot volcanic theme',
        price: 450,
        currency: 'gems',
        emoji: '🌋',
        category: 'theme'
      }
    ],
    
    animations: [
      {
        id: 'sparkle_click',
        name: 'Sparkle Click',
        description: 'Sparkles when clicking',
        price: 200,
        currency: 'gems',
        emoji: '✨'
      },
      {
        id: 'energy_trail',
        name: 'Energy Trail',
        description: 'Leaves energy trail on cursor',
        price: 300,
        currency: 'gems',
        emoji: '⚡'
      }
    ]
  }
};

/**
 * Get package by ID
 */
export function getPackageById(packageId, category = 'gemPackages') {
  return SHOP_ITEMS[category]?.[packageId] || null;
}

/**
 * Get all packages in a category
 */
export function getPackagesByCategory(category) {
  return SHOP_ITEMS[category] || {};
}

/**
 * Check if limited offer is available
 */
export function isOfferAvailable(offer, playerState) {
  if (!offer. condition) return true;
  
  const { condition } = offer;
  
  // Check play time
  if (condition.playTime) {
    const totalPlayTime = playerState.statistics.totalPlayTime;
    if (condition.playTime.max && totalPlayTime > condition.playTime.max) {
      return false;
    }
    if (condition.playTime.min && totalPlayTime < condition.playTime.min) {
      return false;
    }
  }
  
  // Check ascension
  if (condition.justAscended) {
    const timeSinceAscension = Date.now() - (playerState.ascension.lastAscensionTime || 0);
    if (timeSinceAscension > offer.duration) {
      return false;
    }
  }
  
  // Check day of week
  if (condition. dayOfWeek) {
    const currentDay = new Date().getDay();
    if (! condition.dayOfWeek.includes(currentDay)) {
      return false;
    }
  }
  
  return true;
}

export default SHOP_ITEMS;