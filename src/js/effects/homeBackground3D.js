export class HomeBackground3D {
  constructor(canvasOrContainer) {
    let el =
      typeof canvasOrContainer === 'string'
        ? document.getElementById(canvasOrContainer) || document.querySelector(canvasOrContainer)
        : canvasOrContainer;

    if (el && el.tagName !== 'CANVAS') {
      let canvas = el.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'w-full h-full block';
        el.appendChild(canvas);
      }
      el = canvas;
    }

    this.canvas = el;
    this.ctx = el && typeof el.getContext === 'function' ? el.getContext('2d') : null;
    this.gridOffset = 0;
    this.animId = null;
    this.handleResize = this.resize.bind(this);

    if (this.canvas && this.ctx) {
      this.start();
    }
  }

  start() {
    if (!this.canvas || !this.ctx || this.animId) return;
    this.resize();
    window.addEventListener('resize', this.handleResize);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement
      ? this.canvas.parentElement.clientWidth
      : window.innerWidth;
    this.canvas.height = this.canvas.parentElement
      ? this.canvas.parentElement.clientHeight || 450
      : 450;
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }

  loop() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    // Synthwave / Cyberpunk Perspective Grid
    this.gridOffset = (this.gridOffset + 0.6) % 30;

    this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
    this.ctx.lineWidth = 1;

    // Horizon line
    const horizon = h * 0.35;

    // Vertical vanishing lines
    const cx = w / 2;
    for (let x = -w; x < w * 2; x += 45) {
      this.ctx.beginPath();
      this.ctx.moveTo(cx, horizon);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }

    // Horizontal receding lines
    for (let y = horizon; y < h; y += 14) {
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
