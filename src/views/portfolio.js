import { fetchGitHubRepos } from '../github.js';

export async function renderPortfolio(container) {
  container.innerHTML = `
    <div class="space-y-8">
      <div>
        <h2 class="text-3xl font-black font-['Orbitron'] text-white mb-2">REPOSITÓRIOS & <span class="text-[#ff007f]">PROJETOS</span></h2>
        <p class="text-slate-400 font-['Share_Tech_Mono']">Explorando o código-fonte, arquitetura aberta e experimentos digitais.</p>
      </div>

      <div id="portfolio-loading" class="text-center py-12 text-[#00f3ff] font-['Share_Tech_Mono']">
        Sincronizando dados com o GitHub...
      </div>

      <div id="repos-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden"></div>
    </div>
  `;

  const repos = await fetchGitHubRepos();
  const loading = container.querySelector('#portfolio-loading');
  const grid = container.querySelector('#repos-grid');

  if (loading) loading.style.display = 'none';
  if (grid) {
    grid.classList.remove('hidden');
    grid.innerHTML = repos.map(repo => `
      <div class="cyber-panel p-6 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono text-[#00ff66]">${repo.language || 'JavaScript'}</span>
            <span class="text-xs font-mono text-slate-400">⭐ ${repo.stargazers_count || repo.stars || 0}</span>
          </div>
          <h3 class="text-lg font-bold font-['Orbitron'] text-[#00f3ff] mb-2">${repo.name}</h3>
          <p class="text-xs text-slate-300 mb-4 line-clamp-3">${repo.description || 'Repositório de desenvolvimento de software e experimentos.'}</p>
        </div>
        <a href="${repo.html_url || repo.url || '#'}" target="_blank" class="block text-center py-2 rounded bg-slate-900 border border-slate-700 hover:border-[#00f3ff] text-slate-300 hover:text-[#00f3ff] font-['Share_Tech_Mono'] text-xs transition">
          ACESSAR CÓDIGO FONTE ↗
        </a>
      </div>
    `).join('');
  }
}
