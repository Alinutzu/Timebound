/**
 * Boss definitions
 * Challenging encounters that require puzzle mastery
 */

const BOSSES = {
  corruptedTreeant: {
  id: 'corruptedTreeant',
  name: 'Corrupted Treant',
  description: 'An ancient tree guardian twisted by dark energy',
  emoji: '🌳',
  realm: 'forest',
  tier: 1,
  
  hp: 1000,
  
  // ❌ ȘTERGE COMPLET unlockCondition pentru primul boss
  // unlockCondition: {
  //   production: { energy: 100 },
  //   structures: { total: 15 }
  // },
  
  puzzleRequirement: {
    targetScore: 500,
    maxMoves: 20,
    difficulty: 'normal'
  },
  
  damageFormula: (score, combo) => {
    let damage = Math.floor(score / 10);
    if (combo >= 5) damage *= 1.5;
    if (combo >= 10) damage *= 2;
    return Math.floor(damage);
  },
    
    damageFormula: (score, combo) => {
      // Base damage from score
      let damage = Math.floor(score / 10);
      
      // Combo multiplier
      if (combo >= 5) damage *= 1.5;
      if (combo >= 10) damage *= 2;
      
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 200,
        crystals: 10,
        energy: 50000,
        guaranteedGuardian: {
          rarity: 'rare',
          type: 'energy'
        }
      },
      repeat: {
        gems: 50,
        crystals: 2,
        energy: 10000
      }
    },
    
    lore: 'Once a protector of the forest, now consumed by corruption. Only by matching the natural elements can you purify its twisted form.',
    
    achievements: ['firstVictory'],
    
    strategies: [
      'Focus on high combos for maximum damage',
      'Use all 20 moves efficiently',
      'Try to clear the board systematically'
    ]
  },
  
  infernoTitan: {
    id: 'infernoTitan',
    name: 'Inferno Titan',
    description: 'A colossal being of living flame',
    emoji: '🔥',
    realm: 'volcano',
    tier: 2,
    
    hp: 5000,
    
    unlockCondition: {
      realms: { volcano: 'unlocked' },
      ascension: { level: 1 },
      bosses: { corruptedTreeant: 'defeated' }
    },
    
    puzzleRequirement: {
      targetScore: 1000,
      maxMoves: 25,
      difficulty: 'hard'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 8);
      
      // Higher combo requirement for titan
      if (combo >= 7) damage *= 1.5;
      if (combo >= 12) damage *= 2;
      if (combo >= 15) damage *= 2.5;
      
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 500,
        crystals: 30,
        volcanicEnergy: 100000,
        guaranteedGuardian: {
          rarity: 'epic',
          type: 'volcanic'
        }
      },
      repeat: {
        gems: 100,
        crystals: 5,
        volcanicEnergy: 20000
      }
    },
    
    lore: 'Forged in the heart of the volcano eons ago, this titan has never been defeated. Its flames burn hot enough to melt reality itself.',
    
    achievements: ['bossSlayer'],
    
    strategies: [
      'Volcanic puzzles are more challenging',
      'Aim for 15+ combos for massive damage',
      'May take multiple attempts - HP persists!'
    ]
  },
  
  voidLeviathan: {
    id: 'voidLeviathan',
    name: 'Void Leviathan',
    description: 'Creature from beyond the stars',
    emoji: '🐉',
    realm: 'forest',
    tier: 3,
    
    hp: 20000,
    
    unlockCondition: {
      ascension: { level: 5 },
      bosses: { 
        corruptedTreeant: 'defeated',
        infernoTitan: 'defeated'
      },
      production: { energy: 10000 }
    },
    
    puzzleRequirement: {
      targetScore: 2000,
      maxMoves: 30,
      difficulty: 'extreme'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 5);
      
      // Extreme combo scaling
      if (combo >= 10) damage *= 1.5;
      if (combo >= 15) damage *= 2;
      if (combo >= 20) damage *= 3;
      
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 2000,
        crystals: 100,
        energy: 1000000,
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'all'
        },
        specialReward: {
          type: 'cosmetic',
          name: 'Void Conqueror Title'
        }
      },
      repeat: {
        gems: 300,
        crystals: 20,
        energy: 200000
      }
    },
    
    lore: 'The Void Leviathan exists outside time and space. Defeating it requires mastery of all puzzle mechanics and unparalleled skill.',
    
    achievements: ['bossSlayer', 'transcendent'],
    
    strategies: [
      'This is the ultimate challenge',
      'HP persists between attempts',
      'Perfect combo chains are essential',
      'Consider using gems to boost puzzle rewards'
    ]
  },

    oceanLeviathan: {
    id: 'oceanLeviathan',
    name: 'Ocean Leviathan',
    description: 'Ancient beast lurking in the abyss, harnesses the hidden currents.',
    emoji: '🦈',
    realm: 'ocean',
    tier: 2,

    hp: 12000,

    unlockCondition: {
      realms: { ocean: 'unlocked' },
      ascension: { level: 3 },
      structures: { deepSeaPump: 3 }
    },

    puzzleRequirement: {
      targetScore: 1400,
      maxMoves: 24,
      difficulty: 'hard'
    },

    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 6);
      if (combo >= 8) damage *= 1.5;
      if (combo >= 12) damage *= 2;
      return Math.floor(damage);
    },

    rewards: {
      firstTime: {
        gems: 800,
        crystals: 50,
        tidalEnergy: 180000,
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'water'
        }
      },
      repeat: {
        gems: 160,
        crystals: 12,
        tidalEnergy: 35000
      }
    },

    lore: 'Deepest terror and guardian of the abyss. Only with mastery of Ocean structures and guardians can one hope to prevail.',

    strategies: [
      'Try for combos >12 for maximum damage',
      'Balance puzzle moves vs direct scores',
      'Focus on kelp synergy and pearl bonuses'
    ]
  },
  
  // FUTURE BOSSES
  
  tidalKraken: {
    id: 'tidalKraken',
    name: 'Tidal Kraken',
    description: 'Terror of the deep ocean',
    emoji: '🦑',
    realm: 'ocean',
    tier: 2,
    
    hp: 8000,
    
    unlockCondition: {
      realms: { ocean: 'unlocked' },
      ascension: { level: 3 }
    },
    
    puzzleRequirement: {
      targetScore: 1200,
      maxMoves: 25,
      difficulty: 'hard'
    },
    
    damageFormula: (score, combo) => {
      return Math.floor(score / 7);
    },
    
    rewards: {
      firstTime: {
        gems: 600,
        crystals: 40,
        tidalEnergy: 150000,
        guaranteedGuardian: {
          rarity: 'epic',
          type: 'water'
        }
      },
      repeat: {
        gems: 120,
        crystals: 8
      }
    },
    
    lore: 'Ancient ruler of the ocean depths.',
    
    locked: true // Not implemented yet
  },
  
  cosmicHarbinger: {
    id: 'cosmicHarbinger',
    name: 'Cosmic Harbinger',
    description: 'Herald of the end times',
    emoji: '🌌',
    realm: 'cosmos',
    tier: 4,
    
    hp: 50000,
    
    unlockCondition: {
      realms: { cosmos: 'unlocked' },
      ascension: { level: 10 }
    },
    
    puzzleRequirement: {
      targetScore: 5000,
      maxMoves: 40,
      difficulty: 'nightmare'
    },
    
    damageFormula: (score, combo) => {
      return Math.floor(score / 3);
    },
    
    rewards: {
      firstTime: {
        gems: 10000,
        crystals: 500,
        cosmicEnergy: 10000000,
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'cosmic'
        },
        specialReward: {
          type: 'ending',
          name: 'True Ending Unlocked'
        }
      },
      repeat: {
        gems: 1000,
        crystals: 100
      }
    },
    
    lore: 'The final challenge. Are you worthy?',
    
    locked: true // Not implemented yet
  }
};

export default BOSSES;