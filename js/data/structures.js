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
    baseCost: 25,
    costMultiplier: 1.18,
    costResource: 'energy',
    
    // Production
    baseProduction: 0.2,
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
    
    baseCost: 150,
    costMultiplier: 1.22,
    costResource: 'energy',
    
    baseProduction: 0.8,
    productionExponent: 1.05,
    resource: 'energy',
    
    unlockCondition: {
      resources: { energy: 200 }
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
    
    baseCost: 1500,
    costMultiplier: 1.28,
    costResource: 'energy',
    
    baseProduction: 4,
    productionExponent: 1.1,
    resource: 'energy',
    
    unlockCondition: {
      resources: { energy: 3000 }
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
    
    baseCost: 15000,
    costMultiplier: 1.32,
    costResource: 'energy',
    
    baseProduction: 20,
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
    
    baseCost: 300000,
    costMultiplier: 1.38,
    costResource: 'energy',
    
    baseProduction: 120,
    productionExponent: 1.15,
    resource: 'energy',
    
    unlockCondition: {
      resources: { energy: 500000 },
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
    
    baseCost: 2000000,
    costMultiplier: 1.25,
    costResource: 'energy',
    
    baseProduction: 5000,
    productionExponent: 1.2,
    resource: 'energy',
    
    unlockCondition: {
      ascension: { level: 1 },
      resources: { crystals: 10 }
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
    
    baseCost: 50000,
    costMultiplier: 1.22,
    costResource: 'energy',
    
    baseProduction: 0.02,
    productionExponent: 1.1,
    resource: 'mana',
    
    unlockCondition: {
      resources: { energy: 15000 }
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
    
    baseCost: 800000,
    costMultiplier: 1.25,
    costResource: 'energy',
    
    baseProduction: 0.3,
    productionExponent: 1.15,
    resource: 'mana',
    
    unlockCondition: {
      resources: { mana: 100 },
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
    
    baseCost: 300,
    costMultiplier: 1.22,
    costResource: 'volcanicEnergy',
    
    baseProduction: 0.8,
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
    
    baseCost: 3000,
    costMultiplier: 1.28,
    costResource: 'volcanicEnergy',
    
    baseProduction: 0.08,
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
  },

  // ===== OCEAN REALM =====
  tidalGenerator: {
    id: 'tidalGenerator',
    name: 'Tidal Generator',
    description: 'Harnesses tidal forces for energy',
    emoji: '🌊',
    tier: 1,
    realm: 'ocean',
    baseCost: 500,
    costMultiplier: 1.22,
    costResource: 'tidalEnergy',
    baseProduction: 1.2,
    productionExponent: 1.12,
    resource: 'tidalEnergy',
    unlockCondition: {
      realms: { ocean: true }
    },
    flavorTexts: [
      'Power from the rhythm of the deep',
      'Tides never sleep',
      'Harnessing oceanic force'
    ]
  },
  kelpFarm: {
    id: 'kelpFarm',
    name: 'Kelp Farm',
    description: 'Cultivates kelp for tidal resources',
    emoji: '🪸',
    tier: 2,
    realm: 'ocean',
    baseCost: 5000,
    costMultiplier: 1.28,
    costResource: 'tidalEnergy',
    baseProduction: 6,
    productionExponent: 1.13,
    resource: 'tidalEnergy',
    unlockCondition: {
      realms: { ocean: true },
      structures: { tidalGenerator: 5 }
    },
    flavorTexts: [
      'Kelp waves with watery promise',
      'Aquatic farming fuels progress',
      'Oceanic abundance'
    ]
  },
  coralBattery: {
    id: 'coralBattery',
    name: 'Coral Battery',
    description: 'Stores energy, sometimes yields pearls',
    emoji: '🏝️',
    tier: 3,
    realm: 'ocean',
    baseCost: 60000,
    costMultiplier: 1.32,
    costResource: 'tidalEnergy',
    baseProduction: 35,
    productionExponent: 1.15,
    resource: 'tidalEnergy',
    unlockCondition: {
      realms: { ocean: true },
      structures: { kelpFarm: 8 }
    },
    flavorTexts: [
      'Corals accumulate deep power',
      'Pearls of production',
      'Battery from the reef'
    ]
  },
  deepSeaPump: {
    id: 'deepSeaPump',
    name: 'Deep Sea Pump',
    description: 'Draws energy from ocean depths',
    emoji: '🦑',
    tier: 3,
    realm: 'ocean',
    baseCost: 300000,
    costMultiplier: 1.38,
    costResource: 'tidalEnergy',
    baseProduction: 120,
    productionExponent: 1.18,
    resource: 'tidalEnergy',
    unlockCondition: {
      realms: { ocean: true },
      structures: { coralBattery: 5 },
      upgrades: { pressureTech: 1 }
    },
    flavorTexts: [
      'Energy from the abyss',
      'Pressure fuels innovation',
      'Unleashing deep force'
    ]
  },
  pressureReactor: {
    id: 'pressureReactor',
    name: 'Pressure Reactor',
    description: 'Reacts oceanic pressure to create mana',
    emoji: '⚓',
    tier: 3,
    realm: 'ocean',
    baseCost: 800000,
    costMultiplier: 1.42,
    costResource: 'tidalEnergy',
    baseProduction: 0.4,
    productionExponent: 1.2,
    resource: 'mana',
    unlockCondition: {
      realms: { ocean: true },
      structures: { deepSeaPump: 5 }
    },
    flavorTexts: [
      'Mana condensed from oceanic pressure',
      'Depth and force combine',
      'Mystic equilibrium'
    ]
  },

  // ===== DESERT REALM =====
  solarArray: {
    id: 'solarArray',
    name: 'Solar Array',
    description: 'Harnesses concentrated solar essence',
    emoji: '☀️',
    tier: 1,
    realm: 'desert',
    baseCost: 1000,
    costMultiplier: 1.25,
    costResource: 'solarEssence',
    baseProduction: 2,
    productionExponent: 1.1,
    resource: 'solarEssence',
    unlockCondition: {
      realms: { desert: true }
    },
    flavorTexts: [
      'Endless sun powers the array',
      'Solar essence from the dunes',
      'Desert light captured'
    ]
  },
  sandExtractor: {
    id: 'sandExtractor',
    name: 'Sand Extractor',
    description: 'Extracts solar essence from ancient sands',
    emoji: '🏜️',
    tier: 2,
    realm: 'desert',
    baseCost: 10000,
    costMultiplier: 1.30,
    costResource: 'solarEssence',
    baseProduction: 15,
    productionExponent: 1.13,
    resource: 'solarEssence',
    unlockCondition: {
      realms: { desert: true },
      structures: { solarArray: 5 }
    },
    flavorTexts: [
      'Ancient sands yield their power',
      'Deep desert energy',
      'Millennia of sunlight'
    ]
  },
  mirageCore: {
    id: 'mirageCore',
    name: 'Mirage Core',
    description: 'Converts light into stable energy',
    emoji: '🔮',
    tier: 3,
    realm: 'desert',
    baseCost: 200000,
    costMultiplier: 1.38,
    costResource: 'solarEssence',
    baseProduction: 80,
    productionExponent: 1.18,
    resource: 'solarEssence',
    unlockCondition: {
      realms: { desert: true },
      structures: { sandExtractor: 8 },
      upgrades: { heatVent: 1 }
    },
    flavorTexts: [
      'Light bends to your will',
      'Mirage becomes reality',
      'Concentrated solar power'
    ]
  },

  // ===== TUNDRA REALM =====
  cryoReactor: {
    id: 'cryoReactor',
    name: 'Cryo Reactor',
    description: 'Harnesses freezing temperatures for energy',
    emoji: '❄️',
    tier: 1,
    realm: 'tundra',
    baseCost: 3000,
    costMultiplier: 1.22,
    costResource: 'cryoEnergy',
    baseProduction: 3,
    productionExponent: 1.1,
    resource: 'cryoEnergy',
    unlockCondition: {
      realms: { tundra: true }
    },
    flavorTexts: [
      'Cold itself becomes power',
      'Frozen energy awaits',
      'Ice and energy combine'
    ]
  },
  iceHarvester: {
    id: 'iceHarvester',
    name: 'Ice Harvester',
    description: 'Mines cryo energy from ancient ice',
    emoji: '🧊',
    tier: 2,
    realm: 'tundra',
    baseCost: 30000,
    costMultiplier: 1.30,
    costResource: 'cryoEnergy',
    baseProduction: 25,
    productionExponent: 1.13,
    resource: 'cryoEnergy',
    unlockCondition: {
      realms: { tundra: true },
      structures: { cryoReactor: 5 }
    },
    flavorTexts: [
      'Ice that never melts',
      'Frozen deep power',
      'Glacial precision'
    ]
  },
  auraBorealis: {
    id: 'auraBorealis',
    name: 'Aura Borealis',
    description: 'Captures aurora energy from the skies',
    emoji: '🌌',
    tier: 3,
    realm: 'tundra',
    baseCost: 500000,
    costMultiplier: 1.40,
    costResource: 'cryoEnergy',
    baseProduction: 100,
    productionExponent: 1.18,
    resource: 'cryoEnergy',
    unlockCondition: {
      realms: { tundra: true },
      structures: { iceHarvester: 8 }
    },
    flavorTexts: [
      'Dancing lights of power',
      'Aurora surrendered',
      'Sky-born energy'
    ]
  },

  // ===== COSMOS REALM =====
  starForge: {
    id: 'starForge',
    name: 'Star Forge',
    description: 'Harnesses stellar energy from distant stars',
    emoji: '⭐',
    tier: 1,
    realm: 'cosmos',
    baseCost: 10000,
    costMultiplier: 1.20,
    costResource: 'cosmicEnergy',
    baseProduction: 5,
    productionExponent: 1.1,
    resource: 'cosmicEnergy',
    unlockCondition: {
      realms: { cosmos: true }
    },
    flavorTexts: [
      'Starlight turned to power',
      'Energy from the void',
      'Cosmic essence flows'
    ]
  },
  blackHoleGenerator: {
    id: 'blackHoleGenerator',
    name: 'Black Hole Generator',
    description: 'Taps into the power of gravity itself',
    emoji: '🕳️',
    tier: 2,
    realm: 'cosmos',
    baseCost: 100000,
    costMultiplier: 1.35,
    costResource: 'cosmicEnergy',
    baseProduction: 50,
    productionExponent: 1.15,
    resource: 'cosmicEnergy',
    unlockCondition: {
      realms: { cosmos: true },
      structures: { starForge: 5 }
    },
    flavorTexts: [
      'Gravity yields to you',
      'The void provides',
      'Event horizon crossed'
    ]
  },
  warpReactor: {
    id: 'warpReactor',
    name: 'Warp Reactor',
    description: 'Bends spacetime for ultimate energy',
    emoji: '🌀',
    tier: 3,
    realm: 'cosmos',
    baseCost: 1000000,
    costMultiplier: 1.45,
    costResource: 'cosmicEnergy',
    baseProduction: 200,
    productionExponent: 1.2,
    resource: 'cosmicEnergy',
    unlockCondition: {
      realms: { cosmos: true },
      structures: { blackHoleGenerator: 5 }
    },
    flavorTexts: [
      'Spacetime bends to energy',
      'Warp drive engaged',
      'Reality manipulation'
    ]
  },

  // ===== TIER 4: LATE-LATE GAME =====

  // Forest T4
  quantumGenerator: {
    id: 'quantumGenerator',
    name: 'Quantum Generator',
    description: 'Harnesses quantum fluctuations for vast energy',
    emoji: '⚛️',
    tier: 4,
    baseCost: 50000000,
    costMultiplier: 1.45,
    costResource: 'energy',
    baseProduction: 5000,
    productionExponent: 1.25,
    resource: 'energy',
    unlockCondition: {
      structures: { antimatterGenerator: 10 }
    },
    flavorTexts: [
      'Quantum uncertainty yields power',
      'Subatomic energy unleashed',
      'Reality at its most fundamental'
    ]
  },

  // Volcano T4
  infernoCore: {
    id: 'infernoCore',
    name: 'Inferno Core',
    description: 'Taps the planet\'s molten heart',
    emoji: '🔥',
    tier: 4,
    realm: 'volcano',
    baseCost: 1000000,
    costMultiplier: 1.40,
    costResource: 'volcanicEnergy',
    baseProduction: 300,
    productionExponent: 1.22,
    resource: 'volcanicEnergy',
    unlockCondition: {
      realms: { volcano: true },
      structures: { obsidianForge: 10 }
    },
    flavorTexts: [
      'The core of the world',
      'Inferno harnessed',
      'Planetary power'
    ]
  },

  // Ocean T4
  abyssExtractor: {
    id: 'abyssExtractor',
    name: 'Abyss Extractor',
    description: 'Draws energy from the deepest trenches',
    emoji: '🐙',
    tier: 4,
    realm: 'ocean',
    baseCost: 2000000,
    costMultiplier: 1.42,
    costResource: 'tidalEnergy',
    baseProduction: 500,
    productionExponent: 1.22,
    resource: 'tidalEnergy',
    unlockCondition: {
      realms: { ocean: true },
      structures: { pressureReactor: 8 }
    },
    flavorTexts: [
      'The abyss answers',
      'Deepest power unlocked',
      'Trench-born energy'
    ]
  },

  // Desert T4
  sunCathedral: {
    id: 'sunCathedral',
    name: 'Sun Cathedral',
    description: 'A massive array concentrating solar might',
    emoji: '🏛️',
    tier: 4,
    realm: 'desert',
    baseCost: 5000000,
    costMultiplier: 1.45,
    costResource: 'solarEssence',
    baseProduction: 800,
    productionExponent: 1.22,
    resource: 'solarEssence',
    unlockCondition: {
      realms: { desert: true },
      structures: { mirageCore: 8 }
    },
    flavorTexts: [
      'A temple to the sun',
      'Solar glory amplified',
      'The sun\'s full might'
    ]
  },

  // Tundra T4
  polarEngine: {
    id: 'polarEngine',
    name: 'Polar Engine',
    description: 'Converts absolute cold into energy',
    emoji: '🏔️',
    tier: 4,
    realm: 'tundra',
    baseCost: 10000000,
    costMultiplier: 1.48,
    costResource: 'cryoEnergy',
    baseProduction: 1000,
    productionExponent: 1.25,
    resource: 'cryoEnergy',
    unlockCondition: {
      realms: { tundra: true },
      structures: { auraBorealis: 8 }
    },
    flavorTexts: [
      'Cold itself becomes fuel',
      'Polar might harnessed',
      'Frozen power absolute'
    ]
  },

  // Cosmos T4
  novaGenerator: {
    id: 'novaGenerator',
    name: 'Nova Generator',
    description: 'Captures the power of stellar explosions',
    emoji: '💥',
    tier: 4,
    realm: 'cosmos',
    baseCost: 50000000,
    costMultiplier: 1.50,
    costResource: 'cosmicEnergy',
    baseProduction: 3000,
    productionExponent: 1.28,
    resource: 'cosmicEnergy',
    unlockCondition: {
      realms: { cosmos: true },
      structures: { warpReactor: 8 }
    },
    flavorTexts: [
      'Stellar death yields life',
      'Nova force captured',
      'Explosive power'
    ]
  },

  // ===== TIER 5: ASCENSION MASTERY =====

  // Forest T5
  dimensionalCore: {
    id: 'dimensionalCore',
    name: 'Dimensional Core',
    description: 'Opens portals to other dimensions for pure energy',
    emoji: '🌀',
    tier: 5,
    baseCost: 500000000,
    costMultiplier: 1.50,
    costResource: 'energy',
    baseProduction: 50000,
    productionExponent: 1.30,
    resource: 'energy',
    unlockCondition: {
      structures: { quantumGenerator: 10 },
      ascension: { level: 5 }
    },
    flavorTexts: [
      'Dimensions unfold before you',
      'Cross-dimensional energy',
      'Infinite possibilities'
    ]
  },

  // Volcano T5
  primordialForge: {
    id: 'primordialForge',
    name: 'Primordial Forge',
    description: 'Forges rare gems from planetary energy',
    emoji: '💠',
    tier: 5,
    realm: 'volcano',
    baseCost: 50000000,
    costMultiplier: 1.40,
    costResource: 'volcanicEnergy',
    baseProduction: 0.1,
    productionExponent: 1.30,
    resource: 'gems',
    unlockCondition: {
      realms: { volcano: true },
      structures: { infernoCore: 10 },
      ascension: { level: 10 }
    },
    flavorTexts: [
      'Gems born from primal fire',
      'The forge of creation',
      'Primordial treasure'
    ]
  },

  // Ocean T5
  leviathanCore: {
    id: 'leviathanCore',
    name: 'Leviathan Core',
    description: 'Harnesses the might of ancient sea leviathans',
    emoji: '🐋',
    tier: 5,
    realm: 'ocean',
    baseCost: 50000000,
    costMultiplier: 1.50,
    costResource: 'tidalEnergy',
    baseProduction: 5,
    productionExponent: 1.30,
    resource: 'mana',
    unlockCondition: {
      realms: { ocean: true },
      structures: { abyssExtractor: 10 },
      ascension: { level: 8 }
    },
    flavorTexts: [
      'Leviathan energy flows',
      'Ancient ocean power',
      'Titan of the deep'
    ]
  },

  // Desert T5
  singularityLens: {
    id: 'singularityLens',
    name: 'Singularity Lens',
    description: 'Focuses solar essence into a singularity',
    emoji: '🔆',
    tier: 5,
    realm: 'desert',
    baseCost: 100000000,
    costMultiplier: 1.55,
    costResource: 'solarEssence',
    baseProduction: 10000,
    productionExponent: 1.30,
    resource: 'solarEssence',
    unlockCondition: {
      realms: { desert: true },
      structures: { sunCathedral: 10 },
      ascension: { level: 12 }
    },
    flavorTexts: [
      'Light collapses into power',
      'Singularity achieved',
      'Solar apotheosis'
    ]
  },

  // Tundra T5
  absoluteZero: {
    id: 'absoluteZero',
    name: 'Absolute Zero',
    description: 'Reaches the limit of cold to generate infinite mana',
    emoji: '🧊',
    tier: 5,
    realm: 'tundra',
    baseCost: 100000000,
    costMultiplier: 1.55,
    costResource: 'cryoEnergy',
    baseProduction: 10,
    productionExponent: 1.30,
    resource: 'mana',
    unlockCondition: {
      realms: { tundra: true },
      structures: { polarEngine: 10 },
      ascension: { level: 15 }
    },
    flavorTexts: [
      'Zero entropy attained',
      'Perfect stillness yields power',
      'The coldest fire'
    ]
  },

  // Cosmos T5
  voidEngine: {
    id: 'voidEngine',
    name: 'Void Engine',
    description: 'Extracts energy from the void between stars',
    emoji: '🕳️',
    tier: 5,
    realm: 'cosmos',
    baseCost: 500000000,
    costMultiplier: 1.60,
    costResource: 'cosmicEnergy',
    baseProduction: 50000,
    productionExponent: 1.35,
    resource: 'cosmicEnergy',
    unlockCondition: {
      realms: { cosmos: true },
      structures: { novaGenerator: 10 },
      ascension: { level: 20 }
    },
    flavorTexts: [
      'The void gives everything',
      'Nothingness yields infinity',
      'Empty space, infinite power'
    ]
  }
};

export default STRUCTURES;