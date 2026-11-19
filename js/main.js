import { LanguageManager } from './language.js';
import { Navigation } from './navigation.js';
import { ScrollAnimations } from './scroll-animations.js';
import { DownloadManager } from './download.js';

class App {
  constructor() {
    this.languageManager = null;
    this.navigation = null;
    this.scrollAnimations = null;
    this.downloadManager = null;
    this.init();
  }

  async init() {
    await this.setupManagers();
    this.setupEventListeners();
    this.checkDarkMode();
  }

  async setupManagers() {
    this.languageManager = new LanguageManager();
    this.navigation = new Navigation();
    this.scrollAnimations = new ScrollAnimations();

    // Only initialize download manager on download page
    if (window.location.pathname === '/download.html' ||
        window.location.pathname.endsWith('/download.html')) {
      this.downloadManager = new DownloadManager();
    }
  }

  setupEventListeners() {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.languageManager.setLanguage(lang);
      });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Intersection Observer for scroll animations
    this.setupScrollObserver();
  }

  setupScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });
  }

  checkDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark-mode');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
