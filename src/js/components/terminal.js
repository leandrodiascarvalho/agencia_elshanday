import { BaseModal } from './baseModal.js';
import { audio } from '../services/audio.js';
import { escapeHtml } from '../utils/dom.js';
import { createTerminalEngine } from '../core/terminalEngine.js';
import { TERMINAL_COMMANDS } from '../core/terminalCommands.js';

export class CyberTerminal extends BaseModal {
  constructor(container) {
    super(container, {
      title: 'TERMINAL CLI // KERNEL',
      maxWidth: 'max-w-2xl',
      borderColor: 'border-[#00ff66]',
    });
    this.engine = createTerminalEngine(TERMINAL_COMMANDS);
  }

  renderContent() {
    return `
      <div>
        <div id="terminal-history" class="h-64 overflow-y-auto mb-4 space-y-1 font-['VT323'] text-xl pr-2" aria-live="polite">
          <p class="text-slate-400">El Shanday CyberOS v2.4 (x86_64-quantum-retro)</p>
          <p class="text-slate-400">Digite <span class="text-[#ffee00]">help</span> para listar os comandos.</p>
        </div>
        <div class="flex items-center gap-2 border-t-2 border-black pt-2 font-['VT323'] text-xl">
          <label for="terminal-input" class="text-[#ffee00]">player@elshanday:~$</label>
          <input type="text" id="terminal-input" aria-label="Linha de comando do terminal" class="flex-1 bg-transparent border-none outline-none text-[#00ff66]" autocomplete="off" spellcheck="false" />
        </div>
      </div>
    `;
  }

  onMount() {
    this.inputEl = this.container.querySelector('#terminal-input');
    this.historyEl = this.container.querySelector('#terminal-history');
    this.inputEl.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.inputEl.focus();
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && this.inputEl.value.trim()) {
      const result = this.engine.run(this.inputEl.value);
      this.render(result);
      this.inputEl.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.applyHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.applyHistory(1);
    }
  }

  applyHistory(direction) {
    const value = this.engine.navigateHistory(direction);
    if (value !== null) this.inputEl.value = value;
  }

  render({ echo, output, action }) {
    audio.playCoin();
    this.printLine(
      `<span class="text-[#ffee00]">player@elshanday:~$</span> ${escapeHtml(echo)}`,
      'text-slate-200'
    );

    if (action === 'clear') {
      this.historyEl.innerHTML = '';
      return;
    }

    output.forEach((line) => this.printLine(escapeHtml(line)));
  }

  printLine(text, colorClass = 'text-[#00ff66]') {
    const line = document.createElement('p');
    line.className = colorClass;
    line.innerHTML = text;
    this.historyEl.appendChild(line);
    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }
}