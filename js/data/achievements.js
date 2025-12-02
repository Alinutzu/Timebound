/**
 * Achievement definitions
 * Progressive goals that reward players
 */

import StateManager from '../core/StateManager.js';
import StructureSystem from '../systems/StructureSystem.js';

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
      const state = StateManager.getState();
      return state.statistics.totalClicks >= 1;
    },
    reward: { gems: 5 },
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.structuresPurchased >= 1;
    },
    
    reward: {
      gems: 10,
      energy: 50
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.upgradesPurchased >= 1;
    },
    
    reward: {
      gems: 15
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.guardians.length >= 1;
    },
    
    reward: {
      gems: 25,
      energy: 500
    },
    
    hidden: false
  },
  
  // ===== ENERGY PRODUCTION =====
  energyCollector: {
    id: 'energyCollector',
    name: 'Energy Collector',
    description: 'Produce 5,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.ascension.lifetimeEnergy >= 5000;
    },
    
    reward: {
      gems: 15,
      energy: 250
    },
    
    hidden: false
  },
  
  energyHoarder: {
    id: 'energyHoarder',
    name: 'Energy Hoarder',
    description: 'Produce 50,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.ascension.lifetimeEnergy >= 50000;
    },
    
    reward: {
      gems: 30,
      crystals: 1
    },
    
    hidden: false
  },
  
  energyTycoon: {
    id: 'energyTycoon',
    name: 'Energy Tycoon',
    description: 'Produce 500,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. ascension.lifetimeEnergy >= 500000;
    },
    
    reward: {
      gems: 60,
      crystals: 3
    },
    
    hidden: false
  },
  
  energyGod: {
    id: 'energyGod',
    name: 'Energy God',
    description: 'Produce 10,000,000 total energy',
    emoji: '⚡',
    category: 'production',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.ascension.lifetimeEnergy >= 10000000;
    },
    
    reward: {
      gems: 250,
      crystals: 15
    },
    
    hidden: false
  },
  
  // ===== PRODUCTION RATE =====
  productionNovice: {
    id: 'productionNovice',
    name: 'Production Novice',
    description: 'Reach 50 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.production.energy >= 50;
    },
    
    reward: {
      gems: 20,
      energy: 1000
    },
    
    hidden: false
  },
  
  productionExpert: {
    id: 'productionExpert',
    name: 'Production Expert',
    description: 'Reach 500 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.production.energy >= 500;
    },
    
    reward: {
      gems: 40,
      crystals: 2
    },
    
    hidden: false
  },
  
  productionMaster: {
    id: 'productionMaster',
    name: 'Production Master',
    description: 'Reach 5,000 energy/second',
    emoji: '📈',
    category: 'milestone',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. production.energy >= 5000;
    },
    
    reward: {
      gems: 100,
      crystals: 8
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
      const structureSystem = require('../systems/StructureSystem.js'). default;
      return structureSystem.getStats().totalLevels >= 10;
    },
    
    reward: {
      gems: 20,
      energy: 2000
    },
    
    hidden: false
  },
  
  structureArchitect: {
    id: 'structureArchitect',
    name: 'Structure Architect',
    description: 'Own 30 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'silver',
    
    condition: () => {
      const structureSystem = require('../systems/StructureSystem.js').default;
      return structureSystem.getStats(). totalLevels >= 30;
    },
    
    reward: {
      gems: 50,
      crystals: 2
    },
    
    hidden: false
  },
  
  structureMagnate: {
    id: 'structureMagnate',
    name: 'Structure Magnate',
    description: 'Own 100 total structure levels',
    emoji: '🏗️',
    category: 'structures',
    tier: 'gold',
    
    condition: () => {
      const structureSystem = require('../systems/StructureSystem.js').default;
      return structureSystem.getStats().totalLevels >= 100;
    },
    
    reward: {
      gems: 150,
      crystals: 10
    },
    
    hidden: false
  },
  
  maxedOut: {
    id: 'maxedOut',
    name: 'Maxed Out',
    description: 'Get any structure to level 50',
    emoji: '💯',
    category: 'structures',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return Object.values(state.structures).some(s => s.level >= 50);
    },
    
    reward: {
      gems: 300,
      crystals: 15
    },
    
    hidden: false
  },
  
  // ===== UPGRADES =====
  upgradeEnthusiast: {
    id: 'upgradeEnthusiast',
    name: 'Upgrade Enthusiast',
    description: 'Purchase 5 upgrades',
    emoji: '⬆️',
    category: 'upgrades',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.upgradesPurchased >= 5;
    },
    
    reward: {
      gems: 25
    },
    
    hidden: false
  },
  
  upgradeAddict: {
    id: 'upgradeAddict',
    name: 'Upgrade Addict',
    description: 'Purchase 25 upgrades',
    emoji: '⬆️',
    category: 'upgrades',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.upgradesPurchased >= 25;
    },
    
    reward: {
      gems: 80,
      crystals: 3
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
      return state.achievements.patientUpgrader?. triggered || false;
    },
    
    reward: {
      gems: 120,
      crystals: 8
    },
    
    hidden: false
  },
  
  // ===== GUARDIANS =====
  guardianCollector: {
    id: 'guardianCollector',
    name: 'Guardian Collector',
    description: 'Own 3 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.length >= 3;
    },
    
    reward: {
      gems: 40
    },
    
    hidden: false
  },
  
  guardianHoarder: {
    id: 'guardianHoarder',
    name: 'Guardian Hoarder',
    description: 'Own 10 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.guardians.length >= 10;
    },
    
    reward: {
      gems: 100,
      crystals: 4
    },
    
    hidden: false
  },
  
  guardianArmy: {
    id: 'guardianArmy',
    name: 'Guardian Army',
    description: 'Own 25 guardians',
    emoji: '🐉',
    category: 'guardians',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.guardians.length >= 25;
    },
    
    reward: {
      gems: 250,
      crystals: 15
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.guardians.some(g => g.rarity === 'rare');
    },
    
    reward: {
      gems: 30
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
      gems: 80,
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.guardians.some(g => g.rarity === 'legendary');
    },
    
    reward: {
      gems: 300,
      crystals: 20
    },
    
    hidden: false
  },
  
  // ===== QUESTS =====
  questCompleter: {
    id: 'questCompleter',
    name: 'Quest Completer',
    description: 'Complete 5 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'bronze',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.questsCompleted >= 5;
    },
    
    reward: {
      gems: 25
    },
    
    hidden: false
  },
  
  questMaster: {
    id: 'questMaster',
    name: 'Quest Master',
    description: 'Complete 25 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics. questsCompleted >= 25;
    },
    
    reward: {
      gems: 80,
      crystals: 4
    },
    
    hidden: false
  },
  
  questLegend: {
    id: 'questLegend',
    name: 'Quest Legend',
    description: 'Complete 100 quests',
    emoji: '📜',
    category: 'quests',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics. questsCompleted >= 100;
    },
    
    reward: {
      gems: 200,
      crystals: 15
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.puzzlesWon >= 1;
    },
    
    reward: {
      gems: 15
    },
    
    hidden: false
  },
  
  puzzleExpert: {
    id: 'puzzleExpert',
    name: 'Puzzle Expert',
    description: 'Win 10 puzzle games',
    emoji: '🧩',
    category: 'puzzle',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics. puzzlesWon >= 10;
    },
    
    reward: {
      gems: 50,
      crystals: 2
    },
    
    hidden: false
  },
  
  highScorer: {
    id: 'highScorer',
    name: 'High Scorer',
    description: 'Score 1500+ in a puzzle game',
    emoji: '🎯',
    category: 'puzzle',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.statistics.puzzleHighScore >= 1500;
    },
    
    reward: {
      gems: 100,
      crystals: 8
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.ascension.level >= 1;
    },
    
    reward: {
      gems: 150,
      crystals: 10
    },
    
    hidden: false
  },
  
  serialAscender: {
    id: 'serialAscender',
    name: 'Serial Ascender',
    description: 'Reach ascension level 3',
    emoji: '✨',
    category: 'ascension',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.level >= 3;
    },
    
    reward: {
      gems: 400,
      crystals: 30
    },
    
    hidden: false
  },
  
  transcendent: {
    id: 'transcendent',
    name: 'Transcendent',
    description: 'Reach ascension level 5',
    emoji: '🌟',
    category: 'ascension',
    tier: 'diamond',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.ascension.level >= 5;
    },
    
    reward: {
      gems: 1000,
      crystals: 60
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.realms.unlocked. includes('volcano');
    },
    
    reward: {
      gems: 120,
      crystals: 8
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
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.bossesDefeated >= 1;
    },
    
    reward: {
      gems: 80,
      crystals: 4
    },
    
    hidden: false
  },
  
  bossSlayer: {
    id: 'bossSlayer',
    name: 'Boss Slayer',
    description: 'Defeat 3 bosses',
    emoji: '⚔️',
    category: 'bosses',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. statistics.bossesDefeated >= 3;
    },
    
    reward: {
      gems: 200,
      crystals: 15
    },
    
    hidden: false
  },

  // ===== OCEAN REALM ACHIEVEMENTS =====
  firstDive: {
    id: 'firstDive',
    name: 'First Dive',
    description: 'Unlock the Ocean Realm.',
    emoji: '🌊',
    category: 'realms',
    tier: 'gold',
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.realms.unlocked.includes('ocean');
    },
    reward: { 
      gems: 100,
      crystals: 5 
    },
    hidden: false,
    lore: 'You plunged into the deep — this marks a new adventure!'
  },

  tideTycoon: {
    id: 'tideTycoon',
    name: 'Tide Tycoon',
    description: 'Reach 1,000 tidal energy/sec in Ocean Realm.',
    emoji: '🌊',
    category: 'milestone',
    tier: 'gold',
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. production.tidalEnergy >= 1000 && state.realms.current === 'ocean';
    },
    reward: { 
      gems: 80, 
      pearls: 8 
    },
    hidden: false,
    lore: 'Industrial mastery under the waves!'
  },

  kelpOverlord: {
    id: 'kelpOverlord',
    name: 'Kelp Overlord',
    description: 'Own at least 25 Kelp Farms in Ocean Realm.',
    emoji: '🪸',
    category: 'structures',
    tier: 'platinum',
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. structures.kelpFarm?. level >= 25;
    },
    reward: { 
      tidalEnergy: 15000, 
      gems: 120,
      pearls: 10 
    },
    hidden: false,
    lore: 'You\'re the ruler of aquatic farming!'
  },

  pearlMagnate: {
    id: 'pearlMagnate',
    name: 'Pearl Magnate',
    description: 'Collect 100 pearls in Ocean Realm.',
    emoji: '🏝️',
    category: 'resources',
    tier: 'platinum',
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. resources.pearls >= 100;
    },
    reward: { 
      gems: 150, 
      crystals: 12 
    },
    hidden: false,
    lore: 'Every pearl is a testament to your deep-sea skill.'
  },

  abyssVanquisher: {
    id: 'abyssVanquisher',
    name: 'Abyss Vanquisher',
    description: 'Defeat the Ocean Leviathan.',
    emoji: '🦈',
    category: 'bosses',
    tier: 'diamond',
    condition: () => {
      const state = require('../core/StateManager.js').default. getState();
      return state. statistics.bossesDefeatedIds?. includes('oceanLeviathan');
    },
    reward: {
      gems: 300,
      crystals: 25,
      legendaryGuardian: { type: 'water', rarity: 'legendary' }
    },
    hidden: false,
    lore: 'Deep abyss now bows to your power.'
  },
  
  // ===== SPECIAL/HIDDEN =====
  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Reach 500K energy in under 1 hour',
    emoji: '⚡',
    category: 'special',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js').default.getState();
      return state.ascension.lifetimeEnergy >= 500000 && 
             state.statistics.totalPlayTime < 3600000;
    },
    
    reward: {
      gems: 500,
      crystals: 30
    },
    
    hidden: true
  },
  
  gemHoarder: {
    id: 'gemHoarder',
    name: 'Gem Hoarder',
    description: 'Accumulate 2,500 gems',
    emoji: '💎',
    category: 'special',
    tier: 'gold',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.resources.gems >= 2500;
    },
    
    reward: {
      gems: 250
    },
    
    hidden: true
  },
  
  dedicatedPlayer: {
    id: 'dedicatedPlayer',
    name: 'Dedicated Player',
    description: 'Play for 5 hours total',
    emoji: '⏱️',
    category: 'special',
    tier: 'silver',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.totalPlayTime >= 18000000; // 5 hours in ms
    },
    
    reward: {
      gems: 150,
      crystals: 10
    },
    
    hidden: true
  },
  
  noLifeGamer: {
    id: 'noLifeGamer',
    name: 'No Life Gamer',
    description: 'Play for 50 hours total',
    emoji: '🎮',
    category: 'special',
    tier: 'platinum',
    
    condition: () => {
      const state = require('../core/StateManager.js'). default.getState();
      return state.statistics.totalPlayTime >= 180000000; // 50 hours in ms
    },
    
    reward: {
      gems: 1000,
      crystals: 60
    },
    
    hidden: true
  }
};


export default ACHIEVEMENTS;