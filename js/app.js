const introOverlay = document.getElementById('intro-overlay');
const introClose = document.getElementById('intro-close');
const INTRO_SEEN_KEY = 'imamalergiju:introSeen';
let introTimeoutId = null;

function dismissIntro() {
  introOverlay.classList.remove('active');
  localStorage.setItem(INTRO_SEEN_KEY, '1');
  if (introTimeoutId) {
    clearTimeout(introTimeoutId);
    introTimeoutId = null;
  }
}

introClose.addEventListener('click', dismissIntro);

function maybeShowIntro() {
  if (localStorage.getItem(INTRO_SEEN_KEY)) return;
  introOverlay.classList.add('active');
  introTimeoutId = setTimeout(dismissIntro, 15000);
}

const startView = document.getElementById('start-view');
const scannerView = document.getElementById('scanner-view');
const video = document.getElementById('video');
const scanStatus = document.getElementById('scan-status');
const btnScan = document.getElementById('btn-scan');
const btnCancel = document.getElementById('btn-cancel');
const btnManual = document.getElementById('btn-manual');
const manualCode = document.getElementById('manual-code');
const resultCard = document.getElementById('result');
const resultCode = document.getElementById('result-code');
const semaphoreBanner = document.getElementById('semaphore-banner');
const resultName = document.getElementById('result-name');
const resultDetail = document.getElementById('result-detail');
const btnAddProduct = document.getElementById('btn-add-product');
const btnEditAllergens = document.getElementById('btn-edit-allergens');
const disclaimerBanner = document.getElementById('disclaimer-banner');

const activeProfileName = document.getElementById('active-profile-name');
const activeProfileChip = document.getElementById('active-profile-chip');
const profileList = document.getElementById('profile-list');
const btnAddPerson = document.getElementById('btn-add-person');
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name-input');
const profileAllergenList = document.getElementById('profile-allergen-list');
const btnSaveProfile = document.getElementById('btn-save-profile');
const btnCancelProfile = document.getElementById('btn-cancel-profile');

const historyList = document.getElementById('history-list');
const btnClearHistory = document.getElementById('btn-clear-history');

const tabContents = document.querySelectorAll('.tab-content');
const navItems = document.querySelectorAll('.nav-item');

const contributeCard = document.getElementById('contribute-card');
const contributeBarcode = document.getElementById('contribute-barcode');
const contributeName = document.getElementById('contribute-name');
const contributeAllergensContains = document.getElementById('contribute-allergens-contains');
const contributeAllergensTraces = document.getElementById('contribute-allergens-traces');
const contributePhotoFront = document.getElementById('contribute-photo-front');
const contributePhotoIngredients = document.getElementById('contribute-photo-ingredients');
const offUsernameInput = document.getElementById('off-username');
const offPasswordInput = document.getElementById('off-password');
const contributeStatus = document.getElementById('contribute-status');
const btnSubmitContribution = document.getElementById('btn-submit-contribution');
const btnCancelContribution = document.getElementById('btn-cancel-contribution');
const contributeFallbackLink = document.getElementById('contribute-fallback-link');
const contributeModeLabel = document.getElementById('contribute-mode-label');
const langCurrentBtn = document.getElementById('lang-current-btn');
const langCurrentFlag = document.getElementById('lang-current-flag');
const langCurrentCode = document.getElementById('lang-current-code');
const langDropdown = document.getElementById('lang-dropdown');

const OFF_USERNAME_KEY = 'imamalergiju:offUsername';
const OFF_PASSWORD_KEY = 'imamalergiju:offPassword';

let stream = null;
let detectLoopId = null;
let pendingCode = null;
let pendingCodeCount = 0;

// Opšta GS1 provjera kontrolne cifre (radi za EAN-13, EAN-8, UPC-A) — kamera
// ponekad pogrešno pročita cifru zbog loše svjetlosti/ugla, pa broj koji ne
// prođe ovu provjeru sigurno nije ispravno očitan i ne treba ga prihvatiti.
function isValidGtinChecksum(code) {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const checkDigit = digits.pop();
  let sum = 0;
  for (let i = digits.length - 1, pos = 1; i >= 0; i--, pos++) {
    sum += digits[i] * (pos % 2 === 1 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10 === checkDigit;
}
let editingProfileId = null;
let lastScannedCode = null;
let lastScannedProduct = null;
let isEditingExistingProduct = false;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Tabovi ---

function switchTab(tabId) {
  tabContents.forEach((el) => el.classList.toggle('active', el.id === tabId));
  navItems.forEach((el) => el.classList.toggle('active', el.dataset.tab === tabId));
  if (tabId === 'tab-history') renderHistoryList();
  if (tabId === 'tab-profile') renderProfileList();
}

navItems.forEach((el) => {
  el.addEventListener('click', () => switchTab(el.dataset.tab));
});

activeProfileChip.addEventListener('click', () => switchTab('tab-profile'));

// --- Jezik ---

function refreshDynamicText() {
  applyStaticTranslations();
  renderProfileSummary();
  renderProfileList();
  renderHistoryList();
  if (profileForm.style.display !== 'none') {
    renderProfileAllergenCheckboxes(
      editingProfileId ? loadProfiles().find((p) => p.id === editingProfileId)?.allergenIds || [] : []
    );
  }
}

function renderLangDropdown() {
  langDropdown.innerHTML = LANGS.map((l) => `
    <button class="lang-option ${l.code === getLang() ? 'active' : ''}" data-lang="${l.code}">
      <span>${l.flag}</span><span>${l.code.toUpperCase()}</span>
    </button>
  `).join('');
}

function updateLangSwitchLabel() {
  const current = LANGS.find((l) => l.code === getLang()) || LANGS[0];
  langCurrentFlag.textContent = current.flag;
  langCurrentCode.textContent = current.code.toUpperCase();
  renderLangDropdown();
}

langCurrentBtn.addEventListener('click', () => {
  langDropdown.classList.toggle('open');
});

langDropdown.addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-option');
  if (!btn) return;
  setLang(btn.dataset.lang);
  updateLangSwitchLabel();
  refreshDynamicText();
  langDropdown.classList.remove('open');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#lang-switch')) {
    langDropdown.classList.remove('open');
  }
});

// --- Profili ---

function renderProfileSummary() {
  const active = getActiveProfile();
  activeProfileName.textContent = active ? active.name : t('profile.none');
}

function renderProfileList() {
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();

  if (profiles.length === 0) {
    profileList.innerHTML = `<p class="empty-hint">${t('profile.emptyHint')}</p>`;
    return;
  }

  profileList.innerHTML = profiles.map((p) => `
    <div class="profile-row ${p.id === activeId ? 'active' : ''}" data-id="${p.id}">
      <button class="profile-select" data-action="select" data-id="${p.id}">
        <strong>${escapeHtml(p.name)}</strong>
        <span class="profile-meta">${t('profile.allergenCount', p.allergenIds.length)}</span>
      </button>
      <button class="icon-btn" data-action="share" data-id="${p.id}" title="${t('common.share')}">📤</button>
      <button class="icon-btn" data-action="edit" data-id="${p.id}" title="${t('common.edit')}">✏️</button>
      <button class="icon-btn" data-action="delete" data-id="${p.id}" title="${t('common.delete')}">🗑️</button>
    </div>
  `).join('');
}

function buildProfileShareUrl(profile) {
  const payload = encodeURIComponent(JSON.stringify({ name: profile.name, allergenIds: profile.allergenIds }));
  const base = location.origin + location.pathname;
  return `${base}?profile=${payload}`;
}

async function shareProfile(profile) {
  const url = buildProfileShareUrl(profile);
  const text = t('share.text', profile.name);

  if (navigator.share) {
    try {
      await navigator.share({ title: t('share.title'), text, url });
    } catch (e) {
      // korisnik otkazao dijeljenje — ništa ne radimo
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    alert(t('share.copied'));
  } catch (e) {
    prompt(t('share.copyManually'), url);
  }
}

function renderProfileAllergenCheckboxes(selectedIds = []) {
  profileAllergenList.innerHTML = ALLERGENS.map((a) => `
    <label class="allergen-item">
      <input type="checkbox" value="${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''} /> ${allergenLabel(a)}
    </label>
  `).join('');
}

function openProfileForm(profile) {
  editingProfileId = profile ? profile.id : null;
  profileNameInput.value = profile ? profile.name : '';
  renderProfileAllergenCheckboxes(profile ? profile.allergenIds : []);
  profileForm.style.display = 'block';
  profileNameInput.focus();
}

function closeProfileForm() {
  editingProfileId = null;
  profileForm.style.display = 'none';
}

btnAddPerson.addEventListener('click', () => openProfileForm(null));
btnCancelProfile.addEventListener('click', closeProfileForm);

btnSaveProfile.addEventListener('click', () => {
  const name = profileNameInput.value.trim();
  if (!name) {
    profileNameInput.focus();
    return;
  }
  const allergenIds = Array.from(profileAllergenList.querySelectorAll('input:checked')).map((el) => el.value);
  const profile = {
    id: editingProfileId || createProfileId(),
    name,
    allergenIds
  };
  upsertProfile(profile);
  if (!getActiveProfileId()) {
    setActiveProfileId(profile.id);
  }
  closeProfileForm();
  renderProfileList();
  renderProfileSummary();
});

profileList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  const profiles = loadProfiles();
  const profile = profiles.find((p) => p.id === id);

  if (action === 'select') {
    setActiveProfileId(id);
    renderProfileList();
    renderProfileSummary();
  } else if (action === 'share') {
    if (profile) shareProfile(profile);
  } else if (action === 'edit') {
    if (profile) openProfileForm(profile);
  } else if (action === 'delete') {
    if (profile && confirm(t('profile.confirmDelete', profile.name))) {
      deleteProfile(id);
      renderProfileList();
      renderProfileSummary();
    }
  }
});

// --- Istorija ---

function formatHistoryTimestamp(ts) {
  return new Date(ts).toLocaleString(localeForLang(getLang()));
}

function renderHistoryList() {
  const entries = loadHistory();
  if (entries.length === 0) {
    historyList.innerHTML = `<p class="empty-hint">${t('history.emptyHint')}</p>`;
    return;
  }
  historyList.innerHTML = entries.map((e) => `
    <div class="history-row">
      <div class="history-dot ${e.level}"></div>
      <div class="history-info">
        <div class="history-top">
          <strong>${escapeHtml(e.name || t('history.unknownProduct'))}</strong>
          <span class="history-profile-badge">👤 ${escapeHtml(e.profileName)}</span>
        </div>
        <span class="history-meta">${escapeHtml(e.barcode)} · ${formatHistoryTimestamp(e.timestamp)}</span>
      </div>
      <button class="icon-btn" data-action="delete" data-id="${e.id}" title="${t('common.delete')}">🗑️</button>
    </div>
  `).join('');
}

btnClearHistory.addEventListener('click', () => {
  if (loadHistory().length === 0) return;
  if (confirm(t('history.confirmClearAll'))) {
    clearHistory();
    renderHistoryList();
  }
});

historyList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="delete"]');
  if (!btn) return;
  deleteHistoryEntry(btn.dataset.id);
  renderHistoryList();
});

// --- Doprinos (dodaj proizvod u OpenFoodFacts) ---

function renderContributeAllergenCheckboxes(container, selectedIds = []) {
  container.innerHTML = ALLERGENS.map((a) => `
    <label class="allergen-item">
      <input type="checkbox" value="${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''} /> ${allergenLabel(a)}
    </label>
  `).join('');
}

function openContributeForm(code, prefill) {
  isEditingExistingProduct = !!prefill;
  contributeBarcode.textContent = code;
  contributeName.value = prefill ? (prefill.name || '') : '';
  renderContributeAllergenCheckboxes(contributeAllergensContains, prefill ? prefill.containsIds : []);
  renderContributeAllergenCheckboxes(contributeAllergensTraces, prefill ? prefill.tracesIds : []);
  contributeModeLabel.textContent = prefill ? t('contribute.modeEdit') : t('contribute.modeAdd');
  contributePhotoFront.value = '';
  contributePhotoIngredients.value = '';
  offUsernameInput.value = localStorage.getItem(OFF_USERNAME_KEY) || '';
  offPasswordInput.value = localStorage.getItem(OFF_PASSWORD_KEY) || '';
  contributeStatus.textContent = '';
  contributeStatus.classList.remove('error');
  contributeFallbackLink.href = `https://world.openfoodfacts.org/product/${encodeURIComponent(code)}`;
  contributeCard.style.display = 'block';
  contributeName.focus();
}

function closeContributeForm() {
  contributeCard.style.display = 'none';
}

btnAddProduct.addEventListener('click', () => {
  if (lastScannedCode) openContributeForm(lastScannedCode);
});

btnEditAllergens.addEventListener('click', () => {
  if (!lastScannedCode || !lastScannedProduct) return;
  const { containsIds, tracesIds } = deriveAllergenIdsFromTags(
    lastScannedProduct.allergensTags,
    lastScannedProduct.tracesTags
  );
  openContributeForm(lastScannedCode, { name: lastScannedProduct.name, containsIds, tracesIds });
});

btnCancelContribution.addEventListener('click', closeContributeForm);

// Delegirano jer se #forget-off-credentials rekreira svaki put kad se
// contribute.credentialsNote prevede (innerHTML se mijenja pri promjeni jezika).
contributeCard.addEventListener('click', (e) => {
  if (!e.target.closest('#forget-off-credentials')) return;
  e.preventDefault();
  localStorage.removeItem(OFF_USERNAME_KEY);
  localStorage.removeItem(OFF_PASSWORD_KEY);
  offUsernameInput.value = '';
  offPasswordInput.value = '';
});

btnSubmitContribution.addEventListener('click', async () => {
  const code = contributeBarcode.textContent.trim();
  const name = contributeName.value.trim();
  const userId = offUsernameInput.value.trim();
  const password = offPasswordInput.value;
  const containsIds = Array.from(contributeAllergensContains.querySelectorAll('input:checked')).map((el) => el.value);
  const tracesIds = Array.from(contributeAllergensTraces.querySelectorAll('input:checked')).map((el) => el.value);
  const frontFile = contributePhotoFront.files[0];
  const ingredientsFile = contributePhotoIngredients.files[0];

  if (!name) {
    contributeStatus.textContent = t('contribute.errNoName');
    contributeStatus.classList.add('error');
    contributeName.focus();
    return;
  }
  if (!isEditingExistingProduct && (!frontFile || !ingredientsFile)) {
    contributeStatus.textContent = t('contribute.errNoPhotos');
    contributeStatus.classList.add('error');
    return;
  }
  if (!userId || !password) {
    contributeStatus.textContent = t('contribute.errNoCreds');
    contributeStatus.classList.add('error');
    return;
  }

  btnSubmitContribution.disabled = true;
  contributeStatus.classList.remove('error');
  contributeStatus.textContent = t('contribute.sending');

  try {
    await submitProductFields({ code, name, containsIds, tracesIds, userId, password });
    localStorage.setItem(OFF_USERNAME_KEY, userId);
    localStorage.setItem(OFF_PASSWORD_KEY, password);

    if (frontFile) {
      contributeStatus.textContent = t('contribute.sendingFrontPhoto');
      await uploadProductImage({ code, imagefield: 'front', file: frontFile, userId, password });
    }
    if (ingredientsFile) {
      contributeStatus.textContent = t('contribute.sendingIngredientsPhoto');
      await uploadProductImage({ code, imagefield: 'ingredients', file: ingredientsFile, userId, password });
    }

    contributeStatus.textContent = t('contribute.success');
  } catch (err) {
    contributeStatus.textContent = t('contribute.failPrefix', err.message);
    contributeStatus.classList.add('error');
  } finally {
    btnSubmitContribution.disabled = false;
  }
});

// --- Semafor / skeniranje ---

function setBanner(level, text) {
  semaphoreBanner.className = `semaphore-banner ${level}`;
  semaphoreBanner.textContent = text;
}

async function handleBarcode(code) {
  stopScanner();
  lastScannedCode = code;
  resultCard.classList.add('active');
  contributeCard.style.display = 'none';
  resultCode.textContent = code;
  resultName.textContent = '';
  resultDetail.textContent = '';
  btnAddProduct.style.display = 'none';
  btnEditAllergens.style.display = 'none';
  lastScannedProduct = null;
  disclaimerBanner.classList.remove('emphasized');
  setBanner('unknown', t('scan.checking'));

  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    setBanner('unknown', t('scan.needProfile'));
    switchTab('tab-profile');
    return;
  }

  let product;
  try {
    product = await fetchProduct(code);
  } catch (err) {
    setBanner('unknown', t('scan.networkError'));
    return;
  }

  if (!product.found) {
    setBanner('unknown', t('scan.notFound'));
    resultDetail.textContent = t('scan.notFoundDetail');
    btnAddProduct.style.display = 'block';
    addHistoryEntry({ barcode: code, name: null, level: 'unknown', matchedNames: [], profileName: activeProfile.name });
    return;
  }

  lastScannedProduct = product;
  btnEditAllergens.style.display = 'block';
  resultName.textContent = product.name || t('scan.noNameProduct');

  if (activeProfile.allergenIds.length === 0) {
    setBanner('unknown', t('scan.noAllergensSelected', activeProfile.name));
    addHistoryEntry({ barcode: code, name: product.name, level: 'unknown', matchedNames: [], profileName: activeProfile.name });
    return;
  }

  const { level, matched } = matchAllergens(activeProfile.allergenIds, product.allergensTags, product.tracesTags);
  const names = matched.map((a) => allergenLabel(a)).join(', ');

  if (level === 'red') {
    setBanner('red', t('scan.contains', names));
  } else if (level === 'orange') {
    setBanner('orange', t('scan.mayContain', names));
  } else {
    setBanner('green', t('scan.clear'));
    disclaimerBanner.classList.add('emphasized');
  }
  addHistoryEntry({ barcode: code, name: product.name, level, matchedNames: matched.map((a) => allergenLabel(a)), profileName: activeProfile.name });
}

async function startScanner() {
  if (!('BarcodeDetector' in window)) {
    scanStatus.textContent = t('scanner.unsupported');
    scanStatus.classList.add('error');
    scannerView.classList.add('active');
    startView.style.display = 'none';
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
  } catch (err) {
    scanStatus.textContent = t('scanner.cameraError');
    scanStatus.classList.add('error');
    scannerView.classList.add('active');
    startView.style.display = 'none';
    return;
  }

  video.srcObject = stream;
  startView.style.display = 'none';
  scannerView.classList.add('active');
  resultCard.classList.remove('active');
  pendingCode = null;
  pendingCodeCount = 0;

  const detector = new BarcodeDetector({
    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
  });

  const detect = async () => {
    if (!stream) return;
    try {
      const codes = await detector.detect(video);
      if (codes.length > 0) {
        const candidate = codes[0].rawValue;
        if (isValidGtinChecksum(candidate)) {
          if (candidate === pendingCode) {
            pendingCodeCount++;
          } else {
            pendingCode = candidate;
            pendingCodeCount = 1;
          }
          // tražimo isti broj u 2 uzastopna framea prije nego ga prihvatimo —
          // filtrira jednokratne pogrešne očitaje.
          if (pendingCodeCount >= 2) {
            handleBarcode(candidate);
            return;
          }
        }
      }
    } catch (err) {
      // frame not ready yet or detection glitch — keep trying
    }
    detectLoopId = requestAnimationFrame(detect);
  };

  detectLoopId = requestAnimationFrame(detect);
}

function stopScanner() {
  if (detectLoopId) {
    cancelAnimationFrame(detectLoopId);
    detectLoopId = null;
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  video.srcObject = null;
  scannerView.classList.remove('active');
  scanStatus.classList.remove('error');
  startView.style.display = 'block';
}

btnScan.addEventListener('click', startScanner);
btnCancel.addEventListener('click', stopScanner);

btnManual.addEventListener('click', () => {
  const code = manualCode.value.trim();
  if (code) {
    handleBarcode(code);
    manualCode.value = '';
  }
});

manualCode.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnManual.click();
});

function importSharedProfileFromUrl() {
  const params = new URLSearchParams(location.search);
  const raw = params.get('profile');
  if (!raw) return false;

  // Očisti URL odmah da refresh ne ponavlja uvoz.
  const cleanUrl = location.origin + location.pathname;
  history.replaceState({}, '', cleanUrl);

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return false;
  }
  if (!data || typeof data.name !== 'string' || !Array.isArray(data.allergenIds)) return false;

  const validIds = data.allergenIds.filter((id) => ALLERGENS.some((a) => a.id === id));
  const labels = ALLERGENS.filter((a) => validIds.includes(a.id)).map((a) => allergenLabel(a)).join(', ') || t('share.noAllergensFallback');

  const wantsImport = confirm(t('share.importConfirm', data.name, labels));
  if (!wantsImport) return false;

  const profile = { id: createProfileId(), name: data.name.slice(0, 60), allergenIds: validIds };
  upsertProfile(profile);
  setActiveProfileId(profile.id);
  return true;
}

applyStaticTranslations();
updateLangSwitchLabel();
maybeShowIntro();

const importedSharedProfile = importSharedProfileFromUrl();

renderProfileSummary();
renderProfileList();
renderHistoryList();
if (importedSharedProfile) {
  switchTab('tab-home');
} else if (!getActiveProfile()) {
  switchTab('tab-profile');
  openProfileForm(null);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
