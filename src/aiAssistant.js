export class AiAssistantModal {
  constructor(container) {
    this.container = container;
  }

  mount() {
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div class="cyber-panel w-full max-w-lg bg-[#050811] p-6 border border-[#ff007f] text-slate-200 font-['Rajdhani'] flex flex-col h-[520px]">
          <div class="flex justify-between items-center border-b border-[#ff007f]/40 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#00ff66] animate-ping"></span>
              <span class="text-[#00f3ff] font-['Orbitron'] font-bold text-sm">EL_SHANDAY AI AGENT</span>
            </div>
            <button id="btn-close-ai" class="text-slate-400 hover:text-red-400 font-bold">FECHAR [ESC]</button>
          </div>

          <div id="ai-messages" class="flex-1 overflow-y-auto space-y-3 pr-2 font-['Share_Tech_Mono'] text-sm">
            <div class="bg-[#0a1020] border border-[#00f3ff]/30 p-3 rounded-lg text-slate-300">
              <span class="text-[#00f3ff] font-bold">[EL SHANDAY CORE]:</span> Olá! Sou o assistente neural da agência. Em que posso te ajudar hoje? (Criação de sites, orçamento, prazos, tecnologias)
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <input type="text" id="ai-input" placeholder="Digite sua dúvida aqui..." class="flex-1 bg-[#0a1020] border border-[#00f3ff]/40 rounded px-3 py-2 text-white outline-none focus:border-[#ff007f]" />
            <button id="btn-send-ai" class="px-4 py-2 bg-gradient-to-r from-[#00f3ff] to-[#ff007f] text-black font-bold font-['Orbitron'] text-xs rounded hover:opacity-90 transition">
              ENVIAR
            </button>
          </div>
        </div>
      </div>
    `;

    const input = this.container.querySelector('#ai-input');
    const sendBtn = this.container.querySelector('#btn-send-ai');
    const messages = this.container.querySelector('#ai-messages');

    const appendMessage = (text, isUser = false) => {
      const msg = document.createElement('div');
      msg.className = isUser
        ? 'bg-[#150a25] border border-[#ff007f]/30 p-3 rounded-lg text-slate-200 ml-8'
        : 'bg-[#0a1020] border border-[#00f3ff]/30 p-3 rounded-lg text-slate-300 mr-8';
      msg.innerHTML = `<span class="${isUser ? 'text-[#ff007f]' : 'text-[#00f3ff]'} font-bold">[${isUser ? 'VOCÊ' : 'EL SHANDAY'}]</span>: ${text}`;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    };

    const sendMessage = async () => {
      const val = input.value.trim();
      if (!val) return;
      appendMessage(val, true);
      input.value = '';

      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'text-xs text-slate-500 italic';
      loadingMsg.innerText = 'Processando na rede neural...';
      messages.appendChild(loadingMsg);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: val })
        });
        const data = await res.json();
        loadingMsg.remove();
        appendMessage(data.reply || 'Erro na resposta do agente neural.');
      } catch (err) {
        loadingMsg.remove();
        appendMessage('Conexão instável. Tente novamente em alguns instantes.');
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
      if (e.key === 'Escape') this.container.innerHTML = '';
    });

    this.container.querySelector('#btn-close-ai').addEventListener('click', () => {
      this.container.innerHTML = '';
    });
  }
}
