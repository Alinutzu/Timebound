/**
 * Upgrade definitions with balancing
 */

const UPGRADES = {
  // ===== PRODUCTION MULTIPLIERS =====
  energyBoost: {
    id: 'energyBoost',
    name: 'Energy Amplifier',
    description: 'Increases all energy production',
    emoji: '⚡',
    category: 'production',
    
    maxLevel: 50,
    baseCost: 100,
    costMultiplier: 1.5,
    costResource: 'energy',
    
    effect: (level) => {
      // +10% per level, compounding
      return Math.pow(1.1, level);
    },
    
    getDescription: (level) => {
      const bonus = ((Math.pow(1.1, level) - 1) * 100).toFixed(1);
      return `+${bonus}% energy production`;
    },
    
    unlockCondition: null
  },
  
  manaEfficiency: {
    id: 'manaEfficiency',
    name: 'Mana Efficiency',
    description: 'Increases mana production',
    emoji: '✨',
    category: 'production',
    
    maxLevel: 20,
    baseCost: 50,
    costMultiplier: 2.0,
    costResource: 'mana',
    
    effect: (level) => {
      return Math.pow(1.15, level); // +15% per level
    },
    
    getDescription: (level) => {
      const bonus = ((Math.pow(1.15, level) - 1) * 100).toFixed(1);
      return `+${bonus}% mana production`;
    },
    
    unlockCondition: {
      resources: { mana: 10 }
    }
  },
  
  volcanicPower: {
    id: 'volcanicPower',
    name: 'Volcanic Amplification',
    description: 'Boosts volcanic energy production',
    emoji: '🌋',
    category: 'production',
    
    maxLevel: 30,
    baseCost: 200,
    costMultiplier: 1.6,
    costResource: 'volcanicEnergy',
    
    effect: (level) => {
      return Math.pow(1.12, level); // +12% per level
    },
    
    getDescription: (level) => {
      const bonus = ((Math.pow(1.12, level) - 1) * 100).toFixed(1);
      return `+${bonus}% volcanic energy production`;
    },
    
    unlockCondition: {
      realms: { volcano: true }
    }
  },
  
  // ===== RESOURCE CAPS =====
  energyCap: {
    id: 'energyCap',
    name: 'Energy Storage',
    description: 'Increases maximum energy capacity',
    emoji: '🔋',
    category: 'capacity',
    
    maxLevel: 30,
    baseCost: 200,
    costMultiplier: 1.4,
    costResource: 'energy',
    
    effect: (level) => {
      // Base 1000 + 50% per level
      return 1000 * Math.pow(1.5, level);
    },
    
    getDescription: (level) => {
      const cap = Math.floor(1000 * Math.pow(1.5, level));
      return `Energy cap: ${cap.toLocaleString()}`;
    },
    
    unlockCondition: {
      resources: { energy: 500 }
    }
  },
  
  manaCap: {
    id: 'manaCap',
    name: 'Mana Reservoir',
    description: 'Increases maximum mana capacity',
    emoji: '🔮',
    category: 'capacity',
    
    maxLevel: 20,
    baseCost: 100,
    costMultiplier: 1.5,
    costResource: 'mana',
    
    effect: (level) => {
      return 100 * Math.pow(1.5, level);
    },
    
    getDescription: (level) => {
      const cap = Math.floor(100 * Math.pow(1.5, level));
      return `Mana cap: ${cap.toLocaleString()}`;
    },
    
    unlockCondition: {
      resources: { mana: 20 }
    }
  },
  
  volcanicCap: {
    id: 'volcanicCap',
    name: 'Magma Chamber',
    description: 'Increases volcanic energy capacity',
    emoji: '⚱️',
    category: 'capacity',
    
    maxLevel: 25,
    baseCost: 500,
    costMultiplier: 1.45,
    costResource: 'volcanicEnergy',
    
    effect: (level) => {
      return 5000 * Math.pow(1.5, level);
    },
    
    getDescription: (level) => {
      const cap = Math.floor(5000 * Math.pow(1.5, level));
      return `Volcanic cap: ${cap.toLocaleString()}`;
    },
    
    unlockCondition: {
      realms: { volcano: true }
    }
  },
  
  // ===== STRUCTURE SYNERGIES =====
  solarSynergy: {
    id: 'solarSynergy',
    name: 'Solar Optimization',
    description: 'Boosts Solar Panel efficiency',
    emoji: '☀️',
    category: 'synergy',
    
    maxLevel: 5,
    baseCost: 1000,
    costMultiplier: 3.0,
    costResource: 'energy',
    
    targetStructure: 'solarPanel',
    
    effect: (level) => {
      return 1 + (level * 0.5); // +50% per level
    },
    
    getDescription: (level) => {
      const bonus = (level * 50);
      return `+${bonus}% Solar Panel production`;
    },
    
    unlockCondition: {
      structures: { solarPanel: 10 }
    }
  },
  
  windSynergy: {
    id: 'windSynergy',
    name: 'Wind Optimization',
    description: 'Boosts Wind Turbine efficiency',
    emoji: '💨',
    category: 'synergy',
    
    maxLevel: 5,
    baseCost: 2000,
    costMultiplier: 3.0,
    costResource: 'energy',
    
    targetStructure: 'windTurbine',
    
    effect: (level) => {
      return 1 + (level * 0.5);
    },
    
    getDescription: (level) => {
      const bonus = (level * 50);
      return `+${bonus}% Wind Turbine production`;
    },
    
    unlockCondition: {
      structures: { windTurbine: 10 }
    }
  },
  
  hydroSynergy: {
    id: 'hydroSynergy',
    name: 'Hydro Optimization',
    description: 'Boosts Hydro Plant efficiency',
    emoji: '💧',
    category: 'synergy',
    
    maxLevel: 5,
    baseCost: 5000,
    costMultiplier: 3.0,
    costResource: 'energy',
    
    targetStructure: 'hydroPlant',
    
    effect: (level) => {
      return 1 + (level * 0.5);
    },
    
    getDescription: (level) => {
      const bonus = (level * 50);
      return `+${bonus}% Hydro Plant production`;
    },
    
    unlockCondition: {
      structures: { hydroPlant: 10 }
    }
  },
  
  // ===== QUALITY OF LIFE =====
  offlineProduction: {
    id: 'offlineProduction',
    name: 'Offline Generator',
    description: 'Earn resources while offline',
    emoji: '🌙',
    category: 'qol',
    
    maxLevel: 10,
    baseCost: 500,
    costMultiplier: 1.0, // Fixed cost per level
    costResource: 'gems',
    
    effect: (level) => {
      // 0% → 100% in 10 levels
      return Math.min(level * 10, 100);
    },
    
    getDescription: (level) => {
      const percent = Math.min(level * 10, 100);
      return `${percent}% production while offline`;
    },
    
    unlockCondition: {
      resources: { gems: 500 }
    }
  },
  
  autoCollect: {
    id: 'autoCollect',
    name: 'Auto-Collector',
    description: 'Automatically collect offline resources',
    emoji: '🤖',
    category: 'qol',
    
    maxLevel: 1,
    baseCost: 1000,
    costMultiplier: 1.0,
    costResource: 'gems',
    
    effect: (level) => {
      return level > 0;
    },
    
    getDescription: (level) => {
      return level > 0 ? 'Auto-collect enabled' : 'Auto-collect offline resources';
    },
    
    unlockCondition: {
      upgrades: { offlineProduction: 5 }
    }
  },
  
  quickStart: {
    id: 'quickStart',
    name: 'Quick Start',
    description: 'Start with bonus resources after ascension',
    emoji: '🚀',
    category: 'qol',
    
    maxLevel: 5,
    baseCost: 2000,
    costMultiplier: 1.5,
    costResource: 'gems',
    
    effect: (level) => {
      // Start with 10% of previous run resources
      return level * 0.1;
    },
    
    getDescription: (level) => {
      const percent = (level * 10);
      return `Start with ${percent}% of previous resources`;
    },
    
    unlockCondition: {
      ascension: { level: 1 }
    }
  },
  
  // ===== UNLOCK UPGRADES =====
  advancedTech: {
    id: 'advancedTech',
    name: 'Advanced Technology',
    description: 'Unlock Fusion Reactor',
    emoji: '🔬',
    category: 'unlock',
    
    maxLevel: 1,
    baseCost: 10000,
    costMultiplier: 1.0,
    costResource: 'energy',
    
    effect: () => {
      return { unlock: 'fusionReactor' };
    },
    
    getDescription: () => {
      return 'Unlocks: Fusion Reactor';
    },
    
    unlockCondition: {
      resources: { energy: 50000 },
      structures: { geoThermal: 5 }
    }
  },
  
  manaConvergence: {
    id: 'manaConvergence',
    name: 'Mana Convergence',
    description: 'Unlock Mana Crystallizer',
    emoji: '💠',
    category: 'unlock',
    
    maxLevel: 1,
    baseCost: 100,
    costMultiplier: 1.0,
    costResource: 'mana',
    
    effect: () => {
      return { unlock: 'manaCrystallizer' };
    },
    
    getDescription: () => {
      return 'Unlocks: Mana Crystallizer';
    },
    
    unlockCondition: {
      resources: { mana: 100 },
      structures: { manaExtractor: 10 }
    }
  },
  
  // ===== SPECIAL UPGRADES =====
  criticalEnergy: {
    id: 'criticalEnergy',
    name: 'Critical Energy',
    description: 'Chance for 2x energy production ticks',
    emoji: '💥',
    category: 'special',
    
    maxLevel: 10,
    baseCost: 5000,
    costMultiplier: 2.0,
    costResource: 'gems',
    
    effect: (level) => {
      return level * 2; // 2% per level
    },
    
    getDescription: (level) => {
      const chance = (level * 2);
      return `${chance}% chance for 2x energy ticks`;
    },
    
    unlockCondition: {
      resources: { gems: 5000 },
      ascension: { level: 2 }
    }
  },
  
  luckyGems: {
    id: 'luckyGems',
    name: 'Lucky Gems',
    description: 'Chance to get bonus gems from quests',
    emoji: '🍀',
    category: 'special',
    
    maxLevel: 10,
    baseCost: 3000,
    costMultiplier: 1.8,
    costResource: 'gems',
    
    effect: (level) => {
      return level * 5; // 5% per level
    },
    
    getDescription: (level) => {
      const chance = (level * 5);
      return `${chance}% chance for bonus gems`;
    },
    
    unlockCondition: {
      statistics: { questsCompleted: 10 }
    }
  },
  
  guardianBond: {
    id: 'guardianBond',
    name: 'Guardian Bond',
    description: 'Increases all guardian bonuses',
    emoji: '🤝',
    category: 'special',
    
    maxLevel: 10,
    baseCost: 2000,
    costMultiplier: 2.5,
    costResource: 'gems',
    
    effect: (level) => {
      return 1 + (level * 0.1); // +10% per level
    },
    
    getDescription: (level) => {
      const bonus = (level * 10);
      return `+${bonus}% to all guardian bonuses`;
    },
    
    unlockCondition: {
      guardians: { count: 5 }
    }
  }
};

export default UPGRADES;