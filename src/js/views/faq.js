// FAQ View Renderer
import { state, setState } from '../core/state.js';
import { audio } from '../services/audio.js';
import { ApiClient } from '../services/apiClient.js';
import { escapeHtml } from '../utils/dom.js';

export function renderFaq(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-8">
      <!-- Header -->
      <div class="border-b-4 border-[#00ff66] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="font-pixel text-xs text-[#ffee00] mb-1">KB_ARCHIVES // PROTOCOL_RESOLVER</div>
          <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl text-[#00ff66] glitch-text">
            CENTRO DE SUPORTE - FAQ.EXE
          </h1>
        </div>
        <div class="font-pixel text-xs text-[#00ff66] px-3 py-1 bg-black border border-[#00ff66]">
          BASE_CONHECIMENTO: V3.8
        </div>
      </div>

      <!-- Search & Category Filters -->
      <div class="p-4 bg-[#080d08] border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div class="relative flex-1">
          <input
            id="faq-search-input"
            type="text"
            placeholder="Buscar dúvida, SLA, contratos, stack..."
            value="${state.faqSearch || ''}"
            class="w-full px-4 py-2 bg-black border-2 border-[#00ff66] font-code text-xs text-[#00ff66] placeholder-[#00ff66]/40 focus:outline-none focus:border-[#ffee00]"
          />
        </div>

        <div class="flex flex-wrap gap-1.5" id="faq-cat-filters">
          <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.faqCategory === 'ALL' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} cat-btn cursor-pointer" data-cat="ALL">TODAS</button>
          <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.faqCategory === 'Processo' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} cat-btn cursor-pointer" data-cat="Processo">PROCESSO</button>
          <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.faqCategory === 'Tecnologia' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} cat-btn cursor-pointer" data-cat="Tecnologia">TECNOLOGIA</button>
          <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.faqCategory === 'Financeiro' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} cat-btn cursor-pointer" data-cat="Financeiro">FINANCEIRO</button>
          <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.faqCategory === 'Suporte' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} cat-btn cursor-pointer" data-cat="Suporte">SLA / SUPORTE</button>
        </div>
      </div>

      <!-- FAQ Accordion List -->
      <div id="faq-accordion-list" class="space-y-4">
        <div class="p-6 text-center font-code text-xs text-[#00ff66]">[CARREGANDO BASE DE DADOS...]</div>
      </div>

      <!-- Still have questions banner -->
      <div class="p-6 bg-black border-2 border-[#ffee00] shadow-[4px_4px_0px_#ffee00] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="font-pixel text-xs sm:text-sm text-[#ffee00]">AINDA POSSUI DÚVIDAS ESPECÍFICAS?</h3>
          <p class="font-code text-xs text-[#00ff66]/80 mt-1">Conecte-se com nosso AI Assistant no terminal ou despache uma mensagem direta.</p>
        </div>
        <button
          id="faq-open-ai-btn"
          class="px-4 py-2.5 bg-[#00ff66] text-black font-pixel text-xs font-bold border-2 border-black hover:bg-[#ffee00] transition-colors cursor-pointer"
        >
          CONVERSAR COM AI &gt;
        </button>
      </div>
    </div>
  `;

  const listContainer = container.querySelector('#faq-accordion-list');

  function renderFaqItems() {
    if (!listContainer) return;

    const q = (state.faqSearch || '').toLowerCase();
    const cat = state.faqCategory || 'ALL';

    const filtered = (state.faqItems || []).filter((item) => {
      const matchSearch =
        !q ||
        (item.question && item.question.toLowerCase().includes(q)) ||
        (item.answer && item.answer.toLowerCase().includes(q)) ||
        (item.code && item.code.toLowerCase().includes(q));
      const matchCat = cat === 'ALL' || item.category === cat;
      return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML =
        '<div class="p-8 text-center font-code text-xs text-[#ff007f]">[NENHUMA PERGUNTA ENCONTRADA COM ESSES TERMOS]</div>';
      return;
    }

    listContainer.innerHTML = filtered
      .map(
        (item) => `
          <div class="border-2 border-[#00ff66] bg-[#080d08] shadow-[4px_4px_0px_#00ff66] overflow-hidden faq-item group">
            <button class="w-full p-4 flex items-center justify-between text-left font-pixel text-xs text-[#00ff66] hover:bg-[#00ff66]/10 transition-colors faq-toggle-btn cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-[#ffee00]">${escapeHtml(item.code || '')}</span>
                <span>${escapeHtml(item.question || '')}</span>
              </div>
              <span class="font-pixel text-[10px] text-[#ffee00] faq-icon">+</span>
            </button>
            <div class="faq-content hidden p-4 border-t border-[#00ff66]/30 bg-black font-code text-xs text-[#00ff66]/90 leading-relaxed">
              ${escapeHtml(item.answer || '')}
              <div class="mt-3 flex items-center justify-between text-[10px] text-[#00ff66]/60 border-t border-[#00ff66]/20 pt-2 font-pixel">
                <span>CATEGORIA: ${escapeHtml((item.category || '').toUpperCase())}</span>
                <span class="text-[#00f0ff]">STATUS: ${escapeHtml(item.status || 'RESOLVIDO')}</span>
              </div>
            </div>
          </div>
        `
      )
      .join('');
  }

  async function loadFaq() {
    try {
      const data = await ApiClient.get('/api/faq');
      setState({ faqItems: data.faq || [] });
      renderFaqItems();
    } catch {
      // Fallback local FAQ items if offline
      setState({
        faqItems: [
          {
            code: 'FAQ_01',
            question: 'Qual é o prazo médio de entrega de um projeto?',
            answer: 'Landing pages de 1 a 2 semanas. Aplicações completas de 3 a 5 semanas.',
            category: 'Processo',
            status: 'RESOLVIDO',
          },
          {
            code: 'FAQ_02',
            question: 'Como funciona a garantia de suporte e SLA?',
            answer:
              'Oferecemos 90 dias de suporte pós-lançamento incluso e planos de sustentação contínua.',
            category: 'Suporte',
            status: 'RESOLVIDO',
          },
        ],
      });
      renderFaqItems();
    }
  }

  // Accordion Toggle via event delegation
  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.faq-toggle-btn');
      if (!toggleBtn) return;
      audio.play('click');

      const item = toggleBtn.closest('.faq-item');
      if (!item) return;

      const content = item.querySelector('.faq-content');
      const icon = item.querySelector('.faq-icon');

      if (content) {
        const isHidden = content.classList.contains('hidden');
        if (isHidden) {
          content.classList.remove('hidden');
          if (icon) icon.textContent = '-';
        } else {
          content.classList.add('hidden');
          if (icon) icon.textContent = '+';
        }
      }
    });
  }

  // Search input
  const searchInput = container.querySelector('#faq-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setState({ faqSearch: e.target.value.trim() });
      renderFaqItems();
    });
  }

  // Category filters
  const catFilters = container.querySelector('#faq-cat-filters');
  if (catFilters) {
    catFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      audio.play('click');
      const cat = btn.getAttribute('data-cat');
      setState({ faqCategory: cat });

      catFilters.querySelectorAll('.cat-btn').forEach((b) => {
        b.className =
          'px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] bg-black text-[#00ff66] cat-btn cursor-pointer';
      });
      btn.className =
        'px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] bg-[#00ff66] text-black font-bold cat-btn cursor-pointer';

      renderFaqItems();
    });
  }

  const openAiBtn = container.querySelector('#faq-open-ai-btn');
  if (openAiBtn) {
    openAiBtn.addEventListener('click', () => {
      audio.play('click');
      window.dispatchEvent(new CustomEvent('app:open-ai'));
    });
  }

  loadFaq();

  return () => {
    // cleanup
  };
}
