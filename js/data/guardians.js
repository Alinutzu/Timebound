/**
 * Guardian definitions - summonable creatures with bonuses
 */

import CONFIG from '../config.js';

const GUARDIAN_POOL = {
  // ===== ENERGY GUARDIANS =====
  solarSpirit: {
    id: 'solarSpirit',
    name: 'Solar Spirit',
    description: 'A radiant being of pure sunlight',
    emoji: '☀️',
    type: 'energy',
    realm: 'forest',
    rarities: ['common', 'uncommon', 'rare'],
    lore: 'Born from the first rays of dawn, it channels solar power.'
  },
  
  thunderbird: {
    id: 'thunderbird',
    name: 'Thunderbird',
    description: 'Majestic bird crackling with electricity',
    emoji: '⚡',
    type: 'energy',
    realm: 'forest',
    rarities: ['uncommon', 'rare', 'epic'],
    lore: 'Its wings generate storms that power ancient technologies.'
  },
  
  stormElemental: {
    id: 'stormElemental',
    name: 'Storm Elemental',
    description: 'Condensed storm clouds given form',
    emoji: '🌩️',
    type: 'energy',
    realm: 'forest',
    rarities: ['rare', 'epic'],
    lore: 'Where it goes, lightning follows.'
  },
  
  cosmicBeing: {
    id: 'cosmicBeing',
    name: 'Cosmic Being',
    description: 'Entity from beyond the stars',
    emoji: '🌌',
    type: 'energy',
    realm: 'forest',
    rarities: ['epic', 'legendary'],
    lore: 'It understands the universe\'s infinite energy.'
  },
  
  // ===== MANA GUARDIANS =====
  mysticFox: {
    id: 'mysticFox',
    name: 'Mystic Fox',
    description: 'Nine-tailed guardian of magic',
    emoji: '🦊',
    type: 'mana',
    realm: 'forest',
    rarities: ['common', 'uncommon', 'rare'],
    lore: 'Each tail holds a different magical secret.'
  },
  
  arcaneOwl: {
    id: 'arcaneOwl',
    name: 'Arcane Owl',
    description: 'Wise keeper of magical knowledge',
    emoji: '🦉',
    type: 'mana',
    realm: 'forest',
    rarities: ['uncommon', 'rare'],
    lore: 'Its eyes see the flows of mana itself.'
  },
  
  arcanePhoenix: {
    id: 'arcanePhoenix',
    name: 'Arcane Phoenix',
    description: 'Reborn in flames of pure mana',
    emoji: '🔥',
    type: 'mana',
    realm: 'forest',
    rarities: ['rare', 'epic', 'legendary'],
    lore: 'Death only makes it stronger, mana flowing eternal.'
  },
  
  voidWitch: {
    id: 'voidWitch',
    name: 'Void Witch',
    description: 'Channels the darkness between worlds',
    emoji: '🌑',
    type: 'mana',
    realm: 'forest',
    rarities: ['epic', 'legendary'],
    lore: 'Where light ends, her power begins.'
  },
  
  // ===== VOLCANIC GUARDIANS =====
  magmaGolem: {
    id: 'magmaGolem',
    name: 'Magma Golem',
    description: 'Living stone and molten rock',
    emoji: '🗿',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['common', 'uncommon', 'rare'],
    lore: 'Forged in the heart of the volcano itself.'
  },
  
  lavaSerpent: {
    id: 'lavaSerpent',
    name: 'Lava Serpent',
    description: 'Serpent swimming through molten rock',
    emoji: '🐍',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['uncommon', 'rare', 'epic'],
    lore: 'It drinks lava like water.'
  },
  
  infernoTitan: {
    id: 'infernoTitan',
    name: 'Inferno Titan',
    description: 'Giant wreathed in eternal flames',
    emoji: '👹',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['rare', 'epic', 'legendary'],
    lore: 'Mountains crumble before its fury.'
  },
  
  primordialFlame: {
    id: 'primordialFlame',
    name: 'Primordial Flame',
    description: 'The first fire that ever burned',
    emoji: '🔥',
    type: 'volcanic',
    realm: 'volcano',
    rarities: ['legendary'],
    lore: 'All fire in the world is but an echo of its essence.'
  },
  
  // ===== UNIVERSAL GUARDIANS =====
  fortuneCat: {
    id: 'fortuneCat',
    name: 'Fortune Cat',
    description: 'Brings luck and prosperity',
    emoji: '🐱',
    type: 'all',
    realm: 'any',
    rarities: ['uncommon', 'rare'],
    lore: 'Where it walks, fortune follows.'
  },
  
  ancientTurtle: {
    id: 'ancientTurtle',
    name: 'Ancient Turtle',
    description: 'Wise guardian as old as time',
    emoji: '🐢',
    type: 'all',
    realm: 'any',
    rarities: ['rare', 'epic'],
    lore: 'It has seen civilizations rise and fall.'
  },
  
  cosmicDragon: {
    id: 'cosmicDragon',
    name: 'Cosmic Dragon',
    description: 'Dragon of infinite power',
    emoji: '🐉',
    type: 'all',
    realm: 'any',
    rarities: ['legendary'],
    lore: 'Its roar echoes across dimensions, amplifying all power.'
  },
  
  celestialKirin: {
    id: 'celestialKirin',
    name: 'Celestial Kirin',
    description: 'Divine beast of balance',
    emoji: '🦄',
    type: 'all',
    realm: 'any',
    rarities: ['legendary'],
    lore: 'Appears only to those who seek harmony.'
  },
  
  // ===== SPECIAL GUARDIANS =====
  timeKeeper: {
    id: 'timeKeeper',
    name: 'Time Keeper',
    description: 'Guardian that manipulates time itself',
    emoji: '⏰',
    type: 'all',
    realm: 'any',
    rarities: ['legendary'],
    lore: 'Past, present, and future are one to it.',
    special: {
      offlineBonus: 0.2 // +20% offline production
    }
  },
  
  gemFairy: {
    id: 'gemFairy',
    name: 'Gem Fairy',
    description: 'Tiny creature that creates gems',
    emoji: '🧚',
    type: 'gems',
    realm: 'any',
    rarities: ['rare', 'epic'],
    lore: 'Its tears crystallize into precious gems.',
    special: {
      gemBonus: 0.1 // +10% gems from all sources
    }
  },

    // ===== OCEAN REALM GUARDIANS =====
  aquaSprite: {
    id: 'aquaSprite',
    name: 'Aqua Sprite',
    description: 'A playful spirit of the waves, boosts tidal energy production.',
    emoji: '💧',
    type: 'water',
    realm: 'ocean',
    rarities: ['common', 'uncommon'],
    lore: 'Born in the foam, carries whispers of the deep.',
    ability: {
      type: 'boost',
      target: 'tidalEnergy',
      multiplier: 1.10 // +10% tidal energy generation
    }
  },

  kelpGuardian: {
    id: 'kelpGuardian',
    name: 'Kelp Guardian',
    description: 'Guardian of the underwater kelp forests.',
    emoji: '🪸',
    type: 'water',
    realm: 'ocean',
    rarities: ['rare'],
    lore: 'Watches over secret currents and kelp thickets.',
    ability: {
      type: 'synergy',
      target: 'kelpFarm',
      multiplier: 1.25 // +25% production from kelpFarm
    }
  },

  coralWarden: {
    id: 'coralWarden',
    name: 'Coral Warden',
    description: 'Protector of reefs, sometimes finds pearls.',
    emoji: '🏝️',
    type: 'water',
    realm: 'ocean',
    rarities: ['epic'],
    lore: 'Defends reefs and cultivates pearl treasures.',
    ability: {
      type: 'chanceBonus',
      target: 'coralBattery',
      chance: 0.10, // 10% chance for extra pearls
      resource: 'pearls'
    }
  },

  abyssSerpent: {
    id: 'abyssSerpent',
    name: 'Abyss Serpent',
    description: 'Ancient serpent from the deep sea. Increases production and unlocks deep sea upgrades.',
    emoji: '🐍',
    type: 'water',
    realm: 'ocean',
    rarities: ['legendary'],
    lore: 'Spins the unseen tides; legends are its children.',
    ability: {
      type: 'unlock',
      target: 'pressureTech'
    }
  }
};

// Rarity configurations (from CONFIG but can be overridden here)
const RARITIES = CONFIG.BALANCING.GUARDIAN_RARITIES;

export { GUARDIAN_POOL, RARITIES };
export default GUARDIAN_POOL;