import { LanguageManager } from './language.js';
import { ProjectsRenderer } from './projects.js';
import { Navigation, playPageLoad } from './navigation.js';

class App {
  constructor() {
    this.language = new LanguageManager();
    this.projects = new ProjectsRenderer(this.language);
    this.init();
  }

  async init() {
    new Navigation();
    await this.language.init();
    await this.projects.init();
    this.bindLangButtons();
    playPageLoad();
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
