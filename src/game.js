import { audio } from './audio.js';

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
  }

  mount() {
    this.container.innerHTML = `
      <div class="cyber-panel p-6 max-w-lg mx-auto text-center font-['Share_Tech_Mono']">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold font-['Orbitron'] text-[#00f3ff]">CYBER_DODGER // V1.0</h3>
          <button id="btn-close-dodger" class="text-slate-400 hover:text-red-400 font-bold px-2">X</button>
        </div>
        <div class="mb-2 text-sm flex justify-between text-[#fefe00]">
          <span>SCORE: <span id="dodger-score">0</span></span>
          <span>USE: [A][D] ou [←][→]</span>
        </div>
        <canvas id="dodger-canvas" width="400" height="400" class="border border-[#00f3ff]/40 bg-black rounded mx-auto block"></canvas>
        <button id="btn-start-dodger" class="mt-4 px-6 py-2 rounded bg-[#00f3ff] text-black font-bold font-['Orbitron'] hover:bg-[#00f3ff]/80 transition">
          INICIAR JOGO
        </button>
      </div>
    `;

    this.canvas = this.container.querySelector('#dodger-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', e => { this.keys[e.code] = true; });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    this.container.querySelector('#btn-start-dodger').addEventListener('click', () => {
      this.start();
    });

    this.container.querySelector('#btn-close-dodger').addEventListener('click', () => {
      this.stop();
      this.container.innerHTML = '';
    });
  }

  start() {
    this.obstacles = [];
    this.score = 0;
    this.player.x = 188;
    this.isRunning = true;
    audio.cyberLaser();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  loop() {
    if (!this.isRunning) return;

    // Player Movement
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.player.speed;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.player.speed;
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.w, this.player.x));

    // Spawn Obstacles
    if (Math.random() < 0.05) {
      this.obstacles.push({
        x: Math.random() * (this.canvas.width - 20),
        y: -20,
        w: 20 + Math.random() * 20,
        h: 15,
        speed: 3 + Math.random() * 3
      });
    }

    // Update
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render Player
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);

    // Update & Render Obstacles
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
    this.ctx.fillStyle = '#fefe00';
    this.ctx.font = '24px Orbitron';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SISTEMA ROMPIDO (GAME OVER)', this.canvas.width / 2, this.canvas.height / 2);
  }
}
