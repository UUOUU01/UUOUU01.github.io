export class Navigation {
  constructor() {
    this.nav = document.getElementById('nav');
    this.init();
  }

  init() {
    this.setupScrollEffect();
    this.setupMobileMenu();
  }

  setupScrollEffect() {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  }

  setupMobileMenu() {
    // Mobile menu toggle can be added here if needed
    // For now, we're keeping it simple with responsive CSS
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.pageYOffset + 100;

    for (const section of sections) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        return section.getAttribute('id');
      }
    }

    return 'home';
  }
}
