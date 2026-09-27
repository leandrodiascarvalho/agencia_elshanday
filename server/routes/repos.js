import { Router } from 'express';
import { REPOSITORIES } from '../data/repositories.js';

const router = Router();

// In-memory cache for GitHub repositories (5 minutes TTL)
let cachedRepos = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

router.get('/repos', (_req, res) => {
  res.json({
    success: true,
    data: REPOSITORIES,
  });
});

router.get('/github/org-repos', async (_req, res) => {
  const now = Date.now();

  if (cachedRepos && now - lastFetchTime < CACHE_TTL_MS) {
    return res.json({ success: true, cached: true, data: cachedRepos });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      'https://api.github.com/users/leandrodiascarvalho/repos?sort=updated&per_page=6',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ElShanday-Retro-Agency/1.0',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.json({ success: true, fallback: true, data: REPOSITORIES });
    }

    const data = await response.json();
    cachedRepos = data;
    lastFetchTime = now;

    res.json({ success: true, cached: false, data });
  } catch {
    res.json({ success: true, fallback: true, data: REPOSITORIES });
  }
});

export default router;
