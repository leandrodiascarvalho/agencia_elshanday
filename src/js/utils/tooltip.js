import { state } from '../core/state.js';

/**
 * CyberTooltip
 * Custom cyberpunk tooltip system featuring pixelated borders, neon reactive glows,
 * and live audio telemetry feedback for #sound-toggle-btn.
 */
export class CyberTooltip {
  constructor() {
    this.tooltip = null;
    this.target = null;
    this.isVisible = false;
  }

  init() {
    this.initSoundTooltip();
  }

  /**
   * Initializes custom cyberpunk tooltip specifically bound to #sound-toggle-btn
   */
  initSoundTooltip() {
    const btn =
      document.getElementById('sound-toggle-btn') || document.getElementById('btn-audio-toggle');
    if (!btn) return;

    // Remove default OS browser tooltip to prevent double/overlapping tooltips
    btn.removeAttribute('title');
    btn.setAttribute('aria-describedby', 'sound-tooltip');

    this.target = btn;
    this.tooltip = document.getElementById('sound-tooltip');

    if (!this.tooltip) {
      this.createSoundTooltipElement();
    }

    // Set initial audio telemetry state
    this.updateSoundTooltipState();

    // Mouse interactions
    btn.addEventListener('mouseenter', () => this.showSoundTooltip());
    btn.addEventListener('mouseleave', () => this.hideSoundTooltip());

    // Keyboard accessibility focus interactions
    btn.addEventListener('focus', () => this.showSoundTooltip());
    btn.addEventListener('blur', () => this.hideSoundTooltip());

    // Reactive listener for audio state toggles across any interaction (clicks, keyboard, CLI)
    window.addEventListener('app:sound-toggle', () => {
      this.updateSoundTooltipState();
    });
  }

  /**
   * Updates tooltip visual styles (pixel borders, neon colors, action badges) based on state.soundEnabled
   */
  updateSoundTooltipState() {
    if (!this.tooltip) {
      this.tooltip = document.getElementById('sound-tooltip');
    }
    if (!this.tooltip) return;

    const isEnabled = Boolean(state.soundEnabled);
    const statusText = this.tooltip.querySelector('#sound-tooltip-status-text');
    const indicator = this.tooltip.querySelector('#sound-tooltip-indicator');
    const action = this.tooltip.querySelector('#sound-tooltip-action');
    const sub = this.tooltip.querySelector('#sound-tooltip-sub');

    if (isEnabled) {
      this.tooltip.classList.remove('cyber-tooltip-off');
      this.tooltip.classList.add('cyber-tooltip-on');

      if (statusText) {
        statusText.innerHTML =
          'STATUS: <span class="text-[#00ff66] font-bold tracking-wider">ATIVADO [ON]</span>';
      }
      if (indicator) {
        indicator.classList.remove('bg-[#ff007f]');
        indicator.classList.add('bg-[#00ff66]');
      }
      if (action) {
        action.textContent = '[CLIQUE P/ MUTAR]';
        action.classList.remove('text-[#ff007f]');
        action.classList.add('text-[#ffee00]');
      }
      if (sub) {
        sub.textContent = 'DISPOSITIVO: ALTO-FALANTES';
      }
    } else {
      this.tooltip.classList.remove('cyber-tooltip-on');
      this.tooltip.classList.add('cyber-tooltip-off');

      if (statusText) {
        statusText.innerHTML =
          'STATUS: <span class="text-[#ff007f] font-bold tracking-wider">SILENCIADO [OFF]</span>';
      }
      if (indicator) {
        indicator.classList.remove('bg-[#00ff66]');
        indicator.classList.add('bg-[#ff007f]');
      }
      if (action) {
        action.textContent = '[CLIQUE P/ ATIVAR]';
        action.classList.remove('text-[#ffee00]');
        action.classList.add('text-[#00ff66]');
      }
      if (sub) {
        sub.textContent = 'CANAL DE ÁUDIO SUSPENSO';
      }
    }
  }

  showSoundTooltip() {
    this.updateSoundTooltipState();
    if (this.tooltip) {
      this.tooltip.classList.add('is-visible');
      this.tooltip.setAttribute('aria-hidden', 'false');
      this.isVisible = true;
    }
  }

  hideSoundTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('is-visible');
      this.tooltip.setAttribute('aria-hidden', 'true');
      this.isVisible = false;
    }
  }

  createSoundTooltipElement() {
    const container =
      document.getElementById('sound-toggle-container') ||
      (this.target ? this.target.parentElement : null);
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'sound-tooltip';
    wrapper.className = 'cyber-tooltip cyber-tooltip-on';
    wrapper.setAttribute('role', 'tooltip');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = `
      <div class="cyber-tooltip-notch"></div>
      <div class="cyber-tooltip-header">
        <span class="cyber-tooltip-tag">[AUDIO_DSP // TELEMETRIA]</span>
        <span class="cyber-tooltip-chip">8-BIT DSP</span>
      </div>
      <div class="cyber-tooltip-body">
        <div class="flex items-center gap-1.5">
          <span id="sound-tooltip-indicator" class="cyber-pixel-dot bg-[#00ff66]"></span>
          <span id="sound-tooltip-status-text">STATUS: <span class="text-[#00ff66] font-bold tracking-wider">ATIVADO [ON]</span></span>
        </div>
        <span id="sound-tooltip-action" class="cyber-tooltip-action-badge text-[#ffee00]">[CLIQUE P/ MUTAR]</span>
      </div>
      <div class="cyber-tooltip-footer">
        <span id="sound-tooltip-sub">DISPOSITIVO: ALTO-FALANTES</span>
        <span class="text-[#00f0ff]">44.1kHz</span>
      </div>
    `;
    container.appendChild(wrapper);
    this.tooltip = wrapper;
  }
}

export const cyberTooltip = new CyberTooltip();
