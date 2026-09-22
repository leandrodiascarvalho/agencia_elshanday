// Module: GitHub Organization Repository Statistics & Cyber Data-Grid Component
import { fetchOrgRepositories, getLanguageColor } from '../services/github.js';
import { audio } from '../services/audio.js';

export class RepoDataGrid {
  constructor(containerId, options = {}) {
    this.container =
      typeof containerId === 'string' ? document.querySelector(containerId) : containerId;
    this.orgName = options.orgName || 'elshanday';
    this.onViewExecution = options.onViewExecution || null;

    // Grid State
    this.rawData = null;
    this.repositories = [];
    this.filteredRepositories = [];
    this.sortColumn = 'stargazers_count'; // default sort by most stars
    this.sortDirection = 'desc'; // 'asc' | 'desc'
    this.searchTerm = '';
    this.selectedLanguage = 'ALL';
    this.currentPage = 1;
    this.pageSize = 10;
    this.isLoading = true;

    this.stats = {
      totalRepos: 0,
      totalStars: 0,
      totalForks: 0,
      totalIssues: 0,
      avgStars: 0,
      languageDistribution: [],
    };
  }

  /**
   * Initializes and renders the data grid by fetching repository stats
   */
  async init() {
    this.renderLoading();
    await this.fetchStatistics();
    this.render();
  }

  /**
   * Fetches repository statistics from GitHub API (or proxy/cache)
   */
  async fetchStatistics(_forceRefresh = false) {
    this.isLoading = true;
    try {
      this.rawData = await fetchOrgRepositories(this.orgName);
      this.repositories = this.rawData.repositories || [];
      this.computeStats();
      this.applyFilterAndSort();
    } catch (err) {
      console.error('[RepoDataGrid] Error fetching repo stats:', err);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Computes aggregate metrics: stars, forks, languages distribution, issues
   */
  computeStats() {
    const totalRepos = this.repositories.length;
    let totalStars = 0;
    let totalForks = 0;
    let totalIssues = 0;
    const langCounts = {};

    this.repositories.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      totalIssues += repo.open_issues_count || 0;

      const lang = repo.language || 'Outros';
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });

    const languageDistribution = Object.entries(langCounts)
      .map(([lang, count]) => {
        const percentage = totalRepos > 0 ? ((count / totalRepos) * 100).toFixed(1) : 0;
        return {
          language: lang,
          count,
          percentage: Number(percentage),
          color: getLanguageColor(lang),
        };
      })
      .sort((a, b) => b.count - a.count);

    this.stats = {
      totalRepos,
      totalStars,
      totalForks,
      totalIssues,
      avgStars: totalRepos > 0 ? Math.round(totalStars / totalRepos) : 0,
      languageDistribution,
    };
  }

  /**
   * Applies search filtering and sorting across repository records
   */
  applyFilterAndSort() {
    let result = [...this.repositories];

    // Search filter
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.display_name && r.display_name.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.language && r.language.toLowerCase().includes(q)) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Language filter
    if (this.selectedLanguage && this.selectedLanguage !== 'ALL') {
      result = result.filter(
        (r) => (r.language || '').toLowerCase() === this.selectedLanguage.toLowerCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    this.filteredRepositories = result;
    this.currentPage = 1;
  }

  handleSort(columnKey) {
    audio.terminalKey();
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'desc';
    }
    this.applyFilterAndSort();
    this.renderTableBody();
    this.renderTableHeaders();
    this.renderFooter();
  }

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="p-10 bg-[#080d08] border-2 border-[#00ff66] text-center font-code text-xs text-[#00ff66] space-y-3 shadow-[4px_4px_0px_#00ff66]">
        <div class="inline-block w-4 h-4 rounded-full bg-[#00ff66] animate-ping mb-2"></div>
        <div class="font-pixel text-sm text-[#ffee00]">[CARREGANDO DATA-GRID // GITHUB API]</div>
        <p class="text-[#00ff66]/70 max-w-md mx-auto">
          Recuperando métricas de repositórios públicos (estrelas, forks, linguagens) para a organização @${this.orgName}...
        </p>
      </div>
    `;
  }

  render() {
    if (!this.container) return;

    const segmentsHtml = this.stats.languageDistribution
      .map(
        (l) =>
          `<div style="width: ${l.percentage}%; background-color: ${l.color};" title="${l.language}: ${l.count} repos (${l.percentage}%)" class="h-full transition-all hover:opacity-80"></div>`
      )
      .join('');

    const chipsHtml = [
      `<button class="grid-lang-filter-btn px-2 py-0.5 font-pixel text-[8px] border transition-colors cursor-pointer ${this.selectedLanguage === 'ALL' ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' : 'bg-black text-[#00ff66] border-[#00ff66]/60 hover:border-[#ffee00]'}" data-lang="ALL">
        TODAS (${this.stats.totalRepos})
      </button>`,
      ...this.stats.languageDistribution.map((l) => {
        const isSelected = this.selectedLanguage.toLowerCase() === l.language.toLowerCase();
        return `
          <button class="grid-lang-filter-btn px-2 py-0.5 font-pixel text-[8px] border transition-colors cursor-pointer flex items-center gap-1.5 ${isSelected ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' : 'bg-black text-[#00ff66] border-[#00ff66]/60 hover:border-[#ffee00]'}" data-lang="${l.language}">
            <span class="w-1.5 h-1.5 rounded-full inline-block" style="background-color: ${l.color};"></span>
            <span>${l.language.toUpperCase()} (${l.count} · ${l.percentage}%)</span>
          </button>
        `;
      }),
    ].join('');

    this.container.innerHTML = `
      <div class="space-y-4 font-code text-xs">
        <!-- 1. KPI Stats Cards Header -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="p-3.5 bg-black border-2 border-[#00ff66] shadow-[2px_2px_0px_#00ff66]">
            <div class="font-pixel text-[9px] text-[#00ff66]/70">REPOSITÓRIOS PÚBLICOS</div>
            <div class="font-pixel text-lg text-[#00ff66] mt-1 flex items-center justify-between">
              <span class="tabular-nums">${this.stats.totalRepos}</span>
              <span class="text-xs text-[#ffee00]">📁 REPOS</span>
            </div>
          </div>

          <div class="p-3.5 bg-black border-2 border-[#ffee00] shadow-[2px_2px_0px_#ffee00]">
            <div class="font-pixel text-[9px] text-[#ffee00]/70">TOTAL DE ESTRELAS</div>
            <div class="font-pixel text-lg text-[#ffee00] mt-1 flex items-center justify-between">
              <span class="tabular-nums">${this.stats.totalStars.toLocaleString()}</span>
              <span class="text-xs">⭐ STARS</span>
            </div>
          </div>

          <div class="p-3.5 bg-black border-2 border-[#00f0ff] shadow-[2px_2px_0px_#00f0ff]">
            <div class="font-pixel text-[9px] text-[#00f0ff]/70">TOTAL DE FORKS</div>
            <div class="font-pixel text-lg text-[#00f0ff] mt-1 flex items-center justify-between">
              <span class="tabular-nums">${this.stats.totalForks.toLocaleString()}</span>
              <span class="text-xs">🔀 FORKS</span>
            </div>
          </div>

          <div class="p-3.5 bg-black border-2 border-[#ff007f] shadow-[2px_2px_0px_#ff007f]">
            <div class="font-pixel text-[9px] text-[#ff007f]/70">MÉDIA DE POPULARIDADE</div>
            <div class="font-pixel text-lg text-[#ff007f] mt-1 flex items-center justify-between">
              <span class="tabular-nums">${this.stats.avgStars} <span class="text-[10px]">★/repo</span></span>
              <span class="text-xs">📈 METRIC</span>
            </div>
          </div>
        </div>

        <!-- 2. Language Distribution Bar -->
        <div class="p-3.5 bg-[#080d08] border-2 border-[#00ff66]/60 space-y-2">
          <div class="flex items-center justify-between font-pixel text-[9px]">
            <span class="text-[#ffee00]">DISTRIBUIÇÃO DE LINGUAGENS // GITHUB STACK</span>
            <span class="text-[#00ff66]/70">${this.stats.languageDistribution.length} LINGUAGENS DETECTADAS</span>
          </div>
          <div class="h-2 w-full bg-black flex overflow-hidden border border-[#00ff66]/30">
            ${segmentsHtml}
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            ${chipsHtml}
          </div>
        </div>

        <!-- 3. Grid Controls -->
        <div class="p-3 bg-[#080d08] border-2 border-[#00ff66] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1">
            <input
              id="datagrid-search-input"
              type="text"
              placeholder="Buscar por repositório, linguagem, stars ou tags no grid..."
              value="${this.searchTerm}"
              class="w-full px-3 py-1.5 bg-black border border-[#00ff66] text-[#00ff66] placeholder-[#00ff66]/40 focus:outline-none focus:border-[#ffee00] font-code text-xs"
            />
          </div>
          <div class="flex items-center gap-2">
            <button id="datagrid-export-json-btn" class="px-2.5 py-1.5 bg-black border border-[#ffee00] text-[#ffee00] font-pixel text-[9px] hover:bg-[#ffee00] hover:text-black transition-colors cursor-pointer" title="Copiar estatísticas como JSON">
              📋 EXPORT JSON
            </button>
            <button id="datagrid-refresh-btn" class="px-2.5 py-1.5 bg-black border border-[#00f0ff] text-[#00f0ff] font-pixel text-[9px] hover:bg-[#00f0ff] hover:text-black transition-colors cursor-pointer" title="Recarregar dados do GitHub">
              🔄 REFRESH
            </button>
          </div>
        </div>

        <!-- 4. Tabular Data-Grid Matrix -->
        <div class="border-2 border-[#00ff66] bg-black shadow-[4px_4px_0px_#00ff66] overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead id="datagrid-table-head" class="bg-[#051107] border-b-2 border-[#00ff66] font-pixel text-[9px] text-[#00ff66] select-none"></thead>
            <tbody id="datagrid-table-body"></tbody>
          </table>
        </div>

        <!-- 5. Footer Summary / Pagination -->
        <div id="datagrid-footer" class="p-2.5 bg-[#080d08] border-2 border-[#00ff66]/60 flex flex-col sm:flex-row items-center justify-between gap-2 font-code text-[11px] text-[#00ff66]/80"></div>
      </div>
    `;

    this.bindEvents();
    this.renderTableHeaders();
    this.renderTableBody();
    this.renderFooter();
  }

  renderTableHeaders() {
    const thead = this.container.querySelector('#datagrid-table-head');
    if (!thead) return;

    const columns = [
      { key: 'id', label: '#', sortable: false, width: 'w-12 text-center' },
      { key: 'name', label: 'REPOSITÓRIO', sortable: true, width: 'min-w-[200px]' },
      { key: 'language', label: 'LINGUAGEM', sortable: true, width: 'w-28' },
      {
        key: 'stargazers_count',
        label: 'ESTRELAS (STARS)',
        sortable: true,
        width: 'w-32 text-right',
      },
      { key: 'forks_count', label: 'FORKS', sortable: true, width: 'w-24 text-right' },
      { key: 'open_issues_count', label: 'ISSUES', sortable: true, width: 'w-20 text-center' },
      { key: 'updated_at', label: 'ATUALIZADO', sortable: true, width: 'w-28' },
      { key: 'actions', label: 'AÇÕES', sortable: false, width: 'w-44 text-center' },
    ];

    let headerHtml = '<tr>';
    columns.forEach((col) => {
      if (!col.sortable) {
        headerHtml += `
          <th class="py-3 px-3.5 border-r border-[#00ff66]/20 font-bold ${col.width}">
            ${col.label}
          </th>
        `;
      } else {
        const isActive = this.sortColumn === col.key;
        const arrow = isActive ? (this.sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅';
        const color = isActive
          ? 'text-[#ffee00] bg-[#00ff66]/10'
          : 'text-[#00ff66] hover:text-[#ffee00]';
        headerHtml += `
          <th
            class="py-3 px-3.5 border-r border-[#00ff66]/20 font-bold cursor-pointer transition-colors ${col.width} ${color} datagrid-header-col"
            data-col="${col.key}"
            title="Clique para ordenar por ${col.label}"
          >
            <div class="flex items-center justify-between gap-1">
              <span>${col.label}</span>
              <span class="font-mono text-xs opacity-90">${arrow}</span>
            </div>
          </th>
        `;
      }
    });
    headerHtml += '</tr>';

    thead.innerHTML = headerHtml;
  }

  renderTableBody() {
    const tbody = this.container.querySelector('#datagrid-table-body');
    if (!tbody) return;

    if (this.filteredRepositories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center font-code text-xs text-[#ff007f] border-dashed border-[#ff007f]/40">
            [NENHUM REPOSITÓRIO ENCONTRADO PARA OS FILTROS APLICADOS]
          </td>
        </tr>
      `;
      return;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageItems = this.filteredRepositories.slice(startIndex, startIndex + this.pageSize);

    tbody.innerHTML = pageItems
      .map((repo, idx) => {
        const globalIndex = startIndex + idx + 1;
        const langColor = getLanguageColor(repo.language);
        const isHot = (repo.stargazers_count || 0) > 1000;
        const dateFormatted = repo.updated_at ? repo.updated_at.substring(0, 10) : '2026-09';
        const topicsHtml = (repo.topics || [])
          .slice(0, 3)
          .map(
            (t) =>
              `<span class="px-1.5 py-0.2 bg-black border border-[#00ff66]/40 text-[9px] text-[#00ff66]/80">#${t}</span>`
          )
          .join(' ');

        return `
          <tr class="border-b border-[#00ff66]/15 hover:bg-[#00ff66]/5 transition-colors group">
            <td class="py-2.5 px-3 border-r border-[#00ff66]/20 text-center font-mono text-[10px] text-[#00ff66]/60">
              ${globalIndex}
            </td>
            <td class="py-2.5 px-3.5 border-r border-[#00ff66]/20">
              <div class="flex items-center gap-2">
                <a
                  href="${repo.html_url}"
                  target="_blank"
                  rel="noreferrer"
                  class="font-pixel text-[11px] text-[#00ff66] group-hover:text-[#ffee00] transition-colors truncate max-w-[240px] block"
                  title="Abrir no GitHub: ${repo.name}"
                >
                  ${repo.display_name || repo.name}
                </a>
                ${isHot ? '<span class="px-1.5 py-0.2 bg-[#ff007f] text-black font-pixel text-[7px] font-bold shrink-0">HOT</span>' : ''}
              </div>
              <div class="text-[11px] text-[#00ff66]/70 truncate max-w-[320px] mt-0.5">
                ${repo.description || 'Repositório de alta performance.'}
              </div>
              ${topicsHtml ? `<div class="flex items-center gap-1 mt-1">${topicsHtml}</div>` : ''}
            </td>
            <td class="py-2.5 px-3 border-r border-[#00ff66]/20">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${langColor};"></span>
                <span class="font-pixel text-[9px] text-[#00f0ff] truncate">${repo.language || 'Plain'}</span>
              </div>
            </td>
            <td class="py-2.5 px-3 border-r border-[#00ff66]/20 text-right">
              <div class="font-mono text-[#ffee00] text-xs font-bold tabular-nums">
                ⭐ ${(repo.stargazers_count || 0).toLocaleString()}
              </div>
            </td>
            <td class="py-2.5 px-3 border-r border-[#00ff66]/20 text-right">
              <div class="font-mono text-[#00f0ff] text-xs tabular-nums">
                🔀 ${(repo.forks_count || 0).toLocaleString()}
              </div>
            </td>
            <td class="py-2.5 px-3 border-r border-[#00ff66]/20 text-center">
              <span class="font-mono text-xs tabular-nums ${(repo.open_issues_count || 0) > 0 ? 'text-[#ff007f]' : 'text-[#00ff66]/60'}">
                ${repo.open_issues_count || 0}
              </span>
            </td>
            <td class="py-2.5 px-3 border-r border-[#00ff66]/20 font-mono text-[10px] text-[#00ff66]/70">
              ${dateFormatted}
            </td>
            <td class="py-2 px-3 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  class="px-2 py-1 bg-[#00ff66] text-black font-pixel text-[8px] font-bold hover:bg-[#ffee00] transition-colors cursor-pointer datagrid-run-btn active:translate-y-0.5"
                  data-id="${repo.id}"
                  title="Executar simulação online do projeto"
                >
                  ▶ SIMULAR
                </button>
                <a
                  href="${repo.html_url}"
                  target="_blank"
                  rel="noreferrer"
                  class="px-2 py-1 bg-black border border-[#ffee00] text-[#ffee00] font-pixel text-[8px] hover:bg-[#ffee00] hover:text-black transition-colors"
                  title="Ver código no GitHub"
                >
                  GITHUB ↗
                </a>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  renderFooter() {
    const footer = this.container.querySelector('#datagrid-footer');
    if (!footer) return;

    const total = this.filteredRepositories.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    const start = total > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
    const end = Math.min(total, this.currentPage * this.pageSize);

    const visibleStars = this.filteredRepositories.reduce(
      (acc, r) => acc + (r.stargazers_count || 0),
      0
    );
    const visibleForks = this.filteredRepositories.reduce(
      (acc, r) => acc + (r.forks_count || 0),
      0
    );

    footer.innerHTML = `
      <div class="flex flex-wrap items-center gap-3">
        <span>EXIBINDO: <b class="text-[#00ff66] font-mono">${start} - ${end}</b> DE <b class="text-[#ffee00] font-mono">${total}</b> REPOSITÓRIOS</span>
        <span class="text-[#00ff66]/30 hidden sm:inline">|</span>
        <span class="text-[#ffee00]">SOMA: ⭐ ${visibleStars.toLocaleString()}</span>
        <span class="text-[#00f0ff]">🔀 ${visibleForks.toLocaleString()}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          id="datagrid-prev-page"
          class="px-2.5 py-1 bg-black border border-[#00ff66] text-[#00ff66] font-pixel text-[8px] hover:bg-[#00ff66] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          ${this.currentPage <= 1 ? 'disabled' : ''}
        >
          &lt; ANTERIOR
        </button>
        <span class="font-pixel text-[9px] text-[#ffee00] px-1">
          ${this.currentPage} / ${totalPages}
        </span>
        <button
          id="datagrid-next-page"
          class="px-2.5 py-1 bg-black border border-[#00ff66] text-[#00ff66] font-pixel text-[8px] hover:bg-[#00ff66] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          ${this.currentPage >= totalPages ? 'disabled' : ''}
        >
          PRÓXIMO &gt;
        </button>
      </div>
    `;

    const prevBtn = footer.querySelector('#datagrid-prev-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          audio.terminalKey();
          this.currentPage--;
          this.renderTableBody();
          this.renderFooter();
        }
      });
    }

    const nextBtn = footer.querySelector('#datagrid-next-page');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          audio.terminalKey();
          this.currentPage++;
          this.renderTableBody();
          this.renderFooter();
        }
      });
    }
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const headerCol = e.target.closest('.datagrid-header-col');
      if (headerCol) {
        const colKey = headerCol.getAttribute('data-col');
        if (colKey) this.handleSort(colKey);
        return;
      }

      const runBtn = e.target.closest('.datagrid-run-btn');
      if (runBtn) {
        const repoId = runBtn.getAttribute('data-id');
        if (this.onViewExecution) this.onViewExecution(repoId);
        return;
      }
    });

    const searchInput = this.container.querySelector('#datagrid-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.applyFilterAndSort();
        this.renderTableBody();
        this.renderFooter();
      });
    }

    const langBtns = this.container.querySelectorAll('.grid-lang-filter-btn');
    langBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        audio.terminalKey();
        this.selectedLanguage = e.currentTarget.getAttribute('data-lang');
        langBtns.forEach((b) => {
          const lang = b.getAttribute('data-lang');
          if (lang === this.selectedLanguage) {
            b.className =
              'grid-lang-filter-btn px-2 py-0.5 font-pixel text-[8px] border transition-colors cursor-pointer bg-[#00ff66] text-black border-[#00ff66] font-bold';
          } else {
            b.className =
              'grid-lang-filter-btn px-2 py-0.5 font-pixel text-[8px] border transition-colors cursor-pointer bg-black text-[#00ff66] border-[#00ff66]/60 hover:border-[#ffee00]';
          }
        });
        this.applyFilterAndSort();
        this.renderTableBody();
        this.renderFooter();
      });
    });

    const exportBtn = this.container.querySelector('#datagrid-export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        audio.play('coin');
        const exportData = {
          organization: this.orgName,
          export_timestamp: new Date().toISOString(),
          stats: this.stats,
          repositories: this.filteredRepositories,
        };
        const jsonStr = JSON.stringify(exportData, null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(jsonStr);
        }
        const oldHtml = exportBtn.innerHTML;
        exportBtn.innerHTML = '✓ COPIADO!';
        exportBtn.className =
          'px-2.5 py-1.5 bg-black border border-[#00ff66] text-[#00ff66] font-pixel text-[9px] cursor-pointer';
        setTimeout(() => {
          exportBtn.innerHTML = oldHtml;
          exportBtn.className =
            'px-2.5 py-1.5 bg-black border border-[#ffee00] text-[#ffee00] font-pixel text-[9px] hover:bg-[#ffee00] hover:text-black transition-colors cursor-pointer';
        }, 2000);
      });
    }

    const refreshBtn = this.container.querySelector('#datagrid-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        audio.play('laser');
        await this.fetchStatistics(true);
        this.render();
      });
    }
  }
}

/**
 * Factory helper function to create and mount the Data-Grid
 */
export function initRepoDataGrid(containerId, options = {}) {
  const grid = new RepoDataGrid(containerId, options);
  grid.init();
  return grid;
}
