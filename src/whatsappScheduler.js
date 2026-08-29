export class WhatsappSchedulerModal {
  constructor(container) {
    this.container = container;
  }

  mount() {
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div class="cyber-panel w-full max-w-md bg-[#050811] p-6 border border-[#00ff66] text-slate-200 font-['Rajdhani']">
          <div class="flex justify-between items-center border-b border-[#00ff66]/40 pb-3 mb-4">
            <span class="text-[#00ff66] font-['Orbitron'] font-bold text-sm">AGENDAMENTO DIRETO // WHATSAPP</span>
            <button id="btn-close-wa" class="text-slate-400 hover:text-red-400 font-bold">X</button>
          </div>
          <div class="space-y-4 font-['Share_Tech_Mono'] text-sm">
            <div>
              <label class="block text-slate-400 text-xs mb-1">Seu Nome</label>
              <input type="text" id="wa-name" placeholder="Ex: Leandro" class="w-full bg-[#0a1020] border border-[#00ff66]/40 rounded p-2.5 text-white outline-none focus:border-[#00ff66]" />
            </div>
            <div>
              <label class="block text-slate-400 text-xs mb-1">Tipo de Projeto</label>
              <select id="wa-project" class="w-full bg-[#0a1020] border border-[#00ff66]/40 rounded p-2.5 text-white outline-none">
                <option value="Landing Page Cyberpunk">Landing Page Cyberpunk</option>
                <option value="Aplicação Web Completa">Aplicação Web Completa</option>
                <option value="Experiência 3D / Three.js">Experiência 3D / Three.js</option>
                <option value="Integração IA / Chatbot">Integração IA / Chatbot</option>
              </select>
            </div>
            <button id="btn-send-whatsapp" class="w-full py-3 bg-[#00ff66] text-black font-bold font-['Orbitron'] text-sm rounded hover:bg-[#00ff66]/80 transition">
              ABRIR CONVERSA NO WHATSAPP
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-send-whatsapp').addEventListener('click', () => {
      const name = this.container.querySelector('#wa-name').value || 'Cliente';
      const project = this.container.querySelector('#wa-project').value;
      const text = encodeURIComponent(`Olá, me chamo ${name}. Gostaria de solicitar um orçamento para o projeto: ${project} com a Agência El Shanday.`);
      window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
      this.container.innerHTML = '';
    });

    this.container.querySelector('#btn-close-wa').addEventListener('click', () => {
      this.container.innerHTML = '';
    });
  }
}
