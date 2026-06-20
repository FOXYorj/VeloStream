/**
 * VeloStream — Sparkline Chart
 * Lightweight canvas-based throughput visualizer
 */

class SparklineChart {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.data   = [];
    this.max    = opts.max    ?? 100;
    this.color  = opts.color  ?? '#00f5ff';
    this.fill   = opts.fill   ?? true;
    this.points = opts.points ?? 40;
    this.raf    = null;

    // Seed with zeros
    for (let i = 0; i < this.points; i++) this.data.push(0);

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    this.canvas.width  = rect.width  * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this._draw();
  }

  push(value) {
    this.data.push(value);
    if (this.data.length > this.points) this.data.shift();
    this._draw();
  }

  _draw() {
    const ctx = this.ctx;
    const w   = this.canvas.getBoundingClientRect().width;
    const h   = this.canvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);

    if (this.data.length < 2) return;

    const step    = w / (this.data.length - 1);
    const padding = 4;
    const drawH   = h - padding * 2;

    ctx.beginPath();
    this.data.forEach((val, i) => {
      const x = i * step;
      const y = padding + drawH - (val / this.max) * drawH;
      if (i === 0) ctx.moveTo(x, y);
      else {
        // Smooth curve
        const prevX = (i - 1) * step;
        const prevY = padding + drawH - (this.data[i - 1] / this.max) * drawH;
        const cpX   = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });

    // Stroke
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Fill
    if (this.fill) {
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, this.color.replace(')', ', 0.22)').replace('rgb', 'rgba'));
      grad.addColorStop(1, this.color.replace(')', ', 0)').replace('rgb', 'rgba'));
      // hex fallback
      if (this.color.startsWith('#')) {
        const r = parseInt(this.color.slice(1,3),16);
        const g = parseInt(this.color.slice(3,5),16);
        const b = parseInt(this.color.slice(5,7),16);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.2)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      }
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

window.SparklineChart = SparklineChart;
