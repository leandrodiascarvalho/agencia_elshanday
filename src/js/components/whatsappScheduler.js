import { BaseModal } from './baseModal.js';
import { audio } from '../services/audio.js';
import { CONTACT_INFO } from '../core/constants.js';

/**
 * WhatsappSchedulerModal Component
 * Facilitates direct project briefing dispatch to WhatsApp.
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
    return `
      <form id="wa-form" class="space-y-4 font-['VT323'] text-xl" onsubmit="return false;">
        <div>
          <label for="wa-name" class="block text-[#ffee00] text-sm mb-1">Seu Nome / Player</label>
          <input
            type="text"
            id="wa-name"
            required
            placeholder="Ex: Leandro Carvalho"
            class="w-full bg-black border-2 border-[#00ff66] p-2.5 text-[#00ff66] outline-none focus:border-[#ffee00]"
          />
        </div>
        <div>
          <label for="wa-project" class="block text-[#ffee00] text-sm mb-1">Tipo de Missão / Projeto</label>
          <select id="wa-project" class="w-full bg-black border-2 border-[#00ff66] p-2.5 text-[#00ff66] outline-none">
            <option value="Landing Page Retro 8-bit">Landing Page Retro 8-bit</option>
            <option value="Aplicação Web SPA Fullstack">Aplicação Web SPA Fullstack</option>
            <option value="Experiência 3D / WebGL / Canvas">Experiência 3D / WebGL / Canvas</option>
            <option value="Integração IA / Chatbot / Automações">Integração IA / Chatbot / Automações</option>
          </select>
        </div>
        <button type="submit" id="btn-send-whatsapp" class="pixel-btn pixel-btn--primary w-full py-3 text-center text-xs mt-2">
          ▶ ABRIR CONVERSA NO WHATSAPP
        </button>
      </form>
    `;
  }

  onMount() {
    const form = this.container.querySelector('#wa-form');
    const nameInput = this.container.querySelector('#wa-name');
    const projectSelect = this.container.querySelector('#wa-project');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      audio.play1Up();

      const name = nameInput.value.trim() || 'Cliente';
      const project = projectSelect.value;
      const message = `Olá! Me chamo ${name}. Gostaria de solicitar um orçamento para o projeto: ${project} com a Agência El Shanday.`;
      const url = `https://wa.me/${CONTACT_INFO.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(url, '_blank');
      this.destroy();
    });
  }
}
