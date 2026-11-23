// Click feedback: a ripple inside every button-like element plus a small
// particle burst at the cursor. Every click answers back.
const BURST_COLORS = ['var(--orange)', 'var(--sky-deep)', 'var(--text-main)'];

function spawnRipple(host, event) {
  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  host.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

function spawnBurst(x, y) {
  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('span');
    dot.className = 'click-dot';
    dot.style.background = BURST_COLORS[i % BURST_COLORS.length];
    dot.style.left = `${x - 4}px`;
    dot.style.top = `${y - 4}px`;
    document.body.appendChild(dot);

    const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
    const dist = 26 + Math.random() * 34;
    dot.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.2)`, opacity: 0 }
      ],
      { duration: 480 + Math.random() * 160, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
    ).onfinish = () => dot.remove();
  }
}

export function initClickFx() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('click', event => {
    const host = event.target.closest('.btn, .lang-btn, .nav-link, .footer-link');
    if (host) spawnRipple(host, event);
    spawnBurst(event.clientX, event.clientY);
  });
}
