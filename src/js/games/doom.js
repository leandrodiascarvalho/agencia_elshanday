import { audio } from '../services/audio.js';

export class DoomRaycaster {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.player = { x: 2.5, y: 2.5, dirX: -1, dirY: 0, planeX: 0, planeY: 0.66 };
    this.map = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ];
    this.keys = {};
    this.animId = null;

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
        <div class="pixel-panel p-6 max-w-xl w-full mx-auto text-center border-4 border-[#ff007f] bg-[#050811] shadow-[8px_8px_0px_#000]">
          <div class="flex justify-between items-center mb-4 font-['Press_Start_2P']">
            <h3 class="text-xs font-bold text-[#ff007f]">CYBER_DOOM // 3D RAYCASTER</h3>
            <button id="btn-close-doom" class="text-slate-400 hover:text-[#ff3344] text-[10px] cursor-pointer">[ESC] X</button>
          </div>
          <canvas id="doom-canvas" width="440" height="280" class="border-2 border-[#ff007f]/50 bg-black mx-auto block max-w-full"></canvas>
          <p class="text-[9px] font-['Press_Start_2P'] text-[#00f3ff] mt-3">[W/S] AVANÇAR/RECUAR | [A/D] GIRAR MIRA</p>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#doom-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.bindEvents();
    this.start();
  }

  bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    const closeBtn = this.container.querySelector('#btn-close-doom');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.destroy());
    }

    this.handleEsc = (e) => {
      if (e.key === 'Escape') this.destroy();
    };
    window.addEventListener('keydown', this.handleEsc);
  }

  start() {
    this.isRunning = true;
    audio.cyberLaser();
    this.renderLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleEsc);
    this.container.innerHTML = '';
  }

  renderLoop() {
    if (!this.isRunning || !this.ctx || !this.canvas) return;

    // Movement logic
    const moveSpeed = 0.05;
    const rotSpeed = 0.04;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      this.player.x += this.player.dirX * moveSpeed;
      this.player.y += this.player.dirY * moveSpeed;
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      this.player.x -= this.player.dirX * moveSpeed;
      this.player.y -= this.player.dirY * moveSpeed;
    }
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      const oldDirX = this.player.dirX;
      this.player.dirX =
        this.player.dirX * Math.cos(-rotSpeed) - this.player.dirY * Math.sin(-rotSpeed);
      this.player.dirY = oldDirX * Math.sin(-rotSpeed) + this.player.dirY * Math.cos(-rotSpeed);
      const oldPlaneX = this.player.planeX;
      this.player.planeX =
        this.player.planeX * Math.cos(-rotSpeed) - this.player.planeY * Math.sin(-rotSpeed);
      this.player.planeY =
        oldPlaneX * Math.sin(-rotSpeed) + this.player.planeY * Math.cos(-rotSpeed);
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      const oldDirX = this.player.dirX;
      this.player.dirX =
        this.player.dirX * Math.cos(rotSpeed) - this.player.dirY * Math.sin(rotSpeed);
      this.player.dirY = oldDirX * Math.sin(rotSpeed) + this.player.dirY * Math.cos(rotSpeed);
      const oldPlaneX = this.player.planeX;
      this.player.planeX =
        this.player.planeX * Math.cos(rotSpeed) - this.player.planeY * Math.sin(rotSpeed);
      this.player.planeY = oldPlaneX * Math.sin(rotSpeed) + this.player.planeY * Math.cos(rotSpeed);
    }

    // Floor and Ceiling
    this.ctx.fillStyle = '#0a0d1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
    this.ctx.fillStyle = '#05070e';
    this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

    // Raycast columns
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let x = 0; x < w; x += 2) {
      const cameraX = (2 * x) / w - 1;
      const rayDirX = this.player.dirX + this.player.planeX * cameraX;
      const rayDirY = this.player.dirY + this.player.planeY * cameraX;

      let mapX = Math.floor(this.player.x);
      let mapY = Math.floor(this.player.y);

      let sideDistX;
      let sideDistY;

      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);
      let perpWallDist;

      let stepX;
      let stepY;
      let hit = 0;
      let side;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (this.player.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (this.player.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY;
      }

      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        if (this.map[mapY] && this.map[mapY][mapX] > 0) hit = 1;
      }

      if (side === 0) perpWallDist = (mapX - this.player.x + (1 - stepX) / 2) / rayDirX;
      else perpWallDist = (mapY - this.player.y + (1 - stepY) / 2) / rayDirY;

      const lineHeight = Math.floor(h / (perpWallDist || 0.001));
      const drawStart = Math.max(0, -lineHeight / 2 + h / 2);
      const drawEnd = Math.min(h - 1, lineHeight / 2 + h / 2);

      this.ctx.fillStyle = side === 1 ? '#ff007f' : '#00f3ff';
      this.ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
    }

    this.animId = requestAnimationFrame(() => this.renderLoop());
  }
}
