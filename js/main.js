import { LanguageManager } from './language.js';
import { ProjectsRenderer } from './projects.js';
import { Navigation } from './navigation.js';
import { initClickFx } from './interactions.js';
import { MegaParticles, initHeroDots } from './mega.js';
import { initConsent } from './consent.js';

class App {
  constructor() {
    this.language = new LanguageManager();
    this.projects = new ProjectsRenderer(this.language);
    this.init();
  }

  async init() {
    new Navigation();
    initClickFx();
    const mega = document.querySelector('.mega');
    if (mega) new MegaParticles(mega).init();
    initHeroDots(document.querySelector('.hero'));

    // Initialize language immediately, but don't wait for projects
    this.language.init();

    // Projects render async without blocking page load
    this.projects.init();

    this.bindLangButtons();
    initConsent(this.language);
  }

  bindLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this.language.setLanguage(btn.dataset.lang));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
