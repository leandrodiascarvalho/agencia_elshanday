import { fetchTelemetry } from '../github.js';

export async function renderConsole(container) {
  container.innerHTML = `
    <div class="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 class="text-3xl font-black font-['Orbitron'] text-white mb-2">CONSOLE DO SISTEMA // <span class="text-[#00ff66]">TELEMETRIA</span></h2>
        <p class="text-slate-400 font-['Share_Tech_Mono']">Monitoramento de métricas do servidor, integridade e nós da rede.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-['Share_Tech_Mono']">
        <div class="cyber-panel p-6">
          <div class="flex items-center gap-2 mb-4 text-[#00ff66]">
            <span class="w-3 h-3 rounded-full bg-[#00ff66] animate-pulse"></span>
            <span class="font-bold text-sm">STATUS DO SERVIDOR NODE.JS</span>
          </div>
          <div class="space-y-2 text-sm text-slate-300">
            <div class="flex justify-between border-b border-slate-800 pb-1">
              <span>Ambiente:</span>
              <span class="text-white">Production-Ready (SPA + Express)</span>
            </div>
            <div class="flex justify-between border-b border-slate-800 pb-1">
              <span>Vite Pipeline:</span>
              <span class="text-[#00f3ff]">Tailwind CSS 4.0 + Modern ESM</span>
            </div>
            <div class="flex justify-between border-b border-slate-800 pb-1">
              <span>Cyber Shield:</span>
              <span class="text-[#00ff66]">ATIVO</span>
            </div>
          </div>
        </div>

        <div class="cyber-panel p-6">
          <div class="flex items-center gap-2 mb-4 text-[#00f3ff]">
            <span class="w-3 h-3 rounded-full bg-[#00f3ff] animate-pulse"></span>
            <span class="font-bold text-sm">GITHUB INTELLIGENCE</span>
          </div>
          <div id="github-telemetry" class="space-y-2 text-sm text-slate-300">
            <p class="text-slate-500 italic">Carregando dados de telemetria...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const telemetry = await fetchTelemetry();
  const telContainer = container.querySelector('#github-telemetry');
  if (telContainer && telemetry) {
    telContainer.innerHTML = `
      <div class="flex justify-between border-b border-slate-800 pb-1">
        <span>Desenvolvedor:</span>
        <span class="text-white">@${telemetry.username}</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-1">
        <span>Repositórios Públicos:</span>
        <span class="text-[#fefe00]">${telemetry.publicRepos}</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 pb-1">
        <span>Rede Neural:</span>
        <span class="text-[#00ff66]">100% Sincronizada</span>
      </div>
    `;
  }
}
