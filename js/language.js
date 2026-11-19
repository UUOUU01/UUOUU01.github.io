export class LanguageManager {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translations = {};
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.applyLanguage();
  }

  loadTranslations() {
    return fetch('config/locales.json')
      .then(response => response.json())
      .then(data => {
        this.translations = data;
      })
      .catch(error => {
        console.error('Failed to load translations:', error);
        this.translations = this.getDefaultTranslations();
      });
  }

  getDefaultTranslations() {
    return {
      en: {},
      zh: {},
      ja: {},
      ru: {},
      fr: {}
    };
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      this.applyLanguage();
      this.updateLanguageButtons();
    }
  }

  applyLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.dataset.i18n;
      if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
        el.textContent = this.translations[this.currentLang][key];
      }
    });
  }

  updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === this.currentLang) {
        btn.classList.add('active');
      }
    });
  }

  t(key) {
    return this.translations[this.currentLang]?.[key] || key;
  }
}
