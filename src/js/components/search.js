import { BaseModal } from './baseModal.js';
import { audio } from '../services/audio.js';

/**
 * CommandSearchModal Component
 * Command Palette (Ctrl+K) for quick navigation across views.
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
    return `
      <div>
        <input
          type="text"
          id="cmd-search-input"
          aria-label="Buscar páginas e comandos"
          placeholder="Digite para buscar páginas, serviços ou comandos..."
          class="w-full bg-black border-2 border-[#00f0ff] p-3 text-[#ffee00] outline-none font-['VT323'] text-xl mb-3"
          autofocus
        />
        <div id="cmd-results" class="space-y-1 font-['Press_Start_2P'] text-[9px] max-h-60 overflow-y-auto" role="listbox">
          <div data-action="tab-home" role="option" tabindex="0" class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors">
            <span>🏠 HOME // INÍCIO</span>
            <span class="text-[#00f0ff]">[TAB 1]</span>
          </div>
          <div data-action="tab-services" role="option" tabindex="0" class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors">
            <span>⚡ SERVIÇOS RETRO</span>
            <span class="text-[#00f0ff]">[TAB 2]</span>
          </div>
          <div data-action="tab-portfolio" role="option" tabindex="0" class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors">
            <span>📁 PORTFÓLIO & CARTRIDGES</span>
            <span class="text-[#00f0ff]">[TAB 3]</span>
          </div>
          <div data-action="tab-briefing" role="option" tabindex="0" class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors">
            <span>📝 BRIEFING & COIN ESTIMATOR</span>
            <span class="text-[#00f0ff]">[TAB 4]</span>
          </div>
          <div data-action="tab-faq" role="option" tabindex="0" class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors">
            <span>❓ GAME MANUAL // FAQ</span>
            <span class="text-[#00f0ff]">[TAB 5]</span>
          </div>
          <div data-action="tab-console" role="option" tabindex="0" class="search-item p-2.5 rounded hover:bg-[#00f0ff]/20 hover:text-[#ffee00] cursor-pointer flex justify-between items-center transition-colors">
            <span>📊 CONSOLE & TELEMETRIA</span>
            <span class="text-[#00f0ff]">[TAB 6]</span>
          </div>
        </div>
      </div>
    `;
  }

  onMount() {
    const input = this.container.querySelector('#cmd-search-input');
    const items = [...this.container.querySelectorAll('.search-item')];

    items.forEach((item) => {
      const handleSelect = () => {
        audio.playCoin();
        const action = item.getAttribute('data-action');
        if (action?.startsWith('tab-')) {
          const tab = action.replace('tab-', '');
          if (this.onNavigate) this.onNavigate(tab);
        }
        this.destroy();
      };

      item.addEventListener('click', handleSelect);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = !query || text.includes(query) ? 'flex' : 'none';
      });
    });
  }
}
