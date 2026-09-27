import { BaseModal } from './baseModal.js';
import { ApiClient } from '../services/apiClient.js';
import { audio } from '../services/audio.js';
import { escapeHtml } from '../utils/dom.js';

/**
 * AI Assistant Modal Component
 * Conecta o usuário ao assistente neural, com balões automáticos e efeitos sonoros.
 */
export class AiAssistantModal extends BaseModal {
  constructor(container) {
    super(container, {
      title: 'NPC // AGENTE IA',
      badge: true,
      maxWidth: 'max-w-lg',
      borderColor: 'border-[#00ff66]',
    });

    this.isSending = false;
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
            class="flex-1 bg-black border-2 border-[#00ff66] p-2.5 text-[#00ff66] font-['VT323'] text-xl outline-none focus:border-[#ffee00] disabled:opacity-50"
            required
          />
          <button type="submit" id="btn-send-ai" class="pixel-btn pixel-btn--primary py-2 px-4 text-[9px] disabled:opacity-50 disabled:cursor-not-allowed">
            ENVIAR
          </button>
        </form>
      </div>
    `;
  }

  onMount() {
    this.inputEl = this.container.querySelector('#ai-input');
    this.formEl = this.container.querySelector('#ai-form');
    this.messagesEl = this.container.querySelector('#ai-messages');
    this.sendBtnEl = this.container.querySelector('#btn-send-ai');

    this.formEl.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.isSending) return;

    const messageText = this.inputEl.value.trim();
    if (!messageText) return;

    this.setSendingState(true);
    this.inputEl.value = '';
    audio.playCoin();
    this.appendMessage(messageText, true);

    const loadingEl = this.appendLoadingIndicator();

    try {
      const response = await ApiClient.post('/api/chat', { message: messageText });
      loadingEl.remove();
      audio.playCoin();
      this.appendMessage(response.reply || 'Transmissão concluída.');
    } catch (error) {
      loadingEl.remove();
      this.appendMessage(this.resolveErrorMessage(error));
    } finally {
      this.setSendingState(false);
      this.inputEl.focus();
    }
  }

  resolveErrorMessage(error) {
    if (error?.status === 429) return 'Limite de requisições atingido. Aguarde alguns segundos.';
    if (error?.status >= 500) return 'Servidor neural indisponível no momento.';
    return error?.message || 'Conexão neural instável.';
  }

  setSendingState(isSending) {
    this.isSending = isSending;
    this.inputEl.disabled = isSending;
    this.sendBtnEl.disabled = isSending;
  }

  appendLoadingIndicator() {
    const el = document.createElement('div');
    el.className = 'text-base text-slate-400 italic';
    el.textContent = 'Processando resposta na rede neural...';
    this.messagesEl.appendChild(el);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return el;
  }

  appendMessage(text, isUser = false) {
    const msgElement = document.createElement('div');
    msgElement.className = isUser
      ? 'bg-[#152015] border-2 border-[#ffee00] p-3 text-[#ffee00] ml-6'
      : 'bg-[#081208] border-2 border-[#00ff66]/40 p-3 text-[#00ff66] mr-6';

    const authorTag = isUser ? 'VOCÊ' : 'EL SHANDAY';
    const authorColor = isUser ? 'text-[#ffee00]' : 'text-[#00f0ff]';

    msgElement.innerHTML = `<span class="${authorColor} font-bold">[${authorTag}]</span>: ${escapeHtml(text)}`;
    this.messagesEl.appendChild(msgElement);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}