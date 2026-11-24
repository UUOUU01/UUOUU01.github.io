// Consent-gated cookie storage for user preferences (language, etc.).
// Nothing is written until the visitor allows it; declining wipes any
// previously stored prefs. The consent choice itself is a necessary cookie.
const CONSENT_KEY = 'uu_consent';
const PREF_PREFIX = 'uu_pref_';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name, value, maxAge) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (err) {
    // file:// and hardened browsers throw or silently drop cookies — ignore
    console.warn('[storage] cookie unavailable', err.message);
  }
}

export function getConsent() {
  return readCookie(CONSENT_KEY); // 'granted' | 'declined' | null (not asked yet)
}

export function setConsent(value) {
  writeCookie(CONSENT_KEY, value, ONE_YEAR);
}

// Preferences only exist while consent is granted.
export function getPref(key) {
  if (getConsent() !== 'granted') return null;
  return readCookie(PREF_PREFIX + key);
}

export function setPref(key, value) {
  if (getConsent() !== 'granted') return;
  writeCookie(PREF_PREFIX + key, value, ONE_YEAR);
}

export function clearPrefs() {
  for (const name of [...document.cookie.split('; ').map(c => c.split('=')[0])]) {
    if (name.startsWith(PREF_PREFIX)) writeCookie(name, '', 0);
  }
}
