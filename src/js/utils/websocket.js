// WebSocket Real-time Live Sync Client Manager
import { state } from '../core/state.js';
import { audio } from '../services/audio.js';

export class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.reconnectTimer = null;
    this.pingInterval = null;
    this.lastPingTime = 0;

    this.connect();
  }

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  connect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      const url = this.getWebSocketUrl();
      console.log(`[LIVE_SYNC] Conectando ao WebSocket: ${url}`);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = () => this.handleClose();
      this.ws.onerror = (err) => this.handleError(err);
    } catch (e) {
      console.warn('[LIVE_SYNC] Falha ao instanciar WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  handleOpen() {
    console.log('[LIVE_SYNC] WebSocket conectado com sucesso!');
    state.wsConnected = true;
    this.reconnectAttempts = 0;

    this.updateUI(true);

    // Start periodic heartbeat ping (every 15s)
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => this.sendPing(), 15000);

    // Initial ping
    this.sendPing();

    window.dispatchEvent(
      new CustomEvent('app:ws-status', {
        detail: { connected: true, activeUsers: state.activeUsers },
      })
    );
  }

  sendPing() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.lastPingTime = Date.now();
      this.ws.send(JSON.stringify({ type: 'ping', clientTime: this.lastPingTime }));
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'presence:init' || data.type === 'presence:update') {
        const prevCount = state.activeUsers;
        state.activeUsers = Math.max(1, data.activeUsers || 1);
        if (state.stats) {
          state.stats.active_connections = state.activeUsers;
        }

        this.renderActiveUsers(prevCount !== state.activeUsers);

        window.dispatchEvent(
          new CustomEvent('app:ws-presence', {
            detail: {
              activeUsers: state.activeUsers,
              previous: prevCount,
              timestamp: data.timestamp,
            },
          })
        );
      } else if (data.type === 'pong') {
        if (this.lastPingTime) {
          const latency = Math.max(1, Date.now() - this.lastPingTime);
          state.wsLatency = latency;
          if (state.stats) {
            state.stats.latency_ms = `${latency}ms`;
          }
          const latencyEl = document.getElementById('live-sync-latency');
          if (latencyEl) {
            latencyEl.textContent = `${latency}ms`;
          }
        }
      }
    } catch (err) {
      console.error('[LIVE_SYNC] Erro ao processar mensagem WS:', err);
    }
  }

  handleClose() {
    state.wsConnected = false;
    this.updateUI(false);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.scheduleReconnect();
  }

  handleError(err) {
    console.warn('[LIVE_SYNC] Erro na conexão WebSocket:', err);
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    console.log(
      `[LIVE_SYNC] Tentando reconectar em ${(delay / 1000).toFixed(1)}s (tentativa #${this.reconnectAttempts})...`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  updateUI(isConnected) {
    const headerBadge = document.getElementById('header-live-sync');
    const statusTickerBadge = document.getElementById('ticker-live-sync');
    const indicators = document.querySelectorAll('.ws-status-indicator');
    const statusLabels = document.querySelectorAll('.ws-status-label');

    if (isConnected) {
      if (headerBadge) {
        headerBadge.classList.remove(
          'border-[#ff007f]',
          'text-[#ff007f]',
          'shadow-[2px_2px_0px_#ff007f]'
        );
        headerBadge.classList.add(
          'border-[#00ff66]',
          'text-[#00ff66]',
          'shadow-[2px_2px_0px_#00ff66]'
        );
      }
      if (statusTickerBadge) {
        statusTickerBadge.classList.remove('text-[#ff007f]');
        statusTickerBadge.classList.add('text-[#00ff66]');
      }
      indicators.forEach((ind) => {
        ind.classList.remove('bg-[#ff007f]');
        ind.classList.add('bg-[#00ff66]', 'animate-pulse');
      });
      statusLabels.forEach((label) => {
        label.textContent = 'LIVE_SYNC';
      });
    } else {
      if (headerBadge) {
        headerBadge.classList.remove(
          'border-[#00ff66]',
          'text-[#00ff66]',
          'shadow-[2px_2px_0px_#00ff66]'
        );
        headerBadge.classList.add(
          'border-[#ff007f]',
          'text-[#ff007f]',
          'shadow-[2px_2px_0px_#ff007f]'
        );
      }
      if (statusTickerBadge) {
        statusTickerBadge.classList.remove('text-[#00ff66]');
        statusTickerBadge.classList.add('text-[#ff007f]');
      }
      indicators.forEach((ind) => {
        ind.classList.remove('bg-[#00ff66]', 'animate-pulse');
        ind.classList.add('bg-[#ff007f]');
      });
      statusLabels.forEach((label) => {
        label.textContent = 'RECONNECT';
      });
    }

    this.renderActiveUsers(false);
  }

  renderActiveUsers(hasChanged = false) {
    const count = String(state.activeUsers);
    const countSelectors = [
      'header-active-users-count',
      'mobile-active-users-count',
      'ticker-active-users-count',
      'console-active-users-count',
    ];

    countSelectors.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    });

    if (hasChanged) {
      const badges = [
        document.getElementById('header-live-sync'),
        document.getElementById('mobile-live-sync'),
      ].filter(Boolean);

      badges.forEach((b) => b.classList.add('animate-ping-once', 'bg-[#00ff66]/20'));

      if (state.soundEnabled) {
        audio.play('coin');
      }

      setTimeout(() => {
        badges.forEach((b) => b.classList.remove('animate-ping-once', 'bg-[#00ff66]/20'));
      }, 600);
    }
  }
}

let instance = null;

export function initWebSocket() {
  if (!instance) {
    instance = new WebSocketClient();
  }
  return instance;
}
