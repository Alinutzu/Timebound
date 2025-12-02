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
    
    hp: 2500, // Redus de la 1000
    
    // ✅ Fără unlock condition - primul boss e disponibil de la început
    
    puzzleRequirement: {
      targetScore: 800, // Crescut de la 500
      maxMoves: 25, // Crescut de la 20
      difficulty: 'normal'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 12); // Redus de la /10
      if (combo >= 5) damage *= 1.5;
      if (combo >= 10) damage *= 2;
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 100, // Redus de la 200
        crystals: 5, // Redus de la 10
        energy: 25000, // Redus de la 50000
        guaranteedGuardian: {
          rarity: 'rare',
          type: 'energy'
        }
      },
      repeat: {
        gems: 30, // Redus de la 50
        crystals: 1, // Redus de la 2
        energy: 5000 // Redus de la 10000
      }
    },
    
    lore: 'Once a protector of the forest, now consumed by corruption. Only by matching the natural elements can you purify its twisted form.',
    
    achievements: ['firstVictory'],
    
    strategies: [
      'Focus on high combos for maximum damage',
      'Use all 25 moves efficiently',
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
    
    hp: 8000, // Crescut de la 5000
    
    unlockCondition: {
      realms: { volcano: 'unlocked' },
      ascension: { level: 1 },
      bosses: { corruptedTreeant: 'defeated' }
    },
    
    puzzleRequirement: {
      targetScore: 1200, // Crescut de la 1000
      maxMoves: 28, // Crescut de la 25
      difficulty: 'hard'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 10); // Redus de la /8
      
      if (combo >= 7) damage *= 1.5;
      if (combo >= 12) damage *= 2;
      if (combo >= 15) damage *= 2.5;
      
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 250, // Redus de la 500
        crystals: 20, // Redus de la 30
        volcanicEnergy: 50000, // Redus de la 100000
        guaranteedGuardian: {
          rarity: 'epic',
          type: 'volcanic'
        }
      },
      repeat: {
        gems: 60, // Redus de la 100
        crystals: 4, // Redus de la 5
        volcanicEnergy: 10000 // Redus de la 20000
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
    
    hp: 30000, // Crescut de la 20000
    
    unlockCondition: {
      ascension: { level: 3 }, // Redus de la 5
      bosses: { 
        corruptedTreeant: 'defeated',
        infernoTitan: 'defeated'
      },
      production: { energy: 5000 } // Redus de la 10000
    },
    
    puzzleRequirement: {
      targetScore: 1800, // Redus de la 2000
      maxMoves: 32, // Crescut de la 30
      difficulty: 'extreme'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 7); // Redus de la /5
      
      if (combo >= 10) damage *= 1.5;
      if (combo >= 15) damage *= 2;
      if (combo >= 20) damage *= 3;
      
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 1000, // Redus de la 2000
        crystals: 60, // Redus de la 100
        energy: 500000, // Redus de la 1000000
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
        gems: 150, // Redus de la 300
        crystals: 12, // Redus de la 20
        energy: 100000 // Redus de la 200000
      }
    },
    
    lore: 'The Void Leviathan exists outside time and space.  Defeating it requires mastery of all puzzle mechanics and unparalleled skill.',
    
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

    hp: 15000, // Crescut de la 12000

    unlockCondition: {
      realms: { ocean: 'unlocked' },
      ascension: { level: 2 }, // Redus de la 3
      structures: { deepSeaPump: 2 } // Redus de la 3
    },

    puzzleRequirement: {
      targetScore: 1500, // Crescut de la 1400
      maxMoves: 26, // Crescut de la 24
      difficulty: 'hard'
    },

    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 8); // Redus de la /6
      if (combo >= 8) damage *= 1.5;
      if (combo >= 12) damage *= 2;
      if (combo >= 16) damage *= 2.5; // Adăugat bonus extra
      return Math.floor(damage);
    },

    rewards: {
      firstTime: {
        gems: 400, // Redus de la 800
        crystals: 30, // Redus de la 50
        tidalEnergy: 100000, // Redus de la 180000
        pearls: 50, // ✅ ADĂUGAT pearls ca reward
        guaranteedGuardian: {
          rarity: 'legendary',
          type: 'water'
        }
      },
      repeat: {
        gems: 80, // Redus de la 160
        crystals: 8, // Redus de la 12
        tidalEnergy: 20000, // Redus de la 35000
        pearls: 10 // ✅ ADĂUGAT pearls pentru repeat
      }
    },

    lore: 'Deepest terror and guardian of the abyss. Only with mastery of Ocean structures and guardians can one hope to prevail.',

    achievements: ['abyssVanquisher'],

    strategies: [
      'Try for combos >12 for maximum damage',
      'Balance puzzle moves vs direct scores',
      'Focus on kelp synergy and pearl bonuses',
      'Ocean guardians boost damage significantly'
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
    
    hp: 10000, // Crescut de la 8000
    
    unlockCondition: {
      realms: { ocean: 'unlocked' },
      ascension: { level: 2 }, // Redus de la 3
      bosses: { oceanLeviathan: 'defeated' } // ✅ ADĂUGAT prerequisite
    },
    
    puzzleRequirement: {
      targetScore: 1300, // Crescut de la 1200
      maxMoves: 27, // Crescut de la 25
      difficulty: 'hard'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 9); // Redus de la /7
      if (combo >= 8) damage *= 1.5;
      if (combo >= 13) damage *= 2;
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 300, // Redus de la 600
        crystals: 25, // Redus de la 40
        tidalEnergy: 80000, // Redus de la 150000
        pearls: 30, // ✅ ADĂUGAT pearls
        guaranteedGuardian: {
          rarity: 'epic',
          type: 'water'
        }
      },
      repeat: {
        gems: 60, // Redus de la 120
        crystals: 6, // Redus de la 8
        tidalEnergy: 15000,
        pearls: 5 // ✅ ADĂUGAT pearls
      }
    },
    
    lore: 'Ancient ruler of the ocean depths, commands the tides with its tentacles.',
    
    achievements: ['bossSlayer'],
    
    locked: true // Not implemented yet
  },
  
  cosmicHarbinger: {
    id: 'cosmicHarbinger',
    name: 'Cosmic Harbinger',
    description: 'Herald of the end times',
    emoji: '🌌',
    realm: 'cosmos',
    tier: 4,
    
    hp: 75000, // Crescut de la 50000
    
    unlockCondition: {
      realms: { cosmos: 'unlocked' },
      ascension: { level: 5 }, // Redus de la 10
      bosses: {
        voidLeviathan: 'defeated',
        oceanLeviathan: 'defeated',
        infernoTitan: 'defeated'
      }
    },
    
    puzzleRequirement: {
      targetScore: 3000, // Redus de la 5000
      maxMoves: 40,
      difficulty: 'nightmare'
    },
    
    damageFormula: (score, combo) => {
      let damage = Math.floor(score / 4); // Redus de la /3
      if (combo >= 15) damage *= 1.5;
      if (combo >= 20) damage *= 2;
      if (combo >= 25) damage *= 3;
      return Math.floor(damage);
    },
    
    rewards: {
      firstTime: {
        gems: 5000, // Redus de la 10000
        crystals: 300, // Redus de la 500
        cosmicEnergy: 5000000, // Redus de la 10000000
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
        gems: 500, // Redus de la 1000
        crystals: 60 // Redus de la 100
      }
    },
    
    lore: 'The final challenge. Are you worthy?',
    
    locked: true // Not implemented yet
  }
};

export default BOSSES;