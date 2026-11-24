import { loadJSON } from './config.js';
import { getPref, setPref } from './storage.js';

// Applies translations; fires an animation on content refresh so the
// switch itself feels alive (0.8s blur-in burst).
// Language preference lives in a consent-gated cookie; without consent
// (or on first visit) it defaults to English every time.
export class LanguageManager {
  constructor() {
    this.current = getPref('lang') || 'en';
    this.dict = {};
  }

  async init() {
    this.dict = await loadJSON('config/locales.json', {});
    this.apply();
  }

  t(key) {
    return this.dict[this.current]?.[key] ?? this.dict.en?.[key] ?? '';
  }

  setLanguage(lang) {
    if (!this.dict[lang]) return;
    this.current = lang;
    setPref('lang', lang); // no-op unless the visitor allowed cookies
    this.apply(true);
  }

  apply(animate = false) {
    const root = document.body;
    root.lang = this.current;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = this.t(el.dataset.i18n);
      if (val) el.textContent = val;
    });

    // Let canvas-based listeners (particle mega word) re-render in the new language.
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: this.current } }));

    document.title = this.t('page_title') || document.title;

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.current);
    });

    if (animate) {
      const targets = document.querySelectorAll(
        '.hero-title, .hero-sub, .mega, .hero-actions, .project-title, .project-tagline, .project-desc, .project-kicker'
      );
      targets.forEach((el, i) => {
        el.classList.remove('content-burst');
        // force reflow so the animation replays
        void el.offsetWidth;
        el.style.animationDelay = `${i * 0.06}s`;
        el.classList.add('content-burst');
      });
    }
  }
}
