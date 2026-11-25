// Custom right-click menu for project blocks: Open, Go to Releases, Close.
// Selected item gets a dark-blue background.
import { loadJSON } from './config.js';

export class ContextMenu {
  constructor() {
    this.menu = null;
    this.activeProject = null;
    this.init();
  }

  init() {
    // Create menu DOM
    this.menu = document.createElement('div');
    this.menu.className = 'context-menu';
    this.menu.innerHTML = `
      <button class="ctx-item ctx-open">Open</button>
      <button class="ctx-item ctx-releases">Go to Releases</button>
      <button class="ctx-item ctx-close">Close</button>
    `;
    document.body.appendChild(this.menu);

    // Bind actions
    this.menu.querySelector('.ctx-open').addEventListener('click', () => this.openProject());
    this.menu.querySelector('.ctx-releases').addEventListener('click', () => this.goToReleases());
    this.menu.querySelector('.ctx-close').addEventListener('click', () => this.closeMenu());

    // Hide on click elsewhere
    document.addEventListener('click', () => this.closeMenu());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeMenu();
    });

    // Prevent browser context menu
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
  }

  show(x, y, projectId) {
    if (!this.menu || !projectId) return;
    this.activeProject = projectId;
    this.positionMenu(x, y);
    this.menu.classList.add('show');
  }

  positionMenu(x, y) {
    const rect = this.menu.getBoundingClientRect();
    const margin = 4;

    // Clamp to viewport
    x = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));
    y = Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin));

    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
  }

  async openProject() {
    if (!this.activeProject) return;
    const releases = await this.getProjectReleases();
    if (releases) {
      window.open(releases, '_blank', 'noopener');
    }
    this.closeMenu();
  }

  async goToReleases() {
    const releases = await this.getProjectReleases();
    if (releases) {
      window.open(releases, '_blank', 'noopener');
    }
    this.closeMenu();
  }

  async getProjectReleases() {
    if (!this.activeProject) return null;
    const releases = await loadJSON(`config/download/${this.activeProject}.json`, null);
    return releases?.releases || null;
  }

  closeMenu() {
    if (this.menu) this.menu.classList.remove('show');
    this.activeProject = null;
  }
}
