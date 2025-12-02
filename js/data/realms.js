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
    
    lore: 'A peaceful forest where energy flows naturally through ancient trees and crystal-clear streams.',
    
    bonuses: {
      // Starter realm - no special bonuses
      energyProduction: 1.0,
      manaProduction: 1.0
    }
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
      crystals: CONFIG.BALANCING.VOLCANO_UNLOCK_COST || 200 // Fallback dacă nu e în CONFIG
    },
    
    features: {
      structures: ['magmaVent', 'lavaCrystallizer', 'obsidianForge'],
      guardianTypes: ['volcanic', 'all'],
      specialResources: ['volcanicEnergy']
    },
    
    background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    
    lore: 'An ancient volcano where primordial fire still burns. The heat here can forge anything... or destroy everything.',
    
    bonuses: {
      volcanicProduction: 1.10, // +10% volcanic energy (redus de la implicit)
      manaConversion: 1.15, // +15% mana from volcanic sources (redus de la 1.2)
      gemChance: 0.03 // 3% chance for gems (redus de la 5%)
    },
    
    bossId: 'infernoTitan'
  },
  
  // === OCEAN REALM ===
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Mysteries and power beneath the waves',
    emoji: '🌊',
    theme: 'blue',
    
    unlockCondition: {
      ascension: { level: 2 }, // Redus de la 3
      realms: { volcano: 'unlocked' },
      production: { energy: 2000 } // Adăugat milestone de producție
    },
    
    unlockCost: {
      crystals: 300 // Redus de la 500
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
    
    lore: 'The ocean depths hold secrets older than time itself.  Harness tides and marine life for immense energy.',
    
    bonuses: {
      tidalProduction: 1.08, // +8% tidal energy production (redus de la 1. 15)
      pearlDropChance: 0.06, // 6% chance for pearls (redus de la 10%)
      guardianAffinity: 1.12 // +12% water guardian bonus (redus de la 1. 20)
    },
    
    bossId: 'oceanLeviathan',
    questIds: ['ocean_intro', 'tide_master', 'kelp_tycoon', 'pearl_diver'],
    
    locked: false // ✅ Acum e disponibil! 
  },
  
  // === FUTURE REALMS ===
  
  desert: {
    id: 'desert',
    name: 'Desert Expanse',
    description: 'Endless dunes hiding ancient solar power',
    emoji: '�sa',
    theme: 'yellow',
    
    unlockCondition: {
      ascension: { level: 3 },
      realms: { ocean: 'unlocked' }
    },
    
    unlockCost: {
      crystals: 600
    },
    
    features: {
      structures: ['solarArray', 'sandExtractor', 'mirageCore'],
      guardianTypes: ['solar', 'all'],
      specialResources: ['solarEssence']
    },
    
    background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
    
    lore: 'Where the sun burns brightest and sand holds forgotten secrets.',
    
    bonuses: {
      solarProduction: 1.25, // +25% solar energy
      energyProduction: 1.10, // +10% all energy
      heatResistance: 0.9 // -10% structure costs
    },
    
    locked: true // Not implemented yet
  },
  
  tundra: {
    id: 'tundra',
    name: 'Frozen Tundra',
    description: 'Ice and cold preserve ancient energies',
    emoji: '❄️',
    theme: 'cyan',
    
    unlockCondition: {
      ascension: { level: 4 },
      realms: { desert: 'unlocked' }
    },
    
    unlockCost: {
      crystals: 1000
    },
    
    features: {
      structures: ['cryoReactor', 'iceHarvester', 'auraBorealis'],
      guardianTypes: ['ice', 'all'],
      specialResources: ['cryoEnergy']
    },
    
    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
    
    lore: 'Frozen wastes where time moves slowly and energy is preserved eternally.',
    
    bonuses: {
      cryoProduction: 1.30, // +30% cryo energy
      crystalChance: 0.08, // 8% chance for crystals
      guardianDuration: 1.20 // +20% guardian buff duration
    },
    
    locked: true // Not implemented yet
  },
  
  cosmos: {
    id: 'cosmos',
    name: 'Cosmic Expanse',
    description: 'The realm beyond the stars',
    emoji: '🌌',
    theme: 'dark',
    
    unlockCondition: {
      ascension: { level: 5 },
      realms: { tundra: 'unlocked' },
      bosses: {
        voidLeviathan: 'defeated',
        oceanLeviathan: 'defeated',
        infernoTitan: 'defeated'
      }
    },
    
    unlockCost: {
      crystals: 2000
    },
    
    features: {
      structures: ['starForge', 'blackHoleGenerator', 'warpReactor'],
      guardianTypes: ['cosmic', 'all'],
      specialResources: ['cosmicEnergy', 'starDust']
    },
    
    background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    
    lore: 'Where reality bends and infinite energy awaits.  The final frontier.',
    
    bonuses: {
      allProduction: 1.50, // +50% ALL production types
      ascensionBonus: 1.25, // +25% ascension crystal gain
      guardianPower: 1.40 // +40% all guardian bonuses
    },
    
    bossId: 'cosmicHarbinger',
    
    locked: true // Final realm - Not implemented yet
  }
};

/**
 * Get realm by ID
 */
export function getRealmById(realmId) {
  return REALMS[realmId] || null;
}

/**
 * Get unlocked realms based on state
 */
export function getUnlockedRealms(state) {
  return Object.values(REALMS).filter(realm => {
    if (! realm.unlockCondition) return true; // Forest always unlocked
    if (realm.locked) return false; // Not implemented
    
    return state.realms. unlocked.includes(realm.id);
  });
}

/**
 * Check if realm can be unlocked
 */
export function canUnlockRealm(realmId, state) {
  const realm = REALMS[realmId];
  if (!realm || realm.locked) return false;
  if (! realm.unlockCondition) return true;
  
  const condition = realm.unlockCondition;
  
  // Check ascension level
  if (condition.ascension && state.ascension. level < condition.ascension.level) {
    return false;
  }
  
  // Check other realms
  if (condition.realms) {
    for (const [requiredRealm, status] of Object.entries(condition. realms)) {
      if (status === 'unlocked' && !state.realms. unlocked.includes(requiredRealm)) {
        return false;
      }
    }
  }
  
  // Check bosses
  if (condition.bosses) {
    for (const [boss, status] of Object.entries(condition. bosses)) {
      if (status === 'defeated' && ! state.bosses[boss]?.defeated) {
        return false;
      }
    }
  }
  
  // Check production
  if (condition.production) {
    for (const [resource, amount] of Object.entries(condition. production)) {
      if (state.production[resource] < amount) {
        return false;
      }
    }
  }
  
  // Check resources for cost
  if (realm.unlockCost?. crystals && state.resources.crystals < realm.unlockCost.crystals) {
    return false;
  }
  
  return true;
}

export default REALMS;