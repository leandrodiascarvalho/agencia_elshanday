import path from 'path';
import express from 'express';

export async function setupVite(app) {
  const isProd = process.env.NODE_ENV === 'production';
  const root = process.cwd();

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root
    });

    app.use(vite.middlewares);
    return vite;
  } else {
    const distPath = path.resolve(root, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    return null;
  }
}
