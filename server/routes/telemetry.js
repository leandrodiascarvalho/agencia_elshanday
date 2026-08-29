import { Router } from 'express';

const router = Router();

router.get('/telemetry/github', async (req, res) => {
  try {
    const userRes = await fetch('https://api.github.com/users/leandrodiascarvalho', {
      headers: { 'User-Agent': 'ElShanday-Cyberpunk-Agency' }
    });
    const userData = userRes.ok ? await userRes.json() : null;

    res.json({
      success: true,
      data: {
        username: userData?.login || 'leandrodiascarvalho',
        publicRepos: userData?.public_repos || 14,
        followers: userData?.followers || 5,
        location: userData?.location || 'Brasil',
        bio: userData?.bio || 'Fullstack & Cyberpunk Web Developer',
        systemLoad: 'OPTIMAL',
        neuralSync: '100%',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        username: 'leandrodiascarvalho',
        publicRepos: 14,
        followers: 5,
        systemLoad: 'STANDBY',
        error: error.message
      }
    });
  }
});

export default router;
