import { ApiClient } from './apiClient.js';

/**
 * GitHub & Telemetry Service Layer
 */

/**
 * Returns brand neon colors for programming languages.
 * @param {string} language
 * @returns {string} Hex color
 */
export function getLanguageColor(language = '') {
  const colors = {
    javascript: '#ffee00',
    typescript: '#00f0ff',
    html: '#ff5722',
    css: '#264de4',
    scss: '#c6538c',
    python: '#3572A5',
    rust: '#dea584',
    go: '#00ADD8',
    vue: '#41b883',
    react: '#61dafb',
    shell: '#89e051',
  };
  return colors[language.toLowerCase()] || '#00ff66';
}

/**
 * Fetches organization repositories and normalizes their schema for DataGrid and Cards.
 * @param {string} orgName
 * @returns {Promise<{ organization: string, source: string, totalStars: number, totalForks: number, languages: string[], repositories: Array<Object> }>}
 */
export async function fetchOrgRepositories(orgName = 'elshanday') {
  let repos;
  let source = 'github_live';

  try {
    const res = await ApiClient.get('/api/github/org-repos');
    repos = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    source = res.fallback ? 'fallback_cache' : 'github_live';
  } catch {
    try {
      const fallback = await ApiClient.get('/api/repos');
      repos = Array.isArray(fallback.data) ? fallback.data : [];
      source = 'local_catalog';
    } catch {
      repos = [];
    }
  }

  const normalized = repos.map((r, i) => ({
    id: r.id || `repo-${i}`,
    name: r.name || 'unnamed-repo',
    display_name: r.display_name || r.name || 'Projeto Sem Nome',
    description: r.description || 'Repositório de engenharia de software.',
    language: r.language || 'JavaScript',
    stargazers_count: r.stargazers_count ?? r.stars ?? 0,
    forks_count: r.forks_count ?? r.forks ?? 0,
    open_issues_count: r.open_issues_count ?? 0,
    updated_at: r.updated_at || '2026-09-22',
    html_url: r.html_url || r.url || 'https://github.com/leandrodiascarvalho/agencia_elshanday',
    live_url:
      r.homepage ||
      r.live_url ||
      r.html_url ||
      r.url ||
      'https://github.com/leandrodiascarvalho/agencia_elshanday',
    topics: Array.isArray(r.topics) ? r.topics : [],
    latency: r.latency || `${(12 + Math.random() * 8).toFixed(1)} ms`,
    isHot: (r.stargazers_count ?? r.stars ?? 0) > 10,
    system_path: `>_ elshanday/${r.name || 'core'}`,
  }));

  const totalStars = normalized.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = normalized.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const languages = [...new Set(normalized.map((r) => r.language).filter(Boolean))];

  return {
    organization: orgName,
    source,
    totalStars,
    totalForks,
    languages,
    repositories: normalized,
  };
}

/**
 * Fetches repository list from backend API proxy with fallbacks.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchGitHubRepos() {
  const result = await fetchOrgRepositories();
  return result.repositories;
}

/**
 * Fetches GitHub telemetry profile.
 * @returns {Promise<Object>}
 */
export async function fetchTelemetry() {
  try {
    const response = await ApiClient.get('/api/telemetry/github');
    return response.data || response;
  } catch {
    return {
      username: 'leandrodiascarvalho',
      publicRepos: 14,
      followers: 5,
      systemLoad: 'STANDBY',
    };
  }
}
