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
      bonusPercentage: 20
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
        energy: 500000,
        mana: 5000,
        crystals: 50,
        guardian: 3
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
    duration: 2592000000,
    emoji: '👑',
    
    benefits: {
      offlineProduction: 1.0,
      dailyGems: 50,
      questSlots: 5,
      upgradeQueueSlots: 5,
      guardianDiscount: 0.5,
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
      duration: 86400000,
      condition: {
        playTime: { max: 3600000 }
      },
      discount: 70
    },
    
    {
      id: 'ascension_boost',
      name: 'Ascension Boost',
      description: 'Just ascended? Get a head start!',
      gems: 1000,
      bonus: {
        energy: 500000,
        crystals: 50,
        quickStart: true
      },
      price: 3.99,
      priceDisplay: '$3.99',
      emoji: '✨',
      duration: 1800000,
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
      cooldown: 300000,
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
      cooldown: 600000,
      dailyLimit: 5,
      emoji: '💎'
    },
    
    doubleReward: {
      id: 'doubleReward',
      name: 'Double Rewards',
      description: '2x all production for 10 minutes',
      reward: {
        multiplier: 2,
        duration: 600000
      },
      cooldown: 1800000,
      dailyLimit: 3,
      emoji: '✨'
    }
  },
  
  // ===== DAILY DEAL =====
  dailyDeal: {
    refreshTime: 86400000,
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
  },  // ← VIRGULĂ AICI! ÎNCHIDE dailyDeal
  
  // ===== MINI-GAMES PACKAGES ===== ← AICI LA ACELAȘI NIVEL CU dailyDeal!
  miniGamesPackages: {
    extraSpins3: {
      id: 'extra_spins_3',
      name: '3 Extra Spins',
      description: 'Get 3 additional spins for the Daily Wheel!',
      spins: 3,
      bonus: {
        gems: 100
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
        gems: 500,
        energy: 10000
      },
      price: 2.99,
      priceDisplay: '$2.99',
      emoji: '🎡',
      popular: true,
      bonusPercentage: 30
    },
    
    unlimitedSpins24h: {
      id: 'unlimited_spins_24h',
      name: 'Unlimited Spins - 24h',
      description: 'Spin as much as you want for 24 hours!',
      unlimited: true,
      duration: 86400000,
      bonus: {
        gems: 1000
      },
      price: 4.99,
      priceDisplay: '$4.99',
      emoji: '🎡✨',
      special: true
    }
  }  // ← FĂRĂ VIRGULĂ (ultimul element)
};

export default SHOP_ITEMS;