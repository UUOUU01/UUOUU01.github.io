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

// Page load: the loader overlay is REAL — it stays up until the actual data
// fetches and the window load event have both finished (4s cap so a hung
// request can never trap the user). Then the 0.8s blur-in cascade plays.
export function playPageLoad(readyPromise = Promise.resolve()) {
  const overlay = document.getElementById('page-load');
  const items = document.querySelectorAll('.page-load');

  const winLoad = new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  const minShow = new Promise(resolve => setTimeout(resolve, 500));
  const safetyCap = new Promise(resolve => setTimeout(resolve, 4000));

  Promise.race([Promise.all([readyPromise, winLoad, minShow]), safetyCap]).then(() => {
    overlay?.classList.add('hidden');
    items.forEach((el, i) => setTimeout(() => el.classList.add('active'), i * 90));
  });
}
