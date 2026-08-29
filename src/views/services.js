import { SERVICES } from '../../server/data/services.js';

export function renderServices(container, navigateTo) {
  const cardsHtml = SERVICES.map(s => `
    <div class="cyber-panel p-6 flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-['Share_Tech_Mono'] text-[#00f3ff] uppercase px-2 py-0.5 rounded bg-[#00f3ff]/10 border border-[#00f3ff]/30">${s.category}</span>
          <span class="text-sm font-['Share_Tech_Mono'] text-[#fefe00]">a partir de R$ ${s.priceBase}</span>
        </div>
        <h3 class="text-xl font-bold font-['Orbitron'] text-white group-hover:text-[#00f3ff] transition mb-2">${s.title}</h3>
        <p class="text-sm text-slate-300 mb-4">${s.description}</p>
      </div>

      <div>
        <div class="flex flex-wrap gap-1.5 mb-6">
          ${s.tags.map(t => `<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">${t}</span>`).join('')}
        </div>
        <button data-service-id="${s.id}" class="btn-select-service w-full py-2.5 rounded bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black font-bold font-['Orbitron'] text-xs transition cursor-pointer">
          CONTRATAR ESTE SERVIÇO
        </button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="space-y-8">
      <div>
        <h2 class="text-3xl font-black font-['Orbitron'] text-white mb-2">CATÁLOGO DE <span class="text-[#00f3ff]">SERVIÇOS DIGITAIS</span></h2>
        <p class="text-slate-400 font-['Share_Tech_Mono']">Soluções modulares para levar seu negócio ao próximo nível tecnológico.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${cardsHtml}
      </div>
    </div>
  `;

  container.querySelectorAll('.btn-select-service').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo('briefing');
    });
  });
}
