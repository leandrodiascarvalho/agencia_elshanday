import { SERVICES } from '../../../server/data/services.js';
import { audio } from '../services/audio.js';
import { formatCurrencyBRL } from '../utils/formatters.js';
import { escapeHtml } from '../utils/dom.js';

/**
 * Services View Renderer
 * Renders agency service modules and technological capabilities.
 * @param {HTMLElement} container
 * @param {Function} navigateTo
 */
export function renderServices(container, navigateTo) {
  const cardsHtml = SERVICES.map((service, index) => {
    const tagsHtml = (service.tags || [])
      .map(
        (tag) =>
          `<span class="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-black border border-slate-700 text-[#00f0ff]">${escapeHtml(tag)}</span>`
      )
      .join('');

    return `
      <div class="pixel-panel p-6 flex flex-col justify-between group hover:border-[#ffee00] transition-all bg-[#0a140a]">
        <div>
          <div class="flex items-center justify-between mb-4 border-b-2 border-black pb-2 font-['Press_Start_2P']">
            <span class="text-[9px] text-[#ffee00] uppercase bg-black px-2 py-1 border border-[#ffee00]">
              SKILL 0${index + 1}
            </span>
            <span class="text-xs text-[#00ff66]">
              🪙 ${formatCurrencyBRL(service.priceBase || 2500)}
            </span>
          </div>

          <h3 class="text-base font-bold font-['Press_Start_2P'] text-white group-hover:text-[#ffee00] transition mb-3 leading-snug">
            ${escapeHtml(service.title)}
          </h3>

          <p class="text-base text-[#00ff66] font-['VT323'] leading-relaxed mb-4">
            ${escapeHtml(service.description)}
          </p>
        </div>

        <div>
          <div class="flex flex-wrap gap-2 mb-6">
            ${tagsHtml}
          </div>
          <button data-service-id="${escapeHtml(service.id)}" class="btn-select-service pixel-btn pixel-btn--primary w-full text-center">
            ▶ SELECIONAR QUEST
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-8">
      <div class="pixel-panel border-4 border-[#ffee00] bg-[#0d160d]">
        <div class="font-['Press_Start_2P'] text-[10px] text-[#ffee00] uppercase mb-2">// SELECT YOUR WEAPON</div>
        <h2 class="text-xl sm:text-3xl font-bold font-['Press_Start_2P'] text-white mb-2 leading-snug">
          CATÁLOGO DE <span class="text-[#00ff66]">SERVIÇOS RETRO</span>
        </h2>
        <p class="text-[#00ff66] font-['VT323'] text-xl">Escolha sua missão digital para desbloquear o próximo estágio da sua marca.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${cardsHtml}
      </div>

      <!-- Pure Tech Stack Section -->
      <section class="pixel-panel p-6 bg-[#080d08] border-2 border-[#ffee00] space-y-4">
        <h3 class="font-['Press_Start_2P'] text-xs text-[#ffee00] flex items-center gap-2">
          <span>⚡</span> ARQUITETURA PURA // ZERO OVERHEAD
        </h3>
        <p class="font-['VT323'] text-xl text-[#00ff66] leading-relaxed">
          Nossas aplicações são desenvolvidas com foco na arquitetura nativa do navegador:
          <strong>HTML5 Semântico</strong>, <strong>Tailwind CSS &amp; Sass Modular</strong>, <strong>JavaScript ES6 Nativo</strong>, e <strong>Node.js + Express</strong> para endpoints de altíssima performance.
        </p>

        <div class="flex flex-wrap gap-2 pt-2 font-['Press_Start_2P'] text-[9px]">
          <span class="px-3 py-1 bg-black border border-[#00ff66] text-[#00ff66]">HTML5 / CANVAS 2D</span>
          <span class="px-3 py-1 bg-black border border-[#ffee00] text-[#ffee00]">SCSS RETRO</span>
          <span class="px-3 py-1 bg-black border border-[#00f0ff] text-[#00f0ff]">TAILWIND CSS</span>
          <span class="px-3 py-1 bg-black border border-[#ff007f] text-[#ff007f]">VANILLA ES6+</span>
          <span class="px-3 py-1 bg-black border border-[#ffee00] text-[#ffee00]">NODE + EXPRESS</span>
          <span class="px-3 py-1 bg-black border border-[#00f0ff] text-[#00f0ff]">GEMINI AI API</span>
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('.btn-select-service').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.playCoin();
      if (typeof navigateTo === 'function') {
        navigateTo('briefing');
      } else {
        window.location.hash = 'briefing';
      }
    });
  });
}
