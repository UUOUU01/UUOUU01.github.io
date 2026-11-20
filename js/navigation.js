// Nav + hero behaviors: smooth scroll for anchor links, IntersectionObserver
// for any .reveal outside rendered projects (hero etc.), page-load sequence.
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

// Page load: hide loader, then play the 0.8s blur-in cascade on hero content.
export function playPageLoad() {
  const overlay = document.getElementById('page-load');
  const items = document.querySelectorAll('.page-load');

  setTimeout(() => {
    overlay?.classList.add('hidden');
    items.forEach((el, i) => setTimeout(() => el.classList.add('active'), i * 90));
  }, 700);
}
