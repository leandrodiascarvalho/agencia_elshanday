export class DoomRaycaster {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.player = { x: 2.5, y: 2.5, dirX: -1, dirY: 0, planeX: 0, planeY: 0.66 };
    this.map = [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1]
    ];
    this.keys = {};
    this.animId = null;
  }

  mount() {
    this.container.innerHTML = `
      <div class="cyber-panel p-6 max-w-xl mx-auto text-center font-['Share_Tech_Mono']">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold font-['Orbitron'] text-[#ff007f]">CYBER_DOOM // RAYCASTER 3D</h3>
          <button id="btn-close-doom" class="text-slate-400 hover:text-red-400 font-bold px-2">X</button>
        </div>
        <canvas id="doom-canvas" width="480" height="320" class="border border-[#ff007f]/40 bg-black rounded mx-auto block"></canvas>
        <p class="text-xs text-[#00f3ff] mt-2">CONTROLES: [W/S] Frente/Trás | [A/D] Girar Visão</p>
      </div>
    `;

    this.canvas = this.container.querySelector('#doom-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.container.querySelector('#btn-close-doom').addEventListener('click', () => {
      this.stop();
      this.container.innerHTML = '';
    });

    window.addEventListener('keydown', e => { this.keys[e.code] = true; });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    this.start();
  }

  start() {
    this.isRunning = true;
    this.renderLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  renderLoop() {
    if (!this.isRunning) return;

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
      this.player.dirX = this.player.dirX * Math.cos(-rotSpeed) - this.player.dirY * Math.sin(-rotSpeed);
      this.player.dirY = oldDirX * Math.sin(-rotSpeed) + this.player.dirY * Math.cos(-rotSpeed);
      const oldPlaneX = this.player.planeX;
      this.player.planeX = this.player.planeX * Math.cos(-rotSpeed) - this.player.planeY * Math.sin(-rotSpeed);
      this.player.planeY = oldPlaneX * Math.sin(-rotSpeed) + this.player.planeY * Math.cos(-rotSpeed);
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      const oldDirX = this.player.dirX;
      this.player.dirX = this.player.dirX * Math.cos(rotSpeed) - this.player.dirY * Math.sin(rotSpeed);
      this.player.dirY = oldDirX * Math.sin(rotSpeed) + this.player.dirY * Math.cos(rotSpeed);
      const oldPlaneX = this.player.planeX;
      this.player.planeX = this.player.planeX * Math.cos(rotSpeed) - this.player.planeY * Math.sin(rotSpeed);
      this.player.planeY = oldPlaneX * Math.sin(rotSpeed) + this.player.planeY * Math.cos(rotSpeed);
    }

    // Render floor and ceiling
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
