// Nav + hero behaviors: smooth scroll for anchor links, IntersectionObserver
// for any .reveal outside rendered projects (hero etc.).
export class Navigation {
  constructor() {
    this.bindSmoothScroll();
    this.observeReveals();
  }

  bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  observeReveals() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }
}

// Page load: fade in content immediately without blocking. The loader
// overlay is removed immediately, and the reveal animations play.
export function playPageLoad() {
  const overlay = document.getElementById('page-load');
  const items = document.querySelectorAll('.page-load');

  // Remove loader immediately and start reveal animations
  overlay?.classList.add('hidden');
  items.forEach((el, i) => setTimeout(() => el.classList.add('active'), i * 90));
}
