// First-visit cookie consent banner. Text comes from the i18n dictionary
// (data-i18n), so it follows the active language like everything else.
import { getConsent, setConsent, clearPrefs, setPref } from './storage.js';

export function initConsent(language) {
  const banner = document.getElementById('cookie-consent');
  if (!banner || getConsent()) return; // already asked: stay hidden

  banner.classList.add('show');

  banner.querySelector('.consent-accept').addEventListener('click', () => {
    setConsent('granted');
    setPref('lang', language.current); // persist the choice made this visit
    banner.classList.remove('show');
  });

  banner.querySelector('.consent-decline').addEventListener('click', () => {
    setConsent('declined');
    clearPrefs();
    banner.classList.remove('show');
  });
}
