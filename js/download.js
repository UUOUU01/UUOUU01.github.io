export class DownloadManager {
  constructor() {
    this.releases = [];
    this.init();
  }

  async init() {
    await this.loadReleases();
    this.setupDownloadButtons();
  }

  async loadReleases() {
    try {
      const response = await fetch('configure/metrocal.json');
      this.releases = await response.json();
    } catch (error) {
      console.error('Failed to load releases:', error);
      this.releases = [];
    }
  }

  setupDownloadButtons() {
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const downloadType = btn.dataset.download;
        this.handleDownload(downloadType, btn);
      });
    });
  }

  async handleDownload(type, button) {
    // Find the corresponding release
    const release = this.releases.releases.find(r => {
      return r.assets.some(asset => this.getAssetName(asset.name) === type);
    });

    if (!release) {
      console.error('Release not found for:', type);
      return;
    }

    // Find the specific asset
    const asset = release.assets.find(a => this.getAssetName(a.name) === type);

    if (!asset) {
      console.error('Asset not found for:', type);
      return;
    }

    // Show loading state
    this.setButtonLoading(button);

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset button state
    setTimeout(() => {
      this.setButtonLoaded(button);
    }, 1000);
  }

  getAssetName(name) {
    return name.replace(/metrocal-/, '').replace(/\.zip$|\.dmg$|\.tar\.gz$/, '');
  }

  setButtonLoading(button) {
    const originalText = button.innerHTML;
    button.dataset.originalText = originalText;
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="30" stroke-dashoffset="0">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      Loading...
    `;
  }

  setButtonLoaded(button) {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
  }
}
