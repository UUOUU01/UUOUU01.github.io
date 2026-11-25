import { loadJSON, discoverProjects } from './config.js';

// Renders one full-bleed block per project found in config/download/.
// File name = project id. Adding a project = adding one JSON file.
const THEMES = ['is-dark', 'is-light', 'is-dark-alt'];

export class ProjectsRenderer {
  constructor(languageManager) {
    this.lang = languageManager;
    this.sourceDir = 'config/download';
  }

  async init() {
    const ids = await discoverProjects(this.sourceDir);
    if (!ids.length) return;

    const projects = await Promise.all(
      ids.map(id => loadJSON(`${this.sourceDir}/${id}.json`, null).then(cfg => cfg && { id, ...cfg }))
    );

    this.render(projects.filter(Boolean));
  }

  render(projects) {
    const root = document.getElementById('projects-root');
    if (!root || !projects.length) return;

    root.innerHTML = projects.map((p, i) => this.blockHTML(p, i)).join('');
    this.bindActions(root);
    this.bindContextMenu(root);
    this.observeBlocks(root);
  }

  bindContextMenu(root) {
    const menu = new ContextMenu();

    root.querySelectorAll('.project-block').forEach(block => {
      block.addEventListener('contextmenu', e => {
        e.preventDefault();
        const projectId = block.dataset.project;
        menu.show(e.clientX, e.clientY, projectId);
      });
    });
  }

  blockHTML(p, i) {
    const theme = p.theme && ['dark', 'light', 'dark-alt'].includes(p.theme)
      ? `is-${p.theme}`
      : THEMES[i % THEMES.length];

    const name = p.name || p.id;
    const descKey = `${p.id}_desc`;
    const taglineKey = `${p.id}_tagline`;
    const releases = p.releases || `${(p.repo || '').replace(/\/$/, '')}/releases`;
    const repo = p.repo || releases;
    const tech = p.tech || '';
    const render = p.render || '';

    return `
      <section class="project-block ${theme}" data-project="${p.id}" data-releases="${releases}">
        <div class="container">
          <p class="project-kicker reveal" data-i18n="projects_kicker">${this.lang.t('projects_kicker')}</p>
          <h2 class="project-title reveal stagger-1">${name}</h2>
          <p class="project-tagline reveal stagger-2" data-i18n="${taglineKey}">${this.lang.t(taglineKey)}</p>
          <p class="project-desc reveal stagger-3" data-i18n="${descKey}">${this.lang.t(descKey)}</p>
          ${tech ? `<p class="project-tech reveal stagger-4" data-i18n="tech">${tech}</p>` : ''}
          ${render ? `<p class="project-render reveal stagger-4" data-i18n="render">${render}</p>` : ''}
          <div class="project-actions reveal stagger-5">
            <a href="${releases}" target="_blank" rel="noopener" class="btn btn-orange">
              <span data-i18n="btn_release">${this.lang.t('btn_release')}</span>
              <span class="btn-arrow">→</span>
            </a>
            <a href="${repo}" target="_blank" rel="noopener" class="btn btn-ghost">
              <span data-i18n="btn_repo">${this.lang.t('btn_repo')}</span>
            </a>
          </div>
        </div>
      </section>`;
  }

  bindActions(root) {
    // Whole block is clickable -> releases page; inner buttons keep their own links
    root.querySelectorAll('.project-block').forEach(block => {
      block.addEventListener('click', e => {
        if (e.target.closest('a')) return; // let real links behave
        window.open(block.dataset.releases, '_blank', 'noopener');
      });
    });
  }

  observeBlocks(root) {
    const targets = root.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(el => io.observe(el));
  }
}
