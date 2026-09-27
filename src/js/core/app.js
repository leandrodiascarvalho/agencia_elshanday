import { state, setState } from './state.js';
import { APP_THEMES } from './constants.js';
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
    this.bindGlobalEvents();
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

    // Apply active theme using APP_THEMES from constants (single source of truth)
    // SCSS uses html.amber, html.synthwave, html.light class selectors
    const applyTheme = (themeId) => {
      // Remove all theme classes first
      APP_THEMES.forEach((t) => htmlEl.classList.remove(t.id));
      // Apply new theme class (pixel-green is the default, no class needed)
      if (themeId !== 'pixel-green') {
        htmlEl.classList.add(themeId);
      }
      const labelEl = document.getElementById('current-theme-label');
      const found = APP_THEMES.find((t) => t.id === themeId);
      if (labelEl && found) {
        labelEl.textContent = found.label;
      }
    };

    applyTheme(state.theme || 'pixel-green');

    const themeBtn = document.getElementById('theme-cycle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentIdx = APP_THEMES.findIndex((t) => t.id === (state.theme || 'pixel-green'));
        const nextTheme = APP_THEMES[(currentIdx + 1) % APP_THEMES.length];
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
    // Bind header nav buttons, footer links, and logo
    const tabs = document.querySelectorAll('.header-nav-btn[data-tab], .footer-tab-link[data-tab], #header-logo-btn[data-tab]');
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

  async navigateTo(tab, updateHash = true) {
    audio.cyberClick();
    setState({ currentTab: tab });

    if (updateHash && window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }

    // Update active tab UI
    document.querySelectorAll('.header-nav-btn[data-tab]').forEach((t) => {
      const match = t.getAttribute('data-tab') === tab;
      if (match) {
        t.classList.add('bg-[#00ff66]', 'text-[#050805]', 'font-bold', 'border-[#00ff66]');
        t.classList.remove('bg-transparent', 'text-[#00ff66]', 'border-transparent', 'hover:text-[#ffee00]');
      } else {
        t.classList.remove('bg-[#00ff66]', 'text-[#050805]', 'font-bold');
        t.classList.add('bg-transparent', 'text-[#00ff66]', 'border-transparent', 'hover:text-[#ffee00]');
      }
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
        this.currentViewCleanup = await renderServices(
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
    // Sound/Audio Toggle (matches #sound-toggle-btn in index.html)
    const audioBtn = document.getElementById('sound-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const next = !state.soundEnabled;
        setState({ soundEnabled: next });
        if (next) audio.play1Up();
      });
    }

    // AI Chat Modal (matches #fab-ai-assistant-btn in index.html)
    const aiBtn = document.getElementById('fab-ai-assistant-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        audio.cyberClick();
        new AiAssistantModal(this.modalContainer).mount();
      });
    }

    // Terminal Modal (matches #fab-terminal-btn in index.html)
    const termBtn = document.getElementById('fab-terminal-btn');
    if (termBtn) {
      termBtn.addEventListener('click', () => {
        audio.cyberClick();
        new CyberTerminal(this.modalContainer).mount();
      });
    }

    // Search Command Palette (matches #open-search-btn and #open-search-btn-mobile in index.html)
    const searchBtns = document.querySelectorAll('#open-search-btn, #open-search-btn-mobile');
    searchBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        audio.cyberClick();
        new CommandSearchModal(this.modalContainer, (t) => (window.location.hash = t)).mount();
      });
    });

    // WhatsApp Scheduler Modal (matches #fab-whatsapp-btn, #footer-whatsapp-btn in index.html)
    const waBtns = document.querySelectorAll('#fab-whatsapp-btn, #footer-whatsapp-btn');
    waBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        audio.cyberClick();
        new WhatsappSchedulerModal(this.modalContainer).mount();
      });
    });

    // Header CTA buttons (START_PROJECT)
    const ctaBtns = document.querySelectorAll('#header-cta-btn, #header-cta-btn-mobile');
    ctaBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        audio.cyberClick();
        window.location.hash = 'briefing';
      });
    });
  }

  bindGlobalEvents() {
    // Listen for custom events dispatched by views
    window.addEventListener('app:open-whatsapp', () => {
      audio.cyberClick();
      new WhatsappSchedulerModal(this.modalContainer).mount();
    });

    window.addEventListener('app:open-game', () => {
      audio.cyberClick();
      new CyberDodgerGame(this.modalContainer).mount();
    });

    window.addEventListener('app:open-doom', () => {
      audio.cyberClick();
      new DoomRaycaster(this.modalContainer).mount();
    });

    window.addEventListener('app:open-terminal', () => {
      audio.cyberClick();
      new CyberTerminal(this.modalContainer).mount();
    });

    window.addEventListener('app:open-ai', () => {
      audio.cyberClick();
      new AiAssistantModal(this.modalContainer).mount();
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + K for Command Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        audio.cyberClick();
        new CommandSearchModal(this.modalContainer, (t) => (window.location.hash = t)).mount();
      }
      // Esc to clear modals
      if (e.key === 'Escape' && this.modalContainer) {
        this.modalContainer.innerHTML = '';
      }
    });
  }
}
