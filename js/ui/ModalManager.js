/**
 * ModalManager - Handles modal display and interaction
 */

import eventBus from '../utils/EventBus.js';
import logger from '../utils/Logger.js';

class ModalManager {
  constructor() {
    this.modals = document.querySelectorAll('.modal');
    this.activeModal = null;
    
    this.init();
    
    logger.info('ModalManager', 'Initialized');
  }
  
  init() {
    // Bind close buttons
    this.modals.forEach(modal => {
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hide(modal.id);
        });
      }
      
      if (overlay) {
        overlay.addEventListener('click', () => {
          this.hide(modal.id);
        });
      }
    });
    
    // Listen for modal events
    eventBus.on('modal:show', (data) => {
      this.show(data.modalId);
    });
    
    eventBus.on('modal:hide', (data) => {
      this.hide(data.modalId);
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.hide(this.activeModal);
      }
    });
  }
  
  show(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      logger.warn('ModalManager', `Modal ${modalId} not found`);
      return;
    }
    
    // Hide current modal if any
    if (this.activeModal && this.activeModal !== modalId) {
      this.hide(this.activeModal);
    }
    
    modal.classList.add('active');
    this.activeModal = modalId;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    logger.debug('ModalManager', `Showing modal: ${modalId}`);
    
    eventBus.emit('modal:shown', { modalId });
  }
  
  hide(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    
    if (this.activeModal === modalId) {
      this.activeModal = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    logger.debug('ModalManager', `Hiding modal: ${modalId}`);
    
    eventBus.emit('modal:hidden', { modalId });
  }
  
  hideAll() {
    this.modals.forEach(modal => {
      modal.classList.remove('active');
    });
    this.activeModal = null;
    document.body.style.overflow = '';
  }
  
  isActive(modalId) {
    return this.activeModal === modalId;
  }
}

export default ModalManager;