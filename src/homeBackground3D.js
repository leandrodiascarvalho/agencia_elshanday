export class HomeBackground3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.gridOffset = 0;
    this.animId = null;
  }

  start() {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    this.canvas.height = 350;
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  loop() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    // Synthwave / Cyberpunk Perspective Grid
    this.gridOffset = (this.gridOffset + 0.8) % 30;

    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
    this.ctx.lineWidth = 1;

    // Horizon line
    const horizon = h * 0.4;

    // Vertical vanishing lines
    const cx = w / 2;
    for (let x = -w; x < w * 2; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(cx, horizon);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }

    // Horizontal receding lines
    for (let y = horizon; y < h; y += 15) {
      const dynamicY = y + this.gridOffset;
      if (dynamicY > horizon && dynamicY < h) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, dynamicY);
        this.ctx.lineTo(w, dynamicY);
        this.ctx.stroke();
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}
