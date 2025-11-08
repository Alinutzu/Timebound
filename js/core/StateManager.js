/**
 * StateManager - Centralized state management
 * Redux-like pattern with actions and reducers
 */

import CONFIG from '../config.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class StateManager {
  constructor() {
    this.state = this.getInitialState();
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 50;
    
    logger.info('StateManager', 'Initialized');
  }
  
  /**
   * Initial state structure
   */
  getInitialState() {
    return {
      // Meta
      version: CONFIG.VERSION,
      createdAt: Date.now(),
      lastSaved: null,
      
      // Resources
      resources: {
        energy: CONFIG.BALANCING.STARTING_ENERGY,
        mana: CONFIG.BALANCING.STARTING_MANA,
        gems: CONFIG.BALANCING.STARTING_GEMS,
        crystals: CONFIG.BALANCING.STARTING_CRYSTALS,
        volcanicEnergy: 0
      },
      
      // Caps
      caps: {
        energy: CONFIG.BALANCING.BASE_ENERGY_CAP,
        mana: CONFIG.BALANCING.BASE_MANA_CAP,
        volcanicEnergy: CONFIG.BALANCING.BASE_VOLCANIC_ENERGY_CAP
      },
      
      // Production rates
      production: {
        energy: 0,
        mana: 0,
        volcanicEnergy: 0
      },
      
      // Structures (will be populated)
      structures: {},
      
      // Upgrades (will be populated)
      upgrades: {},
      
      // Guardians
      guardians: [],
      
      // Quests
      quests: {
        active: [],
        completed: [],
        completedToday: 0,
        dailyLimit: CONFIG.BALANCING.DAILY_QUEST_LIMIT,
        lastReset: Date.now()
      },
      
      // Achievements
      achievements: {},
      
      // Bosses
      bosses: {},
      currentBoss: null,
      bossHP: 0,
      
      // Realms
      realms: {
        current: 'forest',
        unlocked: ['forest']
      },
      
      // Ascension
      ascension: {
        level: 0,
        lifetimeEnergy: 0,
        totalAscensions: 0
      },
      
      // Shop
      shop: {
        purchaseHistory: [],
        vipActive: false,
        vipExpiry: null,
        adsWatchedToday: 0,
        lastAdReset: Date.now()
      },
      
      // Daily rewards
      dailyRewards: {
        streak: 0,
        lastClaim: null,
        claimed: []
      },
      
      // Automation
      automation: {
        autoBuyStructures: false,
        autoClaimQuests: false,
        autoPuzzle: false,
        autoBuyThreshold: 0.8 // Buy when >= 80% of cost
      },
      
      // Statistics
      statistics: {
        sessionsPlayed: 0,
        totalPlayTime: 0,
        sessionStartTime: Date.now(),
        structuresPurchased: 0,
        upgradesPurchased: 0,
        guardiansSum: 0,
        questsCompleted: 0,
        bossesDefeated: 0,
        puzzlesPlayed: 0,
        puzzleHighScore: 0,
        gemsSpent: 0,
        gemsEarned: 0,
        highestEnergyPerSecond: 0
      },
      
      // Settings
      settings: {
        theme: 'dark',
        soundEnabled: true,
        musicEnabled: false,
        notificationsEnabled: true,
        particleQuality: 'medium',
        autoSaveEnabled: true,
        showFPS: false
      },
      
      // Tutorial
      tutorial: {
        completed: false,
        currentStep: 0,
        skipped: false
      }
    };
  }
  
  /**
   * Dispatch an action to modify state
   * @param {object} action - { type: string, payload: any }
   */
  dispatch(action) {
    if (!action || !action.type) {
      logger.error('StateManager', 'Invalid action', action);
      return;
    }
    
    logger.debug('StateManager', `Action: ${action.type}`, action.payload);
    
    // Store previous state for history
    const previousState = JSON.parse(JSON.stringify(this.state));
    
    // Apply reducer
    this.state = this.reducer(this.state, action);
    
    // Add to history
    this.history.push({
      action,
      timestamp: Date.now(),
      previousState: previousState
    });
    
    // Maintain history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Notify listeners
    this.notifyListeners(action.type, this.state);
    
    // Emit event
    eventBus.emit(`state:${action.type}`, {
      action,
      state: this.state
    });
  }
  
  /**
   * Reducer - pure function that returns new state
   */
  reducer(state, action) {
    switch (action.type) {
      // ===== RESOURCES =====
      case 'ADD_RESOURCE':
        return {
          ...state,
          resources: {
            ...state.resources,
            [action.payload.resource]: Math.min(
              state.resources[action.payload.resource] + action.payload.amount,
              state.caps[action.payload.resource] || Infinity
            )
          }
        };
      
      case 'REMOVE_RESOURCE':
        return {
          ...state,
          resources: {
            ...state.resources,
            [action.payload.resource]: Math.max(
              state.resources[action.payload.resource] - action.payload.amount,
              0
            )
          }
        };
      
      case 'SET_RESOURCE':
        return {
          ...state,
          resources: {
            ...state.resources,
            [action.payload.resource]: action.payload.amount
          }
        };
      
      case 'SET_CAP':
        return {
          ...state,
          caps: {
            ...state.caps,
            [action.payload.resource]: action.payload.amount
          }
        };
      
      case 'SET_PRODUCTION':
        return {
          ...state,
          production: {
            ...state.production,
            [action.payload.resource]: action.payload.amount
          }
        };
      
      // ===== STRUCTURES =====
      case 'BUY_STRUCTURE':
        const { structureKey, cost } = action.payload;
        const currentLevel = state.structures[structureKey]?.level || 0;
        
        return {
          ...state,
          resources: {
            ...state.resources,
            energy: state.resources.energy - cost
          },
          structures: {
            ...state.structures,
            [structureKey]: {
              level: currentLevel + 1,
              totalPurchased: (state.structures[structureKey]?.totalPurchased || 0) + 1
            }
          },
          statistics: {
            ...state.statistics,
            structuresPurchased: state.statistics.structuresPurchased + 1
          }
        };
      
      case 'RESET_STRUCTURES':
        return {
          ...state,
          structures: {}
        };
      
      // ===== UPGRADES =====
      case 'BUY_UPGRADE':
        const { upgradeKey, upgradeCost, costResource } = action.payload;
        const currentUpgradeLevel = state.upgrades[upgradeKey]?.level || 0;
        
        return {
          ...state,
          resources: {
            ...state.resources,
            [costResource]: state.resources[costResource] - upgradeCost
          },
          upgrades: {
            ...state.upgrades,
            [upgradeKey]: {
              level: currentUpgradeLevel + 1
            }
          },
          statistics: {
            ...state.statistics,
            upgradesPurchased: state.statistics.upgradesPurchased + 1
          }
        };
      
      case 'RESET_UPGRADES':
        return {
          ...state,
          upgrades: {}
        };
      
      // ===== GUARDIANS =====
      case 'ADD_GUARDIAN':
        return {
          ...state,
          guardians: [...state.guardians, action.payload.guardian],
          resources: {
            ...state.resources,
            gems: state.resources.gems - CONFIG.BALANCING.GUARDIAN_SUMMON_COST
          },
          statistics: {
            ...state.statistics,
            guardiansSummoned: state.statistics.guardiansSummoned + 1,
            gemsSpent: state.statistics.gemsSpent + CONFIG.BALANCING.GUARDIAN_SUMMON_COST
          }
        };
      
      case 'REMOVE_GUARDIAN':
        return {
          ...state,
          guardians: state.guardians.filter(g => g.id !== action.payload.guardianId)
        };
      
      case 'RESET_GUARDIANS':
        return {
          ...state,
          guardians: []
        };
      
      // ===== QUESTS =====
      case 'ADD_QUEST':
        return {
          ...state,
          quests: {
            ...state.quests,
            active: [...state.quests.active, action.payload.quest]
          }
        };
      
      case 'UPDATE_QUEST_PROGRESS':
        return {
          ...state,
          quests: {
            ...state.quests,
            active: state.quests.active.map(quest => {
              if (quest.id === action.payload.questId) {
                const newProgress = quest.progress + action.payload.amount;
                return {
                  ...quest,
                  progress: newProgress,
                  completed: newProgress >= quest.amount
                };
              }
              return quest;
            })
          }
        };
      
      case 'COMPLETE_QUEST':
        const completedQuest = state.quests.active.find(q => q.id === action.payload.questId);
        
        return {
          ...state,
          quests: {
            ...state.quests,
            active: state.quests.active.filter(q => q.id !== action.payload.questId),
            completed: [...state.quests.completed, action.payload.questId],
            completedToday: state.quests.completedToday + 1
          },
          statistics: {
            ...state.statistics,
            questsCompleted: state.statistics.questsCompleted + 1
          }
        };
      
      // ===== ACHIEVEMENTS =====
      case 'UNLOCK_ACHIEVEMENT':
        return {
          ...state,
          achievements: {
            ...state.achievements,
            [action.payload.achievementKey]: {
              unlocked: true,
              unlockedAt: Date.now(),
              claimed: false
            }
          }
        };
      
      case 'CLAIM_ACHIEVEMENT':
        return {
          ...state,
          achievements: {
            ...state.achievements,
            [action.payload.achievementKey]: {
              ...state.achievements[action.payload.achievementKey],
              claimed: true,
              claimedAt: Date.now()
            }
          }
        };
      
      // ===== REALMS =====
      case 'UNLOCK_REALM':
        return {
          ...state,
          realms: {
            ...state.realms,
            unlocked: [...state.realms.unlocked, action.payload.realmId]
          },
          resources: {
            ...state.resources,
            crystals: state.resources.crystals - action.payload.cost
          }
        };
      
      case 'SWITCH_REALM':
        return {
          ...state,
          realms: {
            ...state.realms,
            current: action.payload.realmId
          }
        };
      
      // ===== ASCENSION =====
      case 'ASCEND':
        return {
          ...state,
          ascension: {
            level: state.ascension.level + 1,
            lifetimeEnergy: state.ascension.lifetimeEnergy,
            totalAscensions: state.ascension.totalAscensions + 1
          },
          resources: {
            ...state.resources,
            energy: CONFIG.BALANCING.STARTING_ENERGY,
            mana: 0,
            volcanicEnergy: 0,
            crystals: state.resources.crystals + action.payload.crystalsEarned
          },
          structures: {},
          upgrades: {}
          // Guardians, achievements, gems are kept!
        };
      
      case 'UPDATE_LIFETIME_ENERGY':
        return {
          ...state,
          ascension: {
            ...state.ascension,
            lifetimeEnergy: state.ascension.lifetimeEnergy + action.payload.amount
          }
        };
      
      // ===== SETTINGS =====
      case 'UPDATE_SETTING':
        return {
          ...state,
          settings: {
            ...state.settings,
            [action.payload.key]: action.payload.value
          }
        };
      
      // ===== STATISTICS =====
      case 'UPDATE_STATISTIC':
        return {
          ...state,
          statistics: {
            ...state.statistics,
            [action.payload.key]: action.payload.value
          }
        };
      
      case 'INCREMENT_STATISTIC':
        return {
          ...state,
          statistics: {
            ...state.statistics,
            [action.payload.key]: (state.statistics[action.payload.key] || 0) + action.payload.amount
          }
        };
      
      // ===== TUTORIAL =====
      case 'COMPLETE_TUTORIAL':
        return {
          ...state,
          tutorial: {
            ...state.tutorial,
            completed: true
          }
        };
      
      case 'SKIP_TUTORIAL':
        return {
          ...state,
          tutorial: {
            ...state.tutorial,
            skipped: true,
            completed: true
          }
        };

        // În StateManager.reducer(), adaugă:

case 'INIT_UPGRADE_QUEUE':
  return {
    ...state,
    upgradeQueue: {
      queue: [],
      slots: 1,
      activeUpgrade: null
    }
  };

case 'ADD_TO_UPGRADE_QUEUE':
  return {
    ...state,
    upgradeQueue: {
      ...state.upgradeQueue,
      queue: [...state.upgradeQueue.queue, action.payload.item]
    },
    resources: {
      ...state.resources,
      [action.payload.item.costResource]: 
        state.resources[action.payload.item.costResource] - action.payload.item.cost
    }
  };

case 'REMOVE_FROM_UPGRADE_QUEUE':
  return {
    ...state,
    upgradeQueue: {
      ...state.upgradeQueue,
      queue: state.upgradeQueue.queue.filter(
        item => item.upgradeKey !== action.payload.upgradeKey
      )
    }
  };

case 'START_UPGRADE':
  return {
    ...state,
    upgradeQueue: {
      ...state.upgradeQueue,
      queue: state.upgradeQueue.queue.slice(1), // Remove first item
      activeUpgrade: action.payload.upgrade
    }
  };

case 'COMPLETE_UPGRADE':
  return {
    ...state,
    upgradeQueue: {
      ...state.upgradeQueue,
      activeUpgrade: null
    }
  };

case 'UPGRADE_QUEUE_SLOTS':
  return {
    ...state,
    upgradeQueue: {
      ...state.upgradeQueue,
      slots: action.payload.slots
    }
  };


  // În StateManager.reducer(), adaugă:

case 'UNLOCK_ACHIEVEMENT':
  return {
    ...state,
    achievements: {
      ...state.achievements,
      [action.payload.achievementKey]: {
        unlocked: true,
        unlockedAt: Date.now(),
        claimed: false
      }
    }
  };

case 'CLAIM_ACHIEVEMENT':
  return {
    ...state,
    achievements: {
      ...state.achievements,
      [action.payload.achievementKey]: {
        ...state.achievements[action.payload.achievementKey],
        claimed: true,
        claimedAt: Date.now()
      }
    }
  };

case 'TRIGGER_ACHIEVEMENT':
  // For special triggers (like patientUpgrader)
  return {
    ...state,
    achievements: {
      ...state.achievements,
      [action.payload.achievementKey]: {
        ...state.achievements[action.payload.achievementKey],
        triggered: true
      }
    }
  };

case 'UNLOCK_REALM':
  return {
    ...state,
    realms: {
      ...state.realms,
      unlocked: [...state.realms.unlocked, action.payload.realmId]
    },
    resources: {
      ...state.resources,
      crystals: state.resources.crystals - (action.payload.cost || 0)
    }
  };

case 'SWITCH_REALM':
  return {
    ...state,
    realms: {
      ...state.realms,
      current: action.payload.realmId
    }
  };

case 'ASCEND':
  return {
    ...state,
    ascension: {
      level: state.ascension.level + 1,
      lifetimeEnergy: state.ascension.lifetimeEnergy,
      totalAscensions: state.ascension.totalAscensions + 1
    },
    resources: {
      ...state.resources,
      energy: CONFIG.BALANCING.STARTING_ENERGY,
      mana: 0,
      volcanicEnergy: 0,
      crystals: state.resources.crystals + action.payload.crystalsEarned
      // Gems are kept!
    },
    structures: {},
    upgrades: {},
    upgradeQueue: {
      queue: [],
      slots: state.upgradeQueue?.slots || 1,
      activeUpgrade: null
    }
    // Guardians, achievements, realms are kept!
  };


  // În StateManager.reducer(), adaugă:

// ===== BOSS ACTIONS =====
case 'UNLOCK_BOSS':
  return {
    ...state,
    bosses: {
      ...state.bosses,
      [action.payload.bossKey]: {
        ...state.bosses[action.payload.bossKey],
        unlocked: true
      }
    }
  };

  case 'INIT_BOSSES':
  return {
    ...state,
    bosses: action.payload.bosses
  };

case 'START_BOSS_BATTLE':
  return {
    ...state,
    currentBoss: action.payload.bossKey
  };

case 'DAMAGE_BOSS':
  return {
    ...state,
    bosses: {
      ...state.bosses,
      [action.payload.bossKey]: {
        ...state.bosses[action.payload.bossKey],
        currentHP: action.payload.newHP,
        attempts: (state.bosses[action.payload.bossKey].attempts || 0) + 1,
        bestScore: Math.max(
          state.bosses[action.payload.bossKey].bestScore || 0,
          action.payload.score
        )
      }
    }
  };

case 'DEFEAT_BOSS':
  return {
    ...state,
    bosses: {
      ...state.bosses,
      [action.payload.bossKey]: {
        ...state.bosses[action.payload.bossKey],
        defeated: true,
        currentHP: 0,
        defeatedCount: (state.bosses[action.payload.bossKey].defeatedCount || 0) + 1,
        firstDefeatAt: state.bosses[action.payload.bossKey].firstDefeatAt || Date.now()
      }
    },
    currentBoss: null
  };

case 'EXIT_BOSS_BATTLE':
  return {
    ...state,
    currentBoss: null
  };

// ===== SHOP ACTIONS =====
case 'RECORD_PURCHASE':
  return {
    ...state,
    shop: {
      ...state.shop,
      purchaseHistory: [
        ...state.shop.purchaseHistory,
        action.payload
      ]
    }
  };

case 'ACTIVATE_VIP':
  return {
    ...state,
    shop: {
      ...state.shop,
      vipActive: true,
      vipExpiry: action.payload.expiryTime,
      vipBenefits: action.payload.benefits
    }
  };

case 'DEACTIVATE_VIP':
  return {
    ...state,
    shop: {
      ...state.shop,
      vipActive: false,
      vipExpiry: null,
      vipBenefits: null
    }
  };

case 'RESET_AD_COUNTER':
  return {
    ...state,
    shop: {
      ...state.shop,
      adsWatchedToday: 0,
      adWatchCount: {},
      lastAdReset: Date.now()
    }
  };

case 'INCREMENT_AD_WATCH':
  const adType = action.payload.adType;
  return {
    ...state,
    shop: {
      ...state.shop,
      adsWatchedToday: state.shop.adsWatchedToday + 1,
      adWatchCount: {
        ...state.shop.adWatchCount,
        [adType]: (state.shop.adWatchCount?.[adType] || 0) + 1
      }
    }
  };

case 'APPLY_TEMP_MULTIPLIER':
  return {
    ...state,
    tempMultiplier: {
      active: true,
      multiplier: action.payload.multiplier,
      expiresAt: action.payload.expiresAt
    }
  };

case 'REMOVE_TEMP_MULTIPLIER':
  return {
    ...state,
    tempMultiplier: {
      active: false,
      multiplier: 1,
      expiresAt: null
    }
  };

case 'REFRESH_DAILY_DEAL':
  return {
    ...state,
    shop: {
      ...state.shop,
      dailyDeal: {
        ...action.payload.deal,
        refreshedAt: action.payload.refreshedAt
      }
    }
  };

// ===== DAILY REWARD ACTIONS =====
case 'CLAIM_DAILY_REWARD':
  return {
    ...state,
    dailyRewards: {
      ...state.dailyRewards,
      streak: action.payload.streak,
      lastClaim: action.payload.lastClaim,
      claimed: [
        ...(state.dailyRewards.claimed || []),
        {
          day: action.payload.day,
          timestamp: action.payload.lastClaim
        }
      ]
    }
  };

// ===== GUARDIAN DIRECT ADD (for boss/shop rewards) =====
case 'ADD_GUARDIAN_DIRECT':
  return {
    ...state,
    guardians: [...state.guardians, action.payload.guardian]
  };


  // În StateManager.reducer(), adaugă:

// ===== AUTOMATION ACTIONS =====
case 'UNLOCK_AUTOMATION':
  return {
    ...state,
    automation: {
      ...state.automation,
      [action.payload.featureKey]: {
        ...state.automation[action.payload.featureKey],
        unlocked: true,
        enabled: false
      }
    }
  };

case 'TOGGLE_AUTOMATION':
  return {
    ...state,
    automation: {
      ...state.automation,
      [action.payload.featureKey]: {
        ...state.automation[action.payload.featureKey],
        enabled: action.payload.enabled
      }
    }
  };

case 'SET_AUTO_BUY_THRESHOLD':
  return {
    ...state,
    automation: {
      ...state.automation,
      autoBuyThreshold: action.payload.threshold
    }
  };

case 'SET_AUTO_SUMMON_THRESHOLD':
  return {
    ...state,
    automation: {
      ...state.automation,
      autoSummonThreshold: action.payload.threshold
    }
  };

// ===== TUTORIAL ACTIONS =====
case 'COMPLETE_TUTORIAL':
  return {
    ...state,
    tutorial: {
      ...state.tutorial,
      completed: true,
      completedAt: Date.now()
    }
  };

case 'SKIP_TUTORIAL':
  return {
    ...state,
    tutorial: {
      ...state.tutorial,
      skipped: true,
      skippedAt: Date.now()
    }
  };

case 'RESET_TUTORIAL':
  return {
    ...state,
    tutorial: {
      completed: false,
      skipped: false,
      currentStep: 0
    }
  };

      // ===== SAVE GAME =====
case 'SAVE_GAME':
  return {
    ...state,
    lastSaved: Date.now()
  };

      
      // ===== FULL STATE =====
      case 'LOAD_STATE':
        return action.payload.state;
      
      case 'RESET_STATE':
        return this.getInitialState();
      
      default:
        logger.warn('StateManager', `Unknown action type: ${action.type}`);
        return state;
    }
  }
  
  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch (or '*' for all)
   * @param {function} callback - Handler
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify listeners
   */
  notifyListeners(actionType, newState) {
    // Notify specific listeners
    if (this.listeners.has(actionType)) {
      this.listeners.get(actionType).forEach(callback => {
        try {
          callback(newState);
        } catch (error) {
          logger.error('StateManager', `Error in listener for ${actionType}:`, error);
        }
      });
    }
    
    // Notify global listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => {
        try {
          callback(newState, actionType);
        } catch (error) {
          logger.error('StateManager', 'Error in global listener:', error);
        }
      });
    }
  }
  
  /**
   * Get current state (read-only)
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state)); // Deep clone
  }
  
  /**
   * Get specific state value
   */
  get(path) {
    const keys = path.split('.');
    let value = this.state;
    
    for (let key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    
    return value;
  }
  
  /**
   * Undo last action
   */
  undo() {
    if (this.history.length === 0) {
      logger.warn('StateManager', 'No history to undo');
      return;
    }
    
    const lastEntry = this.history.pop();
    this.state = lastEntry.previousState;
    
    logger.info('StateManager', `Undid action: ${lastEntry.action.type}`);
    this.notifyListeners('UNDO', this.state);
  }
  
  /**
   * Get action history
   */
  getHistory(count = 10) {
    return this.history.slice(-count);
  }
  
  /**
   * Debug info
   */
  debug() {
    console.log('[StateManager] Current state:', this.state);
    console.log('[StateManager] Listeners:', Array.from(this.listeners.keys()));
    console.log('[StateManager] Recent history:', this.history.slice(-5));
  }
}

// Singleton
const stateManager = new StateManager();

export default stateManager;