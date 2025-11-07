/**
 * Achievement definitions
 * Progressive goals that reward players
 */

const ACHIEVEMENTS = {
  // ===== TUTORIAL & FIRST STEPS =====
  firstClick: {
    id: 'firstClick',
    name: 'First Click',
    description: 'Click your first energy source',
    emoji: '👆',
    category: 'tutorial',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.totalClicks >= 1;
    },
    
    reward: {
      gems: 10
    },
    
    hidden: false
  },
  
  firstStructure: {
    id: 'firstStructure',
    name: 'Builder',
    description: 'Purchase your first structure',
    emoji: '🏗️',
    category: 'tutorial',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.structuresPurchased >= 1;
    },
    
    reward: {
      gems: 20,
      energy: 100
    },
    
    hidden: false
  },
  
  firstUpgrade: {
    id: 'firstUpgrade',
    name: 'Researcher',
    description: 'Purchase your first upgrade',
    emoji: '🔬',
    category: 'tutorial',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.upgradesPurchased >= 1;
    },
    
    reward: {
      gems: 30
    },
    
    hidden: false
  },
  
  firstGuardian: {
    id: 'firstGuardian',
    name: 'Summoner',
    description: 'Summon your first guardian',
    emoji: '🐉',
    category: 'tutorial',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.length >= 1;
    },
    
    reward: {
      gems: 50,
      energy: 1000
    },
    
    hidden: false
  },
  
  // ===== ENERGY PRODUCTION =====
  energyCollector: {
    id: 'energyCollector',
    name: 'Energy Collector',
    description: 'Produce 10,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.lifetimeEnergy >= 10000;
    },
    
    reward: {
      gems: 25,
      energy: 500
    },
    
    hidden: false
  },
  
  energyHoarder: {
    id: 'energyHoarder',
    name: 'Energy Hoarder',
    description: 'Produce 100,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.lifetimeEnergy >= 100000;
    },
    
    reward: {
      gems: 50,
      crystals: 1
    },
    
    hidden: false
  },
  
  energyTycoon: {
    id: 'energyTycoon',
    name: 'Energy Tycoon',
    description: 'Produce 1,000,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.lifetimeEnergy >= 1000000;
    },
    
    reward: {
      gems: 100,
      crystals: 5
    },
    
    hidden: false
  },
  
  energyGod: {
    id: 'energyGod',
    name: 'Energy God',
    description: 'Produce 100,000,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.lifetimeEnergy >= 100000000;
    },
    
    reward: {
      gems: 500,
      crystals: 25
    },
    
    hidden: false
  },
  
  // ===== PRODUCTION RATE =====
  productionNovice: {
    id: 'productionNovice',
    name: 'Production Novice',
    description: 'Reach 100 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.production.energy >= 100;
    },
    
    reward: {
      gems: 30,
      energy: 2000
    },
    
    hidden: false
  },
  
  productionExpert: {
    id: 'productionExpert',
    name: 'Production Expert',
    description: 'Reach 1,000 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.production.energy >= 1000;
    },
    
    reward: {
      gems: 75,
      crystals: 2
    },
    
    hidden: false
  },
  
  productionMaster: {
    id: 'productionMaster',
    name: 'Production Master',
    description: 'Reach 10,000 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.production.energy >= 10000;
    },
    
    reward: {
      gems: 200,
      crystals: 10
    },
    
    hidden: false
  },
  
  // ===== STRUCTURES =====
  structureBuilder: {
    id: 'structureBuilder',
    name: 'Structure Builder',
    description: 'Own 10 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'bronze',
    
    condition: () => {
      const structureSystem = require('../systems/StructureSystem.js').default;
      return structureSystem.getStats().totalLevels >= 10;
    },
    
    reward: {
      gems: 40,
      energy: 5000
    },
    
    hidden: false
  },
  
  structureArchitect: {
    id: 'structureArchitect',
    name: 'Structure Architect',
    description: 'Own 50 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'silver',
    
    condition: () => {
      const structureSystem = require('../systems/StructureSystem.js').default;
      return structureSystem.getStats().totalLevels >= 50;
    },
    
    reward: {
      gems: 100,
      crystals: 3
    },
    
    hidden: false
  },
  
  structureMagnate: {
    id: 'structureMagnate',
    name: 'Structure Magnate',
    description: 'Own 200 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'gold',
    
    condition: () => {
      const structureSystem = require('../systems/StructureSystem.js').default;
      return structureSystem.getStats().totalLevels >= 200;
    },
    
    reward: {
      gems: 250,
      crystals: 15
    },
    
    hidden: false
  },
  
  maxedOut: {
    id: 'maxedOut',
    name: 'Maxed Out',
    description: 'Get any structure to level 100',
    emoji: '💯',
    category: 'structures',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return Object.values(state.structures).some(s => s.level >= 100);
    },
    
    reward: {
      gems: 500,
      crystals: 20
    },
    
    hidden: false
  },
  
  // ===== UPGRADES =====
  upgradeEnthusiast: {
    id: 'upgradeEnthusiast',
    name: 'Upgrade Enthusiast',
    description: 'Purchase 10 upgrades',
    emoji: '⬆️',
    category: 'upgrades',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.upgradesPurchased >= 10;
    },
    
    reward: {
      gems: 50
    },
    
    hidden: false
  },
  
  upgradeAddict: {
    id: 'upgradeAddict',
    name: 'Upgrade Addict',
    description: 'Purchase 50 upgrades',
    emoji: '⬆️',
    category: 'upgrades',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.upgradesPurchased >= 50;
    },
    
    reward: {
      gems: 150,
      crystals: 5
    },
    
    hidden: false
  },
  
  patientUpgrader: {
    id: 'patientUpgrader',
    name: 'Patient Upgrader',
    description: 'Complete an upgrade that took over 1 hour',
    emoji: '⏰',
    category: 'upgrades',
    tier: 'gold',
    
    condition: () => {
      // This will be tracked via event
      const state = require('../core/StateManager.js').default.getState();
      return state.achievements.patientUpgrader?.triggered || false;
    },
    
    reward: {
      gems: 200,
      crystals: 10
    },
    
    hidden: false
  },
  
  // ===== GUARDIANS =====
  guardianCollector: {
    id: 'guardianCollector',
    name: 'Guardian Collector',
    description: 'Own 5 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.length >= 5;
    },
    
    reward: {
      gems: 75
    },
    
    hidden: false
  },
  
  guardianHoarder: {
    id: 'guardianHoarder',
    name: 'Guardian Hoarder',
    description: 'Own 20 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.length >= 20;
    },
    
    reward: {
      gems: 200,
      crystals: 5
    },
    
    hidden: false
  },
  
  guardianArmy: {
    id: 'guardianArmy',
    name: 'Guardian Army',
    description: 'Own 50 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.length >= 50;
    },
    
    reward: {
      gems: 500,
      crystals: 20
    },
    
    hidden: false
  },
  
  rareFind: {
    id: 'rareFind',
    name: 'Rare Find',
    description: 'Summon a rare guardian',
    emoji: '💎',
    category: 'guardians',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.some(g => g.rarity === 'rare');
    },
    
    reward: {
      gems: 50
    },
    
    hidden: false
  },
  
  epicDiscovery: {
    id: 'epicDiscovery',
    name: 'Epic Discovery',
    description: 'Summon an epic guardian',
    emoji: '💜',
    category: 'guardians',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.some(g => g.rarity === 'epic');
    },
    
    reward: {
      gems: 150,
      crystals: 3
    },
    
    hidden: false
  },
  
  legendaryPull: {
    id: 'legendaryPull',
    name: 'Legendary Pull',
    description: 'Summon a legendary guardian',
    emoji: '⭐',
    category: 'guardians',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.some(g => g.rarity === 'legendary');
    },
    
    reward: {
      gems: 500,
      crystals: 25
    },
    
    hidden: false
  },
  
  // ===== QUESTS =====
  questCompleter: {
    id: 'questCompleter',
    name: 'Quest Completer',
    description: 'Complete 10 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.questsCompleted >= 10;
    },
    
    reward: {
      gems: 50
    },
    
    hidden: false
  },
  
  questMaster: {
    id: 'questMaster',
    name: 'Quest Master',
    description: 'Complete 50 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.questsCompleted >= 50;
    },
    
    reward: {
      gems: 150,
      crystals: 5
    },
    
    hidden: false
  },
  
  questLegend: {
    id: 'questLegend',
    name: 'Quest Legend',
    description: 'Complete 200 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.questsCompleted >= 200;
    },
    
    reward: {
      gems: 400,
      crystals: 20
    },
    
    hidden: false
  },
  
  // ===== PUZZLE =====
  puzzleNovice: {
    id: 'puzzleNovice',
    name: 'Puzzle Novice',
    description: 'Win your first puzzle game',
    emoji: '🧩',
    category: 'puzzle',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.puzzlesWon >= 1;
    },
    
    reward: {
      gems: 30
    },
    
    hidden: false
  },
  
  puzzleExpert: {
    id: 'puzzleExpert',
    name: 'Puzzle Expert',
    description: 'Win 20 puzzle games',
    emoji: '🧩',
    category: 'puzzle',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.puzzlesWon >= 20;
    },
    
    reward: {
      gems: 100,
      crystals: 3
    },
    
    hidden: false
  },
  
  highScorer: {
    id: 'highScorer',
    name: 'High Scorer',
    description: 'Score 2000+ in a puzzle game',
    emoji: '🎯',
    category: 'puzzle',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.puzzleHighScore >= 2000;
    },
    
    reward: {
      gems: 200,
      crystals: 10
    },
    
    hidden: false
  },
  
  // ===== ASCENSION =====
  firstAscension: {
    id: 'firstAscension',
    name: 'Ascendant',
    description: 'Perform your first ascension',
    emoji: '✨',
    category: 'ascension',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.level >= 1;
    },
    
    reward: {
      gems: 300,
      crystals: 15
    },
    
    hidden: false
  },
  
  serialAscender: {
    id: 'serialAscender',
    name: 'Serial Ascender',
    description: 'Reach ascension level 5',
    emoji: '✨',
    category: 'ascension',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.level >= 5;
    },
    
    reward: {
      gems: 750,
      crystals: 50
    },
    
    hidden: false
  },
  
  transcendent: {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Reach ascension level 10',
    emoji: '🌟',
    category: 'ascension',
    tier: 'diamond',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.level >= 10;
    },
    
    reward: {
      gems: 2000,
      crystals: 100
    },
    
    hidden: false
  },
  
  // ===== REALMS =====
  realmExplorer: {
    id: 'realmExplorer',
    name: 'Realm Explorer',
    description: 'Unlock the Volcano Realm',
    emoji: '🌋',
    category: 'realms',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.realms.unlocked.includes('volcano');
    },
    
    reward: {
      gems: 250,
      crystals: 10
    },
    
    hidden: false
  },
  
  // ===== BOSSES =====
  firstVictory: {
    id: 'firstVictory',
    name: 'First Victory',
    description: 'Defeat your first boss',
    emoji: '⚔️',
    category: 'bosses',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.bossesDefeated >= 1;
    },
    
    reward: {
      gems: 150,
      crystals: 5
    },
    
    hidden: false
  },
  
  bossSlayer: {
    id: 'bossSlayer',
    name: 'Boss Slayer',
    description: 'Defeat 5 bosses',
    emoji: '⚔️',
    category: 'bosses',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.bossesDefeated >= 5;
    },
    
    reward: {
      gems: 400,
      crystals: 20
    },
    
    hidden: false
  },
  
  // ===== SPECIAL/HIDDEN =====
  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Reach 1M energy in under 1 hour',
    emoji: '⚡',
    category: 'special',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.lifetimeEnergy >= 1000000 && 
             state.statistics.totalPlayTime < 3600000;
    },
    
    reward: {
      gems: 1000,
      crystals: 50
    },
    
    hidden: true
  },
  
  gemHoarder: {
    id: 'gemHoarder',
    name: 'Gem Hoarder',
    description: 'Accumulate 5,000 gems',
    emoji: '💎',
    category: 'special',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.resources.gems >= 5000;
    },
    
    reward: {
      gems: 500
    },
    
    hidden: true
  },
  
  dedicatedPlayer: {
    id: 'dedicatedPlayer',
    name: 'Dedicated Player',
    description: 'Play for 10 hours total',
    emoji: '⏱️',
    category: 'special',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.totalPlayTime >= 36000000; // 10 hours in ms
    },
    
    reward: {
      gems: 300,
      crystals: 15
    },
    
    hidden: true
  },
  
  noLifeGamer: {
    id: 'noLifeGamer',
    name: 'No Life Gamer',
    description: 'Play for 100 hours total',
    emoji: '🎮',
    category: 'special',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.totalPlayTime >= 360000000; // 100 hours in ms
    },
    
    reward: {
      gems: 2000,
      crystals: 100
    },
    
    hidden: true
  }
};

export default ACHIEVEMENTS;