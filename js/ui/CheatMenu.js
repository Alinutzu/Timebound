/**
 * CheatMenu - In-game debug panel for testing
 * Only visible when CONFIG.ENABLE_CHEATS is true
 */

import resourceApi from '../api/ResourceAPI.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../utils/EventBus.js';

class CheatMenu {
  constructor() {
    this.visible = false;
    this.panel = null;
    this.resources = ['energy', 'gems', 'crystals', 'mana'];
    this.createButton();
  }

  createButton() {
    this.btn = document.createElement('button');
    this.btn.textContent = '🛠️';
    this.btn.title = 'Cheat Menu';
    Object.assign(this.btn.style, {
      position: 'fixed',
      bottom: '80px',
      right: '16px',
      zIndex: '9999',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: '2px solid #f59e0b',
      background: '#1a1a2e',
      color: '#f59e0b',
      fontSize: '20px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      transition: 'transform 0.2s'
    });
    this.btn.addEventListener('click', () => this.toggle());
    this.btn.addEventListener('mouseenter', () => { this.btn.style.transform = 'scale(1.1)'; });
    this.btn.addEventListener('mouseleave', () => { this.btn.style.transform = 'scale(1)'; });
    document.body.appendChild(this.btn);
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.visible = true;
      this.refreshValues();
      return;
    }

    this.panel = document.createElement('div');
    this.panel.id = 'cheat-menu';
    Object.assign(this.panel.style, {
      position: 'fixed',
      bottom: '140px',
      right: '16px',
      zIndex: '9998',
      background: '#1a1a2e',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '16px',
      width: '280px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
      fontFamily: 'monospace',
      color: '#e5e7eb',
      fontSize: '13px'
    });

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:16px; font-weight:bold; color:#f59e0b;">🛠️ Cheat Menu</span>
        <button id="cheat-close" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size:18px;">✕</button>
      </div>
      <div style="border-bottom:1px solid #374151; margin-bottom:12px;"></div>
    `;

    // Resource editors
    for (const res of this.resources) {
      const icons = { energy: '⚡', gems: '💎', crystals: '💠', mana: '✨' };
      html += `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="width:20px; text-align:center;">${icons[res]}</span>
          <span style="width:60px; color:#9ca3af;">${res}</span>
          <input type="number" id="cheat-val-${res}" style="flex:1; background:#111827; border:1px solid #374151; border-radius:4px; color:#e5e7eb; padding:4px 6px; font-size:12px; font-family:monospace;" value="0" />
          <button class="cheat-set" data-resource="${res}" style="background:#3b82f6; border:none; border-radius:4px; color:white; padding:4px 8px; cursor:pointer; font-size:11px;">SET</button>
          <button class="cheat-add" data-resource="${res}" style="background:#10b981; border:none; border-radius:4px; color:white; padding:4px 8px; cursor:pointer; font-size:11px;">+ADD</button>
        </div>
      `;
    }

    // Quick actions
    html += `
      <div style="border-bottom:1px solid #374151; margin:12px 0;"></div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button id="cheat-max" style="background:#f59e0b; border:none; border-radius:6px; color:#1a1a2e; padding:6px 10px; cursor:pointer; font-size:11px; font-weight:bold;">💰 MAX ALL</button>
        <button id="cheat-reset" style="background:#ef4444; border:none; border-radius:6px; color:white; padding:6px 10px; cursor:pointer; font-size:11px;">🗑️ RESET</button>
        <button id="cheat-spin" style="background:#8b5cf6; border:none; border-radius:6px; color:white; padding:6px 10px; cursor:pointer; font-size:11px;">🎡 Free Spin</button>
        <button id="cheat-save" style="background:#06b6d4; border:none; border-radius:6px; color:white; padding:6px 10px; cursor:pointer; font-size:11px;">💾 Force Save</button>
      </div>
      <div id="cheat-status" style="margin-top:8px; color:#6b7280; font-size:11px; text-align:center;"></div>
    `;

    this.panel.innerHTML = html;
    document.body.appendChild(this.panel);

    // Bind events
    document.getElementById('cheat-close').addEventListener('click', () => this.hide());

    // SET buttons
    this.panel.querySelectorAll('.cheat-set').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = btn.dataset.resource;
        const val = parseInt(document.getElementById(`cheat-val-${res}`).value) || 0;
        resourceApi.set(res, val);
        this.status(`Set ${res} = ${val.toLocaleString()}`);
      });
    });

    // ADD buttons
    this.panel.querySelectorAll('.cheat-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = btn.dataset.resource;
        const val = parseInt(document.getElementById(`cheat-val-${res}`).value) || 0;
        resourceApi.add(res, val);
        this.status(`Added ${val.toLocaleString()} ${res}`);
      });
    });

    // MAX ALL
    document.getElementById('cheat-max').addEventListener('click', () => {
      resourceApi.set('energy', 10000000);
      resourceApi.set('gems', 100000);
      resourceApi.set('crystals', 10000);
      resourceApi.set('mana', 100000);
      this.status('All resources maxed!');
      this.refreshValues();
    });

    // RESET
    document.getElementById('cheat-reset').addEventListener('click', () => {
      stateManager.dispatch({ type: 'RESET_STATE' });
      this.status('Game reset to defaults');
      this.refreshValues();
    });

    // FREE SPIN
    document.getElementById('cheat-spin').addEventListener('click', () => {
      stateManager.dispatch({
        type: 'UPDATE_MINI_GAME',
        payload: { game: 'dailySpin', data: { lastSpinDate: '' } }
      });
      this.status('Daily spin reset!');
    });

    // FORCE SAVE
    document.getElementById('cheat-save').addEventListener('click', () => {
      eventBus.emit('save:manual');
      this.status('Save triggered!');
    });

    this.visible = true;
    this.refreshValues();
  }

  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
    this.visible = false;
  }

  refreshValues() {
    if (!this.panel) return;
    for (const res of this.resources) {
      const input = document.getElementById(`cheat-val-${res}`);
      if (input) {
        input.value = Math.floor(resourceApi.get(res));
      }
    }
  }

  status(msg) {
    const el = document.getElementById('cheat-status');
    if (el) {
      el.textContent = msg;
      el.style.color = '#10b981';
      setTimeout(() => { el.style.color = '#6b7280'; }, 2000);
    }
  }
}

export default CheatMenu;
