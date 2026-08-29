import { state, setState } from './state.js';
import { audio } from './audio.js';
import { CyberspaceParticles } from './cyberspaceParticles.js';
import { CyberTerminal } from './terminal.js';
import { AiAssistantModal } from './aiAssistant.js';
import { CommandSearchModal } from './search.js';
import { WhatsappSchedulerModal } from './whatsappScheduler.js';
import { CyberDodgerGame } from './game.js';
import { DoomRaycaster } from './doom.js';

// Views
import { renderHome } from './views/home.js';
import { renderServices } from './views/services.js';
import { renderPortfolio } from './views/portfolio.js';
import { renderBriefing } from './views/briefing.js';
import { renderFaq } from './views/faq.js';
import { renderConsole } from './views/console.js';

export class App {
  constructor() {
    this.mainContent = document.getElementById('app-main-content');
    this.modalContainer = document.getElementById('modal-container');
    this.particles = null;
  }

  init() {
    this.initBackgroundParticles();
    this.bindGlobalNavigation();
    this.bindActionButtons();
    this.bindKeyboardShortcuts();
    this.navigateTo('home');
  }

  initBackgroundParticles() {
    const canvas = document.getElementById('cyberspace-canvas');
    if (canvas) {
      this.particles = new CyberspaceParticles(canvas);
      this.particles.start();
    }
  }

  bindGlobalNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        this.navigateTo(target);
      });
    });
  }

  navigateTo(tab) {
    audio.cyberClick();
    setState({ currentTab: tab });

    // Update active tab UI
    document.querySelectorAll('.nav-tab').forEach(t => {
      const match = t.getAttribute('data-tab') === tab;
      t.className = match
        ? 'nav-tab active px-4 py-1.5 rounded transition text-[#00f3ff] bg-[#00f3ff]/10'
        : 'nav-tab px-4 py-1.5 rounded transition text-slate-400 hover:text-[#00f3ff]';
    });

    if (!this.mainContent) return;

    switch (tab) {
      case 'home':
        renderHome(this.mainContent, (t) => this.navigateTo(t));
        break;
      case 'services':
        renderServices(this.mainContent, (t) => this.navigateTo(t));
        break;
      case 'portfolio':
        renderPortfolio(this.mainContent);
        break;
      case 'briefing':
        renderBriefing(this.mainContent);
        break;
      case 'faq':
        renderFaq(this.mainContent);
        break;
      case 'console':
        renderConsole(this.mainContent);
        break;
      default:
        renderHome(this.mainContent, (t) => this.navigateTo(t));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindActionButtons() {
    // Audio Toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        audioBtn.textContent = `AUDIO: [${state.soundEnabled ? 'ON' : 'OFF'}]`;
        if (state.soundEnabled) audio.cyberLaser();
      });
    }

    // AI Chat Modal
    const aiBtn = document.getElementById('btn-ai-chat');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        audio.cyberClick();
        new AiAssistantModal(this.modalContainer).mount();
      });
    }

    // Terminal Modal
    const termBtn = document.getElementById('btn-terminal');
    if (termBtn) {
      termBtn.addEventListener('click', () => {
        audio.cyberClick();
        new CyberTerminal(this.modalContainer).mount();
      });
    }

    // Search Command Palette
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        audio.cyberClick();
        new CommandSearchModal(this.modalContainer, (t) => this.navigateTo(t)).mount();
      });
    }

    // Minigame Dodger
    const gameBtn = document.getElementById('btn-open-game');
    if (gameBtn) {
      gameBtn.addEventListener('click', () => {
        audio.cyberClick();
        new CyberDodgerGame(this.modalContainer).mount();
      });
    }

    // Minigame Doom
    const doomBtn = document.getElementById('btn-open-doom');
    if (doomBtn) {
      doomBtn.addEventListener('click', () => {
        audio.cyberClick();
        new DoomRaycaster(this.modalContainer).mount();
      });
    }
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + K for Command Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        audio.cyberClick();
        new CommandSearchModal(this.modalContainer, (t) => this.navigateTo(t)).mount();
      }
      // Esc to clear modals
      if (e.key === 'Escape') {
        this.modalContainer.innerHTML = '';
      }
    });
  }
}
