import { LanguageManager } from './language.js';
import { ProjectsRenderer } from './projects.js';
import { Navigation, playPageLoad } from './navigation.js';
import { initClickFx } from './interactions.js';
import { MegaParticles } from './mega.js';

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
    const ready = Promise.all([this.language.init(), this.projects.init()]);
    this.bindLangButtons();
    playPageLoad(ready);
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
