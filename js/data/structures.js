/**
 * Structure definitions with balancing
 */

const STRUCTURES = {
  // ===== TIER 1: EARLY GAME =====
  solarPanel: {
    id: 'solarPanel',
    name: 'Solar Panel',
    description: 'Converts sunlight into energy',
    emoji: '☀️',
    tier: 1,
    
    // Costs
    baseCost: 10,
    costMultiplier: 1.15,
    costResource: 'energy',
    
    // Production
    baseProduction: 1,
    productionExponent: 1.0,
    resource: 'energy',
    
    // Unlock
    unlockCondition: null, // Always available
    
    // Flavor
    flavorTexts: [
      'Harnessing the power of the sun',
      'Clean energy for a brighter future',
      'Solar power at its finest'
    ]
  },
  
  windTurbine: {
    id: 'windTurbine',
    name: 'Wind Turbine',
    description: 'Generates energy from wind',
    emoji: '💨',
    tier: 1,
    
    baseCost: 50,
    costMultiplier: 1.18,
    costResource: 'energy',
    
    baseProduction: 5,
    productionExponent: 1.05,
    resource: 'energy',
    
    unlockCondition: {
      resources: { energy: 100 }
    },
    
    flavorTexts: [
      'The wind whispers of energy',
      'Spinning into the future',
      'Renewable and reliable'
    ]
  },
  
  // ===== TIER 2: MID GAME =====
  hydroPlant: {
    id: 'hydroPlant',
    name: 'Hydro Plant',
    description: 'Water-powered energy generation',
    emoji: '💧',
    tier: 2,
    
    baseCost: 500,
    costMultiplier: 1.20,
    costResource: 'energy',
    
    baseProduction: 25,
    productionExponent: 1.1,
    resource: 'energy',
    
    unlockCondition: {
      resources: { energy: 1000 }
    },
    
    flavorTexts: [
      'The power of flowing water',
      'Hydro energy never sleeps',
      'Rivers of electricity'
    ]
  },
  
  geoThermal: {
    id: 'geoThermal',
    name: 'Geothermal Plant',
    description: 'Taps into Earth\'s heat',
    emoji: '🌋',
    tier: 2,
    
    baseCost: 5000,
    costMultiplier: 1.22,
    costResource: 'energy',
    
    baseProduction: 150,
    productionExponent: 1.12,
    resource: 'energy',
    
    unlockCondition: {
      structures: { hydroPlant: 5 }
    },
    
    flavorTexts: [
      'Earth\'s warmth flows through',
      'Geothermal excellence',
      'Heat from the depths'
    ]
  },
  
  // ===== TIER 3: LATE GAME =====
  fusionReactor: {
    id: 'fusionReactor',
    name: 'Fusion Reactor',
    description: 'Nuclear fusion energy',
    emoji: '⚛️',
    tier: 3,
    
    baseCost: 50000,
    costMultiplier: 1.25,
    costResource: 'energy',
    
    baseProduction: 1000,
    productionExponent: 1.15,
    resource: 'energy',
    
    unlockCondition: {
      resources: { energy: 100000 },
      upgrades: { advancedTech: 1 }
    },
    
    flavorTexts: [
      'The power of the stars',
      'Fusion: tomorrow\'s energy today',
      'Unlimited clean energy'
    ]
  },
  
  antimatterGenerator: {
    id: 'antimatterGenerator',
    name: 'Antimatter Generator',
    description: 'Harnesses antimatter reactions',
    emoji: '✨',
    tier: 3,
    
    baseCost: 1000000,
    costMultiplier: 1.30,
    costResource: 'energy',
    
    baseProduction: 10000,
    productionExponent: 1.2,
    resource: 'energy',
    
    unlockCondition: {
      ascension: { level: 1 },
      resources: { crystals: 5 }
    },
    
    flavorTexts: [
      'Matter meets antimatter',
      'The ultimate energy source',
      'Beyond comprehension'
    ]
  },
  
  // ===== MANA PRODUCERS =====
  manaExtractor: {
    id: 'manaExtractor',
    name: 'Mana Extractor',
    description: 'Extracts mana from energy',
    emoji: '🔮',
    tier: 2,
    
    baseCost: 1000,
    costMultiplier: 1.25,
    costResource: 'energy',
    
    baseProduction: 0.1,
    productionExponent: 1.1,
    resource: 'mana',
    
    unlockCondition: {
      resources: { energy: 5000 }
    },
    
    flavorTexts: [
      'Converting energy to magic',
      'Mana flows freely',
      'The mystic conversion'
    ]
  },
  
  manaCrystallizer: {
    id: 'manaCrystallizer',
    name: 'Mana Crystallizer',
    description: 'Crystallizes pure mana',
    emoji: '💎',
    tier: 3,
    
    baseCost: 10000,
    costMultiplier: 1.28,
    costResource: 'energy',
    
    baseProduction: 1,
    productionExponent: 1.15,
    resource: 'mana',
    
    unlockCondition: {
      resources: { mana: 50 },
      structures: { manaExtractor: 10 }
    },
    
    flavorTexts: [
      'Pure crystallized mana',
      'Magic made solid',
      'Crystalline perfection'
    ]
  },
  
  // ===== VOLCANO REALM =====
  magmaVent: {
    id: 'magmaVent',
    name: 'Magma Vent',
    description: 'Volcanic energy source',
    emoji: '🌋',
    tier: 1,
    realm: 'volcano',
    
    baseCost: 100,
    costMultiplier: 1.20,
    costResource: 'volcanicEnergy',
    
    baseProduction: 5,
    productionExponent: 1.1,
    resource: 'volcanicEnergy',
    
    unlockCondition: {
      realms: { volcano: true }
    },
    
    flavorTexts: [
      'Magma surges upward',
      'The volcano\'s breath',
      'Molten energy'
    ]
  },
  
  lavaCrystallizer: {
    id: 'lavaCrystallizer',
    name: 'Lava Crystallizer',
    description: 'Converts volcanic energy to mana',
    emoji: '🔥',
    tier: 2,
    realm: 'volcano',
    
    baseCost: 1000,
    costMultiplier: 1.25,
    costResource: 'volcanicEnergy',
    
    baseProduction: 0.5,
    productionExponent: 1.15,
    resource: 'mana',
    
    unlockCondition: {
      realms: { volcano: true },
      structures: { magmaVent: 5 }
    },
    
    flavorTexts: [
      'Lava transforms to magic',
      'Fire and mana intertwine',
      'Volcanic alchemy'
    ]
  },
  
  obsidianForge: {
    id: 'obsidianForge',
    name: 'Obsidian Forge',
    description: 'Forges gems from volcanic energy',
    emoji: '⚒️',
    tier: 3,
    realm: 'volcano',
    
    baseCost: 10000,
    costMultiplier: 1.30,
    costResource: 'volcanicEnergy',
    
    baseProduction: 0.01, // Very slow gem production
    productionExponent: 1.2,
    resource: 'gems',
    
    unlockCondition: {
      realms: { volcano: true },
      structures: { lavaCrystallizer: 10 }
    },
    
    flavorTexts: [
      'Forging precious gems',
      'Obsidian and fire',
      'Gems from the depths'
    ]
  }
};

export default STRUCTURES;