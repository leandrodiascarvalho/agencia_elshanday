// Home View Renderer
import { audio } from '../services/audio.js';
import { VoxelCanvas } from '../effects/voxel.js';
import { Typewriter } from '../utils/typewriter.js';
import { HomeBackground3D } from '../effects/homeBackground3D.js';

let currentVoxelEngine = null;
let currentTypewriter = null;
let currentBgEngine = null;

export function renderHome(container, navigateTo) {
  if (currentVoxelEngine) {
    currentVoxelEngine.stop();
    currentVoxelEngine = null;
  }
  if (currentTypewriter) {
    currentTypewriter.stop();
    currentTypewriter = null;
  }
  if (currentBgEngine) {
    currentBgEngine.stop();
    currentBgEngine = null;
  }

  if (!container) return () => {};

  container.innerHTML = `
    <div class="relative space-y-12 min-h-screen">
      <!-- 3D THREE.JS IMMERSIVE BACKGROUND CONTAINER -->
      <div id="home-3d-bg-canvas-container" class="absolute -inset-x-4 -top-8 -bottom-16 pointer-events-none -z-10 overflow-hidden opacity-90 transition-opacity duration-500"></div>

      <!-- HERO SECTION -->
      <section class="relative p-6 sm:p-10 border-4 border-[#00ff66] bg-[#080d08]/90 backdrop-blur-sm pixel-shadow-green overflow-hidden">
        <!-- Corner brackets -->
        <div class="absolute top-2 left-2 text-[10px] font-pixel text-[#00ff66]/50">[SYS_ENTRY_01]</div>
        <div class="absolute top-2 right-2 text-[10px] font-pixel text-[#ffee00]">STATUS: ONLINE</div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          <div class="lg:col-span-7 space-y-6">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-black border-2 border-[#ffee00] text-[#ffee00] font-pixel text-[10px]">
              <span class="w-2 h-2 bg-[#ffee00] animate-ping"></span>
              <span>AGÊNCIA DIGITAL CYBERPUNK // STUDIO OBSCURA</span>
            </div>

            <!-- Headline with Typewriter Animation -->
            <h1 class="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-[34px] leading-snug sm:leading-tight text-[#00ff66] tracking-wide min-h-[110px] sm:min-h-[130px]">
              CRIANDO <br />
              <span id="hero-typewriter" class="text-[#ffee00] glitch-text"></span><span class="inline-block w-3 sm:w-4 h-5 sm:h-7 bg-[#00ff66] animate-blink align-middle ml-1"></span>
            </h1>

            <p class="font-code text-xs sm:text-sm md:text-base text-[#00ff66]/90 leading-relaxed max-w-xl">
              Fusão de estética retro brutalista com engenharia de software de alta performance. 
              Construímos aplicações web ultra-rápidas com HTML5, SCSS, JavaScript ES6+ Vanilla e backends robustos em Node + Express.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap gap-3.5 pt-2">
              <button
                id="hero-whatsapp-btn"
                class="px-5 py-3.5 bg-[#00ff66] text-[#050805] font-pixel text-xs sm:text-sm font-bold border-2 border-black shadow-[4px_4px_0px_#ffee00] hover:bg-[#ffee00] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 glitch-btn-green glitch-hover cursor-pointer"
                title="Agendar Reunião via WhatsApp"
              >
                <span class="text-sm">💬</span> AGENDAR REUNIÃO
              </button>

              <button
                id="hero-play-game-btn"
                class="px-5 py-3.5 bg-black text-[#00ff66] font-pixel text-xs sm:text-sm font-bold border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] hover:bg-[#00ff66] hover:text-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 glitch-hover cursor-pointer"
              >
                <span>▷</span> INICIAR JOGO
              </button>

              <button
                id="hero-view-repos-btn"
                class="px-5 py-3.5 bg-black text-[#ffffff] font-pixel text-xs sm:text-sm font-bold border-2 border-white shadow-[4px_4px_0px_#ffee00] hover:text-[#ffee00] hover:border-[#ffee00] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 glitch-hover cursor-pointer"
              >
                <span>📁</span> REPOSITÓRIOS
              </button>

              <button
                id="hero-open-terminal-btn"
                class="px-4 py-3.5 bg-transparent text-[#ffee00] font-pixel text-xs border-2 border-[#ffee00] hover:bg-[#ffee00] hover:text-black transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>&gt;_</span> CLI
              </button>
            </div>
          </div>

          <!-- Real 3D Three.js Interactive Voxel Canvas -->
          <div class="lg:col-span-5 flex flex-col items-center justify-center">
            <div class="relative p-3 bg-black border-4 border-[#00ff66] pixel-shadow-yellow w-full max-w-[320px] flex flex-col items-center">
              <div class="absolute -top-3 left-4 px-2 bg-black text-[9px] font-pixel text-[#ffee00] border border-[#ffee00]">
                3D_VOXEL_CORE.RENDER [WEBGL]
              </div>
              <div class="w-[280px] h-[280px] max-w-full flex items-center justify-center overflow-hidden">
                <canvas id="hero-voxel-canvas" width="280" height="280" class="cursor-grab active:cursor-grabbing w-full h-full"></canvas>
              </div>
              <div class="text-center font-code text-[10px] text-[#00ff66]/80 mt-2 tracking-wider">
                [ARRASTE EM 3D PARA ROTACIONAR O NÚCLEO]
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- STATS STRIP -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#00ff66] pixel-shadow-sm hover:translate-y-[-2px] transition-transform">
          <div class="font-pixel text-[10px] text-[#00ff66]/70">PROJETOS_ENTREGUES</div>
          <div class="font-pixel text-xl text-[#ffee00] mt-1">48+</div>
          <div class="font-code text-[10px] text-[#00ff66]/60">100% no prazo</div>
        </div>
        <div class="p-4 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#ff007f] pixel-shadow-sm hover:translate-y-[-2px] transition-transform">
          <div class="font-pixel text-[10px] text-[#ff007f]/70">LIGHTHOUSE_SCORE</div>
          <div class="font-pixel text-xl text-[#00f0ff] mt-1">100/100</div>
          <div class="font-code text-[10px] text-[#00ff66]/60">Performance extrema</div>
        </div>
        <div class="p-4 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#ffee00] pixel-shadow-sm hover:translate-y-[-2px] transition-transform">
          <div class="font-pixel text-[10px] text-[#ffee00]/70">GITHUB_STARS</div>
          <div class="font-pixel text-xl text-[#00ff66] mt-1">10.2K+</div>
          <div class="font-code text-[10px] text-[#00ff66]/60">Comunidade Dev</div>
        </div>
        <div class="p-4 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#00f0ff] pixel-shadow-sm hover:translate-y-[-2px] transition-transform">
          <div class="font-pixel text-[10px] text-[#00f0ff]/70">LATÊNCIA_MÉDIA</div>
          <div class="font-pixel text-xl text-[#ff007f] mt-1">&lt; 25ms</div>
          <div class="font-code text-[10px] text-[#00ff66]/60">Node + Express API</div>
        </div>
      </section>

      <!-- WHATSAPP SCHEDULING CALLOUT BANNER -->
      <section class="p-6 sm:p-8 bg-[#050805] border-4 border-[#00ff66] shadow-[6px_6px_0px_#ffee00] flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-2 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 bg-black border border-[#ffee00] text-[#ffee00] font-pixel text-[9px]">
            <span class="w-2 h-2 rounded-full bg-[#00ff66] animate-ping"></span>
            <span>SLOT DE ATENDIMENTO ABERTO</span>
          </div>
          <h2 class="font-pixel text-base sm:text-xl text-[#00ff66]">
            PRECISA DE UMA CONSULTORIA TÉCNICA OU PROJETO URGENTE?
          </h2>
          <p class="font-code text-xs sm:text-sm text-[#00ff66]/80 max-w-2xl">
            Agende uma reunião online diretamente pelo WhatsApp com nossos arquitetos de software para discutir escopo, stack tecnológica e prazos de entrega.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
          <button
            id="home-callout-whatsapp-btn"
            class="px-6 py-3.5 bg-[#00ff66] text-[#050805] font-pixel text-xs sm:text-sm font-bold border-2 border-black hover:bg-[#ffee00] shadow-[3px_3px_0px_#ffee00] transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>💬</span> AGENDAR REUNIÃO ↗
          </button>
        </div>
      </section>

      <!-- FEATURE CARDS (THE 4 PILLARS) -->
      <section class="space-y-4">
        <div class="flex items-center justify-between border-b-2 border-[#00ff66] pb-2">
          <h2 class="font-pixel text-base sm:text-lg text-[#00ff66] flex items-center gap-2">
            <span>&gt;</span> NOSSOS PILARES DE ARQUITETURA
          </h2>
          <span class="font-pixel text-[10px] text-[#ffee00]">PROTOCOL_V3</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] space-y-3 group hover:border-[#ffee00] transition-colors">
            <div class="font-pixel text-xs text-[#ffee00]">01 // DIGITAL BRUTALISM</div>
            <h3 class="font-pixel text-sm text-[#00ff66]">Interfaces com Personalidade e Impacto</h3>
            <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
              Design limpo, de alto contraste, tipografia pixel art e sombras geométricas puras. Criamos sites que ninguém esquece.
            </p>
          </div>

          <div class="p-6 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#ffee00] shadow-[4px_4px_0px_#ffee00] space-y-3 group hover:border-[#00ff66] transition-colors">
            <div class="font-pixel text-xs text-[#00f0ff]">02 // ENGENHARIA MODULAR</div>
            <h3 class="font-pixel text-sm text-[#ffee00]">Código Limpo, Leve e Desacoplado</h3>
            <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
              Sem frameworks pesados ou bloatware desnecessário. Código nativo em módulos ES6+, manipulação precisa com DOM Nativo e SCSS semântico.
            </p>
          </div>

          <div class="p-6 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#ff007f] shadow-[4px_4px_0px_#ff007f] space-y-3 group hover:border-[#ffee00] transition-colors">
            <div class="font-pixel text-xs text-[#ffee00]">03 // BACKEND EXPRESS & APIS</div>
            <h3 class="font-pixel text-sm text-[#ff007f]">Segurança e Resposta em Tempo Real</h3>
            <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
              Servidores Node.js configurados com rotas REST seguras, inteligência artificial integrada e integração contínua.
            </p>
          </div>

          <div class="p-6 bg-[#080d08]/90 backdrop-blur-sm border-2 border-[#00f0ff] shadow-[4px_4px_0px_#00f0ff] space-y-3 group hover:border-[#00ff66] transition-colors">
            <div class="font-pixel text-xs text-[#00ff66]">04 // GAMIFICAÇÃO & INTERATIVIDADE</div>
            <h3 class="font-pixel text-sm text-[#00f0ff]">Sons 8-Bit, Shaders e 3D Canvas</h3>
            <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
              Audio Web Synthesizer nativo, efeitos de scanlines CRT, terminais interativos e minijogos que prendem a atenção do usuário.
            </p>
          </div>
        </div>
      </section>

      <!-- RESPONSIVE SHOWCASE: FLEXBOX + CSS GRID + RELATIVE UNITS (%, vh, vw, rem, em, fr) + PICTURE SRCSET -->
      <section id="responsive-showcase-section" class="space-y-6">
        <!-- Header with Live Viewport & Media Query Telemetry -->
        <div class="p-4 sm:p-6 bg-[#080d08] border-4 border-[#ffee00] shadow-[6px_6px_0px_#00ff66] space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#ffee00]/40 pb-4">
            <div>
              <div class="flex items-center gap-2 font-pixel text-[10px] text-[#00f0ff] mb-1">
                <span class="inline-block w-2 h-2 rounded-full bg-[#ffee00] animate-ping"></span>
                <span>ENGINEERING // RESPONSIVE DESIGN LAB</span>
              </div>
              <h2 class="font-pixel text-base sm:text-xl md:text-2xl text-[#ffee00]">
                LAYOUT RESPONSIVO COM FLEXBOX &amp; CSS GRID
              </h2>
            </div>
            <!-- Architecture Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-black border border-[#00ff66] text-[#00ff66] font-pixel text-[10px]">
              <span class="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span>MODULAR CSS ARCHITECTURE // FLUID MATRIX</span>
            </div>
          </div>

          <!-- Relative Units Matrix Explanations (%, vh, vw, rem, em, fr) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="p-3 bg-black/70 border border-[#00ff66]/60">
              <div class="font-pixel text-xs text-[#00ff66] font-bold">% (PORCENTAGEM)</div>
              <div class="font-code text-[11px] text-[#00ff66]/80 mt-1">Larguras fluidas de contêineres e flex-basis adaptável.</div>
            </div>
            <div class="p-3 bg-black/70 border border-[#ffee00]/60">
              <div class="font-pixel text-xs text-[#ffee00] font-bold">VH (VIEWPORT HEIGHT)</div>
              <div class="font-code text-[11px] text-[#00ff66]/80 mt-1">Hero em clamp(60vh, 75vh, 56rem) e modais fluidos.</div>
            </div>
            <div class="p-3 bg-black/70 border border-[#00f0ff]/60">
              <div class="font-pixel text-xs text-[#00f0ff] font-bold">VW (VIEWPORT WIDTH)</div>
              <div class="font-code text-[11px] text-[#00ff66]/80 mt-1">Margens fluidas e tipografia com clamp(1rem, 2.5vw, 2rem).</div>
            </div>
            <div class="p-3 bg-black/70 border border-[#ff007f]/60">
              <div class="font-pixel text-xs text-[#ff007f] font-bold">REM (ROOT EM)</div>
              <div class="font-code text-[11px] text-[#00ff66]/80 mt-1">Espaçamentos de layout (paddings, gaps e borders).</div>
            </div>
            <div class="p-3 bg-black/70 border border-[#ffee00]/60">
              <div class="font-pixel text-xs text-[#ffee00] font-bold">EM (FONT PROPORTION)</div>
              <div class="font-code text-[11px] text-[#00ff66]/80 mt-1">Badges (0.3em 0.8em) e ícones que escalam com o texto.</div>
            </div>
            <div class="p-3 bg-black/70 border border-[#00ff66]/60">
              <div class="font-pixel text-xs text-[#00ff66] font-bold">FR (FRACTIONS)</div>
              <div class="font-code text-[11px] text-[#00ff66]/80 mt-1">Divisões proporcionais de colunas no CSS Grid sem estalos.</div>
            </div>
          </div>
        </div>

        <!-- Responsive Images Gallery with <picture> and srcset (400w, 800w, 1200w) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="responsive-picture-gallery">
          
          <!-- Card 1: Cyber Hardware Rig -->
          <div class="cyber-image-frame flex flex-col justify-between group">
            <div class="image-hud-overlay">
              <span class="image-resolution-tag text-[#00ff66]">SRCSET: 400w/800w/1200w</span>
              <span class="image-resolution-tag text-[#ffee00]">16:10 AS_RATIO</span>
            </div>
            <div class="image-aspect-ratio-box">
              <picture class="responsive-picture">
                <source media="(min-width: 1280px)" srcset="/images/cyber-rig-1200w.svg 1200w" sizes="(min-width: 1280px) 25vw, 100vw">
                <source media="(min-width: 640px)" srcset="/images/cyber-rig-800w.svg 800w" sizes="(min-width: 640px) 50vw, 100vw">
                <img
                  src="/images/cyber-rig-400w.svg"
                  srcset="/images/cyber-rig-400w.svg 400w, /images/cyber-rig-800w.svg 800w, /images/cyber-rig-1200w.svg 1200w"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  alt="Infraestrutura de Racks Cyberpunk 48+ Nós"
                  loading="lazy"
                  class="responsive-img group-hover:scale-105 transition-transform duration-300"
                />
              </picture>
            </div>
            <div class="p-4 space-y-2.5 bg-[#080d08]">
              <div class="flex items-center justify-between">
                <span class="font-pixel text-[10px] text-[#ffee00]">RACK-INFRA // 01</span>
                <span class="cyber-badge bg-black text-[#00ff66] border border-[#00ff66]">48 NÓS</span>
              </div>
              <h3 class="font-pixel text-xs text-[#00ff66]">Clusters de Servidores Edge</h3>
              <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
                Backends em Node.js com balanceamento de carga distribuído, TLS 1.3 e resposta em &lt;20ms.
              </p>
              <div class="pt-1 flex items-center justify-between text-[10px] font-pixel text-[#ffee00]">
                <span>RESPONSIVE: AUTO-FIT</span>
                <span class="text-[#00f0ff]">GRID: 1fr</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Neural Interface & AI Gateway -->
          <div class="cyber-image-frame flex flex-col justify-between group">
            <div class="image-hud-overlay">
              <span class="image-resolution-tag text-[#00f0ff]">SRCSET: 400w/800w/1200w</span>
              <span class="image-resolution-tag text-[#ff007f]">16:10 AS_RATIO</span>
            </div>
            <div class="image-aspect-ratio-box">
              <picture class="responsive-picture">
                <source media="(min-width: 1280px)" srcset="/images/neural-core-1200w.svg 1200w" sizes="(min-width: 1280px) 25vw, 100vw">
                <source media="(min-width: 640px)" srcset="/images/neural-core-800w.svg 800w" sizes="(min-width: 640px) 50vw, 100vw">
                <img
                  src="/images/neural-core-400w.svg"
                  srcset="/images/neural-core-400w.svg 400w, /images/neural-core-800w.svg 800w, /images/neural-core-1200w.svg 1200w"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  alt="Núcleo de Inteligência Artificial Gemini"
                  loading="lazy"
                  class="responsive-img group-hover:scale-105 transition-transform duration-300"
                />
              </picture>
            </div>
            <div class="p-4 space-y-2.5 bg-[#080d08]">
              <div class="flex items-center justify-between">
                <span class="font-pixel text-[10px] text-[#00f0ff]">NEURAL-AI // 02</span>
                <span class="cyber-badge bg-black text-[#00f0ff] border border-[#00f0ff]">STREAMING</span>
              </div>
              <h3 class="font-pixel text-xs text-[#ffee00]">Gateway de IA Gemini</h3>
              <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
                Interações neurais server-side com respostas em fluxo contínuo, orquestração e contexto amplo.
              </p>
              <div class="pt-1 flex items-center justify-between text-[10px] font-pixel text-[#00f0ff]">
                <span>RESPONSIVE: AUTO-FIT</span>
                <span class="text-[#ff007f]">GRID: 1fr</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Global Distributed Mesh -->
          <div class="cyber-image-frame flex flex-col justify-between group">
            <div class="image-hud-overlay">
              <span class="image-resolution-tag text-[#ff007f]">SRCSET: 400w/800w/1200w</span>
              <span class="image-resolution-tag text-[#00ff66]">16:10 AS_RATIO</span>
            </div>
            <div class="image-aspect-ratio-box">
              <picture class="responsive-picture">
                <source media="(min-width: 1280px)" srcset="/images/cloud-mesh-1200w.svg 1200w" sizes="(min-width: 1280px) 25vw, 100vw">
                <source media="(min-width: 640px)" srcset="/images/cloud-mesh-800w.svg 800w" sizes="(min-width: 640px) 50vw, 100vw">
                <img
                  src="/images/cloud-mesh-400w.svg"
                  srcset="/images/cloud-mesh-400w.svg 400w, /images/cloud-mesh-800w.svg 800w, /images/cloud-mesh-1200w.svg 1200w"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  alt="Malha Distribuída Global Cloud Mesh"
                  loading="lazy"
                  class="responsive-img group-hover:scale-105 transition-transform duration-300"
                />
              </picture>
            </div>
            <div class="p-4 space-y-2.5 bg-[#080d08]">
              <div class="flex items-center justify-between">
                <span class="font-pixel text-[10px] text-[#ff007f]">CLOUD-MESH // 03</span>
                <span class="cyber-badge bg-black text-[#ff007f] border border-[#ff007f]">MULTI-REGION</span>
              </div>
              <h3 class="font-pixel text-xs text-[#00ff66]">Topologia Multi-Região</h3>
              <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
                Rotas de baixa latência em SP, US e EU conectadas com cache em memória e sincronização assíncrona.
              </p>
              <div class="pt-1 flex items-center justify-between text-[10px] font-pixel text-[#ff007f]">
                <span>RESPONSIVE: AUTO-FIT</span>
                <span class="text-[#ffee00]">GRID: 1fr</span>
              </div>
            </div>
          </div>

          <!-- Card 4: Digital Brutalism Design Lab -->
          <div class="cyber-image-frame flex flex-col justify-between group">
            <div class="image-hud-overlay">
              <span class="image-resolution-tag text-[#ffee00]">SRCSET: 400w/800w/1200w</span>
              <span class="image-resolution-tag text-[#00f0ff]">16:10 AS_RATIO</span>
            </div>
            <div class="image-aspect-ratio-box">
              <picture class="responsive-picture">
                <source media="(min-width: 1280px)" srcset="/images/retro-lab-1200w.svg 1200w" sizes="(min-width: 1280px) 25vw, 100vw">
                <source media="(min-width: 640px)" srcset="/images/retro-lab-800w.svg 800w" sizes="(min-width: 640px) 50vw, 100vw">
                <img
                  src="/images/retro-lab-400w.svg"
                  srcset="/images/retro-lab-400w.svg 400w, /images/retro-lab-800w.svg 800w, /images/retro-lab-1200w.svg 1200w"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  alt="Laboratório de Design Brutalista e Pixel Art"
                  loading="lazy"
                  class="responsive-img group-hover:scale-105 transition-transform duration-300"
                />
              </picture>
            </div>
            <div class="p-4 space-y-2.5 bg-[#080d08]">
              <div class="flex items-center justify-between">
                <span class="font-pixel text-[10px] text-[#ffee00]">PIXEL-LAB // 04</span>
                <span class="cyber-badge bg-black text-[#ffee00] border border-[#ffee00]">SCSS + GRID</span>
              </div>
              <h3 class="font-pixel text-xs text-[#00f0ff]">Design System Brutalista</h3>
              <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">
                Contraste rigoroso, scanlines CRT, sintetizador Web Audio de 8-bits e grids modulares precisos.
              </p>
              <div class="pt-1 flex items-center justify-between text-[10px] font-pixel text-[#ffee00]">
                <span>RESPONSIVE: AUTO-FIT</span>
                <span class="text-[#00ff66]">GRID: 1fr</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  `;

  // Initialize Three.js 3D Immersive Background
  currentBgEngine = new HomeBackground3D('home-3d-bg-canvas-container');

  // Initialize Typewriter Animation
  currentTypewriter = new Typewriter(
    '#hero-typewriter',
    [
      'EXPERIÊNCIAS PIXEL-PERFECT',
      'APLICAÇÕES ULTRA-RÁPIDAS',
      'SISTEMAS FULL-STACK NODE',
      'INTERFACES CYBERPUNK 3D',
    ],
    {
      typeSpeed: 80,
      deleteSpeed: 45,
      pauseDelay: 2200,
      soundEnabled: true,
    }
  );

  // Initialize Real 3D Three.js Voxel Canvas
  currentVoxelEngine = new VoxelCanvas('hero-voxel-canvas');

  // Event handlers
  const waBtns = container.querySelectorAll('#hero-whatsapp-btn, #home-callout-whatsapp-btn');
  waBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.play('powerup');
      window.dispatchEvent(
        new CustomEvent('app:open-whatsapp', {
          detail: { topic: 'Desenvolvimento de Nova Aplicação Web (Full-Stack)' },
        })
      );
    });
  });

  const gameBtn = container.querySelector('#hero-play-game-btn');
  if (gameBtn) {
    gameBtn.addEventListener('click', () => {
      audio.play('click');
      window.dispatchEvent(new CustomEvent('app:open-game'));
    });
  }

  const reposBtn = container.querySelector('#hero-view-repos-btn');
  if (reposBtn) {
    reposBtn.addEventListener('click', () => {
      audio.play('click');
      if (typeof navigateTo === 'function') {
        navigateTo('portfolio');
      } else {
        window.location.hash = 'portfolio';
      }
    });
  }

  const termBtn = container.querySelector('#hero-open-terminal-btn');
  if (termBtn) {
    termBtn.addEventListener('click', () => {
      audio.play('click');
      window.dispatchEvent(new CustomEvent('app:open-terminal'));
    });
  }

  return () => {
    if (currentVoxelEngine && typeof currentVoxelEngine.stop === 'function') {
      currentVoxelEngine.stop();
      currentVoxelEngine = null;
    }
    if (currentTypewriter && typeof currentTypewriter.stop === 'function') {
      currentTypewriter.stop();
      currentTypewriter = null;
    }
    if (currentBgEngine && typeof currentBgEngine.stop === 'function') {
      currentBgEngine.stop();
      currentBgEngine = null;
    }
  };
}
