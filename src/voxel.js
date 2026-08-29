export class VoxelCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.angle = 0;
    this.animId = null;
  }

  start() {
    if (!this.canvas || !this.ctx) return;
    this.render();
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.angle += 0.02;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const size = 30;

    // Render wireframe rotating cube
    const points = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];

    const projected = points.map(([x, y, z]) => {
      const rotX = x * Math.cos(this.angle) - z * Math.sin(this.angle);
      const rotZ = x * Math.sin(this.angle) + z * Math.cos(this.angle);
      const scale = 120 / (rotZ + 3);
      return [cx + rotX * size * scale, cy + y * size * scale];
    });

    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();

    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];

    edges.forEach(([p1, p2]) => {
      this.ctx.moveTo(projected[p1][0], projected[p1][1]);
      this.ctx.lineTo(projected[p2][0], projected[p2][1]);
    });

    this.ctx.stroke();
    this.animId = requestAnimationFrame(() => this.render());
  }
}
