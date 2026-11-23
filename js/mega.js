// Mega word rendered as flat particles that assemble into the text.
// The word follows the active language via the hidden i18n span, and the
// particles glide to their new shape whenever the language changes.
const POINT_STEP = 4;          // px between sampled text pixels
const MAX_PARTICLES = 1400;    // perf ceiling, step grows if exceeded
const MOUSE_RADIUS = 70;       // repel distance in px
const COLORS = { main: 0.7, orange: 0.15, sky: 0.15 }; // share of particles

export class MegaParticles {
  constructor(container) {
    this.container = container;
    this.canvas = container.querySelector('.mega-canvas');
    this.srcEl = container.querySelector('.mega-src');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.raf = null;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.setWord(this.srcEl.textContent.trim());
    });
    document.addEventListener('langchange', () => this.setWord(this.srcEl.textContent.trim()));

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.canvas.addEventListener('mouseleave', () => { this.mouse.x = -9999; this.mouse.y = -9999; });

    this.setWord(this.srcEl.textContent.trim());
    if (this.reduced) this.drawStatic();
    else this.tick();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Sample the word's pixels on an offscreen canvas, return target points.
  sampleWord(word) {
    const off = document.createElement('canvas');
    off.width = this.width;
    off.height = this.height;
    const c = off.getContext('2d');

    const family = getComputedStyle(document.body).getPropertyValue('font-family');
    let size = this.height * 0.95;
    c.font = `800 ${size}px ${family}`;
    const w = c.measureText(word).width;
    if (w > this.width * 0.96) size *= (this.width * 0.96) / w;
    c.font = `800 ${size}px ${family}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#fff';
    c.fillText(word, this.width / 2, this.height / 2);

    let step = POINT_STEP;
    let points = this.scanPoints(c, off.width, off.height, step);
    while (points.length > MAX_PARTICLES) {
      step++;
      points = this.scanPoints(c, off.width, off.height, step);
    }
    return points;
  }

  scanPoints(ctx, w, h, step) {
    const data = ctx.getImageData(0, 0, w, h).data;
    const points = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 128) points.push({ x, y });
      }
    }
    return points;
  }

  setWord(word) {
    const points = this.sampleWord(word);
    const palette = [
      { color: this.cssVar('--text-main'), weight: COLORS.main },
      { color: this.cssVar('--orange'), weight: COLORS.orange },
      { color: this.cssVar('--sky-deep'), weight: COLORS.sky }
    ];

    // Grow/shrink the flock, keep existing positions so the shape morphs
    // instead of snapping when the word changes.
    while (this.particles.length < points.length) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0, vy: 0, r: 1.4 + Math.random() * 1.2
      });
    }
    this.particles.length = points.length;

    this.particles.forEach((p, i) => {
      p.tx = points[i].x;
      p.ty = points[i].y;
      const roll = Math.random();
      p.color = roll < palette[0].weight ? palette[0].color
        : roll < palette[0].weight + palette[1].weight ? palette[1].color
        : palette[2].color;
    });
  }

  tick() {
    const { ctx, particles, mouse } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const p of particles) {
      // spring toward the target shape
      p.vx += (p.tx - p.x) * 0.02;
      p.vy += (p.ty - p.y) * 0.02;

      // cursor punches a hole in the word
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
        const d = Math.sqrt(d2) || 1;
        const force = (MOUSE_RADIUS - d) / MOUSE_RADIUS * 1.6;
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;
      }

      p.vx *= 0.88;
      p.vy *= 0.88;
      p.x += p.vx;
      p.y += p.vy;

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.r, p.r);
    }
    this.raf = requestAnimationFrame(() => this.tick());
  }

  drawStatic() {
    const { ctx, particles } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.tx, p.ty, p.r, p.r);
    }
  }
}
