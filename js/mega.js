// Mega word assembled from real SVG particle circles: every particle is a
// <circle> node. The word follows the active language via the hidden i18n
// span, and particles glide to their new shape whenever the language changes.
// Also exports the hero background dot field.
const SVG_NS = 'http://www.w3.org/2000/svg';
const POINT_STEP = 4;          // px between sampled text pixels
const MAX_PARTICLES = 600;     // DOM node ceiling, step grows if exceeded
const MOUSE_RADIUS = 70;       // repel distance in px
const COLOR_MIX = { main: 0.7, orange: 0.15, sky: 0.15 };

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
    let size = this.height * 0.95;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.font = `800 ${size}px ${family}`;
    const w = c.measureText(word).width;
    if (w > this.width * 0.96) size *= (this.width * 0.96) / w;
    c.font = `800 ${size}px ${family}`;
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

  pickColor() {
    const roll = Math.random();
    if (roll < COLOR_MIX.main) return this.cssVar('--text-main');
    if (roll < COLOR_MIX.main + COLOR_MIX.orange) return this.cssVar('--orange');
    return this.cssVar('--sky-deep');
  }

  setWord(word) {
    const points = this.sampleWord(word);

    // Grow/shrink the flock, keep existing positions so the shape morphs
    // instead of snapping when the word changes.
    while (this.particles.length < points.length) {
      const circle = document.createElementNS(SVG_NS, 'circle');
      this.svg.appendChild(circle);
      this.particles.push({
        el: circle,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0, vy: 0, r: 1.3 + Math.random() * 1.3
      });
    }
    while (this.particles.length > points.length) {
      this.particles.pop().el.remove();
    }

    this.particles.forEach((p, i) => {
      p.tx = points[i].x;
      p.ty = points[i].y;
      p.el.setAttribute('r', p.r);
      p.el.setAttribute('fill', this.pickColor());
    });
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
