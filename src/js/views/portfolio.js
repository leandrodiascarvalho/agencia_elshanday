// Portfolio / Repositories View Renderer with Live Project Execution Runner & Cyber Data-Grid
import { state, setState } from '../core/state.js';
import { audio } from '../services/audio.js';
import { fetchOrgRepositories, getLanguageColor } from '../services/github.js';
import { initRepoDataGrid } from '../effects/repoDataGrid.js';
import { initGitHubHeatmap } from '../services/githubHeatmap.js';

let currentReposData = null;
let dataGridInstance = null;
let heatmapInstance = null;

export function renderPortfolio(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-8">
      <!-- Header with GitHub Live Sync Badge & View Mode Toggle -->
      <div class="border-b-4 border-[#00ff66] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 font-pixel text-xs text-[#ffee00] mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
            <span>GITHUB_API // ORG: "elshanday"</span>
          </div>
          <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl text-[#00ff66] glitch-text">
            REPOSITÓRIO DE PROJETOS
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- View Switcher -->
          <div class="flex items-center p-0.5 bg-black border-2 border-[#00ff66]">
            <button id="view-mode-datagrid" class="px-3 py-1 font-pixel text-[9px] bg-[#00ff66] text-black font-bold transition-colors cursor-pointer flex items-center gap-1.5" title="Visualização em Grade de Dados Tabular">
              <span>⊞</span> DATA-GRID
            </button>
            <button id="view-mode-cards" class="px-3 py-1 font-pixel text-[9px] bg-black text-[#00ff66] transition-colors cursor-pointer flex items-center gap-1.5 hover:text-[#ffee00]" title="Visualização em Cards Visuais">
              <span>▦</span> CARDS
            </button>
          </div>

          <button id="resync-github-btn" class="px-3 py-1 bg-black border-2 border-[#ffee00] text-[#ffee00] font-pixel text-[10px] hover:bg-[#ffee00] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>⚡</span> RE-SYNC
          </button>
          <div class="font-pixel text-xs text-[#00f0ff] px-3 py-1 bg-black border border-[#00f0ff]">
            TOTAL: <span id="repo-count-badge">...</span>
          </div>
        </div>
      </div>

      <!-- Live GitHub Org Overview Banner -->
      <div id="github-org-stats-banner" class="p-4 bg-[#080d08] border-2 border-[#ffee00] pixel-shadow-yellow grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="font-pixel text-[9px] text-[#ffee00]/70">ORGANIZAÇÃO</div>
          <div class="font-pixel text-sm text-[#00ff66] mt-0.5">@elshanday</div>
        </div>
        <div>
          <div class="font-pixel text-[9px] text-[#ffee00]/70">TOTAL DE ESTRELAS</div>
          <div id="github-total-stars" class="font-pixel text-sm text-[#ffee00] mt-0.5">⭐ ...</div>
        </div>
        <div>
          <div class="font-pixel text-[9px] text-[#ffee00]/70">TOTAL DE FORKS</div>
          <div id="github-total-forks" class="font-pixel text-sm text-[#00f0ff] mt-0.5">🔀 ...</div>
        </div>
        <div>
          <div class="font-pixel text-[9px] text-[#ffee00]/70">API_SOURCE</div>
          <div id="github-sync-source" class="font-pixel text-[10px] text-[#00ff66] mt-0.5">GITHUB_LIVE</div>
        </div>
      </div>

      <!-- D3.JS GITHUB ACTIVITY CONTRIBUTIONS HEATMAP -->
      <div id="github-activity-heatmap-container" class="w-full"></div>

      <!-- VIEW 1: DATA-GRID COMPONENT CONTAINER (Active by Default) -->
      <div id="repo-datagrid-container" class="w-full"></div>

      <!-- VIEW 2: CARDS SECTION CONTAINER (Toggleable) -->
      <div id="repo-cards-container" class="w-full space-y-6 hidden">
        <!-- Filters & Search Toolbar -->
        <div class="p-4 bg-[#080d08] border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div class="relative flex-1">
            <input
              id="repo-search-input"
              type="text"
              placeholder="Filtrar repositórios por nome, tag ou descrição..."
              value="${state.searchQuery || ''}"
              class="w-full px-4 py-2 bg-black border-2 border-[#00ff66] font-code text-xs text-[#00ff66] placeholder-[#00ff66]/40 focus:outline-none focus:border-[#ffee00]"
            />
          </div>

          <div class="flex flex-wrap gap-1.5" id="repo-lang-filters">
            <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.selectedLanguage === 'ALL' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} lang-btn" data-lang="ALL">TODAS</button>
          </div>
        </div>

        <!-- Repo Cards Grid -->
        <div id="repo-cards-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-12 text-center font-code text-xs text-[#00ff66] col-span-full animate-pulse">
            [CONSUMINDO GITHUB API // BUSCANDO REPOSITÓRIOS DA ORG 'ELSHANDAY'...]
          </div>
        </div>
      </div>

      <!-- Live Project Execution & Preview Modal -->
      <div id="project-execution-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="bg-[#050805] border-4 border-[#00ff66] shadow-[8px_8px_0px_#ffee00] max-w-4xl w-full p-5 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden">
          
          <div class="flex items-center justify-between border-b-2 border-[#00ff66] pb-3 shrink-0">
            <div class="flex items-center gap-2">
              <span class="inline-block w-3 h-3 bg-[#00ff66] rounded-full animate-ping"></span>
              <div>
                <div class="font-pixel text-[9px] text-[#ffee00]">RUNTIME RUNNER // SIMULAÇÃO EM TEMPO REAL</div>
                <h3 id="exec-modal-title" class="font-pixel text-sm sm:text-base text-[#00ff66] break-all">PROJETO_DEMO</h3>
              </div>
            </div>
            <button id="exec-modal-close-btn" class="font-pixel text-xs text-[#ff007f] hover:text-white px-2.5 py-1 bg-black border border-current cursor-pointer transition-colors">
              [ESC / FECHAR X]
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/70 p-3 border border-[#00ff66]/40 shrink-0">
            <div>
              <div class="font-pixel text-[8px] text-[#00ff66]/70">STATUS_RUNTIME</div>
              <div class="font-pixel text-xs text-[#00ff66] mt-0.5 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#00ff66]"></span> ONLINE
              </div>
            </div>
            <div>
              <div class="font-pixel text-[8px] text-[#00ff66]/70">LATÊNCIA_EXECUÇÃO</div>
              <div id="exec-modal-latency" class="font-pixel text-xs text-[#ffee00] mt-0.5">14.8 ms</div>
            </div>
            <div>
              <div class="font-pixel text-[8px] text-[#00ff66]/70">LINGUAGEM_STACK</div>
              <div id="exec-modal-lang" class="font-pixel text-xs text-[#00f0ff] mt-0.5">TypeScript</div>
            </div>
            <div>
              <div class="font-pixel text-[8px] text-[#00ff66]/70">UPTIME_CLUSTER</div>
              <div class="font-pixel text-xs text-[#ff007f] mt-0.5">99.98% SLA</div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div class="border-2 border-[#00ff66] bg-black p-4 space-y-3 relative overflow-hidden">
              <div class="flex items-center justify-between border-b border-[#00ff66]/40 pb-2 text-[10px] font-mono text-[#00ff66]/70">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#ff007f]/80"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-[#ffee00]/80"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-[#00ff66]/80"></span>
                </div>
                <div id="exec-browser-url" class="px-3 py-0.5 bg-[#080d08] border border-[#00ff66]/30 text-[#ffee00] text-[10px] truncate max-w-xs sm:max-w-md">
                  https://elshanday.github.io/demo
                </div>
                <div class="text-[9px] text-[#00f0ff] font-pixel">LIVE_PREVIEW</div>
              </div>

              <div id="exec-live-display" class="p-4 sm:p-6 bg-[#060a06] border border-[#00ff66]/30 space-y-4 min-h-[160px] flex flex-col justify-center">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 id="exec-preview-heading" class="font-pixel text-base text-[#ffee00]">ELSHANDAY ENGINE ACTIVE</h4>
                    <p id="exec-preview-desc" class="font-code text-xs text-[#00ff66]/80 mt-1 max-w-xl">
                      Aplicação implantada em produção e respondendo em tempo real na rede da agência.
                    </p>
                  </div>
                  <div class="p-3 bg-black border border-[#00ff66] text-center shrink-0">
                    <div class="font-pixel text-[8px] text-[#00ff66]/70">BENCHMARK</div>
                    <div class="font-pixel text-sm text-[#00ff66] mt-0.5">100/100</div>
                  </div>
                </div>

                <div class="p-3 bg-black/60 border border-[#00ff66]/30 flex flex-wrap items-center justify-between gap-2">
                  <div class="text-[11px] font-code text-[#00ff66]/80 flex items-center gap-2">
                    <span class="text-[#ffee00]">&gt;_</span>
                    <span id="exec-sim-output">Módulo pronto para interação. Clique para testar sub-rotina.</span>
                  </div>
                  <button id="exec-sim-action-btn" class="px-3 py-1 bg-[#00ff66] text-black font-pixel text-[9px] font-bold hover:bg-[#ffee00] active:translate-y-0.5 cursor-pointer">
                    ⚡ TESTAR REQUISIÇÃO
                  </button>
                </div>
              </div>

              <div class="p-3 bg-[#030503] border border-[#00ff66]/20 font-code text-[11px] text-[#00ff66]/90 space-y-1">
                <div class="text-[9px] font-pixel text-[#ffee00]/70 flex items-center justify-between">
                  <span>LOGS DE EXECUÇÃO // LIVE DEPLOYMENT</span>
                  <span id="exec-log-time" class="text-[#00f0ff]">SYS_TICKS: OK</span>
                </div>
                <div id="exec-terminal-stream" class="space-y-0.5">
                  <div>[BOOT] Inicializando contêiner de execução... OK</div>
                  <div>[CLUSTER] Conexão estabelecida com Edge CDN (Latência: &lt; 20ms)</div>
                  <div>[STATUS] Rota pública respondendo HTTP 200 OK</div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t-2 border-[#00ff66]/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div class="text-xs font-code text-[#00ff66]/70 text-center sm:text-left">
              Ambiente de Produção Conectado
            </div>
            <div class="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
              <a
                id="exec-modal-site-link"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 sm:flex-none px-5 py-2.5 bg-[#ffee00] text-black font-pixel text-xs font-bold border-2 border-black shadow-[3px_3px_0px_#00ff66] hover:bg-[#00ff66] hover:shadow-[3px_3px_0px_#ffee00] transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5"
              >
                <span>🔗</span> VISITAR SITE DO PROJETO ↗
              </a>
              <a
                id="exec-modal-github-link"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2.5 bg-black border border-[#00ff66] text-[#00ff66] font-pixel text-[10px] hover:bg-[#00ff66] hover:text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📂</span> GITHUB ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const execModal = container.querySelector('#project-execution-modal');

  function openExecutionModal(repoId) {
    audio.play('laser');
    const repoList =
      (currentReposData && currentReposData.repositories) || state.repositories || [];
    const repo = repoList.find((r) => String(r.id) === String(repoId));

    if (repo && execModal) {
      const liveSiteUrl = repo.live_url || repo.html_url;

      container.querySelector('#exec-modal-title').textContent =
        `PROJETO: ${repo.display_name} // (${repo.name})`;
      container.querySelector('#exec-modal-latency').textContent = repo.latency || '< 16.5 ms';
      container.querySelector('#exec-modal-lang').textContent = repo.language || 'TypeScript';
      container.querySelector('#exec-browser-url').textContent = liveSiteUrl;
      container.querySelector('#exec-preview-heading').textContent = repo.display_name;
      container.querySelector('#exec-preview-desc').textContent = repo.description;

      container.querySelector('#exec-modal-site-link').setAttribute('href', liveSiteUrl);
      container.querySelector('#exec-modal-github-link').setAttribute('href', repo.html_url);

      const now = new Date();
      container.querySelector('#exec-log-time').textContent =
        `SYS_TICKS: ${now.toLocaleTimeString()}`;
      container.querySelector('#exec-terminal-stream').innerHTML = `
        <div>[BOOT] Inicializando contêiner para ${repo.name}... OK</div>
        <div>[RUNTIME] Executando ambiente de alta performance ${repo.language}</div>
        <div>[NETWORK] DNS resolvido para: <span class="text-[#ffee00]">${liveSiteUrl}</span></div>
        <div>[STATUS] Rota pública respondendo HTTP 200 OK (Latência: ${repo.latency || '14.2ms'})</div>
      `;

      container.querySelector('#exec-sim-output').textContent =
        'Módulo pronto para interação. Clique no botão ao lado para disparar teste.';
      execModal.classList.remove('hidden');
      execModal.classList.add('flex');
      audio.modalOpen();
    }
  }

  // Initialize D3 Heatmap
  heatmapInstance = initGitHubHeatmap('#github-activity-heatmap-container', {
    orgName: 'elshanday',
  });

  // Initialize Repo Data Grid
  dataGridInstance = initRepoDataGrid('#repo-datagrid-container', {
    orgName: 'elshanday',
    onViewExecution: (repoId) => openExecutionModal(repoId),
  });

  async function loadRepos(forceSync = false) {
    const grid = container.querySelector('#repo-cards-grid');
    if (forceSync || !currentReposData) {
      if (grid) {
        grid.innerHTML =
          '<div class="p-12 text-center font-code text-xs text-[#00ff66] col-span-full animate-pulse">[SINCRONIZANDO COM GITHUB API (@elshanday)...]</div>';
      }
      try {
        currentReposData = await fetchOrgRepositories('elshanday');
      } catch (err) {
        console.error('Error fetching org repos:', err);
      }
    }

    if (!currentReposData || !currentReposData.repositories) {
      if (grid) {
        grid.innerHTML =
          '<div class="p-8 text-center font-code text-xs text-[#ff007f] col-span-full">[ERRO AO CARREGAR REPOSITÓRIOS DO GITHUB]</div>';
      }
      return;
    }

    const starsEl = container.querySelector('#github-total-stars');
    const forksEl = container.querySelector('#github-total-forks');
    const sourceEl = container.querySelector('#github-sync-source');
    if (starsEl) starsEl.textContent = `⭐ ${currentReposData.totalStars.toLocaleString()}`;
    if (forksEl) forksEl.textContent = `🔀 ${currentReposData.totalForks.toLocaleString()}`;
    if (sourceEl) sourceEl.textContent = currentReposData.source.toUpperCase();

    // Populate Dynamic Language Filter Buttons
    const langFilters = container.querySelector('#repo-lang-filters');
    if (langFilters) {
      langFilters.innerHTML = `
        <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${state.selectedLanguage === 'ALL' ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} lang-btn cursor-pointer" data-lang="ALL">TODAS</button>
        ${(currentReposData.languages || [])
          .map((lang) => {
            const isSelected = state.selectedLanguage === lang;
            const langColor = getLanguageColor(lang);
            return `
              <button class="px-2.5 py-1.5 font-pixel text-[9px] border border-[#00ff66] ${isSelected ? 'bg-[#00ff66] text-black font-bold' : 'bg-black text-[#00ff66]'} lang-btn cursor-pointer flex items-center gap-1.5" data-lang="${lang}">
                <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${langColor};"></span>
                <span>${lang.toUpperCase()}</span>
              </button>
            `;
          })
          .join('')}
      `;
    }

    let filtered = [...currentReposData.repositories];

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.display_name && r.display_name.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.language && r.language.toLowerCase().includes(q)) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (state.selectedLanguage && state.selectedLanguage !== 'ALL') {
      filtered = filtered.filter(
        (r) => (r.language || '').toLowerCase() === state.selectedLanguage.toLowerCase()
      );
    }

    const countBadge = container.querySelector('#repo-count-badge');
    if (countBadge) countBadge.textContent = filtered.length;

    setState({ repositories: currentReposData.repositories });
    renderRepoCards(filtered);
  }

  function renderRepoCards(repos) {
    const grid = container.querySelector('#repo-cards-grid');
    if (!grid) return;

    if (repos.length === 0) {
      grid.innerHTML =
        '<div class="p-8 text-center font-code text-xs text-[#ff007f] col-span-full border-2 border-dashed border-[#ff007f]/50">[NENHUM REPOSITÓRIO ENCONTRADO PARA OS CRITÉRIOS SELECIONADOS]</div>';
      return;
    }

    grid.innerHTML = repos
      .map((repo) => {
        const isHotBadge = repo.isHot
          ? `<span class="px-2 py-0.5 bg-[#ff007f] text-black font-pixel text-[8px] font-bold animate-pulse">POPULAR</span>`
          : '';

        const topicsHtml = (repo.topics || [])
          .slice(0, 4)
          .map(
            (t) =>
              `<span class="px-1.5 py-0.5 bg-black border border-[#00ff66]/40 font-code text-[9px] text-[#00ff66]/80 hover:border-[#ffee00] transition-colors">#${t}</span>`
          )
          .join(' ');

        const langColor = getLanguageColor(repo.language);

        return `
          <div class="p-5 bg-[#080d08] border-2 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] flex flex-col justify-between space-y-4 hover:border-[#ffee00] hover:shadow-[4px_4px_0px_#ffee00] transition-all">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-code text-[10px] text-[#ffee00]">${repo.system_path || '>_ source.git'}</span>
                ${isHotBadge}
              </div>

              <h3 class="font-pixel text-xs sm:text-sm text-[#00ff66] break-all">${repo.display_name || repo.name}</h3>
              <p class="font-code text-xs text-[#00ff66]/80 leading-relaxed">${repo.description || 'Repositório de alta performance.'}</p>
              
              <div class="flex flex-wrap gap-1 pt-1">${topicsHtml}</div>
            </div>

            <div class="border-t border-[#00ff66]/30 pt-3 flex flex-col gap-3">
              <div class="flex items-center justify-between font-code text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full inline-block border border-black/40" style="background-color: ${langColor};"></span>
                  <span class="text-[#00f0ff] font-pixel text-[9px]">${repo.language || 'Plain'}</span>
                </div>
                <div class="flex items-center gap-3 text-[#ffee00] font-pixel text-[10px]">
                  <span title="Estrelas no GitHub">⭐ ${repo.stargazers_count || 0}</span>
                  <span title="Forks">🔀 ${repo.forks_count || 0}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex-1 py-2 bg-[#00ff66] text-black border border-[#00ff66] font-pixel text-[9px] font-bold hover:bg-[#ffee00] hover:border-[#ffee00] transition-all view-execution-btn cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                  data-id="${repo.id}"
                  title="Executar simulação do projeto e ver site online"
                >
                  <span>▶</span> VER EM EXECUÇÃO
                </button>
                <a
                  href="${repo.html_url}"
                  target="_blank"
                  rel="noreferrer"
                  class="px-3 py-2 bg-black text-[#ffee00] border border-[#ffee00] font-pixel text-[9px] hover:bg-[#ffee00] hover:text-black transition-colors flex items-center justify-center cursor-pointer"
                  title="Abrir no GitHub"
                >
                  GITHUB ↗
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // View Mode Switching Handlers
  const dataGridBtn = container.querySelector('#view-mode-datagrid');
  const cardsBtn = container.querySelector('#view-mode-cards');
  const dataGridContainer = container.querySelector('#repo-datagrid-container');
  const cardsContainer = container.querySelector('#repo-cards-container');

  if (dataGridBtn && cardsBtn) {
    dataGridBtn.addEventListener('click', () => {
      audio.play('click');
      dataGridBtn.className =
        'px-3 py-1 font-pixel text-[9px] bg-[#00ff66] text-black font-bold transition-colors cursor-pointer flex items-center gap-1.5';
      cardsBtn.className =
        'px-3 py-1 font-pixel text-[9px] bg-black text-[#00ff66] transition-colors cursor-pointer flex items-center gap-1.5 hover:text-[#ffee00]';
      dataGridContainer.classList.remove('hidden');
      cardsContainer.classList.add('hidden');
    });

    cardsBtn.addEventListener('click', () => {
      audio.play('click');
      cardsBtn.className =
        'px-3 py-1 font-pixel text-[9px] bg-[#00ff66] text-black font-bold transition-colors cursor-pointer flex items-center gap-1.5';
      dataGridBtn.className =
        'px-3 py-1 font-pixel text-[9px] bg-black text-[#00ff66] transition-colors cursor-pointer flex items-center gap-1.5 hover:text-[#ffee00]';
      cardsContainer.classList.remove('hidden');
      dataGridContainer.classList.add('hidden');
      if (!currentReposData) {
        loadRepos();
      }
    });
  }

  // Event Listeners
  const resyncBtn = container.querySelector('#resync-github-btn');
  if (resyncBtn) {
    resyncBtn.addEventListener('click', async () => {
      audio.play('laser');
      if (heatmapInstance) {
        await heatmapInstance.loadContributionData();
        heatmapInstance.render();
      }
      if (dataGridInstance) {
        await dataGridInstance.fetchStatistics(true);
        dataGridInstance.render();
      }
      loadRepos(true);
    });
  }

  const searchInput = container.querySelector('#repo-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setState({ searchQuery: e.target.value.trim() });
      loadRepos();
    });
  }

  const langFiltersContainer = container.querySelector('#repo-lang-filters');
  if (langFiltersContainer) {
    langFiltersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (!btn) return;
      audio.play('click');
      const lang = btn.getAttribute('data-lang');
      setState({ selectedLanguage: lang });
      loadRepos();
    });
  }

  const cardsGrid = container.querySelector('#repo-cards-grid');
  if (cardsGrid) {
    cardsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-execution-btn');
      if (!btn) return;
      const repoId = btn.getAttribute('data-id');
      openExecutionModal(repoId);
    });
  }

  const modalCloseBtn = container.querySelector('#exec-modal-close-btn');
  if (modalCloseBtn && execModal) {
    modalCloseBtn.addEventListener('click', () => {
      audio.play('click');
      execModal.classList.add('hidden');
      execModal.classList.remove('flex');
    });
  }

  const simActionBtn = container.querySelector('#exec-sim-action-btn');
  const simOutput = container.querySelector('#exec-sim-output');
  const simStream = container.querySelector('#exec-terminal-stream');

  if (simActionBtn) {
    simActionBtn.addEventListener('click', () => {
      audio.play('laser');
      simActionBtn.textContent = 'PROCESSANDO...';
      simActionBtn.setAttribute('disabled', 'true');
      if (simOutput) {
        simOutput.textContent = 'Transmitindo pacote de teste ao endpoint de produção...';
      }

      setTimeout(() => {
        const ping = (10 + Math.random() * 12).toFixed(1);
        if (simOutput) {
          simOutput.innerHTML = `<span class="text-[#00ff66] font-bold">✓ RESPOSTA RECEBIDA: 200 OK</span> em ${ping}ms. Pacote sincronizado com sucesso.`;
        }
        if (simStream) {
          const entry = document.createElement('div');
          entry.className = 'text-[#00ff66]';
          entry.textContent = `[DISPATCH] Teste de carga executado com sucesso: ACK 200 OK (${ping}ms)`;
          simStream.appendChild(entry);
        }
        audio.play('coin');
        simActionBtn.textContent = '⚡ TESTAR REQUISIÇÃO';
        simActionBtn.removeAttribute('disabled');
      }, 700);
    });
  }

  loadRepos();

  return () => {
    // Cleanup if unmounting
    dataGridInstance = null;
    heatmapInstance = null;
  };
}
