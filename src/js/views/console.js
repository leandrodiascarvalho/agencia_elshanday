// Console View Renderer (Telemetry & System Logs)
import { state } from '../core/state.js';
import { audio } from '../services/audio.js';
import { ApiClient } from '../services/apiClient.js';
import { escapeHtml } from '../utils/dom.js';

let telemetryTimer = null;
const githubLatencyHistory = [18, 22, 20, 24, 19, 21, 25, 20];
const memoryUsageHistory = [35, 38, 42, 40, 45, 43, 41, 39];

export function renderConsole(container) {
  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }

  if (!container) return () => {};

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b-4 border-[#00ff66] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="font-pixel text-xs text-[#ffee00] mb-1">NODE.JS + EXPRESS // LIVE TELEMETRY CORE</div>
          <h1 class="font-pixel text-xl sm:text-2xl md:text-3xl text-[#00ff66] glitch-text">
            SISTEMA &amp; CONSOLE DE TELEMETRIA
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button id="toggle-console-info-btn" class="px-3 py-1.5 bg-black border-2 border-[#ffee00] text-[#ffee00] font-pixel text-[10px] hover:bg-[#ffee00] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>ℹ️</span> PARA QUE SERVE O CONSOLE?
          </button>
          <div class="flex items-center gap-2 bg-black border border-[#00ff66] px-3 py-1">
            <span class="w-2.5 h-2.5 bg-[#00ff66] rounded-full animate-ping"></span>
            <span class="font-pixel text-[10px] text-[#00ff66]">TELEMETRY: ACTIVE</span>
          </div>
          <div class="flex items-center gap-2 bg-black border border-[#00ff66] px-3 py-1">
            <span class="ws-status-indicator w-2.5 h-2.5 bg-[#00ff66] rounded-full animate-pulse"></span>
            <span class="font-pixel text-[10px] text-[#00ff66]">LIVE_SYNC: <span id="console-active-users-count" class="text-[#ffee00] font-bold">${state.activeUsers}</span> ONLINE</span>
          </div>
        </div>
      </div>

      <!-- EXPLANATION BANNER (COLLAPSIBLE) -->
      <div id="console-info-banner" class="hidden p-5 bg-[#080d08] border-2 border-[#ffee00] pixel-shadow-yellow space-y-3">
        <div class="flex items-center justify-between">
          <div class="font-pixel text-xs text-[#ffee00] flex items-center gap-2">
            <span>💡</span> DIRETRIZ ARQUITETURAL // UTILIDADE DO CONSOLE
          </div>
          <button id="close-console-info-btn" class="text-xs text-[#ffee00] hover:text-white font-pixel cursor-pointer">[FECHAR X]</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-code text-[#00ff66]/90 leading-relaxed">
          <div class="space-y-2 bg-black/60 p-3 border border-[#00ff66]/30">
            <div class="font-pixel text-[10px] text-[#00f0ff]">1. PARA QUE SERVE ESTE CONSOLE?</div>
            <p>
              Ele atua como o <strong>Centro de Observabilidade e Diagnóstico</strong> da agência. Centraliza a saúde das APIs externas (como a latência do GitHub), o ciclo de alocação de memória do V8 e o fluxo de eventos do backend Express em tempo real.
            </p>
          </div>
          <div class="space-y-2 bg-black/60 p-3 border border-[#ffee00]/30">
            <div class="font-pixel text-[10px] text-[#ffee00]">2. ELE É REALMENTE NECESSÁRIO?</div>
            <p>
              Em um website comum de marketing ele seria opcional, mas no ecossistema <em>Cyberpunk Brutalist</em> da ELSHANDAY ele cumpre 3 funções vitais: <strong>(1) Prova técnica de capacidade full-stack</strong>, <strong>(2) Terminal CLI interativo para testes</strong> e <strong>(3) Monitoramento de latência e SLAs</strong> em tempo real.
            </p>
          </div>
        </div>
      </div>

      <!-- MAIN TELEMETRY DASHBOARD PANEL (MEMORY & GITHUB API) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- TELEMETRY BLOCK 1: SIMULATED MEMORY & V8 HEAP ENGINE -->
        <div class="p-5 bg-black border-4 border-[#00ff66] shadow-[5px_5px_0px_#00ff66] space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#00ff66]/60 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-[#00ff66] text-sm">🧠</span>
              <span class="font-pixel text-xs text-[#00ff66]">TELEMETRIA_DE_MEMÓRIA (V8 HEAP)</span>
            </div>
            <span class="font-pixel text-[9px] text-[#ffee00] bg-[#ffee00]/10 px-2 py-0.5 border border-[#ffee00]/40">
              SIMULATED DYNAMIC ALLOC
            </span>
          </div>

          <!-- Memory Big Gauges -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-3 bg-[#080d08] border border-[#00ff66]/50">
              <div class="font-pixel text-[9px] text-[#00ff66]/70">HEAP_UTILIZADO</div>
              <div id="telemetry-heap-used" class="font-pixel text-lg text-[#ffee00] mt-1">248.4 MB</div>
              <div class="text-[9px] font-code text-[#00ff66]/60">V8 Heap Alloc</div>
            </div>
            <div class="p-3 bg-[#080d08] border border-[#00ff66]/50">
              <div class="font-pixel text-[9px] text-[#00ff66]/70">LIMITE_MÁXIMO</div>
              <div id="telemetry-heap-total" class="font-pixel text-lg text-[#00f0ff] mt-1">1024 MB</div>
              <div class="text-[9px] font-code text-[#00ff66]/60">Heap Max Ceiling</div>
            </div>
            <div class="p-3 bg-[#080d08] border border-[#00ff66]/50 col-span-2 sm:col-span-1">
              <div class="font-pixel text-[9px] text-[#00ff66]/70">RSS_PROCESS</div>
              <div id="telemetry-rss-mb" class="font-pixel text-lg text-[#ff007f] mt-1">84.2 MB</div>
              <div class="text-[9px] font-code text-[#00ff66]/60">Resident Set Size</div>
            </div>
          </div>

          <!-- Memory Usage Visual Progress Bar -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-[10px] font-pixel">
              <span class="text-[#00ff66]">OCUPAÇÃO DO POOL DE MEMÓRIA</span>
              <span id="telemetry-mem-percent" class="text-[#ffee00]">38.5%</span>
            </div>
            <div class="w-full bg-[#080d08] border-2 border-[#00ff66] h-4 p-0.5 overflow-hidden flex">
              <div id="telemetry-mem-bar" class="bg-gradient-to-r from-[#00ff66] via-[#ffee00] to-[#ff007f] h-full transition-all duration-500" style="width: 38.5%;"></div>
            </div>
            <div class="flex justify-between text-[9px] font-code text-[#00ff66]/60">
              <span>0 MB (Cold)</span>
              <span>Buffer Cache: <span id="telemetry-buffer-cache" class="text-[#ffee00]">44.8 MB</span></span>
              <span>1024 MB (Ceiling)</span>
            </div>
          </div>

          <!-- Memory Sparkline Wave -->
          <div class="p-3 bg-[#050805] border border-[#00ff66]/40 space-y-1">
            <div class="flex items-center justify-between text-[9px] font-pixel text-[#00ff66]/70">
              <span>HISTÓRICO DE CONSUMO (ÚLTIMOS CICLOS)</span>
              <span class="text-[#ffee00] font-mono">POOL MONITOR</span>
            </div>
            <div id="memory-sparkline" class="flex items-end gap-1.5 h-12 pt-2 border-b border-[#00ff66]/20"></div>
          </div>

          <!-- GC Trigger Simulation Button -->
          <div class="flex items-center justify-between pt-1">
            <div class="text-[10px] font-code text-[#00ff66]/70">
              Status GC: <span id="gc-status-label" class="text-[#00ff66]">IDLE (AUTOMÁTICO)</span>
            </div>
            <button id="trigger-gc-btn" class="px-3 py-1.5 bg-[#00ff66] text-black font-pixel text-[9px] font-bold hover:bg-[#ffee00] active:translate-y-0.5 transition-all cursor-pointer">
              ⚡ FORÇAR GC CYCLE (SIMULAR)
            </button>
          </div>
        </div>

        <!-- TELEMETRY BLOCK 2: GITHUB API LIVE CONNECTION LATENCY -->
        <div class="p-5 bg-black border-4 border-[#ffee00] shadow-[5px_5px_0px_#ffee00] space-y-4">
          <div class="flex items-center justify-between border-b-2 border-[#ffee00]/60 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-[#ffee00] text-sm">🌐</span>
              <span class="font-pixel text-xs text-[#ffee00]">GITHUB_API // PROBE DE LATÊNCIA</span>
            </div>
            <span id="github-probe-status-badge" class="font-pixel text-[9px] text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 border border-[#00ff66]/40">
              STATUS: 200 OK
            </span>
          </div>

          <!-- Latency Big Gauges -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-3 bg-[#080d08] border border-[#ffee00]/50">
              <div class="font-pixel text-[9px] text-[#ffee00]/70">LATÊNCIA_ATUAL</div>
              <div id="telemetry-gh-latency" class="font-pixel text-lg text-[#00ff66] mt-1">21.4 ms</div>
              <div class="text-[9px] font-code text-[#00ff66]/60">RTT Ping Real</div>
            </div>
            <div class="p-3 bg-[#080d08] border border-[#ffee00]/50">
              <div class="font-pixel text-[9px] text-[#ffee00]/70">JITTER / OSCILAÇÃO</div>
              <div id="telemetry-gh-jitter" class="font-pixel text-lg text-[#ffee00] mt-1">&plusmn; 2.1 ms</div>
              <div class="text-[9px] font-code text-[#00ff66]/60">Estabilidade de Rede</div>
            </div>
            <div class="p-3 bg-[#080d08] border border-[#ffee00]/50 col-span-2 sm:col-span-1">
              <div class="font-pixel text-[9px] text-[#ffee00]/70">RATE_LIMIT_RESTANTE</div>
              <div id="telemetry-gh-ratelimit" class="font-pixel text-lg text-[#00f0ff] mt-1">58 / 60</div>
              <div class="text-[9px] font-code text-[#00ff66]/60">GitHub Public API</div>
            </div>
          </div>

          <!-- Latency Gauge Meter Bar -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-[10px] font-pixel">
              <span class="text-[#ffee00]">QUALIDADE DA CONEXÃO EXTERNA</span>
              <span id="telemetry-gh-quality" class="text-[#00ff66]">EXCELENTE (&lt; 50ms)</span>
            </div>
            <div class="w-full bg-[#080d08] border-2 border-[#ffee00] h-4 p-0.5 overflow-hidden flex">
              <div id="telemetry-latency-bar" class="bg-[#00ff66] h-full transition-all duration-500" style="width: 22%;"></div>
            </div>
            <div class="flex justify-between text-[9px] font-code text-[#00ff66]/60">
              <span>0 ms</span>
              <span>Endpoint: <span class="text-[#ffee00]">api.github.com/zen</span></span>
              <span>200 ms</span>
            </div>
          </div>

          <!-- GitHub Latency Sparkline Wave -->
          <div class="p-3 bg-[#050805] border border-[#ffee00]/40 space-y-1">
            <div class="flex items-center justify-between text-[9px] font-pixel text-[#ffee00]/70">
              <span>RTT HISTOGRAMA (ms)</span>
              <span id="telemetry-gh-lastprobe" class="text-[#00f0ff] font-mono">Último probe: agora</span>
            </div>
            <div id="github-sparkline" class="flex items-end gap-1.5 h-12 pt-2 border-b border-[#ffee00]/20"></div>
          </div>

          <!-- Probe Action Controls -->
          <div class="flex items-center justify-between pt-1">
            <div class="text-[10px] font-code text-[#00ff66]/70">
              Intervalo: <span class="text-[#ffee00]">Auto (3s)</span>
            </div>
            <button id="probe-github-now-btn" class="px-3 py-1.5 bg-[#ffee00] text-black font-pixel text-[9px] font-bold hover:bg-[#00ff66] active:translate-y-0.5 transition-all cursor-pointer">
              ⚡ PING GITHUB API AGORA
            </button>
          </div>
        </div>

      </div>

      <!-- Live Terminal Console Stream & Subroutine Dispatcher -->
      <div class="p-6 bg-black border-4 border-[#00ff66] shadow-[6px_6px_0px_#ffee00] space-y-4">
        <div class="flex items-center justify-between border-b-2 border-[#00ff66] pb-2">
          <div class="flex items-center gap-2">
            <span class="font-pixel text-xs text-[#ffee00]">&gt;_</span>
            <span class="font-pixel text-xs text-[#00ff66]">LIVE_SYSTEM_LOGS.STREAM</span>
          </div>
          <div class="flex gap-2">
            <button id="clear-logs-btn" class="px-2.5 py-1 font-pixel text-[9px] bg-black border border-[#00ff66] text-[#00ff66] hover:bg-[#00ff66] hover:text-black cursor-pointer">
              LIMPAR LOGS
            </button>
            <button id="inject-ping-btn" class="px-2.5 py-1 font-pixel text-[9px] bg-[#ffee00] text-black font-bold hover:bg-[#00ff66] cursor-pointer">
              TEST_PING
            </button>
          </div>
        </div>

        <!-- Log entries container -->
        <div id="console-logs-list" class="h-64 overflow-y-auto space-y-1.5 font-code text-xs p-2 bg-[#050805] border border-[#00ff66]/40"></div>

        <!-- Interactive inline prompt -->
        <div class="flex items-center gap-2 pt-2 border-t border-[#00ff66]/30">
          <span class="font-pixel text-xs text-[#ffee00]">&gt;</span>
          <input
            type="text"
            id="console-inline-input"
            placeholder="Comandos: /ping, /github, /memory, /gc, /stats, /clear..."
            class="flex-1 bg-transparent font-code text-xs text-[#00ff66] placeholder-[#00ff66]/40 focus:outline-none"
          />
          <button id="console-inline-send" class="px-4 py-1.5 bg-[#00ff66] text-black font-pixel text-[10px] font-bold hover:bg-[#ffee00] cursor-pointer">
            EXECUTAR
          </button>
        </div>
      </div>
    </div>
  `;

  function renderSparklines() {
    const memSpark = container.querySelector('#memory-sparkline');
    if (memSpark) {
      memSpark.innerHTML = memoryUsageHistory
        .map((val) => {
          const heightPercent = Math.min(100, Math.max(15, (val / 100) * 100));
          return `<div class="flex-1 bg-[#00ff66]/80 hover:bg-[#ffee00] transition-all rounded-t-sm" style="height: ${heightPercent}%;" title="${val}% heap"></div>`;
        })
        .join('');
    }

    const ghSpark = container.querySelector('#github-sparkline');
    if (ghSpark) {
      ghSpark.innerHTML = githubLatencyHistory
        .map((val) => {
          const heightPercent = Math.min(100, Math.max(15, (val / 120) * 100));
          let colorClass = 'bg-[#00ff66]';
          if (val > 60) colorClass = 'bg-[#ffee00]';
          if (val > 100) colorClass = 'bg-[#ff007f]';
          return `<div class="flex-1 ${colorClass} hover:opacity-100 transition-all rounded-t-sm opacity-80" style="height: ${heightPercent}%;" title="${val} ms"></div>`;
        })
        .join('');
    }
  }

  function renderLogs() {
    const list = container.querySelector('#console-logs-list');
    if (!list) return;

    list.innerHTML = (state.systemLogs || [])
      .map((log) => {
        let color = 'text-[#00ff66]';
        if (log.type === 'warning') color = 'text-[#ffee00]';
        if (log.type === 'error') color = 'text-[#ff007f]';
        if (log.type === 'info') color = 'text-[#00f0ff]';
        if (log.type === 'success') color = 'text-[#00ff66] font-bold';

        return `
          <div class="flex items-start gap-3">
            <span class="text-[#00ff66]/50 font-mono text-[10px] shrink-0">[${escapeHtml(log.timestamp || '')}]</span>
            <span class="${color} break-all">${escapeHtml(log.text || '')}</span>
          </div>
        `;
      })
      .join('');

    list.scrollTop = list.scrollHeight;
  }

  function addLog(text, type = 'info') {
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    if (!state.systemLogs) state.systemLogs = [];
    state.systemLogs.push({ id: String(Date.now()), timestamp: time, text, type });
    if (state.systemLogs.length > 50) {
      state.systemLogs.shift();
    }
    renderLogs();
  }

  async function fetchMemoryTelemetry() {
    try {
      const data = await ApiClient.get('/api/stats');
      if (data && data.memory_details) {
        const heapUsed = data.memory_details.heapUsedMB;
        const heapTotal = data.memory_details.heapTotalMB;
        const rss = data.memory_details.rssMB;
        const simulatedPercent = parseFloat(data.memory_details.simulatedV8Usage);
        const buffer = data.memory_details.bufferCacheMB;

        const heapUsedEl = container.querySelector('#telemetry-heap-used');
        const heapTotalEl = container.querySelector('#telemetry-heap-total');
        const rssEl = container.querySelector('#telemetry-rss-mb');
        const bufferEl = container.querySelector('#telemetry-buffer-cache');
        const memPercentEl = container.querySelector('#telemetry-mem-percent');
        const memBarEl = container.querySelector('#telemetry-mem-bar');

        if (heapUsedEl) heapUsedEl.textContent = `${heapUsed} MB`;
        if (heapTotalEl) heapTotalEl.textContent = `${heapTotal} MB`;
        if (rssEl) rssEl.textContent = `${rss} MB`;
        if (bufferEl) bufferEl.textContent = `${buffer} MB`;
        if (memPercentEl) memPercentEl.textContent = `${simulatedPercent}%`;
        if (memBarEl) memBarEl.style.width = `${simulatedPercent}%`;

        memoryUsageHistory.push(simulatedPercent);
        if (memoryUsageHistory.length > 18) memoryUsageHistory.shift();
        renderSparklines();
      }
    } catch {
      // Offline fallback
    }
  }

  async function fetchGitHubTelemetry(manual = false) {
    try {
      const data = await ApiClient.get('/api/telemetry/github');
      const latency =
        typeof data.latency_ms === 'number' ? data.latency_ms : parseFloat(data.latency_ms) || 20;

      const latencyEl = container.querySelector('#telemetry-gh-latency');
      const ratelimitEl = container.querySelector('#telemetry-gh-ratelimit');
      const jitterEl = container.querySelector('#telemetry-gh-jitter');
      const latencyBar = container.querySelector('#telemetry-latency-bar');
      const qualityEl = container.querySelector('#telemetry-gh-quality');
      const lastProbeEl = container.querySelector('#telemetry-gh-lastprobe');
      const probeBadge = container.querySelector('#github-probe-status-badge');

      if (latencyEl) latencyEl.textContent = `${latency.toFixed(1)} ms`;
      if (ratelimitEl)
        ratelimitEl.textContent = `${data.rate_limit_remaining || '58'} / ${data.rate_limit_limit || '60'}`;

      const prev = githubLatencyHistory[githubLatencyHistory.length - 1] || latency;
      const jitter = Math.abs(latency - prev).toFixed(1);
      if (jitterEl) jitterEl.textContent = `± ${jitter} ms`;

      const percent = Math.min(100, Math.max(8, (latency / 120) * 100));
      if (latencyBar) latencyBar.style.width = `${percent}%`;

      if (qualityEl && latencyBar) {
        if (latency < 40) {
          qualityEl.textContent = 'EXCELENTE (< 40ms)';
          qualityEl.className = 'text-[#00ff66]';
          latencyBar.className = 'bg-[#00ff66] h-full';
        } else if (latency < 90) {
          qualityEl.textContent = 'ESTÁVEL (< 90ms)';
          qualityEl.className = 'text-[#ffee00]';
          latencyBar.className = 'bg-[#ffee00] h-full';
        } else {
          qualityEl.textContent = 'ELEVADO (> 90ms)';
          qualityEl.className = 'text-[#ff007f]';
          latencyBar.className = 'bg-[#ff007f] h-full';
        }
      }

      const now = new Date();
      if (lastProbeEl) lastProbeEl.textContent = `Último probe: ${now.toLocaleTimeString()}`;
      if (probeBadge)
        probeBadge.textContent = `STATUS: ${data.status || 200} ${data.statusText || 'OK'}`;

      githubLatencyHistory.push(latency);
      if (githubLatencyHistory.length > 18) githubLatencyHistory.shift();
      renderSparklines();

      if (manual) {
        addLog(
          `[GITHUB PROBE] 200 OK | Latência: ${latency.toFixed(1)}ms | RateLimit: ${data.rate_limit_remaining || 58}/${data.rate_limit_limit || 60}`,
          'success'
        );
      }
    } catch {
      const probeBadge = container.querySelector('#github-probe-status-badge');
      if (probeBadge) {
        probeBadge.textContent = 'STATUS: FAILOVER';
        probeBadge.className =
          'text-[#ff007f] font-pixel text-[9px] bg-[#ff007f]/10 px-2 py-0.5 border border-[#ff007f]/40';
      }
    }
  }

  // Toggle info explanation banner
  const banner = container.querySelector('#console-info-banner');
  const toggleInfoBtn = container.querySelector('#toggle-console-info-btn');
  const closeInfoBtn = container.querySelector('#close-console-info-btn');

  if (toggleInfoBtn && banner) {
    toggleInfoBtn.addEventListener('click', () => {
      audio.play('click');
      banner.classList.toggle('hidden');
    });
  }

  if (closeInfoBtn && banner) {
    closeInfoBtn.addEventListener('click', () => {
      audio.play('click');
      banner.classList.add('hidden');
    });
  }

  const probeNowBtn = container.querySelector('#probe-github-now-btn');
  if (probeNowBtn) {
    probeNowBtn.addEventListener('click', () => {
      audio.play('laser');
      fetchGitHubTelemetry(true);
    });
  }

  const triggerGcBtn = container.querySelector('#trigger-gc-btn');
  const gcStatusLabel = container.querySelector('#gc-status-label');
  if (triggerGcBtn) {
    triggerGcBtn.addEventListener('click', () => {
      audio.play('laser');
      if (gcStatusLabel) {
        gcStatusLabel.textContent = 'SWEEPING & COMPACTING...';
        gcStatusLabel.className = 'text-[#ffee00] font-bold animate-pulse';
      }
      addLog(
        '[GC V8 ENGINE] Ciclo de Garbage Collection forçado. Liberando buffers temporários...',
        'warning'
      );

      setTimeout(() => {
        const dropVal = (20 + Math.random() * 8).toFixed(1);
        const memPercent = container.querySelector('#telemetry-mem-percent');
        const memBar = container.querySelector('#telemetry-mem-bar');
        if (memPercent) memPercent.textContent = `${dropVal}%`;
        if (memBar) memBar.style.width = `${dropVal}%`;

        memoryUsageHistory[memoryUsageHistory.length - 1] = parseFloat(dropVal);
        renderSparklines();
        if (gcStatusLabel) {
          gcStatusLabel.textContent = 'IDLE (RECUPERADO)';
          gcStatusLabel.className = 'text-[#00ff66]';
        }
        addLog(
          `[GC V8 ENGINE] Concluído: ~18.4 MB reciclados. Pool estável em ${dropVal}%.`,
          'success'
        );
        audio.play('coin');
      }, 900);
    });
  }

  const clearLogsBtn = container.querySelector('#clear-logs-btn');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      audio.play('click');
      state.systemLogs = [
        { id: '1', timestamp: '00:00:00', text: '[LOG BUFFER CLEARED]', type: 'info' },
      ];
      renderLogs();
    });
  }

  const injectPingBtn = container.querySelector('#inject-ping-btn');
  if (injectPingBtn) {
    injectPingBtn.addEventListener('click', () => {
      audio.play('laser');
      addLog(
        `PING request dispatched -> ACK response in ${(Math.random() * 8 + 14).toFixed(1)}ms`,
        'success'
      );
    });
  }

  const inlineInput = container.querySelector('#console-inline-input');
  const inlineSend = container.querySelector('#console-inline-send');

  function execInline() {
    if (!inlineInput) return;
    const cmd = inlineInput.value.trim();
    if (!cmd) return;
    inlineInput.value = '';
    audio.play('terminal_beep');

    addLog(`EXEC: ${cmd}`, 'info');

    const lower = cmd.toLowerCase();
    if (lower === '/ping' || lower === 'ping') {
      addLog('PONG from Node+Express backend cluster [200 OK]', 'success');
    } else if (lower === '/github' || lower === 'github') {
      fetchGitHubTelemetry(true);
    } else if (lower === '/memory' || lower === 'memory') {
      const heapUsed = container.querySelector('#telemetry-heap-used')?.textContent || '';
      const heapTotal = container.querySelector('#telemetry-heap-total')?.textContent || '';
      const memPercent = container.querySelector('#telemetry-mem-percent')?.textContent || '';
      addLog(`HEAP: ${heapUsed} / ${heapTotal} | Ocupação: ${memPercent}`, 'warning');
    } else if (lower === '/gc' || lower === 'gc') {
      if (triggerGcBtn) triggerGcBtn.click();
    } else if (lower === '/time' || lower === 'time') {
      addLog(`SERVER_TIME: ${new Date().toISOString()}`, 'info');
    } else if (lower === '/clear' || lower === 'clear') {
      state.systemLogs = [];
      renderLogs();
    } else if (lower === '/focus' || lower === 'focus') {
      window.dispatchEvent(new CustomEvent('app:open-terminal'));
      window.dispatchEvent(new CustomEvent('app:set-focus-mode', { detail: { enabled: true } }));
      addLog('Disparando Modo Foco Imersivo no Terminal...', 'success');
    } else if (lower === '/stats' || lower === 'stats') {
      const memPercent = container.querySelector('#telemetry-mem-percent')?.textContent || '';
      const ghLatency = container.querySelector('#telemetry-gh-latency')?.textContent || '';
      addLog(`V8 Pool: ${memPercent} | GitHub Latência: ${ghLatency}`, 'warning');
    } else {
      addLog(`Comando "${cmd}" transmitido ao cluster com sucesso.`, 'success');
    }
  }

  if (inlineSend) inlineSend.addEventListener('click', execInline);
  if (inlineInput) {
    inlineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') execInline();
    });
  }

  renderLogs();
  renderSparklines();
  fetchMemoryTelemetry();
  fetchGitHubTelemetry();

  const onWsPresence = (e) => {
    if (e.detail) {
      const countEl = container.querySelector('#console-active-users-count');
      if (countEl) countEl.textContent = e.detail.activeUsers;
      const diff = e.detail.activeUsers - (e.detail.previous || 0);
      if (diff > 0) {
        addLog(
          `[WS_EVENT] +${diff} cliente conectado. Nós simultâneos: ${e.detail.activeUsers}`,
          'success'
        );
      } else if (diff < 0) {
        addLog(
          `[WS_EVENT] Cliente desconectado. Nós simultâneos: ${e.detail.activeUsers}`,
          'warning'
        );
      }
    }
  };
  window.addEventListener('app:ws-presence', onWsPresence);

  telemetryTimer = setInterval(() => {
    fetchMemoryTelemetry();
    fetchGitHubTelemetry();
  }, 3200);

  return () => {
    if (telemetryTimer) {
      clearInterval(telemetryTimer);
      telemetryTimer = null;
    }
    window.removeEventListener('app:ws-presence', onWsPresence);
  };
}
