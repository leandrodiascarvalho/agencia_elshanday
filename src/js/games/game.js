import { audio } from '../services/audio.js';

export class CyberDodgerGame {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.player = { x: 180, y: 350, w: 24, h: 24, speed: 6 };
    this.obstacles = [];
    this.score = 0;
    this.isRunning = false;
    this.keys = {};
    this.animationId = null;

    this.handleKeyDown = (e) => {
      this.keys[e.code] = true;
    };
    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };
  }

  mount() {
    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <div class="pixel-panel p-6 max-w-lg w-full mx-auto text-center border-4 border-[#00f3ff] bg-[#050811] shadow-[8px_8px_0px_#000]">
          <div class="flex justify-between items-center mb-4 font-['Press_Start_2P']">
            <h3 class="text-xs font-bold text-[#00f3ff]">CYBER_DODGER // 2D</h3>
            <button id="btn-close-dodger" class="text-slate-400 hover:text-[#ff3344] text-[10px] cursor-pointer">[ESC] X</button>
          </div>
          <div class="mb-3 text-[10px] font-['Press_Start_2P'] flex justify-between text-[#ffee00]">
            <span>SCORE: <span id="dodger-score" class="text-white">0</span></span>
            <span class="hidden sm:inline">[A][D] OU [←][→]</span>
          </div>
          <canvas id="dodger-canvas" width="380" height="360" class="border-2 border-[#00f3ff]/50 bg-black mx-auto block max-w-full"></canvas>
          <div class="flex gap-3 justify-center mt-4">
            <button id="btn-start-dodger" class="pixel-btn pixel-btn--primary py-2 px-6 text-[10px]">
              ▶ START GAME
            </button>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#dodger-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    const startBtn = this.container.querySelector('#btn-start-dodger');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    }

    const closeBtn = this.container.querySelector('#btn-close-dodger');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.destroy());
    }

    this.handleEsc = (e) => {
      if (e.key === 'Escape') this.destroy();
    };
    window.addEventListener('keydown', this.handleEsc);
  }

  start() {
    this.obstacles = [];
    this.score = 0;
    this.player.x = 180;
    this.isRunning = true;
    audio.cyberLaser();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleEsc);
    this.container.innerHTML = '';
  }

  loop() {
    if (!this.isRunning || !this.ctx || !this.canvas) return;

    // Player Movement
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.player.speed;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.player.speed;
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.w, this.player.x));

    // Spawn Obstacles
    if (Math.random() < 0.05) {
      this.obstacles.push({
        x: Math.random() * (this.canvas.width - 24),
        y: -20,
        w: 20 + Math.random() * 24,
        h: 16,
        speed: 3 + Math.random() * 3,
      });
    }

    // Clear Canvas
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render Player
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);

    // Render Obstacles
    this.ctx.fillStyle = '#ff007f';
    this.ctx.shadowColor = '#ff007f';

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += obs.speed;
      this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // Collision Detection
      if (
        this.player.x < obs.x + obs.w &&
        this.player.x + this.player.w > obs.x &&
        this.player.y < obs.y + obs.h &&
        this.player.y + this.player.h > obs.y
      ) {
        this.gameOver();
        return;
      }

      if (obs.y > this.canvas.height) {
        this.obstacles.splice(i, 1);
        this.score += 10;
        const scoreEl = this.container.querySelector('#dodger-score');
        if (scoreEl) scoreEl.textContent = this.score;
      }
    }

    this.animationId = requestAnimationFrame(() => this.loop());
  }

  gameOver() {
    this.isRunning = false;
    audio.playJump();
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = '#ffee00';
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
  }
}
