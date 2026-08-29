export async function fetchGitHubRepos() {
  try {
    const res = await fetch('/api/github/org-repos');
    if (!res.ok) throw new Error('Falha ao carregar repositórios da API.');
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.warn('[GitHub API Client Warning]:', error.message);
    const fallback = await fetch('/api/repos');
    const data = await fallback.json();
    return data.data || [];
  }
}

export async function fetchTelemetry() {
  try {
    const res = await fetch('/api/telemetry/github');
    const json = await res.json();
    return json.data;
  } catch (error) {
    return {
      username: 'leandrodiascarvalho',
      publicRepos: 14,
      followers: 5,
      systemLoad: 'OFFLINE'
    };
  }
}
