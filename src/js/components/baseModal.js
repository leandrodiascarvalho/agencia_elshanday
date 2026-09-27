import { FocusTrap } from '../utils/focusTrap.js';
import { audio } from '../services/audio.js';

/**
 * BaseModal Abstract Class (Template Method Pattern)
 * Encapsula o boilerplate de modais: backdrop, focus trap, tecla Escape e ciclo de vida.
 */
export class BaseModal {
  /**
   * @param {HTMLElement} container - Nó DOM onde o modal será montado
   * @param {Object} options
   * @param {string} options.title - Título do modal
   * @param {boolean} [options.badge] - Exibe indicador pulsante no header
   * @param {string} [options.maxWidth='max-w-lg'] - Classe Tailwind de largura máxima
   * @param {string} [options.borderColor='border-[#00ff66]'] - Classe de cor da borda
   */
  constructor(container, options = {}) {
    this.container = container;
    this.title = options.title || 'MODAL';
    this.badge = options.badge || false;
    this.maxWidth = options.maxWidth || 'max-w-lg';
    this.borderColor = options.borderColor || 'border-[#00ff66]';
    this.focusTrap = null;
    this.handleKeyDown = this.onKeyDown.bind(this);
  }

  /** Método abstrato: cada modal filho define seu próprio conteúdo interno. */
  renderContent() {
    throw new Error('BaseModal.renderContent() deve ser implementado pela classe filha.');
  }

  /** Hook opcional, chamado após o modal ser montado no DOM. */
  onMount() {}

  /** Hook opcional, chamado antes do modal ser destruído. */
  onDestroy() {}

  mount() {
    this.destroy({ silent: true }); // garante estado limpo se mount() for chamado mais de uma vez

    this.container.innerHTML = this.renderShell();

    this.focusTrap = new FocusTrap(this.container);
    this.focusTrap.activate();

    window.addEventListener('keydown', this.handleKeyDown);

    this.container
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.destroy());

    this.container.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.destroy();
    });

    this.onMount();
  }

  renderShell() {
    const badgeMarkup = this.badge
      ? `<span class="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-ping" aria-hidden="true"></span>`
      : '';

    return `
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        <div class="pixel-panel w-full ${this.maxWidth} bg-[#050811] p-6 border-4 ${this.borderColor} text-slate-200 font-mono flex flex-col shadow-[8px_8px_0px_#000]">
          <header class="flex justify-between items-center border-b-2 border-current/40 pb-3 mb-4 font-['Press_Start_2P']">
            <div class="flex items-center gap-2">
              ${badgeMarkup}
              <h2 id="modal-heading" class="text-xs font-bold text-[#ffee00]">${this.title}</h2>
            </div>
            <button id="modal-close-btn" class="text-slate-400 hover:text-[#ff3344] text-[10px] cursor-pointer" aria-label="Fechar modal">[ESC] X</button>
          </header>
          <div class="modal-body flex-1 overflow-y-auto">
            ${this.renderContent()}
          </div>
        </div>
      </div>
    `;
  }

  onKeyDown(e) {
    if (e.key === 'Escape') this.destroy();
  }

  destroy({ silent = false } = {}) {
    if (!silent) audio.playCoin();
    this.onDestroy();

    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    this.container.innerHTML = '';
  }
}