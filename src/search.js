export class CommandSearchModal {
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
  }

  mount() {
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-md p-4">
        <div class="cyber-panel w-full max-w-xl bg-[#050811] p-4 border border-[#00f3ff] text-slate-200 font-['Rajdhani']">
          <input type="text" id="cmd-search-input" placeholder="Digite para buscar páginas, serviços ou comandos..." class="w-full bg-[#0a1020] border border-[#00f3ff]/40 rounded p-3 text-white outline-none focus:border-[#ff007f] font-['Share_Tech_Mono'] text-sm mb-3" autofocus />
          <div id="cmd-results" class="space-y-1 font-['Share_Tech_Mono'] text-sm max-h-60 overflow-y-auto">
            <div data-action="tab-home" class="p-2.5 rounded hover:bg-[#00f3ff]/20 cursor-pointer flex justify-between">
              <span>🏠 Ir para a Página Inicial</span>
              <span class="text-[#00f3ff]">/home</span>
            </div>
            <div data-action="tab-services" class="p-2.5 rounded hover:bg-[#00f3ff]/20 cursor-pointer flex justify-between">
              <span>⚡ Ver Catálogo de Serviços</span>
              <span class="text-[#00f3ff]">/services</span>
            </div>
            <div data-action="tab-portfolio" class="p-2.5 rounded hover:bg-[#00f3ff]/20 cursor-pointer flex justify-between">
              <span>📁 Portfólio & Repositórios</span>
              <span class="text-[#00f3ff]">/portfolio</span>
            </div>
            <div data-action="tab-briefing" class="p-2.5 rounded hover:bg-[#00f3ff]/20 cursor-pointer flex justify-between">
              <span>📝 Briefing & Orçamento Rápido</span>
              <span class="text-[#00f3ff]">/briefing</span>
            </div>
            <div data-action="tab-faq" class="p-2.5 rounded hover:bg-[#00f3ff]/20 cursor-pointer flex justify-between">
              <span>❓ Dúvidas Frequentes</span>
              <span class="text-[#00f3ff]">/faq</span>
            </div>
            <div data-action="tab-console" class="p-2.5 rounded hover:bg-[#00f3ff]/20 cursor-pointer flex justify-between">
              <span>📊 Console & Telemetria do Sistema</span>
              <span class="text-[#00f3ff]">/console</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const input = this.container.querySelector('#cmd-search-input');
    const items = [...this.container.querySelectorAll('[data-action]')];

    items.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        if (action.startsWith('tab-')) {
          const tab = action.replace('tab-', '');
          if (this.onNavigate) this.onNavigate(tab);
        }
        this.container.innerHTML = '';
      });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.container.innerHTML = '';
    });
  }
}
