import { BaseModal } from './baseModal.js';
import { audio } from '../services/audio.js';
import { CONTACT_INFO } from '../core/constants.js';

const PROJECT_TYPES = [
  'Landing Page Retro 8-bit',
  'Aplicação Web SPA Fullstack',
  'Experiência 3D / WebGL / Canvas',
  'Integração IA / Chatbot / Automações',
];

/**
 * WhatsappSchedulerModal Component
 * Facilita o disparo direto de briefing de projeto para o WhatsApp.
 */
export class WhatsappSchedulerModal extends BaseModal {
  constructor(container) {
    super(container, {
      title: 'AGENDAMENTO // WHATSAPP',
      maxWidth: 'max-w-md',
      borderColor: 'border-[#00ff66]',
    });
  }

  renderContent() {
    const optionsMarkup = PROJECT_TYPES.map(
      (type) => `<option value="${type}">${type}</option>`
    ).join('');

    return `
      <form id="wa-form" class="space-y-4 font-['VT323'] text-xl" onsubmit="return false;">
        <div>
          <label for="wa-name" class="block text-[#ffee00] text-sm mb-1">Seu Nome / Player</label>
          <input
            type="text"
            id="wa-name"
            required
            maxlength="60"
            placeholder="Ex: Leandro Carvalho"
            class="w-full bg-black border-2 border-[#00ff66] p-2.5 text-[#00ff66] outline-none focus:border-[#ffee00]"
          />
          <p id="wa-name-error" class="text-[#ff3344] text-sm mt-1 hidden" role="alert">Preencha seu nome para continuar.</p>
        </div>
        <div>
          <label for="wa-project" class="block text-[#ffee00] text-sm mb-1">Tipo de Missão / Projeto</label>
          <select id="wa-project" class="w-full bg-black border-2 border-[#00ff66] p-2.5 text-[#00ff66] outline-none">
            ${optionsMarkup}
          </select>
        </div>
        <button type="submit" id="btn-send-whatsapp" class="pixel-btn pixel-btn--primary w-full py-3 text-center text-xs mt-2">
          ▶ ABRIR CONVERSA NO WHATSAPP
        </button>
      </form>
    `;
  }

  onMount() {
    this.formEl = this.container.querySelector('#wa-form');
    this.nameInput = this.container.querySelector('#wa-name');
    this.projectSelect = this.container.querySelector('#wa-project');
    this.nameErrorEl = this.container.querySelector('#wa-name-error');

    this.formEl.addEventListener('submit', (e) => this.handleSubmit(e));
    this.nameInput.addEventListener('input', () => this.clearError());
  }

  handleSubmit(e) {
    e.preventDefault();

    const name = this.nameInput.value.trim();
    if (!name) {
      this.showError();
      return;
    }

    audio.play1Up();

    const project = this.projectSelect.value;
    const message = `Olá! Me chamo ${name}. Gostaria de solicitar um orçamento para o projeto: ${project} com a Agência El Shanday.`;
    const url = `https://wa.me/${CONTACT_INFO.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    this.destroy();
  }

  showError() {
    this.nameErrorEl.classList.remove('hidden');
    this.nameInput.classList.add('border-[#ff3344]');
    this.nameInput.focus();
  }

  clearError() {
    this.nameErrorEl.classList.add('hidden');
    this.nameInput.classList.remove('border-[#ff3344]');
  }
}