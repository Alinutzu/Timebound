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
        energy: 10000,
        mana: 100
      },
      price: 0.99,
      priceDisplay: '$0.99',
      emoji: '💎',
      popular: false
    },
    
    medium: {
      id: 'medium',
      name: 'Medium Pack',
      description: 'Good value for active players',
      gems: 1200,
      bonus: {
        energy: 25000,
        mana: 250,
        crystals: 5
      },
      price: 1.99,
      priceDisplay: '$1.99',
      emoji: '💎',
      popular: true,
      bonusPercentage: 20 // +20% gems
    },
    
    large: {
      id: 'large',
      name: 'Large Pack',
      description: 'Best value!',
      gems: 3000,
      bonus: {
        energy: 100000,
        mana: 1000,
        crystals: 15,
        guardian: 1 // Free guardian summon
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 50 // +50% gems
    },
    
    mega: {
      id: 'mega',
      name: 'Mega Pack',
      description: 'For serious players',
      gems: 7500,
      bonus: {
        energy: 500000,
        mana: 5000,
        crystals: 50,
        guardian: 3
      },
      price: 9.99,
      priceDisplay: '$9.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 100 // +100% gems (double)
    },
    
    ultimate: {
      id: 'ultimate',
      name: 'Ultimate Pack',
      description: 'The best deal',
      gems: 20000,
      bonus: {
        energy: 2000000,
        mana: 20000,
        crystals: 200,
        guardian: 10,
        guaranteedLegendary: 1
      },
      price: 19.99,
      priceDisplay: '$19.99',
      emoji: '💎',
      popular: false,
      bonusPercentage: 150, // +150% gems
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
    duration: 2592000000, // 30 days in ms
    emoji: '👑',
    
    benefits: {
      offlineProduction: 1.0, // 100% offline production
      dailyGems: 50,
      questSlots: 5, // +2 quest slots
      upgradeQueueSlots: 5, // +2 upgrade slots
      guardianDiscount: 0.5, // 50% off guardian summons
      noAds: true,
      exclusiveCosmetics: true
    },
    
    benefitsDisplay: [
      '100% offline production',
      '50 gems daily',
      '+2 quest slots',
      '+2 upgrade queue slots',
      '50% off guardian summons',
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
      gems: 2000,
      bonus: {
        energy: 100000,
        crystals: 20,
        guardian: 2
      },
      price: 2.99,
      priceDisplay: '$2.99',
      emoji: '🎁',
      duration: 86400000, // 24 hours
      condition: {
        playTime: { max: 3600000 } // First hour only
      },
      discount: 70 // 70% off
    },
    
    {
      id: 'ascension_boost',
      name: 'Ascension Boost',
      description: 'Just ascended? Get a head start!',
      gems: 1000,
      bonus: {
        energy: 500000,
        crystals: 50,
        quickStart: true // Triggers quick start bonus
      },
      price: 3.99,
      priceDisplay: '$3.99',
      emoji: '✨',
      duration: 1800000, // 30 minutes after ascension
      condition: {
        justAscended: true
      },
      discount: 50
    }
  ],
  
  // ===== REWARDED ADS =====
  rewardedAds: {
    energyBoost: {
      id: 'energyBoost',
      name: 'Energy Boost',
      description: 'Watch ad for energy',
      reward: {
        energy: 5000
      },
      cooldown: 300000, // 5 minutes
      dailyLimit: 10,
      emoji: '⚡'
    },
    
    gemReward: {
      id: 'gemReward',
      name: 'Free Gems',
      description: 'Watch ad for gems',
      reward: {
        gems: 25
      },
      cooldown: 600000, // 10 minutes
      dailyLimit: 5,
      emoji: '💎'
    },
    
    doubleReward: {
      id: 'doubleReward',
      name: 'Double Rewards',
      description: '2x all production for 10 minutes',
      reward: {
        multiplier: 2,
        duration: 600000 // 10 minutes
      },
      cooldown: 1800000, // 30 minutes
      dailyLimit: 3,
      emoji: '✨'
    }
  },
  
  // ===== DAILY DEAL =====
  dailyDeal: {
    refreshTime: 86400000, // 24 hours
    deals: [
      {
        id: 'energy_sale',
        name: 'Energy Sale',
        gems: 500,
        bonus: { energy: 100000 },
        price: 0.99,
        discount: 50
      },
      {
        id: 'crystal_deal',
        name: 'Crystal Deal',
        gems: 1000,
        bonus: { crystals: 25 },
        price: 1.99,
        discount: 60
      },
      {
        id: 'guardian_special',
        name: 'Guardian Special',
        gems: 800,
        bonus: { guardian: 5 },
        price: 2.99,
        discount: 40
      }
    ]
  }
};

export default SHOP_ITEMS;