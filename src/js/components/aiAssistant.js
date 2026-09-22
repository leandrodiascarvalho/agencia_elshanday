import { BaseModal } from './baseModal.js';
import { ApiClient } from '../services/apiClient.js';
import { audio } from '../services/audio.js';
import { escapeHtml } from '../utils/dom.js';

/**
 * AI Assistant Modal Component
 * Connects user with neural assistant with automatic speech bubbles and sound effects.
 */
export class AiAssistantModal extends BaseModal {
  constructor(container) {
    super(container, {
      title: 'NPC // AGENTE IA',
      badge: true,
      maxWidth: 'max-w-lg',
      borderColor: 'border-[#00ff66]',
    });
  }

  renderContent() {
    return `
      <div class="flex flex-col h-[400px]">
        <div id="ai-messages" class="flex-1 overflow-y-auto space-y-3 pr-2 font-['VT323'] text-xl" aria-live="polite">
          <div class="bg-[#081208] border-2 border-[#00ff66]/40 p-3 text-[#00ff66]">
            <span class="text-[#ffee00] font-bold">[EL SHANDAY CORE]:</span> Saudações, Player 1! Sou o assistente neural retro. Em que posso te ajudar hoje? (Projetos, orçamentos, tecnologias, prazos)
          </div>
        </div>

        <form id="ai-form" class="mt-4 flex gap-2" onsubmit="return false;">
          <input
            type="text"
            id="ai-input"
            aria-label="Mensagem para o assistente IA"
            placeholder="Digite sua mensagem..."
            class="flex-1 bg-black border-2 border-[#00ff66] p-2.5 text-[#00ff66] font-['VT323'] text-xl outline-none focus:border-[#ffee00]"
            required
          />
          <button type="submit" id="btn-send-ai" class="pixel-btn pixel-btn--primary py-2 px-4 text-[9px]">
            ENVIAR
          </button>
        </form>
      </div>
    `;
  }

  onMount() {
    const input = this.container.querySelector('#ai-input');
    const form = this.container.querySelector('#ai-form');
    const messages = this.container.querySelector('#ai-messages');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageText = input.value.trim();
      if (!messageText) return;

      input.value = '';
      audio.playCoin();
      this.appendMessage(messages, messageText, true);

      const loadingElement = document.createElement('div');
      loadingElement.className = 'text-base text-slate-400 italic';
      loadingElement.textContent = 'Processando resposta na rede neural...';
      messages.appendChild(loadingElement);

      try {
        const response = await ApiClient.post('/api/chat', { message: messageText });
        loadingElement.remove();
        audio.playCoin();
        this.appendMessage(messages, response.reply || 'Transmissão concluída.');
      } catch (error) {
        loadingElement.remove();
        this.appendMessage(messages, error.message || 'Conexão neural instável.');
      }
    });
  }

  appendMessage(container, text, isUser = false) {
    const msgElement = document.createElement('div');
    msgElement.className = isUser
      ? 'bg-[#152015] border-2 border-[#ffee00] p-3 text-[#ffee00] ml-6'
      : 'bg-[#081208] border-2 border-[#00ff66]/40 p-3 text-[#00ff66] mr-6';

    const authorTag = isUser ? 'VOCÊ' : 'EL SHANDAY';
    const authorColor = isUser ? 'text-[#ffee00]' : 'text-[#00f0ff]';

    msgElement.innerHTML = `<span class="${authorColor} font-bold">[${authorTag}]</span>: ${escapeHtml(text)}`;
    container.appendChild(msgElement);
    container.scrollTop = container.scrollHeight;
  }
}
