/**
 * QuestSystem - Generates, tracks, and completes quests
 */

import QUEST_TEMPLATES from '../data/quests.js';
import CONFIG from '../config.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class QuestSystem {
  constructor() {
    this.templates = QUEST_TEMPLATES;
    this.maxActiveQuests = 3;
    
    this.initializeState();
    this.subscribeToEvents();
    
    logger.info('QuestSystem', 'Initialized with templates:', Object.keys(this.templates));
  }
  
  /**
   * Initialize quest state
   */
  initializeState() {
    const state = stateManager.getState();
    
    // Generate initial quests if none exist
    if (state.quests.active.length === 0) {
      this.generateQuests(this.maxActiveQuests);
    }
  }
  
  /**
   * Subscribe to events for quest tracking
   */
  subscribeToEvents() {
    // Structure purchases
    eventBus.on('structure:purchased', (data) => {
      this.updateProgress('buy', data.structureKey, 1);
      this.updateProgress('buy', 'any', 1);
    });
    
    // Upgrade purchases
    eventBus.on('upgrade:purchased', () => {
      this.updateProgress('upgrade', 'any', 1);
    });
    
    // Guardian summons
    eventBus.on('guardian:summoned', (guardian) => {
      this.updateProgress('summon', 'any', 1);
      this.updateProgress('collect', guardian.rarity, 1);
    });
    
    // Puzzle wins
    eventBus.on('puzzle:won', (data) => {
      this.updateProgress('puzzle', 'win', 1);
      this.updateProgress('puzzle', 'score', data.score);
    });
    
    // Boss defeats
    eventBus.on('boss:defeated', (data) => {
      this.updateProgress('boss', data.bossId, 1);
    });
    
    // Realm unlocks
    eventBus.on('realm:unlocked', (data) => {
      this.updateProgress('realm', data.realmId, 1);
    });
    
    // Ascension
    eventBus.on('ascension:completed', () => {
      this.updateProgress('ascension', 'any', 1);
    });
    
    // Production tracking (checked periodically)
    eventBus.on('game:tick', () => {
      this.trackProductionQuests();
    });
  }
  
  /**
   * Generate random quests
   */
  generateQuests(count) {
  const state = stateManager.getState();
  const availableTemplates = this.getAvailableTemplates();
  
  if (availableTemplates.length === 0) {
    logger. warn('QuestSystem', 'No available quest templates');
    return;
  }
  
  const generated = [];
  let attempts = 0;
  const maxAttempts = count * 3; // Evită infinite loop
  
  while (generated.length < count && attempts < maxAttempts && availableTemplates.length > 0) {
    attempts++;
    
    const template = this.weightedRandom(availableTemplates);
    const quest = this.createQuestFromTemplate(template);
    
    // ===== FIX: Skip quest-uri null =====
    if (! quest) {
      logger.warn('QuestSystem', `Failed to create quest from template ${template.id}, skipping`);
      
      // Remove problematic template
      const index = availableTemplates.findIndex(t => t.id === template.id);
      if (index !== -1) {
        availableTemplates.splice(index, 1);
      }
      
      continue; // Try again
    }
    // ===== SFÂRȘIT FIX =====
    
    stateManager.dispatch({
      type: 'ADD_QUEST',
      payload: { quest }
    });
    
    generated.push(quest);
    
    // Remove template from pool
    const index = availableTemplates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      availableTemplates.splice(index, 1);
    }
  }
  
  logger.info('QuestSystem', `Generated ${generated.length}/${count} quests (${attempts} attempts)`);
  eventBus.emit('quests:generated', { quests: generated });
  
  return generated;
}
  
  /**
   * Get available quest templates (unlocked)
   */
  getAvailableTemplates() {
    const state = stateManager.getState();
    
    return Object.values(this.templates).filter(template => {
      // Check unlock condition
      if (template.unlockCondition) {
        const condition = template.unlockCondition;
        
        // Resources
        if (condition.resources) {
          for (let [resource, amount] of Object.entries(condition.resources)) {
            if (state.resources[resource] < amount) {
              return false;
            }
          }
        }
        
        // Upgrades
        if (condition.upgrades) {
          for (let [upgrade, level] of Object.entries(condition.upgrades)) {
            if ((state.upgrades[upgrade]?.level || 0) < level) {
              return false;
            }
          }
        }
        
        // Guardians
        if (condition.guardians) {
          if (condition.guardians.count && state.guardians.length < condition.guardians.count) {
            return false;
          }
        }
        
        // Realms
        if (condition.realms) {
          for (let [realm, required] of Object.entries(condition.realms)) {
            if (required && !state.realms.unlocked.includes(realm)) {
              return false;
            }
          }
        }
        
        // Bosses
        if (condition.bosses) {
          if (condition.bosses.unlocked) {
            const unlockedBosses = Object.values(state.bosses).filter(b => b.unlocked).length;
            if (unlockedBosses < condition.bosses.unlocked) {
              return false;
            }
          }
        }
        
        // Ascension
        if (condition.ascension) {
          if (condition.ascension.canAscend) {
            // Check if player meets ascension requirements
            const canAscend = state.ascension.lifetimeEnergy >= CONFIG.BALANCING.ASCENSION_MIN_ENERGY;
            if (!canAscend) return false;
          }
          if (condition.ascension.level && state.ascension.level < condition.ascension.level) {
            return false;
          }
        }
      }
      
      return true;
    });
  }
  
  /**
   * Create quest instance from template
   */
  createQuestFromTemplate(template) {
  const state = stateManager.getState();
  
  // Validare initială
  if (!template) return null;
  
  const progressLevel = this.getPlayerProgressLevel();
  let amount, target, description;
  
  try {
    switch (template.type) {
      case 'produce':
        if (!template.amounts || template.amounts.length === 0) {
          logger.error('QuestSystem', `Produce quest ${template.id} missing amounts`);
          return null;
        }
        amount = this.selectScaledValue(template.amounts, progressLevel);
        description = template.description.replace('{amount}', amount. toLocaleString());
        break;
      
      case 'buy':
        if (!template.amounts || template.amounts.length === 0) return null;
        
        amount = this.selectScaledValue(template.amounts, progressLevel);
        target = template.target || 'any';
        
        if (template.targets && template.targets.length > 0) {
          target = template.targets[Math.floor(Math.random() * template.targets. length)];
          const structureName = target;
          description = template.description
            .replace('{amount}', amount)
            .replace('{structure}', structureName);
        } else {
          description = template.description. replace('{amount}', amount);
        }
        break;
      
      case 'upgrade':
        if (!template.amounts || template.amounts.length === 0) return null;
        amount = this.selectScaledValue(template.amounts, progressLevel);
        description = template.description. replace('{amount}', amount);
        break;
      
      case 'milestone':
        if (!template.amounts || template.amounts.length === 0) return null;
        amount = this.selectScaledValue(template.amounts, progressLevel);
        description = template.description.replace('{amount}', amount. toLocaleString());
        break;
      
      case 'puzzle':
        if (template.counts && template.counts. length > 0) {
          amount = this.selectScaledValue(template.counts, progressLevel);
          description = template.description.replace('{amount}', amount);
        } else if (template.scores && template.scores.length > 0) {
          amount = this.selectScaledValue(template.scores, progressLevel);
          description = template.description.replace('{amount}', amount. toLocaleString());
        } else {
          return null;
        }
        break;
      
      case 'summon':
        if (!template. counts || template.counts.length === 0) return null;
        amount = this.selectScaledValue(template.counts, progressLevel);
        description = template.description.replace('{amount}', amount);
        break;
      
      case 'collect':
        if (!template.rarities || template.rarities.length === 0) return null;
        target = template.rarities[Math. floor(Math.random() * template.rarities.length)];
        description = template.description.replace('{rarity}', target);
        amount = 1;
        break;
      
      case 'boss':
        if (!template.bosses || template.bosses.length === 0) return null;
        target = template.bosses[Math. floor(Math.random() * template.bosses.length)];
        const bossName = target;
        description = template.description. replace('{boss}', bossName);
        amount = 1;
        break;
      
      case 'realm':
        if (!template.realms || template.realms.length === 0) return null;
        target = template.realms[Math.floor(Math.random() * template. realms.length)];
        description = template.description.replace('{realm}', target);
        amount = 1;
        break;
      
      case 'ascension':
        description = template.description;
        amount = 1;
        break;
      
      default:
        logger.error('QuestSystem', `Unknown quest type: ${template.type}`);
        return null;
    }
  } catch (error) {
    logger.error('QuestSystem', `Error creating quest from template ${template.id}:`, error);
    return null;
  }
  
  // Calculate rewards
  try {
    const rewards = template.rewards(amount, target);
    
    // Create quest object
    const quest = {
      id: `quest_${Date.now()}_${Math.random()}`,
      templateId: template.id,
      name: template.name,
      description: description,
      emoji: template. emoji,
      type: template. type,
      target: target,
      amount: amount,
      progress: 0,
      completed: false,
      rewards: rewards,
      difficulty: template.difficulty,
      createdAt: Date.now()
    };
    
    return quest;
  } catch (error) {
    logger.error('QuestSystem', `Error calculating rewards for ${template.id}:`, error);
    return null;
  }
}
  
  /**
   * Get player progress level (0-4) for quest scaling
   */
  getPlayerProgressLevel() {
    const state = stateManager.getState();
    
    // Based on ascension level and lifetime energy
    if (state.ascension.level >= 3) return 4;
    if (state.ascension.level >= 1) return 3;
    if (state.ascension.lifetimeEnergy >= 1000000) return 2;
    if (state.ascension.lifetimeEnergy >= 100000) return 1;
    return 0;
  }
  
  /**
   * Select value from array based on progress level
   */
  selectScaledValue(array, progressLevel) {
    const index = Math.min(progressLevel, array.length - 1);
    return array[index];
  }
  
  /**
   * Weighted random selection
   */
  weightedRandom(templates) {
    const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (let template of templates) {
      random -= (template.weight || 1);
      if (random <= 0) {
        return template;
      }
    }
    
    return templates[0];
  }
  
  /**
   * Update quest progress
   */
  updateProgress(type, target, amount) {
    const state = stateManager.getState();
    const activeQuests = state.quests.active;
    
    for (let quest of activeQuests) {
      if (quest.completed) continue;
      
      // Check if quest matches
      if (quest.type !== type) continue;
      
      // Check target
      if (quest.target && quest.target !== 'any' && quest.target !== target) {
        continue;
      }
      
      // Update progress
      stateManager.dispatch({
        type: 'UPDATE_QUEST_PROGRESS',
        payload: {
          questId: quest.id,
          amount: amount
        }
      });
      
      // Check if completed
      const updatedState = stateManager.getState();
      const updatedQuest = updatedState.quests.active.find(q => q.id === quest.id);
      
      if (updatedQuest && updatedQuest.completed) {
        logger.info('QuestSystem', `Quest completed: ${updatedQuest.name}`);
        eventBus.emit('quest:completed', updatedQuest);
      }
    }
  }
  
  /**
   * Track production-based quests (called from game tick)
   */
  trackProductionQuests() {
    const state = stateManager.getState();
    
    // Track 'produce' quests
    // These are incremented when resources are actually produced
    // Already handled via tick system adding resources
    
    // Track 'milestone' quests
    for (let quest of state.quests.active) {
      if (quest.completed) continue;
      
      if (quest.type === 'milestone') {
        let currentValue = 0;
        
        switch (quest.metric) {
          case 'energyPerSecond':
            currentValue = state.production.energy;
            break;
          case 'maxStructureLevel':
            currentValue = Math.max(...Object.values(state.structures).map(s => s.level || 0));
            break;
        }
        
        if (currentValue >= quest.amount && quest.progress < quest.amount) {
          stateManager.dispatch({
            type: 'UPDATE_QUEST_PROGRESS',
            payload: {
              questId: quest.id,
              amount: quest.amount - quest.progress
            }
          });
        }
      }
    }
  }
  
  /**
   * Claim quest rewards
   */
  claim(questId) {
    const state = stateManager.getState();
    const quest = state.quests.active.find(q => q.id === questId);
    
    if (!quest) {
      logger.error('QuestSystem', `Quest ${questId} not found`);
      return false;
    }
    
    if (!quest.completed) {
      logger.warn('QuestSystem', `Quest ${questId} not completed`);
      return false;
    }

    // ===== INSEREAZĂ AICI - FIX LUCKY GEMS =====
// Apply lucky gems bonus chance
const upgradeSystem = require('./UpgradeSystem.js').default;
const luckyChance = upgradeSystem.getLuckyGemsChance(); // Returns 0-0.50

if (quest.rewards.gems && luckyChance > 0 && Math.random() < luckyChance) {
  const bonusGems = Math.floor(quest.rewards.gems * 0.5); // +50% bonus
  quest.rewards.gems += bonusGems;
  
  logger.info('QuestSystem', `🍀 Lucky Gems!  Bonus: +${bonusGems} gems`);
  
  // Optional: emit event for UI notification
  eventBus.emit('quest:lucky-gems', { 
    questId, 
    bonusGems 
  });
}
    
    // Give rewards
    for (let [resource, amount] of Object.entries(quest.rewards)) {
      stateManager.dispatch({
        type: 'ADD_RESOURCE',
        payload: { resource, amount }
      });
      
      // Track gem earnings
      if (resource === 'gems') {
        stateManager.dispatch({
          type: 'INCREMENT_STATISTIC',
          payload: { key: 'gemsEarned', amount }
        });
      }
    }
    
    // Complete quest
    stateManager.dispatch({
      type: 'COMPLETE_QUEST',
      payload: { questId }
    });
    
    logger.info('QuestSystem', `Claimed quest: ${quest.name}`, quest.rewards);
    eventBus.emit('quest:claimed', { quest, rewards: quest.rewards });
    
    // Check if should generate new quest
    const newState = stateManager.getState();
    if (newState.quests.active.length < this.maxActiveQuests) {
      if (newState.quests.completedToday < CONFIG.BALANCING.DAILY_QUEST_LIMIT) {
        this.generateQuests(1);
      }
    }
    
    return true;
  }
  
  /**
   * Get active quests
   */
  getActiveQuests() {
    const state = stateManager.getState();
    return state.quests.active;
  }
  
  /**
   * Get completed quests
   */
  getCompletedQuests() {
    const state = stateManager.getState();
    return state.quests.completed;
  }
  
  /**
   * Get quest stats
   */
  getStats() {
    const state = stateManager.getState();
    
    return {
      active: state.quests.active.length,
      completed: state.quests.completed.length,
      completedToday: state.quests.completedToday,
      dailyLimit: state.quests.dailyLimit,
      remainingToday: state.quests.dailyLimit - state.quests.completedToday
    };
  }
  
  /**
   * Reset daily quests (called at midnight)
   */
  resetDaily() {
    const state = stateManager.getState();
    
    // Reset daily counter
    state.quests.completedToday = 0;
    state.quests.lastReset = Date.now();
    
    // Generate new quests if needed
    if (state.quests.active.length < this.maxActiveQuests) {
      this.generateQuests(this.maxActiveQuests - state.quests.active.length);
    }
    
    logger.info('QuestSystem', 'Daily quests reset');
    eventBus.emit('quests:daily-reset');
  }
}

// Singleton
const questSystem = new QuestSystem();

export default questSystem;