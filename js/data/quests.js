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
    amounts: [1000, 5000, 10000, 50000, 100000],
    
    rewards: (amount) => {
      return {
        energy: Math.floor(amount * 0.1), // 10% bonus
        gems: Math.min(5 + Math.floor(amount / 10000), 50)
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
    amounts: [10, 50, 100, 500, 1000],
    
    rewards: (amount) => {
      return {
        mana: Math.floor(amount * 0.2), // 20% bonus
        gems: Math.min(10 + Math.floor(amount / 50), 100)
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
    amounts: [100, 500, 1000, 5000, 10000],
    
    rewards: (amount) => {
      return {
        volcanicEnergy: Math.floor(amount * 0.15),
        gems: Math.min(15 + Math.floor(amount / 500), 150),
        crystals: Math.floor(amount / 5000)
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
    amounts: [5, 10, 20, 50, 100],
    
    rewards: (amount) => {
      return {
        energy: amount * 500,
        gems: Math.min(10 + amount, 100),
        mana: Math.floor(amount / 10)
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
    amounts: [3, 5, 10, 20],
    
    rewards: (amount) => {
      return {
        energy: amount * 1000,
        gems: amount * 5
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
    
    amounts: [1, 3, 5, 10],
    
    rewards: (amount) => {
      return {
        gems: amount * 20,
        energy: amount * 2000,
        mana: amount * 10
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
    amounts: [100, 500, 1000, 5000, 10000],
    
    rewards: (amount) => {
      return {
        gems: Math.min(25 + Math.floor(amount / 100), 200),
        crystals: Math.floor(amount / 1000),
        energy: amount * 100
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
    amounts: [10, 25, 50, 100],
    
    rewards: (amount) => {
      return {
        gems: amount * 2,
        energy: amount * 1000
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
    
    counts: [1, 3, 5, 10],
    minScore: 500,
    
    rewards: (count) => {
      return {
        gems: count * 15,
        energy: count * 2000
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
    
    scores: [1000, 1500, 2000, 3000],
    
    rewards: (score) => {
      return {
        gems: Math.floor(score / 50),
        energy: score * 5
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
    
    counts: [1, 3, 5, 10],
    
    rewards: (count) => {
      return {
        gems: count * 50,
        energy: count * 5000
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
        rare: { gems: 100, crystals: 1 },
        epic: { gems: 250, crystals: 3 },
        legendary: { gems: 500, crystals: 10 }
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
        gems: 100,
        crystals: 5,
        energy: 50000
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
        gems: 200,
        crystals: 10,
        energy: 100000
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
        gems: 500,
        crystals: 20
      };
    },
    
    weight: 2,
    difficulty: 'hard',
    
    unlockCondition: {
      ascension: { canAscend: true }
    }
  }
};

export default QUEST_TEMPLATES;