import { HomeBackground3D } from '../homeBackground3D.js';
import { VoxelCanvas } from '../voxel.js';
import { typeWriter } from '../typewriter.js';

export function renderHome(container, navigateTo) {
  container.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl border border-[#00f3ff]/30 bg-[#0a1020]/90 p-8 sm:p-12 mb-10 shadow-[0_0_30px_rgba(0,243,255,0.15)]">
      <canvas id="home-3d-bg" class="absolute inset-0 pointer-events-none opacity-40"></canvas>
      
      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div class="lg:col-span-2 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00f3ff]/40 bg-[#00f3ff]/10 text-xs font-['Share_Tech_Mono'] text-[#00f3ff]">
            <span class="w-2 h-2 rounded-full bg-[#00f3ff] animate-ping"></span>
            NEXT-GEN CYBERPUNK DIGITAL LAB
          </div>
          
          <h1 class="text-4xl sm:text-6xl font-black font-['Orbitron'] tracking-tight leading-tight">
            CRIAMOS O <span class="bg-linear-to-r from-[#00f3ff] via-[#fefe00] to-[#ff007f] bg-clip-text text-transparent">FUTURO DIGITAL</span> DA SUA MARCA.
          </h1>
          
          <p id="home-typewriter-text" class="text-lg text-slate-300 font-['Rajdhani'] max-w-xl h-14">
            Websites ultrarrápidos, interfaces cyberpunk imersivas, 3D WebGL e agentes inteligentes com IA.
          </p>

          <div class="flex flex-wrap gap-4 pt-2">
            <button id="home-btn-briefing" class="px-8 py-3.5 rounded-lg bg-linear-to-r from-[#00f3ff] to-[#0088ff] text-black font-bold font-['Orbitron'] text-sm hover:opacity-90 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition cursor-pointer">
              INICIAR BRIEFING
            </button>
            <button id="home-btn-services" class="px-8 py-3.5 rounded-lg border border-[#ff007f] text-[#ff007f] font-bold font-['Orbitron'] text-sm hover:bg-[#ff007f]/10 transition cursor-pointer">
              VER SERVIÇOS
            </button>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center p-6 border border-[#00f3ff]/20 rounded-xl bg-black/40 backdrop-blur-md">
          <canvas id="voxel-cube" width="160" height="160" class="mb-4"></canvas>
          <span class="text-xs font-['Share_Tech_Mono'] text-[#00f3ff] uppercase tracking-wider">CORE_VOXEL // MATRIX 3D</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-['Share_Tech_Mono']">
      <div class="cyber-panel p-6">
        <div class="text-[#00f3ff] text-3xl font-bold font-['Orbitron'] mb-1">100%</div>
        <div class="text-slate-300 text-sm">Performance & Otimização Google Lighthouse</div>
      </div>
      <div class="cyber-panel p-6">
        <div class="text-[#ff007f] text-3xl font-bold font-['Orbitron'] mb-1">&lt; 15ms</div>
        <div class="text-slate-300 text-sm">Arquitetura de renderização ultra-rápida</div>
      </div>
      <div class="cyber-panel p-6">
        <div class="text-[#fefe00] text-3xl font-bold font-['Orbitron'] mb-1">AI-READY</div>
        <div class="text-slate-300 text-sm">Integração nativa com IA generativa e automações</div>
      </div>
    </div>
  `;

  // Start 3D Grid & Voxel
  const bgCanvas = container.querySelector('#home-3d-bg');
  const bg3D = new HomeBackground3D(bgCanvas);
  bg3D.start();

  const voxelCanvas = container.querySelector('#voxel-cube');
  const voxel = new VoxelCanvas(voxelCanvas);
  voxel.start();

  // Typewriter effect
  const twEl = container.querySelector('#home-typewriter-text');
  typeWriter(twEl, 'Websites ultrarrápidos, interfaces cyberpunk imersivas, 3D WebGL e agentes inteligentes com IA.', 25);

  container.querySelector('#home-btn-briefing').addEventListener('click', () => navigateTo('briefing'));
  container.querySelector('#home-btn-services').addEventListener('click', () => navigateTo('services'));
}
