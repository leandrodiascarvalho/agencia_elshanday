import { state, setState } from './state.js';
import { audio } from '../services/audio.js';
import { CyberspaceParticles } from '../effects/cyberspaceParticles.js';
import { CyberTerminal } from '../components/terminal.js';
import { AiAssistantModal } from '../components/aiAssistant.js';
import { CommandSearchModal } from '../components/search.js';
import { WhatsappSchedulerModal } from '../components/whatsappScheduler.js';
import { CyberDodgerGame } from '../games/game.js';
import { DoomRaycaster } from '../games/doom.js';

// Views
import { renderHome } from '../views/home.js';
import { renderServices } from '../views/services.js';
import { renderPortfolio } from '../views/portfolio.js';
import { renderBriefing } from '../views/briefing.js';
import { renderFaq } from '../views/faq.js';
import { renderConsole } from '../views/console.js';

export class App {
  constructor() {
    this.mainContent = document.getElementById('app-main-content');
    this.modalContainer = document.getElementById('modal-container');
    this.particles = null;
    this.currentViewCleanup = null;
  }

  init() {
    this.initBackgroundParticles();
    this.initThemeAndCrt();
    this.bindGlobalNavigation();
    this.bindActionButtons();
    this.bindKeyboardShortcuts();
    this.initRouter();
  }

  initBackgroundParticles() {
    const canvas = document.getElementById('cyberspace-canvas');
    if (canvas) {
      this.particles = new CyberspaceParticles(canvas);
      this.particles.start();
    }
  }

  initThemeAndCrt() {
    const htmlEl = document.documentElement;

    // Apply active theme
    const themes = [
      { id: 'pixel-green', label: '8-Bit Green' },
      { id: 'amber', label: 'Amber Phosphor' },
      { id: 'cyberpunk', label: 'Cyberpunk Neon' },
      { id: 'matrix', label: 'Matrix Rain' },
    ];

    const applyTheme = (themeId) => {
      if (themeId === 'pixel-green') {
        htmlEl.removeAttribute('data-theme');
      } else {
        htmlEl.setAttribute('data-theme', themeId);
      }
      const labelEl = document.getElementById('current-theme-label');
      const found = themes.find((t) => t.id === themeId);
      if (labelEl && found) {
        labelEl.textContent = found.label;
      }
    };

    applyTheme(state.theme || 'pixel-green');

    const themeBtn = document.getElementById('theme-cycle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentIdx = themes.findIndex((t) => t.id === (state.theme || 'pixel-green'));
        const nextTheme = themes[(currentIdx + 1) % themes.length];
        setState({ theme: nextTheme.id });
        applyTheme(nextTheme.id);
        audio.playCoin();
      });
    }

    // CRT Scanlines state application
    if (state.crtEnabled) {
      htmlEl.classList.add('scanlines');
    } else {
      htmlEl.classList.remove('scanlines');
    }

    const crtBtn = document.getElementById('crt-toggle-btn');
    if (crtBtn) {
      crtBtn.textContent = `[CRT: ${state.crtEnabled ? 'ON' : 'OFF'}]`;
      crtBtn.addEventListener('click', () => {
        const next = !state.crtEnabled;
        setState({ crtEnabled: next });
        htmlEl.classList.toggle('scanlines', next);
        crtBtn.textContent = `[CRT: ${next ? 'ON' : 'OFF'}]`;
        audio.playCoin();
      });
    }

    // Audio status button sync
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.textContent = `🔊 AUDIO: [${state.soundEnabled ? 'ON' : 'OFF'}]`;
    }
  }

  initRouter() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim() || 'home';
      this.navigateTo(hash, false);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  bindGlobalNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.getAttribute('data-tab');
        if (target) {
          window.location.hash = target;
        }
      });
    });
  }

  navigateTo(tab, updateHash = true) {
    audio.cyberClick();
    setState({ currentTab: tab });

    if (updateHash && window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }

    // Update active tab UI
    document.querySelectorAll('.nav-tab').forEach((t) => {
      const match = t.getAttribute('data-tab') === tab;
      t.className = match
        ? 'nav-tab active px-3 py-1.5 transition text-[#050805] bg-[#00ff66] font-bold cursor-pointer'
        : 'nav-tab px-3 py-1.5 transition text-slate-400 hover:text-[#ffee00] cursor-pointer';
    });

    if (!this.mainContent) return;

    // Cleanup previous view if needed
    if (typeof this.currentViewCleanup === 'function') {
      this.currentViewCleanup();
      this.currentViewCleanup = null;
    }

    switch (tab) {
      case 'home':
        this.currentViewCleanup = renderHome(this.mainContent, (t) => (window.location.hash = t));
        break;
      case 'services':
        this.currentViewCleanup = renderServices(
          this.mainContent,
          (t) => (window.location.hash = t)
        );
        break;
      case 'portfolio':
        this.currentViewCleanup = renderPortfolio(this.mainContent);
        break;
      case 'briefing':
        this.currentViewCleanup = renderBriefing(this.mainContent);
        break;
      case 'faq':
        this.currentViewCleanup = renderFaq(this.mainContent);
        break;
      case 'console':
        this.currentViewCleanup = renderConsole(this.mainContent);
        break;
      default:
        this.currentViewCleanup = renderHome(this.mainContent, (t) => (window.location.hash = t));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindActionButtons() {
    // Audio Toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const next = !state.soundEnabled;
        setState({ soundEnabled: next });
        audioBtn.textContent = `🔊 AUDIO: [${next ? 'ON' : 'OFF'}]`;
        if (next) audio.play1Up();
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
        new CommandSearchModal(this.modalContainer, (t) => (window.location.hash = t)).mount();
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

    // WhatsApp Scheduler Modal trigger
    const waBtn = document.getElementById('btn-whatsapp');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        audio.cyberClick();
        new WhatsappSchedulerModal(this.modalContainer).mount();
      });
    }
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + K for Command Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        audio.cyberClick();
        new CommandSearchModal(this.modalContainer, (t) => (window.location.hash = t)).mount();
      }
      // Esc to clear modals if click outside
      if (e.key === 'Escape' && this.modalContainer) {
        this.modalContainer.innerHTML = '';
      }
    });
  }
}
