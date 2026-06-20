/**
 * VeloStream — Particle Network Background
 * Animated canvas with drifting nodes and connecting lines
 */

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.count = this._nodeCount();
    this.maxDist = 160;
    this.raf = null;

    this._resize();
    this._spawn();
    this._loop();

    window.addEventListener('resize', () => {
      this._resize();
      this._adjustNodes();
    });
  }

  _nodeCount() {
    const area = window.innerWidth * window.innerHeight;
    return Math.min(Math.floor(area / 14000), 80);
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.count = this._nodeCount();
  }

  _adjustNodes() {
    while (this.nodes.length < this.count) this._addNode();
    this.nodes.length = this.count;
  }

  _addNode() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const speed = 0.12 + Math.random() * 0.22;
    const angle = Math.random() * Math.PI * 2;
    this.nodes.push({
      x:  Math.random() * w,
      y:  Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  1.2 + Math.random() * 1.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    });
  }

  _spawn() {
    for (let i = 0; i < this.count; i++) this._addNode();
  }

  _loop() {
    this._update();
    this._draw();
    this.raf = requestAnimationFrame(() => this._loop());
  }

  _update() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (const n of this.nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;
      if (n.x < 0) n.x = w;
      if (n.x > w) n.x = 0;
      if (n.y < 0) n.y = h;
      if (n.y > h) n.y = 0;
    }
  }

  _draw() {
    const ctx = this.ctx;
    const w   = this.canvas.width;
    const h   = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const nodes = this.nodes;
    const maxD  = this.maxDist;
    const maxD2 = maxD * maxD;

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxD2) continue;

        const alpha = (1 - d2 / maxD2) * 0.22;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const pAlpha = 0.4 + 0.3 * Math.sin(n.pulse);
      const pR = n.r * (1 + 0.25 * Math.sin(n.pulse));

      ctx.beginPath();
      ctx.arc(n.x, n.y, pR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 245, 255, ${pAlpha})`;
      ctx.fill();

      // Glow
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pR * 5);
      grd.addColorStop(0, `rgba(0, 245, 255, ${pAlpha * 0.3})`);
      grd.addColorStop(1, 'rgba(0, 245, 255, 0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, pR * 5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

window.ParticleNetwork = ParticleNetwork;
