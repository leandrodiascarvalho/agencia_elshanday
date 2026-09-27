import { BaseModal } from './baseModal.js';
import { audio } from '../services/audio.js';

const NAVIGATION_ITEMS = [
  { tab: 'home', icon: '🏠', label: 'HOME // INÍCIO', shortcut: 'TAB 1' },
  { tab: 'services', icon: '⚡', label: 'SERVIÇOS RETRO', shortcut: 'TAB 2' },
  { tab: 'portfolio', icon: '📁', label: 'PORTFÓLIO & CARTRIDGES', shortcut: 'TAB 3' },
  { tab: 'briefing', icon: '📝', label: 'BRIEFING & COIN ESTIMATOR', shortcut: 'TAB 4' },
  { tab: 'faq', icon: '❓', label: 'GAME MANUAL // FAQ', shortcut: 'TAB 5' },
  { tab: 'console', icon: '📊', label: 'CONSOLE & TELEMETRIA', shortcut: 'TAB 6' },
];

/**
 * CommandSearchModal Component
 * Command Palette (Ctrl+K) para navegação rápida entre views.
 * Suporta navegação completa por teclado: ArrowUp/ArrowDown entre itens,
 * Enter/Espaço para selecionar, Escape para limpar busca ou fechar.
 */
export class CommandSearchModal extends BaseModal {
  constructor(container, onNavigate) {
    super(container, {
      title: 'COMMAND_PALETTE // QUICK NAVIGATION',
      maxWidth: 'max-w-xl',
      borderColor: 'border-[#00f0ff]',
    });
    this.onNavigate = onNavigate;
  }

  renderContent() {
    const itemsMarkup = NAVIGATION_ITEMS.map(
      (item) => `
        <div
          data-tab="${item.tab}"
          data-label="${item.icon} ${item.label}"
          role="option"
          tabindex="0"
          class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors"
        >
          <span>${item.icon} ${item.label}</span>
          <span class="text-[#00f0ff]">[${item.shortcut}]</span>
        </div>
      `
    ).join('');

    return `
      <div>
        <input
          type="text"
          id="cmd-search-input"
          aria-label="Buscar páginas e comandos"
          placeholder="Digite para buscar páginas, serviços ou comandos..."
          class="w-full bg-black border-2 border-[#00f0ff] p-3 text-[#ffee00] outline-none font-['VT323'] text-xl mb-3"
        />
        <div id="cmd-results" class="space-y-1 font-['Press_Start_2P'] text-[9px] max-h-60 overflow-y-auto" role="listbox">
          ${itemsMarkup}
        </div>
      </div>
    `;
  }

  onMount() {
    this.inputEl = this.container.querySelector('#cmd-search-input');
    this.items = [...this.container.querySelectorAll('.search-item')];

    this.items.forEach((item) => {
      item.addEventListener('click', () => this.selectItem(item));
      item.addEventListener('keydown', (e) => this.handleItemKeyDown(e, item));
    });

    this.inputEl.addEventListener('input', () => this.filterItems());
    this.inputEl.addEventListener('keydown', (e) => this.handleInputKeyDown(e));

    this.inputEl.focus();
  }

  selectItem(item) {
    audio.playCoin();
    const tab = item.getAttribute('data-tab');
    if (tab && this.onNavigate) this.onNavigate(tab);
    this.destroy();
  }

  filterItems() {
    const query = this.inputEl.value.toLowerCase().trim();
    this.items.forEach((item) => {
      const label = item.getAttribute('data-label').toLowerCase();
      item.style.display = !query || label.includes(query) ? 'flex' : 'none';
    });
  }

  getVisibleItems() {
    return this.items.filter((item) => item.style.display !== 'none');
  }

  handleInputKeyDown(e) {
    const visibleItems = this.getVisibleItems();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (visibleItems.length > 0) visibleItems[0].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (visibleItems.length > 0) visibleItems[visibleItems.length - 1].focus();
    } else if (e.key === 'Escape' && this.inputEl.value) {
      // Escape limpa a busca primeiro; só fecha o modal se já estiver vazia
      e.stopPropagation();
      this.inputEl.value = '';
      this.filterItems();
    }
  }

  handleItemKeyDown(e, currentItem) {
    const visibleItems = this.getVisibleItems();
    const currentIndex = visibleItems.indexOf(currentItem);

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.selectItem(currentItem);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextItem = visibleItems[currentIndex + 1];
      if (nextItem) {
        nextItem.focus();
      } else {
        this.inputEl.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevItem = visibleItems[currentIndex - 1];
      if (prevItem) {
        prevItem.focus();
      } else {
        this.inputEl.focus();
      }
    }
  }
}