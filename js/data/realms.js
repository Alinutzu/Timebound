/**
 * Realm definitions
 */

import CONFIG from '../config.js';

const REALMS = {
  forest: {
    id: 'forest',
    name: 'Forest Realm',
    description: 'The starting realm, lush with natural energy',
    emoji: '🌲',
    theme: 'green',
    
    unlockCondition: null, // Always unlocked
    unlockCost: null,
    
    features: {
      structures: ['solarPanel', 'windTurbine', 'hydroPlant', 'geoThermal', 'fusionReactor', 'antimatterGenerator'],
      guardianTypes: ['energy', 'mana', 'all'],
      specialResources: []
    },
    
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    
    lore: 'A peaceful forest where energy flows naturally through ancient trees and crystal-clear streams.'
  },
  
  volcano: {
    id: 'volcano',
    name: 'Volcanic Realm',
    description: 'A realm of fire and molten power',
    emoji: '🌋',
    theme: 'red',
    
    unlockCondition: {
      ascension: { level: 1 },
      bosses: { corruptedTreeant: 'defeated' }
    },
    
    unlockCost: {
      crystals: CONFIG.BALANCING.VOLCANO_UNLOCK_COST
    },
    
    features: {
      structures: ['magmaVent', 'lavaCrystallizer', 'obsidianForge'],
      guardianTypes: ['volcanic', 'all'],
      specialResources: ['volcanicEnergy']
    },
    
    background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    
    lore: 'An ancient volcano where primordial fire still burns. The heat here can forge anything... or destroy everything.',
    
    bonuses: {
      // Special bonuses for being in this realm
      manaConversion: 1.2, // +20% mana from volcanic sources
      gemChance: 0.05 // 5% chance for gems from volcanic structures
    }
  },
  
  // === OCEAN REALM ===
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Mysteries and power beneath the waves',
    emoji: '🌊',
    theme: 'blue',
    unlockCondition: {
      ascension: { level: 3 },
      realms: { volcano: 'unlocked' }
    },
    unlockCost: {
      crystals: 500
    },
    features: {
      structures: [
        'tidalGenerator',
        'kelpFarm',
        'coralBattery',
        'deepSeaPump',
        'pressureReactor'
      ],
      guardianTypes: ['water', 'all'],
      specialResources: ['tidalEnergy', 'pearls']
    },
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    lore: 'The ocean depths hold secrets older than time itself. Harness tides and marine life for immense energy.',
    bonuses: {
      energyProduction: 1.15, // +15% energy production in ocean
      pearlDropChance: 0.10, // 10% chance for pearls from kelp/coral
      guardianAffinity: 1.20 // +20% water guardian bonus here
    },
    bossId: 'leviathan', // Reference to Ocean boss, to be defined
    questIds: ['ocean_intro', 'tide_master'], // Reference to quests for the realm
    locked: true // Set to false when all module data is ready
  },
  
  cosmos: {
    id: 'cosmos',
    name: 'Cosmic Expanse',
    description: 'The realm beyond the stars',
    emoji: '🌌',
    theme: 'dark',
    
    unlockCondition: {
      ascension: { level: 5 }
    },
    
    unlockCost: {
      crystals: 2000
    },
    
    features: {
      structures: [], // To be defined
      guardianTypes: ['cosmic', 'all'],
      specialResources: ['cosmicEnergy']
    },
    
    background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    
    lore: 'Where reality bends and infinite energy awaits.',
    
    locked: true // Not implemented yet
  }
};

export default REALMS;