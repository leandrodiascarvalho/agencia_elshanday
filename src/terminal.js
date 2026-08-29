export class CyberTerminal {
  constructor(container) {
    this.container = container;
  }

  mount() {
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div class="cyber-panel w-full max-w-2xl bg-[#050811] p-6 border border-[#00f3ff] text-green-400 font-['Share_Tech_Mono'] text-sm">
          <div class="flex justify-between items-center border-b border-green-800 pb-2 mb-4">
            <span class="text-[#00f3ff] font-['Orbitron'] font-bold">TERMINAL CLI // EL_SHANDAY_KERNEL</span>
            <button id="btn-close-term" class="text-red-400 hover:text-red-300 font-bold">FECHAR [ESC]</button>
          </div>
          <div id="terminal-history" class="h-64 overflow-y-auto mb-4 space-y-1">
            <p class="text-slate-400">El Shanday CyberOS v2.4 (x86_64-quantum)</p>
            <p class="text-slate-400">Digite <span class="text-[#fefe00]">help</span> para listar os comandos disponíveis.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[#00f3ff]">guest@elshanday:~$</span>
            <input type="text" id="terminal-input" class="flex-1 bg-transparent border-none outline-none text-white font-mono" autofocus />
          </div>
        </div>
      </div>
    `;

    const input = this.container.querySelector('#terminal-input');
    const history = this.container.querySelector('#terminal-history');

    const print = (text, color = 'text-green-400') => {
      const p = document.createElement('p');
      p.className = color;
      p.innerHTML = text;
      history.appendChild(p);
      history.scrollTop = history.scrollHeight;
    };

    const handleCommand = (cmd) => {
      const trimmed = cmd.trim().toLowerCase();
      print(`<span class="text-[#00f3ff]">guest@elshanday:~$</span> ${cmd}`, 'text-slate-200');

      switch (trimmed) {
        case 'help':
          print(`Comandos disponíveis:
  - <b class="text-[#00f3ff]">services</b>: Lista serviços
  - <b class="text-[#00f3ff]">status</b>: Telemetria da agência
  - <b class="text-[#00f3ff]">clear</b>: Limpa o terminal
  - <b class="text-[#00f3ff]">contact</b>: Informações de contato
  - <b class="text-[#00f3ff]">matrix</b>: Modo hacker`);
          break;
        case 'services':
          print('-> Desenvolvimento Web Fullstack, 3D WebGL (Three.js), Design UI/UX Futurista, Automações IA');
          break;
        case 'status':
          print('[KERNEL]: Status 100% OPERACIONAL | Latência: 4ms | Shield: ATIVO');
          break;
        case 'clear':
          history.innerHTML = '';
          break;
        case 'contact':
          print('WhatsApp: +55 (11) 99999-9999 | Email: contato@elshanday.com');
          break;
        case 'matrix':
          print('WAKE UP, NEO... THE MATRIX HAS YOU.');
          break;
        default:
          print(`Comando não reconhecido: "${cmd}". Digite <span class="text-[#fefe00]">help</span>.`);
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value) {
        handleCommand(input.value);
        input.value = '';
      }
      if (e.key === 'Escape') {
        this.container.innerHTML = '';
      }
    });

    this.container.querySelector('#btn-close-term').addEventListener('click', () => {
      this.container.innerHTML = '';
    });
  }
}
