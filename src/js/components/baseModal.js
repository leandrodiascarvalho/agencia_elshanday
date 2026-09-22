import { FocusTrap } from '../utils/focusTrap.js';
import { audio } from '../services/audio.js';

/**
 * BaseModal Abstract Class (Template Method & Clean Architecture)
 * Encapsulates modal dialog boilerplate: backdrop, focus trap, Escape key handling, and lifecycle.
 */
export class BaseModal {
  /**
   * @param {HTMLElement} container - DOM node where the modal will mount
   * @param {Object} options
   * @param {string} options.title - Dialog title
   * @param {string} [options.badge] - Optional badge in header
   * @param {string} [options.maxWidth='max-w-lg'] - Tailwind max width class
   * @param {string} [options.borderColor='border-[#00ff66]'] - Border style
   */
  constructor(container, options = {}) {
    this.container = container;
    this.title = options.title || 'MODAL';
    this.badge = options.badge || '';
    this.maxWidth = options.maxWidth || 'max-w-lg';
    this.borderColor = options.borderColor || 'border-[#00ff66]';
    this.focusTrap = null;
    this.handleKeyDown = this.onKeyDown.bind(this);
  }

  /**
   * Abstract method to be implemented by child classes to return inner HTML content.
   * @returns {string}
   */
  renderContent() {
    throw new Error('BaseModal.renderContent() deve ser implementado pela classe filha.');
  }

  /**
   * Optional lifecycle hook called immediately after modal elements are mounted in the DOM.
   */
  onMount() {}

  /**
   * Optional lifecycle hook called before modal is destroyed.
   */
  onDestroy() {}

  mount() {
    this.container.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        <div class="pixel-panel w-full ${this.maxWidth} bg-[#050811] p-6 border-4 ${this.borderColor} text-slate-200 font-mono flex flex-col shadow-[8px_8px_0px_#000]">
          <header class="flex justify-between items-center border-b-2 border-current/40 pb-3 mb-4 font-['Press_Start_2P']">
            <div class="flex items-center gap-2">
              ${this.badge ? `<span class="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-ping" aria-hidden="true"></span>` : ''}
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

    this.focusTrap = new FocusTrap(this.container);
    this.focusTrap.activate();

    window.addEventListener('keydown', this.handleKeyDown);

    const closeBtn = this.container.querySelector('#modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.destroy());
    }

    const backdrop = this.container.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.destroy();
        }
      });
    }

    this.onMount();
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.destroy();
    }
  }

  destroy() {
    audio.playCoin();
    this.onDestroy();

    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    this.container.innerHTML = '';
  }
}
