// Retro Cyberpunk Typewriter Animation Engine
import { audio } from '../services/audio.js';

export class Typewriter {
  constructor(elementOrSelector, phrases, options = {}) {
    this.element =
      typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;
    this.phrases = phrases || [];
    this.options = {
      typeSpeed: options.typeSpeed || 75,
      deleteSpeed: options.deleteSpeed || 40,
      pauseDelay: options.pauseDelay || 2000,
      loop: options.loop !== undefined ? options.loop : true,
      soundEnabled: options.soundEnabled !== undefined ? options.soundEnabled : true,
      ...options,
    };

    this.phraseIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.timeoutId = null;
    this.isActive = false;

    if (this.element && this.phrases.length > 0) {
      this.start();
    }
  }

  start() {
    this.isActive = true;
    this.tick();
  }

  stop() {
    this.isActive = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  tick() {
    if (!this.isActive || !this.element) return;

    const currentPhrase = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
      if (this.options.soundEnabled) {
        audio.play('terminal_beep');
      }
    }

    const textToDisplay = currentPhrase.substring(0, this.charIndex);
    this.element.textContent = textToDisplay;

    let delay = this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed;

    if (!this.isDeleting && this.charIndex === currentPhrase.length) {
      // Completed phrase, pause
      delay = this.options.pauseDelay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      // Deleted phrase, move to next
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      delay = 400;
    }

    this.timeoutId = setTimeout(() => this.tick(), delay);
  }
}
