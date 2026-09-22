import { state } from '../core/state.js';

class RetroAudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isUnlocked = false;
  }

  init() {
    if (this.ctx || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Master volume limit
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (err) {
      console.warn('[AudioContext Warning]: Web Audio indisponível no navegador.', err);
    }
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      });
    } else {
      this.isUnlocked = true;
    }
  }

  // 8-Bit Coin Pickup Sound (Classic Mario / Arcade style)
  playCoin() {
    if (!state.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      /* ignore audio glitch */
    }
  }

  // 8-Bit Jump Sound
  playJump() {
    if (!state.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      /* ignore */
    }
  }

  cyberClick() {
    this.playCoin();
  }

  // 8-Bit Laser Blast
  cyberLaser() {
    if (!state.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      /* ignore */
    }
  }

  // Generic play adapter for backwards compatibility and clean unified API
  play(name = 'click') {
    switch (name) {
      case 'coin':
      case 'powerup':
        this.play1Up();
        break;
      case 'jump':
      case 'modalOpen':
        this.playJump();
        break;
      case 'laser':
        this.cyberLaser();
        break;
      case 'terminal_beep':
      case 'terminalKey':
      case 'click':
      default:
        this.cyberClick();
        break;
    }
  }

  terminalKey() {
    this.cyberClick();
  }

  modalOpen() {
    this.playJump();
  }
}

export const audio = new RetroAudioManager();
export const sound = audio;
