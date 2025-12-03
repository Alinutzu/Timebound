/**
 * Upgrade definitions with balancing
 *
 * Balancing philosophy (in linii mari, ca în idle/incremental games):
 * - Primele upgrade-uri sunt accesibile și dau un „wow” vizibil.
 * - Costurile cresc exponențial, dar nu atât de brutal încât să blocheze progresul.
 * - Capacity upgrades apar când începi să „lovești cap-ul” des.
 * - Synergiile sunt mai scumpe și mai late-game, dar foarte puternice.
 * - QoL și special sunt milestones, nu blocaje.
 */

const UPGRADES = {
  // ===== PRODUCTION MULTIPLIERS =====
  energyBoost: {
    id: 'energyBoost',
    name: 'Energy Amplifier',
    description: 'Increases all energy production',
    emoji: '⚡',
    category: 'production',
    
    // Early-mid game backbone: simți câștigul, dar nu sari instant în infinit
    maxLevel: 40,
    baseCost: 200,          // accesibil foarte devreme
    costMultiplier: 1.5,    // scaling blând, potrivit pentru „primul” upgrade important
    costResource: 'energy',
    
    effect: (level) => {
      // ~+12% per level, compounding
      return Math.pow(1.12, level);
    },
    
    getDescription: (level) => {
      const bonus = ((Math.pow(1.12, level) - 1) * 100).toFixed(1);
      return `+${bonus}% energy production`;
    },
    
    unlockCondition: null   // disponibil de la început
  },
  
  manaEfficiency: {
    id: 'manaEfficiency',
    name: 'Mana Efficiency',
    description: 'Increases mana production',
    emoji: '✨',
    category: 'production',
    
    // Mana e o resursă secundară, dar importantă
    maxLevel: 25,
    baseCost: 300,
    costMultiplier: 1.8,    // mai agresiv decât energy, dar nu absurd
    costResource: 'mana',
    
    effect: (level) => {
      // ~+14% per level, compounding
      return Math.pow(1.14, level);
    },
    
    getDescription: (level) => {
      const bonus = ((Math.pow(1.14, level) - 1) * 100).toFixed(1);
      return `+${bonus}% mana production`;
    },
    
    unlockCondition: {
      // intri în jocul cu mana destul de repede
      resources: { mana: 20 }
    }
  },
  
  volcanicPower: {
    id: 'volcanicPower',
    name: 'Volcanic Amplification',
    description: 'Boosts volcanic energy production',
    emoji: '🌋',
    category: 'production',
    
    // Realm mai avansat → costuri mai mari dar scaling ceva mai blând
    maxLevel: 30,
    baseCost: 2000,
    costMultiplier: 1.6,
    costResource: 'volcanicEnergy',
    
    effect: (level) => {
      // ~+15% per level, compounding
      return Math.pow(1.15, level);
    },
    
    getDescription: (level) => {
      const bonus = ((Math.pow(1.15, level) - 1) * 100).toFixed(1);
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
    
    // Capacity de early-mid game
    maxLevel: 20,
    baseCost: 500,          // corelat cu ce vezi în UI ca „prim milestone”
    costMultiplier: 1.6,
    costResource: 'energy',
    
    effect: (level) => {
      // Plecăm de la un cap decent și scalăm sănătos
      // Level 0 (implicit) înseamnă cap de bază din CONFIG; aici dăm valoarea când ai 1 level
      // Din sistemul tău: SET_CAP setează efectul direct ca nou cap
      return 3000 * Math.pow(1.8, level);
    },
    
    getDescription: (level) => {
      const cap = Math.floor(3000 * Math.pow(1.8, level));
      return `Energy cap: ${cap.toLocaleString()}`;
    },
    
    unlockCondition: {
      // simți nevoia de cap când ai atins de câteva ori acest prag
      resources: { energy: 500 }
    }
  },
  
  manaCap: {
    id: 'manaCap',
    name: 'Mana Reservoir',
    description: 'Increases maximum mana capacity',
    emoji: '🔮',
    category: 'capacity',
    
    maxLevel: 15,
    baseCost: 300,
    costMultiplier: 1.7,
    costResource: 'mana',
    
    effect: (level) => {
      return 500 * Math.pow(1.8, level);
    },
    
    getDescription: (level) => {
      const cap = Math.floor(500 * Math.pow(1.8, level));
      return `Mana cap: ${cap.toLocaleString()}`;
    },
    
    unlockCondition: {
      resources: { mana: 50 }
    }
  },
  
  volcanicCap: {
    id: 'volcanicCap',
    name: 'Magma Chamber',
    description: 'Increases volcanic energy capacity',
    emoji: '⚱️',
    category: 'capacity',
    
    maxLevel: 15,
    baseCost: 5000,
    costMultiplier: 1.7,
    costResource: 'volcanicEnergy',
    
    effect: (level) => {
      return 4000 * Math.pow(1.8, level);
    },
    
    getDescription: (level) => {
      const cap = Math.floor(4000 * Math.pow(1.8, level));
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
    baseCost: 5000,
    costMultiplier: 2.5,
    costResource: 'energy',
    
    targetStructure: 'solarPanel',
    
    effect: (level) => {
      // +40% per level (linear) – foarte puternic pe structuri mari
      return 1 + (level * 0.4);
    },
    
    getDescription: (level) => {
      const bonus = level * 40;
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
    baseCost: 15000,
    costMultiplier: 2.5,
    costResource: 'energy',
    
    targetStructure: 'windTurbine',
    
    effect: (level) => {
      return 1 + (level * 0.4);
    },
    
    getDescription: (level) => {
      const bonus = level * 40;
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
    baseCost: 30000,
    costMultiplier: 2.5,
    costResource: 'energy',
    
    targetStructure: 'hydroPlant',
    
    effect: (level) => {
      // Hydro ceva mai „late-game”, deci puțin mai puternic
      return 1 + (level * 0.5);
    },
    
    getDescription: (level) => {
      const bonus = level * 50;
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
    costMultiplier: 1.4, // nu chiar fix, dar nici prea agresiv
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
      resources: { gems: 200 } // mai ușor de deblocat, dar scaling de cost mai dur pe termen lung
    }
  },
  
  autoCollect: {
    id: 'autoCollect',
    name: 'Auto-Collector',
    description: 'Automatically collect offline resources',
    emoji: '🤖',
    category: 'qol',
    
    maxLevel: 1,
    baseCost: 2000,        // puțin mai scump, să simți că e „feature premium”
    costMultiplier: 1.0,
    costResource: 'gems',
    
    effect: (level) => {
      return level > 0;
    },
    
    getDescription: (level) => {
      return level > 0 ? 'Auto-collect enabled' : 'Auto-collect offline resources';
    },
    
    unlockCondition: {
      upgrades: { offlineProduction: 3 } // unlock mai devreme decât 5, dar nu instant
    }
  },
  
  quickStart: {
    id: 'quickStart',
    name: 'Quick Start',
    description: 'Start with bonus resources after ascension',
    emoji: '🚀',
    category: 'qol',
    
    maxLevel: 5,
    baseCost: 3000,
    costMultiplier: 1.7,
    costResource: 'gems',
    
    effect: (level) => {
      // Start with 10% of previous run resources per level
      return level * 0.1;
    },
    
    getDescription: (level) => {
      const percent = level * 10;
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
    baseCost: 100000,
    costMultiplier: 1.0,
    costResource: 'energy',
    
    effect: () => {
      return { unlock: 'fusionReactor' };
    },
    
    getDescription: () => {
      return 'Unlocks: Fusion Reactor';
    },
    
    unlockCondition: {
      // „late-mid / early-late game” milestone
      resources: { energy: 250000 },
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
    baseCost: 1000,
    costMultiplier: 1.0,
    costResource: 'mana',
    
    effect: () => {
      return { unlock: 'manaCrystallizer' };
    },
    
    getDescription: () => {
      return 'Unlocks: Mana Crystallizer';
    },
    
    unlockCondition: {
      resources: { mana: 500 },
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
    baseCost: 10000,
    costMultiplier: 2.2,
    costResource: 'gems',
    
    effect: (level) => {
      return level * 2; // 2% per level
    },
    
    getDescription: (level) => {
      const chance = level * 2;
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
    baseCost: 8000,
    costMultiplier: 2.0,
    costResource: 'gems',
    
    effect: (level) => {
      return level * 5; // 5% per level
    },
    
    getDescription: (level) => {
      const chance = level * 5;
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
    baseCost: 5000,
    costMultiplier: 2.0,
    costResource: 'gems',
    
    effect: (level) => {
      return 1 + (level * 0.1); // +10% per level
    },
    
    getDescription: (level) => {
      const bonus = level * 10;
      return `+${bonus}% to all guardian bonuses`;
    },
    
    unlockCondition: {
      guardians: { count: 5 }
    }
  },

  // ===== OCEAN REALM UPGRADES =====
  tidalSynergy: {
    id: 'tidalSynergy',
    name: 'Tidal Synergy',
    description: 'Boosts Tidal Generator efficiency.',
    emoji: '🌊',
    category: 'synergy',

    maxLevel: 5,
    baseCost: 8000,
    costMultiplier: 2.8,
    costResource: 'tidalEnergy',
    targetStructure: 'tidalGenerator',

    effect: (level) => {
      return 1 + (level * 0.5); // +50% per level
    },

    getDescription: (level) => {
      const bonus = level * 50;
      return `+${bonus}% Tidal Generator production`;
    },

    unlockCondition: {
      // corectăm cerința: număr de structuri, nu „8000”
      structures: { tidalGenerator: 10 }
    }
  },

  kelpSynergy: {
    id: 'kelpSynergy',
    name: 'Kelp Optimization',
    description: 'Boosts Kelp Farm efficiency.',
    emoji: '🪸',
    category: 'synergy',

    maxLevel: 5,
    baseCost: 15000,
    costMultiplier: 2.8,
    costResource: 'tidalEnergy',
    targetStructure: 'kelpFarm',

    effect: (level) => {
      return 1 + (level * 0.5); // +50% per level
    },

    getDescription: (level) => {
      const bonus = level * 50;
      return `+${bonus}% Kelp Farm production`;
    },

    unlockCondition: {
      structures: { kelpFarm: 10 }
    }
  },

  coralSynergy: {
    id: 'coralSynergy',
    name: 'Coral Battery Optimization',
    description: 'Boosts Coral Battery efficiency.',
    emoji: '🏝️',
    category: 'synergy',

    maxLevel: 5,
    baseCost: 35000,
    costMultiplier: 3.0,
    costResource: 'tidalEnergy',
    targetStructure: 'coralBattery',

    effect: (level) => {
      return 1 + (level * 0.5); // +50% per level
    },

    getDescription: (level) => {
      const bonus = level * 50;
      return `+${bonus}% Coral Battery production`;
    },

    unlockCondition: {
      structures: { coralBattery: 10 }
    }
  },

  abyssalTech: {
    id: 'abyssalTech',
    name: 'Abyssal Pressure Tech',
    description: 'Unlocks Deep Sea Pump, boosts tidal energy by +20%.',
    emoji: '⚓',
    category: 'unlock',

    maxLevel: 1,
    baseCost: 200000,
    costMultiplier: 1.0,
    costResource: 'tidalEnergy',

    effect: () => {
      return { unlock: 'deepSeaPump', bonus: 1.2 };
    },

    getDescription: () => {
      return 'Unlocks: Deep Sea Pump (+20% tidal energy)';
    },

    unlockCondition: {
      // milestone de structură, nu valoare numerică random
      structures: { coralBattery: 5 }
    }
  },

  pearlHarvest: {
    id: 'pearlHarvest',
    name: 'Pearl Harvesting Tech',
    description: 'Increase chance to find pearls from Coral Battery by +10%.',
    emoji: '🏝️',
    category: 'special',

    maxLevel: 1,
    baseCost: 8000,
    costMultiplier: 1.0,
    costResource: 'pearls',

    effect: () => {
      return { pearlDropBonus: 0.1 };
    },

    getDescription: () => {
      return '+10% Pearl drop chance from Coral Battery';
    },

    unlockCondition: {
      structures: { coralBattery: 10 }
    }
  }
};

export default UPGRADES;