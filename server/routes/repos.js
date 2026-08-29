import { Router } from 'express';
import { REPOSITORIES } from '../data/repositories.js';

const router = Router();

router.get('/repos', (req, res) => {
  res.json({
    success: true,
    data: REPOSITORIES
  });
});

router.get('/github/org-repos', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/users/leandrodiascarvalho/repos?sort=updated&per_page=6', {
      headers: { 'User-Agent': 'ElShanday-Cyberpunk-Agency' }
    });
    if (!response.ok) {
      return res.json({ success: true, fallback: true, data: REPOSITORIES });
    }
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: true, fallback: true, data: REPOSITORIES, error: error.message });
  }
});

export default router;
