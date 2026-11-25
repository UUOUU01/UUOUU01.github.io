// Mega word assembled from real SVG particle circles: every particle is a
// <circle> node. The word follows the active language via the hidden i18n
// span, and particles glide to their new shape whenever the language changes.
// Also exports the hero background dot field.
const SVG_NS = 'http://www.w3.org/2000/svg';
const POINT_STEP = getComputedStyle(document.documentElement).getPropertyValue('--particle-step').trim();
const MAX_PARTICLES = 1400;    // perf ceiling, step grows if exceeded
const MOUSE_RADIUS = 70;       // repel distance in px
const COLOR_CYCLE = [
  'var(--orange)',
  'var(--sky-deep)',
  '#10B981',  // emerald
  'var(--text-secondary)',
  '#FFFFFF'
];
const COLOR_CYCLE_INTERVAL = 4000; // ms per color

export class MegaParticles {
  constructor(container) {
    this.container = container;
    this.svg = container.querySelector('.mega-svg');
    this.srcEl = container.querySelector('.mega-src');
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

    this.svg.addEventListener('mousemove', e => {
      const rect = this.svg.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.svg.addEventListener('mouseleave', () => { this.mouse.x = -9999; this.mouse.y = -9999; });

    this.setWord(this.srcEl.textContent.trim());
    this.startColorCycle();
    if (!this.reduced) this.tick();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', this.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
  }

  cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Sample the word's pixel grid on an offscreen canvas, return target points.
  sampleWord(word) {
    const off = document.createElement('canvas');
    off.width = this.width;
    off.height = this.height;
    const c = off.getContext('2d');

    // Left-aligned to match the hero: word starts at the left edge.
    const family = getComputedStyle(document.body).getPropertyValue('font-family');
    const baseSize = this.height * 0.95;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.font = `800 ${baseSize}px ${family}`;
    const w = c.measureText(word).width;
    const scale = this.width * 0.96 / w;
    const finalSize = baseSize * scale;
    c.font = `800 ${finalSize}px ${family}`;
    c.fillStyle = '#fff';
    c.fillText(word, 0, this.height / 2);

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

    // Grow/shrink the flock, keep existing positions so the shape morphs
    // instead of snapping when the word changes.
    while (this.particles.length < points.length) {
      const circle = document.createElementNS(SVG_NS, 'circle');
      this.svg.appendChild(circle);
      const r = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--particle-radius').trim());
      const rRange = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--particle-radius-range').trim());
      this.particles.push({
        el: circle,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0, vy: 0, r: r + Math.random() * rRange
      });
    }
    while (this.particles.length > points.length) {
      this.particles.pop().el.remove();
    }

    this.particles.forEach((p, i) => {
      p.tx = points[i].x;
      p.ty = points[i].y;
      p.el.setAttribute('r', p.r);
    });
  }

  startColorCycle() {
    let cycleIndex = 0;
    setInterval(() => {
      cycleIndex = (cycleIndex + 1) % COLOR_CYCLE.length;
      this.particles.forEach(p => {
        p.el.setAttribute('fill', COLOR_CYCLE[cycleIndex]);
      });
    }, COLOR_CYCLE_INTERVAL);
  }

  tick() {
    const { particles, mouse } = this;

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
      p.el.setAttribute('cx', p.x);
      p.el.setAttribute('cy', p.y);
    }
    this.raf = requestAnimationFrame(() => this.tick());
  }
}

// Hero background: a loose field of faint SVG dots drifting on the floatY
// keyframes. Pure CSS animation, no JS per frame.
export function initHeroDots(hero) {
  if (!hero) return;
  const svg = hero.querySelector('.hero-dots');
  if (!svg) return;

  const rect = hero.getBoundingClientRect();
  const palette = [
    { color: 'var(--orange)', weight: 0.35 },
    { color: 'var(--sky-deep)', weight: 0.3 },
    { color: 'var(--text-secondary)', weight: 0.35 }
  ];
  const COUNT = 70;

  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElementNS(SVG_NS, 'circle');
    const roll = Math.random();
    dot.setAttribute('cx', Math.random() * rect.width);
    dot.setAttribute('cy', Math.random() * rect.height);
    dot.setAttribute('r', 1.5 + Math.random() * 2.5);
    dot.setAttribute('fill', roll < palette[0].weight ? palette[0].color
      : roll < palette[0].weight + palette[1].weight ? palette[1].color
      : palette[2].color);
    dot.setAttribute('opacity', (0.18 + Math.random() * 0.3).toFixed(2));
    dot.style.animation = `floatY ${6 + Math.random() * 7}s ease-in-out ${-Math.random() * 8}s infinite`;
    svg.appendChild(dot);
  }
}
