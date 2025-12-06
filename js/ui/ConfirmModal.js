/**
 * ConfirmModal - Custom confirmation dialog
 */

class ConfirmModal {
  constructor() {
    this.createModal();
  }
  
  createModal() {
    // Verifică dacă modalul există deja
    if (document.getElementById('confirm-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="confirm-title">⚠️ Confirm</h2>
        </div>
        <div class="modal-body">
          <p id="confirm-message"></p>
          <div class="confirm-actions">
            <button class="btn btn-danger" id="confirm-yes">Yes, I'm sure</button>
            <button class="btn btn-secondary" id="confirm-no">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('.modal-overlay').addEventListener('click', () => this.hide());
    modal.querySelector('#confirm-no').addEventListener('click', () => this.hide());
  }
  
  show({ title = 'Confirm', message = 'Are you sure? ', onConfirm = () => {}, danger = false }) {
    const modal = document.getElementById('confirm-modal');
    
    document.getElementById('confirm-title').innerHTML = danger ? '⚠️ ' + title : title;
    document. getElementById('confirm-message').textContent = message;
    
    // Remove old listener
    const yesBtn = document.getElementById('confirm-yes');
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    
    // Add new listener
    newYesBtn.addEventListener('click', () => {
      this.hide();
      onConfirm();
    });
    
    modal.classList.add('active');
  }
  
  hide() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('active');
  }
}

const confirmModal = new ConfirmModal();

export default confirmModal;