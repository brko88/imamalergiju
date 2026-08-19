const CONSENT_KEY = 'imamalergiju:consent';

function applyConsent(value) {
  if (typeof gtag === 'function') {
    gtag('consent', 'update', { analytics_storage: value });
  }
}

function hideConsentBanner() {
  document.getElementById('consent-banner')?.classList.remove('active');
}

function showConsentBanner() {
  document.getElementById('consent-banner')?.classList.add('active');
}

function setConsent(value) {
  localStorage.setItem(CONSENT_KEY, value);
  applyConsent(value);
  hideConsentBanner();
  document.dispatchEvent(new CustomEvent('imamalergiju:consentDecided'));
}

function initConsent() {
  // Dozvoljava linku iz privacy.html da resetuje odluku i ponovo prikaže banner.
  if (location.search.includes('consent=reset')) {
    localStorage.removeItem(CONSENT_KEY);
    history.replaceState(null, '', location.pathname + location.hash);
  }

  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored) {
    applyConsent(stored);
    document.dispatchEvent(new CustomEvent('imamalergiju:consentDecided'));
  } else if (localStorage.getItem('imamalergiju:introSeen')) {
    showConsentBanner();
  } else {
    // Sačekaj da korisnik zatvori uvodni popup, da se dva ne prikazuju istovremeno.
    document.addEventListener('imamalergiju:introDismissed', showConsentBanner, { once: true });
  }

  document.getElementById('btn-consent-accept')?.addEventListener('click', () => setConsent('granted'));
  document.getElementById('btn-consent-reject')?.addEventListener('click', () => setConsent('denied'));
}

initConsent();
