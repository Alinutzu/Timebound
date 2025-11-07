/**
 * TutorialSystem - Interactive tutorial for new players
 */

import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';
import resourceManager from '../core/ResourceManager.js';

class TutorialSystem {
  constructor() {
    this.steps = this.getTutorialSteps();
    this.currentStep = 0;
    this.active = false;
    this.spotlight = null;
    
    this.subscribeToEvents();
    
    logger.info('TutorialSystem', 'Initialized');
  }
  
  /**
   * Get tutorial steps
   */
  getTutorialSteps() {
    return [
      {
        id: 'welcome',
        title: 'Welcome to Idle Energy Empire!',
        message: 'Let\'s get you started on your journey to infinite energy!',
        target: null,
        position: 'center',
        onClick: null,
        condition: () => true,
        onComplete: null
      },
      
      {
        id: 'resources',
        title: 'Resources',
        message: 'This is your energy counter. Energy is the core resource of the game!',
        target: '#energy-display',
        position: 'bottom',
        highlight: true,
        condition: () => true
      },
      
      {
        id: 'first_structure',
        title: 'Build Your First Structure',
        message: 'Click on Solar Panel to purchase your first energy generator!',
        target: '.structure-card[data-key="solarPanel"]',
        position: 'right',
        highlight: true,
        onClick: () => {
          // Wait for structure purchase
        },
        condition: () => {
          const state = stateManager.getState();
          return !state.structures.solarPanel || state.structures.solarPanel.level === 0;
        },
        waitFor: 'structure:purchased',
        onComplete: () => {
          // Give bonus
          stateManager.dispatch({
            type: 'ADD_RESOURCE',
            payload: { resource: 'energy', amount: 100 }
          });
        }
      },
      
      {
        id: 'production',
        title: 'Passive Production',
        message: 'Great! Your Solar Panel is now generating energy automatically. Watch your energy grow!',
        target: '#energy-rate',
        position: 'bottom',
        highlight: true,
        duration: 3000
      },
      
      {
        id: 'buy_more',
        title: 'Scale Up',
        message: 'Buy more structures to increase your energy production!',
        target: '.structure-card[data-key="solarPanel"] .buy-btn',
        position: 'right',
        highlight: true,
        condition: () => {
          const state = stateManager.getState();
          return state.structures.solarPanel?.level < 3;
        },
        waitFor: 'structure:purchased',
        skipAfter: 30000 // Skip after 30s
      },
      
      {
        id: 'upgrades_tab',
        title: 'Upgrades',
        message: 'Upgrades multiply your production! Let\'s check them out.',
        target: '.tab-btn[data-tab="upgrades"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click',
        condition: () => {
          const state = stateManager.getState();
          return state.resources.energy >= 100;
        }
      },
      
      {
        id: 'first_upgrade',
        title: 'Buy an Upgrade',
        message: 'Energy Boost multiplies ALL your energy production. Very powerful!',
        target: '.upgrade-card[data-key="energyBoost"]',
        position: 'right',
        highlight: true,
        condition: () => {
          const upgradeSystem = require('./UpgradeSystem.js').default;
          return upgradeSystem.getLevel('energyBoost') === 0;
        },
        waitFor: 'upgrade:purchased'
      },
      
      {
        id: 'upgrade_queue',
        title: 'Upgrade Queue',
        message: 'Higher level upgrades take time to complete. You can queue them up!',
        target: '#upgrade-queue-section',
        position: 'left',
        highlight: true,
        duration: 4000
      },
      
      {
        id: 'guardians_tab',
        title: 'Guardians',
        message: 'Guardians are powerful allies that boost your production!',
        target: '.tab-btn[data-tab="guardians"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click',
        condition: () => {
          const state = stateManager.getState();
          return state.resources.gems >= 100;
        }
      },
      
      {
        id: 'summon_guardian',
        title: 'Summon a Guardian',
        message: 'Use 100 gems to summon your first guardian!',
        target: '#summon-guardian-btn',
        position: 'bottom',
        highlight: true,
        condition: () => {
          const state = stateManager.getState();
          return state.guardians.length === 0;
        },
        waitFor: 'guardian:summoned',
        onComplete: () => {
          // Give bonus gems
          stateManager.dispatch({
            type: 'ADD_RESOURCE',
            payload: { resource: 'gems', amount: 50 }
          });
        }
      },
      
      {
        id: 'quests_tab',
        title: 'Quests',
        message: 'Complete quests to earn gems and other rewards!',
        target: '.tab-btn[data-tab="quests"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click'
      },
      
      {
        id: 'quest_info',
        title: 'Quest System',
        message: 'You can have up to 3 active quests. They refresh daily!',
        target: '#quests-container',
        position: 'right',
        highlight: true,
        duration: 4000
      },
      
      {
        id: 'achievements',
        title: 'Achievements',
        message: 'Check your achievements for extra rewards!',
        target: '.tab-btn[data-tab="achievements"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click'
      },
      
      {
        id: 'puzzle_intro',
        title: 'Puzzle Mini-Game',
        message: 'Play the puzzle game to earn bonus gems and energy!',
        target: '.tab-btn[data-tab="puzzle"]',
        position: 'bottom',
        highlight: true,
        onClick: 'click'
      },
      
      {
        id: 'ascension_teaser',
        title: 'Ascension (Prestige)',
        message: 'When you reach 10M lifetime energy, you can ascend for permanent bonuses!',
        target: '#ascension-btn',
        position: 'left',
        highlight: true,
        duration: 5000
      },
      
      {
        id: 'tutorial_complete',
        title: 'Tutorial Complete!',
        message: 'You\'re ready to build your energy empire! Here\'s 500 gems to get you started. 💎',
        target: null,
        position: 'center',
        onComplete: () => {
          this.completeTutorial();
        }
      }
    ];
  }
  
  /**
   * Subscribe to events
   */
  subscribeToEvents() {
    // Listen for tutorial triggers
    eventBus.on('game:started', () => {
      this.checkShouldStart();
    });
    
    // Listen for step completion events
    eventBus.on('structure:purchased', (data) => {
      this.checkStepCompletion('structure:purchased', data);
    });
    
    eventBus.on('upgrade:purchased', (data) => {
      this.checkStepCompletion('upgrade:purchased', data);
    });
    
    eventBus.on('guardian:summoned', (data) => {
      this.checkStepCompletion('guardian:summoned', data);
    });
  }
  
  /**
   * Check if tutorial should start
   */
  checkShouldStart() {
    const state = stateManager.getState();
    
    // Don't start if already completed
    if (state.tutorial.completed) {
      return;
    }
    
    // Don't start if skipped
    if (state.tutorial.skipped) {
      return;
    }
    
    // Check if veteran player (has progress)
    const isVeteran = state.ascension.lifetimeEnergy > 10000 ||
                      state.statistics.sessionsPlayed > 1;
    
    if (isVeteran) {
      // Ask if they want tutorial
      this.offerTutorial();
    } else {
      // Start automatically for new players
      setTimeout(() => {
        this.start();
      }, 2000);
    }
  }
  
  /**
   * Offer tutorial to returning players
   */
  offerTutorial() {
    eventBus.emit('tutorial:offer', {
      onAccept: () => this.start(),
      onDecline: () => this.skip()
    });
  }
  
  /**
   * Start tutorial
   */
  start() {
    const state = stateManager.getState();
    
    if (state.tutorial.completed || state.tutorial.skipped) {
      logger.warn('TutorialSystem', 'Tutorial already completed or skipped');
      return false;
    }
    
    this.active = true;
    this.currentStep = 0;
    
    logger.info('TutorialSystem', 'Tutorial started');
    
    eventBus.emit('tutorial:started');
    
    this.showCurrentStep();
    
    return true;
  }
  
  /**
   * Show current step
   */
  showCurrentStep() {
    if (!this.active) return;
    
    const step = this.steps[this.currentStep];
    
    if (!step) {
      this.complete();
      return;
    }
    
    // Check condition
    if (step.condition && !step.condition()) {
      // Skip this step
      this.next();
      return;
    }
    
    logger.debug('TutorialSystem', `Showing step: ${step.id}`);
    
    // Show step UI
    this.displayStep(step);
    
    // Set up auto-skip if specified
    if (step.skipAfter) {
      setTimeout(() => {
        if (this.active && this.currentStep === this.steps.indexOf(step)) {
          this.next();
        }
      }, step.skipAfter);
    }
    
    // Set up auto-advance for timed steps
    if (step.duration) {
      setTimeout(() => {
        if (this.active && this.currentStep === this.steps.indexOf(step)) {
          this.next();
        }
      }, step.duration);
    }
  }
  
  /**
   * Display step (UI)
   */
  displayStep(step) {
    // Show tooltip
    this.showTooltip(step);
    
    // Show spotlight if needed
    if (step.highlight && step.target) {
      this.showSpotlight(step.target);
    }
    
    // Set up click handler if needed
    if (step.onClick === 'click' && step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const clickHandler = () => {
          element.removeEventListener('click', clickHandler);
          this.next();
        };
        element.addEventListener('click', clickHandler);
      }
    }
    
    eventBus.emit('tutorial:step-shown', { step, index: this.currentStep });
  }
  
  /**
   * Show tooltip
   */
  showTooltip(step) {
    const tooltip = {
      title: step.title,
      message: step.message,
      target: step.target,
      position: step.position || 'auto',
      buttons: []
    };
    
    // Add next button if not waiting for event
    if (!step.waitFor) {
      tooltip.buttons.push({
        text: 'Next',
        action: () => this.next()
      });
    }
    
    // Add skip button
    tooltip.buttons.push({
      text: 'Skip Tutorial',
      action: () => this.skip(),
      secondary: true
    });
    
    eventBus.emit('tutorial:show-tooltip', tooltip);
  }
  
  /**
   * Show spotlight on element
   */
  showSpotlight(selector) {
    const element = document.querySelector(selector);
    
    if (!element) {
      logger.warn('TutorialSystem', `Spotlight target not found: ${selector}`);
      return;
    }
    
    // Create spotlight overlay
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'tutorial-spotlight';
    
    const rect = element.getBoundingClientRect();
    
    this.spotlight.style.cssText = `
      position: fixed;
      top: ${rect.top - 10}px;
      left: ${rect.left - 10}px;
      width: ${rect.width + 20}px;
      height: ${rect.height + 20}px;
      border: 3px solid #f59e0b;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
      pointer-events: none;
      z-index: 9998;
      animation: pulse 2s ease-in-out infinite;
    `;
    
    document.body.appendChild(this.spotlight);
    
    // Update position if element moves
    const updatePosition = () => {
      if (!this.spotlight) return;
      
      const newRect = element.getBoundingClientRect();
      this.spotlight.style.top = `${newRect.top - 10}px`;
      this.spotlight.style.left = `${newRect.left - 10}px`;
    };
    
    this.spotlightInterval = setInterval(updatePosition, 100);
  }
  
  /**
   * Hide spotlight
   */
  hideSpotlight() {
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }
    
    if (this.spotlightInterval) {
      clearInterval(this.spotlightInterval);
      this.spotlightInterval = null;
    }
  }
  
  /**
   * Check if step is complete
   */
  checkStepCompletion(eventType, data) {
    if (!this.active) return;
    
    const step = this.steps[this.currentStep];
    
    if (step && step.waitFor === eventType) {
      // Step completed!
      if (step.onComplete) {
        step.onComplete(data);
      }
      
      this.next();
    }
  }
  
  /**
   * Go to next step
   */
  next() {
    if (!this.active) return;
    
    this.hideSpotlight();
    
    this.currentStep++;
    
    if (this.currentStep >= this.steps.length) {
      this.complete();
    } else {
      this.showCurrentStep();
    }
  }
  
  /**
   * Go to previous step
   */
  previous() {
    if (!this.active) return;
    if (this.currentStep <= 0) return;
    
    this.hideSpotlight();
    this.currentStep--;
    this.showCurrentStep();
  }
  
  /**
   * Skip tutorial
   */
  skip() {
    if (!this.active) return;
    
    this.active = false;
    this.hideSpotlight();
    
    stateManager.dispatch({
      type: 'SKIP_TUTORIAL'
    });
    
    logger.info('TutorialSystem', 'Tutorial skipped');
    
    eventBus.emit('tutorial:skipped');
    eventBus.emit('tutorial:hide-tooltip');
  }
  
  /**
   * Complete tutorial
   */
  complete() {
    this.active = false;
    this.hideSpotlight();
    
    // Give completion reward
    stateManager.dispatch({
      type: 'ADD_RESOURCE',
      payload: { resource: 'gems', amount: 500 }
    });
    
    stateManager.dispatch({
      type: 'COMPLETE_TUTORIAL'
    });
    
    logger.info('TutorialSystem', 'Tutorial completed');
    
    eventBus.emit('tutorial:completed');
    eventBus.emit('tutorial:hide-tooltip');
    
    // Show completion notification
    eventBus.emit('notification:show', {
      type: 'success',
      title: '🎓 Tutorial Complete!',
      message: 'You earned 500 gems!',
      duration: 7000
    });
  }
  
  /**
   * Replay tutorial
   */
  replay() {
    stateManager.dispatch({
      type: 'RESET_TUTORIAL'
    });
    
    this.start();
  }
  
  /**
   * Get tutorial progress
   */
  getProgress() {
    return {
      currentStep: this.currentStep,
      totalSteps: this.steps.length,
      percentage: (this.currentStep / this.steps.length) * 100,
      active: this.active
    };
  }
}

// Singleton
const tutorialSystem = new TutorialSystem();

export default tutorialSystem;