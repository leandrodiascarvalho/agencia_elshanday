import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';

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

// In-memory repositories data
const REPOSITORIES = [
  {
    id: 'repo-1',
    name: 'cyber-punk-engine',
    display_name: 'CYBER_PUNK_ENGINE',
    description:
      'Uma engine de renderização 2.5D otimizada para navegadores modernos, focada em efeitos CRT e iluminação volumétrica retro.',
    language: 'JavaScript',
    stargazers_count: 1240,
    forks_count: 312,
    html_url: 'https://github.com/elshanday/cyber-punk-engine',
    topics: ['webgl', 'threejs', 'retro-shaders', 'cyberpunk'],
    system_path: '>_ cyber-core.exe',
    isHot: false,
    code_snippet: `// KERNEL_MGR.CPP\nVOID* MEM_ALLOC(SIZE_T SIZE);\nIF (STATUS == ACTIVE) {\n  EXEC_OP(SUB_ROUTE_ID);\n}`,
  },
  {
    id: 'repo-2',
    name: 'retro-ui-kit',
    display_name: 'RETRO_UI_KIT',
    description:
      'Biblioteca de componentes inspirada em interfaces de sistemas operacionais de 16-bit e terminal digital brutalista.',
    language: 'JavaScript',
    stargazers_count: 845,
    forks_count: 128,
    html_url: 'https://github.com/elshanday/retro-ui-kit',
    topics: ['jquery', 'sass', 'digital-brutalism', 'pixel-art'],
    system_path: '>_ synth-ui.css',
    isHot: false,
    code_snippet: `export const BrutalCard = (title, content) => \`\n  <div class="border-4 border-[#00ff66] shadow-[4px_4px_0px_#00ff66] bg-black p-4">\n    <h3>\${title}</h3>\n    <p>\${content}</p>\n  </div>\`;`,
  },
  {
    id: 'repo-3',
    name: 'neuro-net-visualizer',
    display_name: 'NEURO_NET_VISUAL...',
    description:
      'Uma ferramenta WebGL interativa para visualizar redes neurais em tempo real, com estética de hacker terminal e nós reativos.',
    language: 'HTML/CSS',
    stargazers_count: 3180,
    forks_count: 642,
    html_url: 'https://github.com/elshanday/neuro-net-visualizer',
    topics: ['ai-viz', 'neural-network', 'webgl-matrix', 'real-time'],
    system_path: '>_ net-runner.sh',
    isHot: true,
    code_snippet: `class NeuralNode {\n  constructor(id, layer) {\n    this.weights = new Float32Array(128);\n    this.bias = Math.random() * 0.05;\n  }\n}`,
  },
  {
    id: 'repo-4',
    name: 'op-neon-sky',
    display_name: 'OP: NEON SKY',
    description:
      'Implantação de rede distribuída para infraestrutura ciber-espacial e sincronização peer-to-peer de alta velocidade.',
    language: 'Rust',
    stargazers_count: 940,
    forks_count: 215,
    html_url: 'https://github.com/elshanday/op-neon-sky',
    topics: ['rust', 'webassembly', 'p2p-mesh', 'crypto-net'],
    system_path: 'DIR_01',
    isHot: false,
    code_snippet: `pub fn establish_p2p_channel(node: &str) -> Result<Stream, Error> {\n    let socket = UdpSocket::bind("0.0.0.0:8080")?;\n    socket.connect(node)?;\n    Ok(Stream::from(socket))\n}`,
  },
  {
    id: 'repo-5',
    name: 'cyber-vault',
    display_name: 'CYBER-VAULT',
    description:
      'Sistema de armazenamento descentralizado com criptografia nível militar e auditoria imutável em blocos criptográficos.',
    language: 'Rust',
    stargazers_count: 1560,
    forks_count: 420,
    html_url: 'https://github.com/elshanday/cyber-vault',
    topics: ['blockchain', 'rust', 'zero-knowledge', 'vault-core'],
    system_path: 'DIR_02',
    isHot: false,
    code_snippet: `fn encrypt_payload(data: &[u8], key: &AESKey) -> Vec<u8> {\n    let cipher = Aes256Gcm::new(key);\n    cipher.encrypt(Nonce::from_slice(b"UNIQUE_NONCE_12B"), data).unwrap()\n}`,
  },
  {
    id: 'repo-6',
    name: 'pixel-genesis',
    display_name: 'PIXEL GENESIS',
    description:
      'Engine de renderização customizada para experiências imersivas retrô, partículas quânticas e física baseada em pixels 2D.',
    language: 'C++',
    stargazers_count: 2450,
    forks_count: 530,
    html_url: 'https://github.com/elshanday/pixel-genesis',
    topics: ['wasm', 'cpp', 'pixel-physics', 'game-engine'],
    system_path: 'DIR_03',
    isHot: true,
    code_snippet: `struct Particle {\n    float x, y, vx, vy;\n    uint32_t color_rgba;\n    void step(float dt) { x += vx * dt; y += vy * dt; }\n};`,
  },
];

const SERVICES = [
  {
    id: 'web-dev',
    title: 'Desenvolvimento Web',
    description:
      'Aplicações web robustas, rápidas e escaláveis. Transformamos lógica complexa em experiências fluidas utilizando HTML5, SCSS, JavaScript ES6 e jQuery com performance extrema.',
    tags: ['HTML5', 'SASS', 'ES6', 'JQUERY', 'NODE'],
    borderColor: 'green',
    icon: 'code',
    specs: [
      'Renderização Hiper-rápida',
      'Arquitetura Modular ES6 Limpa',
      'Acessibilidade WCAG e Performance 100 no Lighthouse',
    ],
  },
  {
    id: 'ui-ux',
    title: 'Design UI/UX & Brutalismo',
    description:
      'Interfaces brutais, usabilidade cirúrgica. Desenhamos sistemas de design que capturam a essência do Brutalismo Digital e estética retro-gaming sem sacrificar a clareza.',
    tags: ['FIGMA', 'PIXEL-ART', 'PROTOTIPAGEM'],
    borderColor: 'magenta',
    icon: 'palette',
    specs: [
      'Design Systems Paramétricos',
      'Microinterações e Animações 60fps',
      'Pesquisa de UX e Wireframing de Alta Fidelidade',
    ],
  },
  {
    id: 'api-integration',
    title: 'Integrações & Backends',
    description:
      'Conectando sistemas com eficiência letal. Automações de fluxo de trabalho, APIs REST em Node/Express e sincronização de dados em tempo real.',
    tags: ['NODE.JS', 'EXPRESS', 'REST', 'WEBHOOKS'],
    borderColor: 'yellow',
    icon: 'cpu',
    specs: [
      'Pipelines Automatizados',
      'WebSockets e Streaming',
      'Arquitetura Segura e Baixa Latência',
    ],
  },
  {
    id: 'strategy',
    title: 'Estratégia Digital & SEO',
    description:
      'Mapeamento de jornada, análise competitiva e otimização de busca. Garantimos que seu produto domine o mercado com um posicionamento único e disruptivo.',
    tags: ['SEO', 'ANALYTICS', 'PERFORMANCE'],
    borderColor: 'cyan',
    icon: 'crosshair',
    specs: [
      'Auditoria Técnica e Diagnóstico de Performance',
      'Estratégia de SEO Técnico e Indexação Instantânea',
      'Métricas de Conversão e Otimização',
    ],
  },
];

const FAQ = [
  {
    id: 'faq-1',
    code: '#001',
    icon: 'gamepad-2',
    question: 'COMO INICIAR UMA MISSÃO?',
    answer:
      'Selecione "START_PROJECT" no menu superior ou use a aba BRIEFING. Preencha os parâmetros da sua missão e nossa equipe responderá em menos de 24 horas.',
    status: 'RESOLVIDO',
    category: 'Processo',
  },
  {
    id: 'faq-2',
    code: '#002',
    icon: 'code-xml',
    question: 'QUAIS AS STACKS SUPORTADAS?',
    answer:
      'Trabalhamos com HTML5 semântico, Sass (SCSS), Tailwind CSS, jQuery, Vanilla ES6 Modules, Node.js + Express, além de WebGL, Canvas 2D e integrações REST.',
    status: 'RESOLVIDO',
    category: 'Tecnologia',
  },
  {
    id: 'faq-3',
    code: '#003',
    icon: 'clock',
    question: 'TEMPO DE ENTREGA E PRODUÇÃO?',
    answer:
      'Depende da complexidade do nível e escopo do projeto, variando geralmente entre 2 a 6 semanas para entregas completas em produção com testes de estresse.',
    status: 'VARIAVEL',
    category: 'Prazos',
  },
  {
    id: 'faq-4',
    code: '#004',
    icon: 'shield-check',
    question: 'POLÍTICA DE MANUTENÇÃO E SLA?',
    answer:
      'Oferecemos monitoramento 24/7 com tempo de resposta ágil para suporte e manutenção contínua de patches de segurança e evolução de features.',
    status: 'ONLINE',
    category: 'Suporte',
  },
  {
    id: 'faq-5',
    code: '#005',
    icon: 'git-branch',
    question: 'COMO FUNCIONA A ENTREGA DO CÓDIGO?',
    answer:
      'Todo o código-fonte é entregue em repositórios Git versionados com documentação modular, padrões de commit semântico e deploy automatizado.',
    status: 'ONLINE',
    category: 'DevOps',
  },
  {
    id: 'faq-6',
    code: '#006',
    icon: 'dollar-sign',
    question: 'FORMAS DE PAGAMENTO E CONTRATOS?',
    answer:
      'Aceitamos PIX, transferências bancárias, faturamento corporativo em etapas (milestones) e criptoativos (USDC/ETH). Contratos com NDA e transferência total de PI.',
    status: 'RESOLVIDO',
    category: 'Financeiro',
  },
];

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
  } catch (_e) {
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
    reply = `[SUB-ROUTINE: SERVICES_QUERY]\nOferecemos:\n1. DESENVOLVIMENTO WEB: HTML5, SASS, ES6 JS, jQuery, Node + Express\n2. DESIGN UI/UX: Brutalismo digital, wireframing e design systems\n3. BACKENDS & APIs: Node.js, Express, arquitetura REST e WebSockets\n4. ESTRATÉGIA & SEO: Performance 100% e posicionamento digital.\nUse a aba 'SERVIÇOS' para detalhar!`;
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
    reply = `[TECH_MATRIX]\nStack nativa:\n- Frontend: HTML5 Semântico, Sass (SCSS), Tailwind CSS, ES6 Modules, jQuery\n- Backend: Node.js + Express\n- Performance: Zero overhead, carregamento ultrarrápido!`;
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
