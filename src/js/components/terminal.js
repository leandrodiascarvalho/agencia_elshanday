import { BaseModal } from './baseModal.js';
import { audio } from '../services/audio.js';
import { escapeHtml } from '../utils/dom.js';

/**
 * CyberTerminal Component
 * Interactive retro CLI kernel simulator.
 */
export class CyberTerminal extends BaseModal {
  constructor(container) {
    super(container, {
      title: 'TERMINAL CLI // KERNEL',
      maxWidth: 'max-w-2xl',
      borderColor: 'border-[#00ff66]',
    });
  }

  renderContent() {
    return `
      <div>
        <div id="terminal-history" class="h-64 overflow-y-auto mb-4 space-y-1 font-['VT323'] text-xl pr-2" aria-live="polite">
          <p class="text-slate-400">El Shanday CyberOS v2.4 (x86_64-quantum-retro)</p>
          <p class="text-slate-400">Digite <span class="text-[#ffee00]">help</span> para listar os comandos disponíveis.</p>
        </div>
        <div class="flex items-center gap-2 border-t-2 border-black pt-2 font-['VT323'] text-xl">
          <label for="terminal-input" class="text-[#ffee00]">player@elshanday:~$</label>
          <input type="text" id="terminal-input" aria-label="Comando do terminal" class="flex-1 bg-transparent border-none outline-none text-[#00ff66]" autofocus />
        </div>
      </div>
    `;
  }

  onMount() {
    const input = this.container.querySelector('#terminal-input');
    const history = this.container.querySelector('#terminal-history');

    const print = (htmlText, color = 'text-[#00ff66]') => {
      const line = document.createElement('p');
      line.className = color;
      line.innerHTML = htmlText;
      history.appendChild(line);
      history.scrollTop = history.scrollHeight;
    };

    const handleCommand = (rawCmd) => {
      audio.playCoin();
      const cmd = rawCmd.trim().toLowerCase();
      print(
        `<span class="text-[#ffee00]">player@elshanday:~$</span> ${escapeHtml(rawCmd)}`,
        'text-slate-200'
      );

      switch (cmd) {
        case 'help':
          print(`Comandos disponíveis:
  - <b class="text-[#00f0ff]">services</b>: Lista serviços e stacks
  - <b class="text-[#00f0ff]">repos</b>: Lista repositórios open-source
  - <b class="text-[#00f0ff]">status</b>: Telemetria da agência
  - <b class="text-[#00f0ff]">clear</b>: Limpa o terminal
  - <b class="text-[#00f0ff]">contact</b>: Informações de contato
  - <b class="text-[#00f0ff]">matrix</b>: Modo hacker`);
          break;
        case 'services':
          print(
            '-> Desenvolvimento Web Fullstack, 3D WebGL (Three.js), Design UI/UX Futurista, Automações IA'
          );
          break;
        case 'repos':
          print(
            '-> Repositórios ativos: CYBER_PUNK_ENGINE, RETRO_UI_KIT, NEURO_NET_VISUALIZER, OP: NEON SKY'
          );
          break;
        case 'status':
          print('[KERNEL]: Status 100% OPERACIONAL | Latência: 4ms | Shield: ATIVO');
          break;
        case 'clear':
          history.innerHTML = '';
          break;
        case 'contact':
          print('WhatsApp: +55 (11) 99999-9999 | Email: contato@elshanday.dev');
          break;
        case 'matrix':
          print('WAKE UP, NEO... THE MATRIX HAS YOU.');
          break;
        default:
          print(
            `Comando não reconhecido: "${escapeHtml(rawCmd)}". Digite <span class="text-[#ffee00]">help</span>.`
          );
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value) {
        handleCommand(input.value);
        input.value = '';
      }
    });
  }
}
