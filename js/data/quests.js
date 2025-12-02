/**
 * Quest templates for generation
 */

const QUEST_TEMPLATES = {
  // ===== PRODUCTION QUESTS =====
  produceEnergy: {
    id: 'produceEnergy',
    type: 'produce',
    name: 'Energy Production',
    description: 'Produce {amount} energy',
    emoji: '⚡',
    
    resource: 'energy',
    amounts: [500, 2000, 5000, 15000, 50000],
    
    rewards: (amount) => {
      return {
        energy: Math.floor(amount * 0.08), // 8% bonus (reduced from 10%)
        gems: Math.min(3 + Math.floor(amount / 5000), 30)
      };
    },
    
    weight: 30,
    difficulty: 'easy'
  },
  
  produceMana: {
    id: 'produceMana',
    type: 'produce',
    name: 'Mana Production',
    description: 'Produce {amount} mana',
    emoji: '✨',
    
    resource: 'mana',
    amounts: [5, 20, 50, 200, 500],
    
    rewards: (amount) => {
      return {
        mana: Math. floor(amount * 0.15), // 15% bonus (reduced from 20%)
        gems: Math.min(5 + Math.floor(amount / 25), 50)
      };
    },
    
    weight: 25,
    difficulty: 'easy',
    
    unlockCondition: {
      resources: { mana: 1 }
    }
  },
  
  produceVolcanic: {
    id: 'produceVolcanic',
    type: 'produce',
    name: 'Volcanic Energy',
    description: 'Produce {amount} volcanic energy',
    emoji: '🌋',
    
    resource: 'volcanicEnergy',
    amounts: [50, 250, 500, 2500, 5000],
    
    rewards: (amount) => {
      return {
        volcanicEnergy: Math.floor(amount * 0.12),
        gems: Math.min(8 + Math.floor(amount / 250), 80),
        crystals: Math.floor(amount / 2500)
      };
    },
    
    weight: 20,
    difficulty: 'medium',
    
    unlockCondition: {
      realms: { volcano: true }
    }
  },
  
  // ===== STRUCTURE QUESTS =====
  buyStructures: {
    id: 'buyStructures',
    type: 'buy',
    name: 'Structure Investment',
    description: 'Purchase {amount} structures',
    emoji: '🏗️',
    
    target: 'any',
    amounts: [3, 5, 10, 25, 50],
    
    rewards: (amount) => {
      return {
        energy: amount * 200,
        gems: Math.min(5 + amount, 50),
        mana: Math.floor(amount / 5)
      };
    },
    
    weight: 20,
    difficulty: 'easy'
  },
  
  buySpecificStructure: {
    id: 'buySpecificStructure',
    type: 'buy',
    name: 'Focused Development',
    description: 'Purchase {amount} {structure}',
    emoji: '🎯',
    
    targets: ['solarPanel', 'windTurbine', 'hydroPlant', 'manaExtractor'],
    amounts: [2, 3, 5, 10],
    
    rewards: (amount) => {
      return {
        energy: amount * 500,
        gems: amount * 3
      };
    },
    
    weight: 15,
    difficulty: 'medium'
  },
  
  // ===== UPGRADE QUESTS =====
  buyUpgrades: {
    id: 'buyUpgrades',
    type: 'upgrade',
    name: 'Research & Development',
    description: 'Purchase {amount} upgrades',
    emoji: '🔬',
    
    amounts: [1, 2, 3, 5],
    
    rewards: (amount) => {
      return {
        gems: amount * 15,
        energy: amount * 1000,
        mana: amount * 5
      };
    },
    
    weight: 15,
    difficulty: 'medium',
    
    unlockCondition: {
      upgrades: { energyBoost: 1 }
    }
  },
  
  // ===== MILESTONE QUESTS =====
  reachProduction: {
    id: 'reachProduction',
    type: 'milestone',
    name: 'Production Milestone',
    description: 'Reach {amount} energy/s',
    emoji: '📈',
    
    metric: 'energyPerSecond',
    amounts: [50, 200, 500, 2000, 5000],
    
    rewards: (amount) => {
      return {
        gems: Math.min(15 + Math.floor(amount / 50), 100),
        crystals: Math.floor(amount / 500),
        energy: amount * 50
      };
    },
    
    weight: 10,
    difficulty: 'hard'
  },
  
  reachLevel: {
    id: 'reachLevel',
    type: 'milestone',
    name: 'Level Up',
    description: 'Reach structure level {amount}',
    emoji: '⬆️',
    
    metric: 'maxStructureLevel',
    amounts: [5, 10, 25, 50],
    
    rewards: (amount) => {
      return {
        gems: amount * 1,
        energy: amount * 500
      };
    },
    
    weight: 10,
    difficulty: 'medium'
  },
  
  // ===== PUZZLE QUESTS =====
  winPuzzle: {
    id: 'winPuzzle',
    type: 'puzzle',
    name: 'Puzzle Master',
    description: 'Win {amount} puzzle games',
    emoji: '🧩',
    
    counts: [1, 2, 3, 5],
    minScore: 500,
    
    rewards: (count) => {
      return {
        gems: count * 10,
        energy: count * 1000
      };
    },
    
    weight: 15,
    difficulty: 'medium'
  },
  
  puzzleHighScore: {
    id: 'puzzleHighScore',
    type: 'puzzle',
    name: 'High Scorer',
    description: 'Score {amount} in puzzle',
    emoji: '🎯',
    
    scores: [800, 1200, 1600, 2500],
    
    rewards: (score) => {
      return {
        gems: Math.floor(score / 80),
        energy: score * 3
      };
    },
    
    weight: 10,
    difficulty: 'hard'
  },
  
  // ===== GUARDIAN QUESTS =====
  summonGuardians: {
    id: 'summonGuardians',
    type: 'summon',
    name: 'Guardian Summoner',
    description: 'Summon {amount} guardians',
    emoji: '🐉',
    
    counts: [1, 2, 3, 5],
    
    rewards: (count) => {
      return {
        gems: count * 30,
        energy: count * 2500
      };
    },
    
    weight: 10,
    difficulty: 'hard',
    
    unlockCondition: {
      guardians: { count: 1 }
    }
  },
  
  collectRarity: {
    id: 'collectRarity',
    type: 'collect',
    name: 'Rare Collection',
    description: 'Own a {rarity} guardian',
    emoji: '💎',
    
    rarities: ['rare', 'epic', 'legendary'],
    
    rewards: (rarity) => {
      const rewardMap = {
        rare: { gems: 50, crystals: 1 },
        epic: { gems: 150, crystals: 3 },
        legendary: { gems: 300, crystals: 8 }
      };
      return rewardMap[rarity];
    },
    
    weight: 5,
    difficulty: 'hard',
    
    unlockCondition: {
      guardians: { count: 3 }
    }
  },
  
  // ===== BOSS QUESTS =====
  defeatBoss: {
    id: 'defeatBoss',
    type: 'boss',
    name: 'Boss Slayer',
    description: 'Defeat {boss}',
    emoji: '⚔️',
    
    bosses: ['corruptedTreeant', 'infernoTitan', 'voidLeviathan'],
    
    rewards: (bossId) => {
      return {
        gems: 75,
        crystals: 5,
        energy: 25000
      };
    },
    
    weight: 5,
    difficulty: 'hard',
    
    unlockCondition: {
      bosses: { unlocked: 1 }
    }
  },
  
  // ===== REALM QUESTS =====
  exploreRealm: {
    id: 'exploreRealm',
    type: 'realm',
    name: 'Realm Explorer',
    description: 'Unlock the {realm}',
    emoji: '🗺️',
    
    realms: ['volcano'],
    
    rewards: (realmId) => {
      return {
        gems: 100,
        crystals: 8,
        energy: 50000
      };
    },
    
    weight: 3,
    difficulty: 'hard'
  },
  
  // ===== ASCENSION QUESTS =====
  ascend: {
    id: 'ascend',
    type: 'ascension',
    name: 'Transcendence',
    description: 'Perform ascension',
    emoji: '✨',
    
    rewards: () => {
      return {
        gems: 250,
        crystals: 15
      };
    },
    
    weight: 2,
    difficulty: 'hard',
    
    unlockCondition: {
      ascension: { canAscend: true }
    }
  },

  // ===== OCEAN REALM QUESTS =====
  ocean_intro: {
    id: 'ocean_intro',
    type: 'realm',
    name: 'Discover the Ocean',
    description: 'Unlock and enter the Ocean Realm.',
    emoji: '🌊',
    realm: 'ocean',
    
    requirements: {
      realms: { ocean: true }
    },
    
    rewards: {
      tidalEnergy: 2500,
      gems: 50,
      crystals: 3
    },
    
    weight: 3,
    difficulty: 'hard',
    lore: 'You found your way to the mysterious underwater world. The tides welcome you.'
  },

  tide_master: {
    id: 'tide_master',
    type: 'milestone',
    name: 'Tide Master',
    description: 'Reach 250 tidal energy/sec production in the Ocean Realm.',
    emoji: '🌊',
    realm: 'ocean',
    
    metric: 'tidalEnergyPerSecond',
    amounts: [250],
    
    rewards: (amount) => {
      return {
        pearls: 15,
        gems: 30,
        crystals: 5
      };
    },
    
    weight: 8,
    difficulty: 'hard',
    
    unlockCondition: {
      realms: { ocean: true }
    },
    
    lore: 'You tamed the tides and mastered the ocean\'s energy.'
  },

  kelp_tycoon: {
    id: 'kelp_tycoon',
    type: 'buy',
    name: 'Kelp Tycoon',
    description: 'Own at least 10 Kelp Farms in Ocean Realm.',
    emoji: '🪸',
    realm: 'ocean',
    
    target: 'kelpFarm',
    amounts: [10],
    
    rewards: (amount) => {
      return {
        tidalEnergy: 8000,
        gems: 15
      };
    },
    
    weight: 12,
    difficulty: 'medium',
    
    unlockCondition: {
      realms: { ocean: true },
      structures: { kelpFarm: 5 }
    },
    
    lore: 'You\'ve built the largest kelp farm in the deep.'
  },

  pearl_diver: {
    id: 'pearl_diver',
    type: 'collect',
    name: 'Pearl Diver',
    description: 'Collect 30 pearls using Coral Battery.',
    emoji: '🏝️',
    realm: 'ocean',
    
    resource: 'pearls',
    amounts: [30],
    
    rewards: (amount) => {
      return {
        gems: 20,
        crystals: 5
      };
    },
    
    weight: 10,
    difficulty: 'hard',
    
    unlockCondition: {
      realms: { ocean: true },
      structures: { coralBattery: 3 }
    },
    
    lore: 'Your diving skills have brought back the ocean\'s treasures.'
  },

  abyss_conqueror: {
    id: 'abyss_conqueror',
    type: 'boss',
    name: 'Abyss Conqueror',
    description: 'Defeat the Ocean Leviathan boss.',
    emoji: '🦈',
    realm: 'ocean',
    
    bosses: ['oceanLeviathan'],
    
    rewards: (bossId) => {
      return {
        gems: 100,
        crystals: 10,
        tidalEnergy: 50000,
        legendaryGuardian: {
          type: 'water',
          rarity: 'legendary'
        }
      };
    },
    
    weight: 3,
    difficulty: 'hard',
    
    unlockCondition: {
      realms: { ocean: true },
      bosses: { oceanLeviathan: 'unlocked' }
    },
    
    lore: 'You conquered the deepest horror the ocean could offer.'
  },

  // ===== OCEAN PRODUCTION QUESTS =====
  produceTidal: {
    id: 'produceTidal',
    type: 'produce',
    name: 'Tidal Wave',
    description: 'Produce {amount} tidal energy',
    emoji: '🌊',
    
    resource: 'tidalEnergy',
    amounts: [100, 500, 1500, 5000, 15000],
    
    rewards: (amount) => {
      return {
        tidalEnergy: Math.floor(amount * 0.12),
        gems: Math.min(8 + Math.floor(amount / 300), 70),
        pearls: Math.floor(amount / 3000)
      };
    },
    
    weight: 20,
    difficulty: 'medium',
    
    unlockCondition: {
      realms: { ocean: true }
    }
  }
};

export default QUEST_TEMPLATES;