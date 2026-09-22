export class VoxelCanvas {
  constructor(canvasOrId) {
    this.canvas =
      typeof canvasOrId === 'string'
        ? document.getElementById(canvasOrId) || document.querySelector(canvasOrId)
        : canvasOrId;
    this.ctx =
      this.canvas && typeof this.canvas.getContext === 'function'
        ? this.canvas.getContext('2d')
        : null;
    this.angleX = 0;
    this.angleY = 0;
    this.autoRotateSpeed = 0.015;
    this.animId = null;
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    this.handleMouseDown = this.onMouseDown.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseUp = this.onMouseUp.bind(this);

    if (this.canvas && this.ctx) {
      this.bindDragEvents();
      this.start();
    }
  }

  bindDragEvents() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.prevMouseX;
    const deltaY = e.clientY - this.prevMouseY;
    this.angleY += deltaX * 0.01;
    this.angleX += deltaY * 0.01;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  }

  onMouseUp() {
    this.isDragging = false;
  }

  start() {
    if (!this.canvas || !this.ctx || this.animId) return;
    this.render();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.isDragging) {
      this.angleY += this.autoRotateSpeed;
      this.angleX += this.autoRotateSpeed * 0.5;
    }

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const size = 32;

    const points = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];

    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);

    const projected = points.map(([x, y, z]) => {
      // Rotation Y
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotation X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = 160 / (z2 + 3.5);
      return [cx + x1 * size * scale, cy + y2 * size * scale];
    });

    this.ctx.strokeStyle = '#00ff66';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#00ff66';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();

    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    edges.forEach(([p1, p2]) => {
      this.ctx.moveTo(projected[p1][0], projected[p1][1]);
      this.ctx.lineTo(projected[p2][0], projected[p2][1]);
    });

    this.ctx.stroke();

    // Render cyber neon core vertex points
    this.ctx.fillStyle = '#ffee00';
    this.ctx.shadowColor = '#ffee00';
    this.ctx.shadowBlur = 10;
    projected.forEach(([px, py]) => {
      this.ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
    });

    this.animId = requestAnimationFrame(() => this.render());
  }
}
