import { ApiClient } from '../services/apiClient.js';
import { audio } from '../services/audio.js';
import { formatCurrencyBRL } from '../utils/formatters.js';
import { CONTACT_INFO } from '../core/constants.js';

/**
 * Pure function: Calculates total project budget and estimated timeline.
 * @param {Object} params
 * @returns {{ totalFormatted: string, deadlineFormatted: string, rawTotal: number, projectTypeName: string }}
 */
export function calculateBudget({
  architectureType,
  pagesCount,
  hasCustomDesign,
  hasBackendApi,
  hasAuthPanel,
  isRushDelivery,
}) {
  let basePrice = 3500;
  let deadlineWeeks = 2;
  let projectTypeName = 'Landing Page Retro / Pitch Deck';

  if (architectureType === 'web') {
    basePrice = 5000;
    deadlineWeeks = 3;
    projectTypeName = 'Aplicação Web Completa (SPA / Dashboard)';
  } else if (architectureType === 'ecommerce') {
    basePrice = 7000;
    deadlineWeeks = 4;
    projectTypeName = 'E-Commerce & Catálogo Customizado';
  } else if (architectureType === 'custom') {
    basePrice = 9500;
    deadlineWeeks = 5;
    projectTypeName = 'Ecossistema Digital & WebGL / Minigame';
  }

  // Addons calculation
  basePrice += (pagesCount - 1) * 600;
  if (hasCustomDesign) basePrice += 1500;
  if (hasBackendApi) basePrice += 2000;
  if (hasAuthPanel) basePrice += 2500;

  if (isRushDelivery) {
    basePrice = Math.round(basePrice * 1.25);
    deadlineWeeks = Math.max(1, Math.round(deadlineWeeks * 0.6));
  }

  return {
    rawTotal: basePrice,
    totalFormatted: formatCurrencyBRL(basePrice),
    deadlineFormatted: `Prazo Estimado: ~ ${deadlineWeeks} semana${deadlineWeeks > 1 ? 's' : ''}`,
    projectTypeName,
  };
}

/**
 * Briefing and Budget Calculator View
 * @param {HTMLElement} container
 */
export function renderBriefing(container) {
  container.innerHTML = `
    <div class="space-y-8">
      <div class="pixel-panel border-4 border-[#ffee00] bg-[#0d160d]">
        <div class="font-['Press_Start_2P'] text-[10px] text-[#00ff66] mb-1">PROTOCOLO // DISPATCH_CENTER</div>
        <h1 class="text-xl sm:text-3xl font-bold font-['Press_Start_2P'] text-white mb-2 leading-snug">
          &gt; BRIEFING &amp; <span class="text-[#ffee00]">ESTIMADOR DE COINS</span>
        </h1>
        <p class="text-[#00ff66] font-['VT323'] text-xl">Calcule seu investimento em tempo real e envie os parâmetros da sua missão técnica.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- LIVE BUDGET CALCULATOR (5 cols) -->
        <div class="lg:col-span-5 p-6 bg-[#071107] border-4 border-[#ffee00] shadow-[6px_6px_0px_#00ff66] space-y-6">
          <div class="flex items-center justify-between border-b-2 border-[#ffee00] pb-3">
            <h2 class="font-['Press_Start_2P'] text-xs text-[#ffee00]">ESTIMADOR DE CUSTO</h2>
            <span class="w-2.5 h-2.5 bg-[#ffee00] animate-ping" aria-hidden="true"></span>
          </div>

          <!-- Type Selector -->
          <div class="space-y-2">
            <label for="calc-type" class="block font-['Press_Start_2P'] text-[10px] text-[#00ff66]">TIPO DE ARQUITETURA:</label>
            <select id="calc-type" class="w-full p-2.5 bg-black border-2 border-[#00ff66] font-['VT323'] text-xl text-[#ffee00] outline-none">
              <option value="landing">Landing Page Retro / Pitch Deck</option>
              <option value="web" selected>Aplicação Web Completa (SPA / Dashboard)</option>
              <option value="ecommerce">E-Commerce &amp; Catálogo Customizado</option>
              <option value="custom">Ecossistema Digital &amp; WebGL / Minigame</option>
            </select>
          </div>

          <!-- Number of Pages / Modules -->
          <div class="space-y-2">
            <div class="flex justify-between font-['Press_Start_2P'] text-[10px]">
              <span class="text-[#00ff66]">MÓDULOS / TELAS:</span>
              <span id="calc-pages-val" class="text-[#ffee00]">3 TELAS</span>
            </div>
            <input
              id="calc-pages-slider"
              type="range"
              min="1"
              max="10"
              value="3"
              class="w-full accent-[#ffee00] cursor-pointer"
            />
          </div>

          <!-- Addons Checkboxes -->
          <div class="space-y-2 pt-2 border-t border-[#00ff66]/30 font-['VT323'] text-lg">
            <div class="font-['Press_Start_2P'] text-[9px] text-[#00ff66] mb-2">POWER-UPS &amp; REQUISITOS:</div>

            <label class="flex items-center gap-2 cursor-pointer text-[#00ff66] hover:text-[#ffee00]">
              <input type="checkbox" id="calc-design" checked class="accent-[#ffee00] w-4 h-4" />
              <span>Design UI/UX Retro Pixel Customizado (+R$ 1.500)</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-[#00ff66] hover:text-[#ffee00]">
              <input type="checkbox" id="calc-api" checked class="accent-[#ffee00] w-4 h-4" />
              <span>Backend Node/Express &amp; APIs REST (+R$ 2.000)</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-[#00ff66] hover:text-[#ffee00]">
              <input type="checkbox" id="calc-auth" class="accent-[#ffee00] w-4 h-4" />
              <span>Autenticação &amp; Painel Administrativo (+R$ 2.500)</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-[#00ff66] hover:text-[#ffee00]">
              <input type="checkbox" id="calc-rush" class="accent-[#ffee00] w-4 h-4" />
              <span>Entrega Expressa Speedrun (+25%)</span>
            </label>
          </div>

          <!-- Budget Total Display -->
          <div class="p-4 bg-black border-2 border-[#ffee00] text-center space-y-3">
            <div class="font-['Press_Start_2P'] text-[9px] text-[#00ff66]">ESTIMATIVA CALCULADA:</div>
            <div id="calc-total-display" class="font-['Press_Start_2P'] text-xl sm:text-2xl text-[#ffee00]">
              R$ 8.500
            </div>
            <div id="calc-deadline-display" class="font-['VT323'] text-lg text-[#00f0ff]">
              Prazo Estimado: ~ 3 semanas
            </div>
            <button
              id="calc-whatsapp-meeting-btn"
              type="button"
              class="pixel-btn pixel-btn--primary w-full py-2.5 px-3 text-[9px] text-center"
            >
              💬 AGENDAR REUNIÃO COM ESTE VALOR ↗
            </button>
          </div>
        </div>

        <!-- DISPATCH FORM (7 cols) -->
        <div class="lg:col-span-7 p-6 bg-[#071107] border-4 border-[#00ff66] shadow-[6px_6px_0px_#ffee00] space-y-6">
          <div class="flex items-center justify-between border-b-2 border-[#00ff66] pb-3 font-['Press_Start_2P']">
            <h2 class="text-xs text-[#00ff66]">PARÂMETROS DA MISSÃO</h2>
            <span class="text-[9px] text-slate-400">[DISPATCH_ID: AUTO]</span>
          </div>

          <form id="briefing-form" class="space-y-4 font-['VT323'] text-xl">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="client-name" class="block font-['Press_Start_2P'] text-[9px] text-[#ffee00] mb-1">PLAYER 1 / NOME *</label>
                <input
                  type="text"
                  id="client-name"
                  name="name"
                  required
                  placeholder="Seu nome ou codinome"
                  class="w-full p-2.5 bg-black border-2 border-[#00ff66] text-[#00ff66] outline-none focus:border-[#ffee00]"
                />
              </div>

              <div>
                <label for="client-email" class="block font-['Press_Start_2P'] text-[9px] text-[#ffee00] mb-1">E-MAIL DE CONTATO *</label>
                <input
                  type="email"
                  id="client-email"
                  name="email"
                  required
                  placeholder="player@dominio.com"
                  class="w-full p-2.5 bg-black border-2 border-[#00ff66] text-[#00ff66] outline-none focus:border-[#ffee00]"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="briefing-proj-type" class="block font-['Press_Start_2P'] text-[9px] text-[#ffee00] mb-1">CLASSE DA MISSÃO</label>
                <input
                  type="text"
                  id="briefing-proj-type"
                  name="projectType"
                  value="Aplicação Web Completa (SPA / Dashboard)"
                  readonly
                  class="w-full p-2.5 bg-[#050805] border-2 border-[#00ff66]/50 text-[#ffee00] cursor-not-allowed"
                />
              </div>

              <div>
                <label for="briefing-budget" class="block font-['Press_Start_2P'] text-[9px] text-[#ffee00] mb-1">ORÇAMENTO ESTIMADO</label>
                <input
                  type="text"
                  id="briefing-budget"
                  name="budget"
                  value="R$ 8.500"
                  readonly
                  class="w-full p-2.5 bg-[#050805] border-2 border-[#00ff66]/50 text-[#ffee00] cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label for="briefing-desc" class="block font-['Press_Start_2P'] text-[9px] text-[#ffee00] mb-1">DETALHES DA QUEST &amp; OBJETIVOS *</label>
              <textarea
                id="briefing-desc"
                name="description"
                required
                rows="4"
                placeholder="Descreva funcionalidades, referências visuais e escopo desejado..."
                class="w-full p-2.5 bg-black border-2 border-[#00ff66] text-[#00ff66] outline-none focus:border-[#ffee00]"
              ></textarea>
            </div>

            <button
              type="submit"
              id="briefing-submit-btn"
              class="pixel-btn pixel-btn--primary w-full py-4 text-center text-xs tracking-wider"
            >
              ▶ TRANSMITIR MISSÃO // DISPATCH DATA
            </button>
          </form>

          <!-- Result banner -->
          <div id="briefing-result-banner" class="hidden p-4 bg-black border-2 border-[#ffee00] text-center space-y-2">
            <div class="font-['Press_Start_2P'] text-xs text-[#ffee00]">★ MISSÃO TRANSMITIDA COM SUCESSO!</div>
            <div id="briefing-mission-id" class="font-['Press_Start_2P'] text-[10px] text-[#00f0ff]"></div>
            <p class="font-['VT323'] text-xl text-[#00ff66]">
              Nossa equipe técnica iniciará a análise e retornará o contato em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Calculator elements
  const typeSelect = container.querySelector('#calc-type');
  const pagesSlider = container.querySelector('#calc-pages-slider');
  const pagesDisplay = container.querySelector('#calc-pages-val');
  const designCheckbox = container.querySelector('#calc-design');
  const apiCheckbox = container.querySelector('#calc-api');
  const authCheckbox = container.querySelector('#calc-auth');
  const rushCheckbox = container.querySelector('#calc-rush');
  const totalDisplay = container.querySelector('#calc-total-display');
  const deadlineDisplay = container.querySelector('#calc-deadline-display');
  const projTypeInput = container.querySelector('#briefing-proj-type');
  const budgetInput = container.querySelector('#briefing-budget');

  function refreshCalculator() {
    const result = calculateBudget({
      architectureType: typeSelect.value,
      pagesCount: Number(pagesSlider.value),
      hasCustomDesign: designCheckbox.checked,
      hasBackendApi: apiCheckbox.checked,
      hasAuthPanel: authCheckbox.checked,
      isRushDelivery: rushCheckbox.checked,
    });

    const pages = Number(pagesSlider.value);
    pagesDisplay.textContent = `${pages} TELA${pages > 1 ? 'S' : ''}`;
    totalDisplay.textContent = result.totalFormatted;
    deadlineDisplay.textContent = result.deadlineFormatted;

    projTypeInput.value = result.projectTypeName;
    budgetInput.value = result.totalFormatted;
  }

  const calcInputs = [
    typeSelect,
    pagesSlider,
    designCheckbox,
    apiCheckbox,
    authCheckbox,
    rushCheckbox,
  ];
  calcInputs.forEach((input) => {
    input.addEventListener('input', () => {
      audio.playCoin();
      refreshCalculator();
    });
  });

  // Direct WhatsApp Meeting
  const waBtn = container.querySelector('#calc-whatsapp-meeting-btn');
  waBtn.addEventListener('click', () => {
    audio.play1Up();
    const proj = projTypeInput.value;
    const bud = budgetInput.value;
    const text = encodeURIComponent(
      `Olá! Gostaria de agendar uma reunião técnica para o projeto: ${proj} com estimativa calculada em ${bud}.`
    );
    window.open(`https://wa.me/${CONTACT_INFO.WHATSAPP_NUMBER}?text=${text}`, '_blank');
  });

  // Form submission
  const form = container.querySelector('#briefing-form');
  const submitBtn = container.querySelector('#briefing-submit-btn');
  const resultBanner = container.querySelector('#briefing-result-banner');
  const missionIdDisplay = container.querySelector('#briefing-mission-id');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    audio.playCoin();

    submitBtn.disabled = true;
    submitBtn.textContent = 'TRANSMITINDO DADOS...';

    const payload = {
      name: container.querySelector('#client-name').value.trim(),
      email: container.querySelector('#client-email').value.trim(),
      projectType: projTypeInput.value,
      budget: budgetInput.value,
      description: container.querySelector('#briefing-desc').value.trim(),
    };

    try {
      const response = await ApiClient.post('/api/briefing', payload);
      audio.play1Up();

      missionIdDisplay.textContent = `PROTOCOLO: ${response.protocol || 'ES-OK'}`;
      resultBanner.classList.remove('hidden');
      form.style.display = 'none';
    } catch (error) {
      alert(`Erro ao transmitir missão: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '▶ TRANSMITIR MISSÃO // DISPATCH DATA';
    }
  });

  refreshCalculator();
}
