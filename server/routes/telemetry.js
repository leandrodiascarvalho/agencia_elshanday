import { Router } from 'express';

const router = Router();

let cachedTelemetry = null;
let lastTelemetryTime = 0;
const TELEMETRY_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

router.get('/telemetry/github', async (_req, res) => {
  const now = Date.now();

  if (cachedTelemetry && now - lastTelemetryTime < TELEMETRY_TTL_MS) {
    return res.json({ success: true, cached: true, data: cachedTelemetry });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const userRes = await fetch('https://api.github.com/users/leandrodiascarvalho', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ElShanday-Retro-Agency/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    clearTimeout(timeoutId);
    const userData = userRes.ok ? await userRes.json() : null;

    const telemetryData = {
      username: userData?.login || 'leandrodiascarvalho',
      publicRepos: userData?.public_repos || 14,
      followers: userData?.followers || 5,
      location: userData?.location || 'Brasil',
      bio: userData?.bio || 'Fullstack & Retro Web Developer',
      systemLoad: 'OPTIMAL',
      neuralSync: '100%',
      timestamp: new Date().toISOString(),
    };

    cachedTelemetry = telemetryData;
    lastTelemetryTime = now;

    res.json({ success: true, cached: false, data: telemetryData });
  } catch {
    res.json({
      success: true,
      fallback: true,
      data: {
        username: 'leandrodiascarvalho',
        publicRepos: 14,
        followers: 5,
        location: 'Brasil',
        bio: 'Fullstack & Retro Web Developer',
        systemLoad: 'STANDBY',
        neuralSync: '95%',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
