/**
 * Global Game Configuration
 * Centralizează toate constantele și setările globale
 */

const CONFIG = {
  // Game identity
  GAME_NAME: 'Idle Energy Empire',
  VERSION: '2.0.0',
  
  // Save system
  SAVE_KEY: 'idle_energy_empire_save_v2',
  AUTO_SAVE_INTERVAL: 30000, // 30 secunde
  
  // Game loop
  TICK_RATE: 100, // ms (10 ticks per second)
  
  // Debug
  DEBUG_MODE: true,
  ENABLE_CHEATS: true, // Development only
  LOG_LEVEL: 'info', // 'error', 'warn', 'info', 'debug'
  
  // UI
  ANIMATION_SPEED: 300, // ms
  NOTIFICATION_DURATION: 3000, // ms
  TOOLTIP_DELAY: 500, // ms
  
  // Balancing
  BALANCING: {
    // Starting resources
    STARTING_ENERGY: 10,
    STARTING_MANA: 0,
    STARTING_GEMS: 100, // Tutorial bonus
    STARTING_CRYSTALS: 0,
    
    // Caps
    BASE_ENERGY_CAP: 5000,
    BASE_MANA_CAP: 100,
    BASE_VOLCANIC_ENERGY_CAP: 5000,
    
    // Offline
    OFFLINE_PRODUCTION_BASE: 0.5, // 50% without upgrades
    OFFLINE_TIME_CAP: 86400000, // 24h in ms
    
    // Daily
    DAILY_QUEST_LIMIT: 10,
    
    // Ascension
    ASCENSION_MIN_ENERGY: 10000000, // 10M
    ASCENSION_CRYSTAL_FORMULA: (lifetimeEnergy) => {
      return Math.floor(Math.sqrt(lifetimeEnergy / 1000000));
    },
    ASCENSION_PRODUCTION_BONUS: 0.1, // +10% per level
    ASCENSION_CAPACITY_BONUS: 0.5,   // +50% per level
    
    // Guardians
    GUARDIAN_SUMMON_COST: 100, // gems
    GUARDIAN_RARITIES: {
      common: { weight: 50, bonusRange: [5, 15] },
      uncommon: { weight: 30, bonusRange: [15, 30] },
      rare: { weight: 15, bonusRange: [30, 50] },
      epic: { weight: 4, bonusRange: [50, 100] },
      legendary: { weight: 1, bonusRange: [100, 200] }
    },
    
    // Volcano unlock
    VOLCANO_UNLOCK_COST: 100, // crystals
    VOLCANO_MIN_ASCENSION: 1
  },
  
  // Features flags
  FEATURES: {
    PUZZLE_ENABLED: true,
    BOSSES_ENABLED: true,
    SHOP_ENABLED: true,
    ACHIEVEMENTS_ENABLED: true,
    STATISTICS_ENABLED: true,
    AUTOMATION_ENABLED: true
  }
};

// Freeze to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.BALANCING);
Object.freeze(CONFIG.FEATURES);


export default CONFIG;
