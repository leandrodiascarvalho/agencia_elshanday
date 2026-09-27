import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';
import { REPOSITORIES as CURATED_REPOSITORIES } from './server/data/repositories.js';
import { SERVICES as CURATED_SERVICES } from './server/data/services.js';
import { FAQ as CURATED_FAQ } from './server/data/faq.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Create HTTP and WebSocket Servers
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Track active WebSocket users in real-time
let activeWsClients = 0;

function broadcastPresence() {
  const payload = JSON.stringify({
    type: 'presence:update',
    activeUsers: Math.max(1, activeWsClients),
    timestamp: new Date().toISOString(),
    serverTime: Date.now(),
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  activeWsClients++;
  console.log(`[WS] Client connected. Active users: ${activeWsClients}`);

  // Send initial presence state to newly connected client
  ws.send(
    JSON.stringify({
      type: 'presence:init',
      activeUsers: Math.max(1, activeWsClients),
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
    })
  );

  // Broadcast updated count to all connected clients
  broadcastPresence();

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ping') {
        ws.send(
          JSON.stringify({ type: 'pong', clientTime: msg.clientTime, serverTime: Date.now() })
        );
      }
    } catch {
      // ignore
    }
  });

  let isCleanedUp = false;
  const handleDisconnect = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    activeWsClients = Math.max(0, activeWsClients - 1);
    console.log(`[WS] Client disconnected. Active users: ${activeWsClients}`);
    broadcastPresence();
  };

  ws.on('close', handleDisconnect);
  ws.on('error', handleDisconnect);
});

// Explicit upgrade handler for /ws endpoint
server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
      return;
    }
  } catch {
    // Ignore invalid upgrade URLs
  }
  socket.destroy();
});

// Curated data imported from server/data/ modules (single source of truth)
const REPOSITORIES = CURATED_REPOSITORIES;
const SERVICES = CURATED_SERVICES;
const FAQ = CURATED_FAQ;

// In-memory submissions store
const BRIEFING_SUBMISSIONS = [];

// ================= API ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    engine: 'Node.js + Express (ES6 Modules)',
  });
});

app.get('/api/repos', (req, res) => {
  const { search, lang } = req.query;
  let results = [...REPOSITORIES];

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (lang && lang !== 'ALL') {
    results = results.filter((r) => r.language.toLowerCase() === String(lang).toLowerCase());
  }

  res.json({
    total: results.length,
    repositories: results,
  });
});

app.get('/api/services', (req, res) => {
  res.json({ services: SERVICES });
});

app.get('/api/faq', (req, res) => {
  res.json({ faq: FAQ });
});

app.get('/api/stats', (req, res) => {
  const mem = process.memoryUsage();
  const heapUsedMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
  const heapTotalMB = (mem.heapTotal / 1024 / 1024).toFixed(1);
  const rssMB = (mem.rss / 1024 / 1024).toFixed(1);

  res.json({
    cpu_load: (Math.random() * 8 + 12).toFixed(1) + '%',
    memory_used: `${heapUsedMB} MB / ${heapTotalMB} MB`,
    memory_details: {
      heapUsedMB: parseFloat(heapUsedMB),
      heapTotalMB: parseFloat(heapTotalMB),
      rssMB: parseFloat(rssMB),
      simulatedV8Usage: Math.min(
        95,
        Math.max(20, 35 + Math.sin(Date.now() / 4000) * 18 + Math.random() * 6)
      ).toFixed(1),
      bufferCacheMB: (42.5 + Math.random() * 5).toFixed(1),
    },
    active_connections: Math.max(1, activeWsClients),
    subroutines_active: 8,
    uptime_seconds: Math.floor(process.uptime()),
    latency_ms: (Math.random() * 12 + 18).toFixed(1) + 'ms',
  });
});

// Live GitHub API Latency Probe
app.get('/api/telemetry/github', async (req, res) => {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://api.github.com/zen', {
      headers: {
        'User-Agent': 'ELSHANDAY-Cyberpunk-Telemetry/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    const rateLimit = response.headers.get('x-ratelimit-remaining') || '60';
    const rateLimitLimit = response.headers.get('x-ratelimit-limit') || '60';

    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      latency_ms: latencyMs,
      endpoint: 'https://api.github.com/zen',
      rate_limit_remaining: rateLimit,
      rate_limit_limit: rateLimitLimit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    res.json({
      success: false,
      status: 504,
      statusText: error.name === 'AbortError' ? 'Gateway Timeout' : 'Network Error',
      latency_ms: latencyMs > 0 ? latencyMs : (Math.random() * 40 + 80).toFixed(1),
      endpoint: 'https://api.github.com/zen',
      rate_limit_remaining: '45',
      rate_limit_limit: '60',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GitHub Organization Repos Proxy & Cache
app.get('/api/github/org-repos', async (req, res) => {
  const org = req.query.org || 'elshanday';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let ghRes = await fetch(`https://api.github.com/orgs/${org}/repos?sort=updated&per_page=100`, {
      headers: {
        'User-Agent': 'ELSHANDAY-Cyberpunk-Telemetry/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });

    if (ghRes.status === 404) {
      ghRes = await fetch(`https://api.github.com/users/${org}/repos?sort=updated&per_page=100`, {
        headers: {
          'User-Agent': 'ELSHANDAY-Cyberpunk-Telemetry/1.0',
          Accept: 'application/vnd.github.v3+json',
        },
      });
    }

    clearTimeout(timeoutId);

    if (ghRes.ok) {
      const data = await ghRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return res.json({
          source: 'github_live_api',
          org,
          total: data.length,
          repositories: data,
        });
      }
    }
  } catch {
    // Failover
  }

  // Graceful fallback to verified curated repositories
  res.json({
    source: 'vault_fallback',
    org,
    total: REPOSITORIES.length,
    repositories: REPOSITORIES,
  });
});

app.post('/api/briefing', (req, res) => {
  const { clientName, clientEmail, projectType, budget, deadline, description, services } =
    req.body;

  if (!clientName || !clientEmail || !description) {
    return res.status(400).json({ error: 'Campos obrigatórios: Nome, Email e Descrição.' });
  }

  const newSubmission = {
    id: 'MISSION_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    clientName,
    clientEmail,
    projectType: projectType || 'WEB_APPLICATION',
    budget: budget || 'R$ 5.000 - R$ 15.000',
    deadline: deadline || '4_WEEKS',
    description,
    services: services || [],
    createdAt: new Date().toISOString(),
    status: 'RECEIVED',
  };

  BRIEFING_SUBMISSIONS.unshift(newSubmission);

  res.json({
    success: true,
    missionId: newSubmission.id,
    message: 'Missão recebida e despachada para a equipe de engenharia ELSHANDAY.',
    data: newSubmission,
  });
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem vazia.' });
  }

  // System persona for ELSHANDAY studio
  const systemPrompt = `Você é o CYBER_AI da ELSHANDAY // STUDIO OBSCURA.
Seu tom é técnico, cyberpunk, retro-terminal, brutalista e extremamente direto, profissional e prestativo.
A ELSHANDAY é uma agência digital de elite focada em:
- Desenvolvimento Web com HTML5, SCSS, ES6 JavaScript, jQuery e Node + Express
- Design UI/UX brutalista e pixel-perfect
- Performance extrema (100 Lighthouse), APIs seguras e WebSockets
- Criação de experiências imersivas digitais e retro gaming
Responda em português de forma concisa e estilizada (use tags estilo terminal como [STATUS], [OUTPUT], [INFO], [OK] quando couber, mas com formatação legível).`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = 'gemini-2.5-flash';

      const contents = [];
      if (Array.isArray(history)) {
        for (const msg of history.slice(-6)) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text || msg.content || '' }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nPergunta do usuário: ${message}` }],
      });

      const response = await ai.models.generateContent({
        model,
        contents,
      });

      const responseText = response.text || '[SYSTEM] Resposta gerada com sucesso.';
      return res.json({ reply: responseText });
    }
  } catch (err) {
    console.error('Gemini API Error:', err);
  }

  // Fallback intelligent responder if API key not configured or failed
  const msgLower = message.toLowerCase();
  let reply;

  if (msgLower.includes('serviço') || msgLower.includes('service') || msgLower.includes('fazem')) {
    reply = `[SUB-ROUTINE: SERVICES_QUERY]\nOferecemos:\n1. DESENVOLVIMENTO WEB: HTML5, CSS3/Tailwind, ES6 JS, Node + Express\n2. DESIGN UI/UX: Brutalismo digital, wireframing e design systems\n3. BACKENDS & APIs: Node.js, Express, arquitetura REST e WebSockets\n4. ESTRATÉGIA & SEO: Performance 100% e posicionamento digital.\nUse a aba 'SERVIÇOS' para detalhar!`;
  } else if (
    msgLower.includes('preço') ||
    msgLower.includes('custo') ||
    msgLower.includes('orçamento') ||
    msgLower.includes('valor')
  ) {
    reply = `[CALCULATOR_SUBROUTINE]\nNossos projetos partem de protótipos rápidos (R$ 3.500) até ecossistemas corporativos complexos (R$ 25.000+).\nUse a aba 'BRIEFING' ou a calculadora integrada para simular o orçamento exato em segundos!`;
  } else if (
    msgLower.includes('contato') ||
    msgLower.includes('email') ||
    msgLower.includes('falar')
  ) {
    reply = `[DISPATCH_CHANNEL]\nCanais ativos:\n- Email: ops@elshanday.dev\n- Terminal: Envie um briefing direto pela aba BRIEFING\n- SLA de resposta: < 24 horas terrestres.`;
  } else if (msgLower.includes('tecnologia') || msgLower.includes('stack')) {
    reply = `[TECH_MATRIX]\nStack nativa:\n- Frontend: HTML5 Semântico, CSS3 Modular, Tailwind CSS, ES6 Modules\n- Backend: Node.js + Express\n- Performance: Zero overhead, carregamento ultrarrápido!`;
  } else {
    reply = `[STATUS: ONLINE]\nRecebido comando: "${message.slice(0, 40)}"\nO Studio Obscura está pronto para operacionalizar seu próximo projeto digital.\nExplore as abas SERVIÇOS, REPOSITÓRIO e BRIEFING para iniciar sua missão!`;
  }

  return res.json({ reply });
});

// ================= VITE / STATIC MIDDLEWARE =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ELSHANDAY SERVER] Node + Express running on http://0.0.0.0:${PORT}`);
    console.log(`[ELSHANDAY WS] Real-time WebSocket active on ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer();
