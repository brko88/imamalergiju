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
const forgetOffCredentials = document.getElementById('forget-off-credentials');

const OFF_USERNAME_KEY = 'imamalergiju:offUsername';
const OFF_PASSWORD_KEY = 'imamalergiju:offPassword';

let stream = null;
let detectLoopId = null;
let editingProfileId = null;
let lastScannedCode = null;
let lastScannedProduct = null;

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

// --- Profili ---

function renderProfileSummary() {
  const active = getActiveProfile();
  activeProfileName.textContent = active ? active.name : '— nema profila —';
}

function renderProfileList() {
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();

  if (profiles.length === 0) {
    profileList.innerHTML = '<p class="empty-hint">Još nema dodanih osoba.</p>';
    return;
  }

  profileList.innerHTML = profiles.map((p) => `
    <div class="profile-row ${p.id === activeId ? 'active' : ''}" data-id="${p.id}">
      <button class="profile-select" data-action="select" data-id="${p.id}">
        <strong>${escapeHtml(p.name)}</strong>
        <span class="profile-meta">${p.allergenIds.length} alergen(a)</span>
      </button>
      <button class="icon-btn" data-action="share" data-id="${p.id}" title="Podijeli">📤</button>
      <button class="icon-btn" data-action="edit" data-id="${p.id}" title="Uredi">✏️</button>
      <button class="icon-btn" data-action="delete" data-id="${p.id}" title="Obriši">🗑️</button>
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
  const text = `Alergeni za ${profile.name} — otvori link, app se sama podesi.`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'imamAlergiju profil', text, url });
    } catch (e) {
      // korisnik otkazao dijeljenje — ništa ne radimo
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    alert('Link je kopiran u clipboard. Pošalji ga kome želiš.');
  } catch (e) {
    prompt('Kopiraj ovaj link ručno:', url);
  }
}

function renderProfileAllergenCheckboxes(selectedIds = []) {
  profileAllergenList.innerHTML = ALLERGENS.map((a) => `
    <label class="allergen-item">
      <input type="checkbox" value="${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''} /> ${a.label}
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
    if (profile && confirm(`Obrisati profil "${profile.name}"?`)) {
      deleteProfile(id);
      renderProfileList();
      renderProfileSummary();
    }
  }
});

// --- Istorija ---

function formatHistoryTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

function renderHistoryList() {
  const entries = loadHistory();
  if (entries.length === 0) {
    historyList.innerHTML = '<p class="empty-hint">Još nema skeniranih proizvoda.</p>';
    return;
  }
  historyList.innerHTML = entries.map((e) => `
    <div class="history-row">
      <div class="history-dot ${e.level}"></div>
      <div class="history-info">
        <div class="history-top">
          <strong>${escapeHtml(e.name || 'Nepoznat proizvod')}</strong>
          <span class="history-profile-badge">👤 ${escapeHtml(e.profileName)}</span>
        </div>
        <span class="history-meta">${escapeHtml(e.barcode)} · ${formatHistoryTimestamp(e.timestamp)}</span>
      </div>
      <button class="icon-btn" data-action="delete" data-id="${e.id}" title="Obriši">🗑️</button>
    </div>
  `).join('');
}

btnClearHistory.addEventListener('click', () => {
  if (loadHistory().length === 0) return;
  if (confirm('Obrisati cijelu istoriju skeniranja?')) {
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
      <input type="checkbox" value="${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''} /> ${a.label}
    </label>
  `).join('');
}

function openContributeForm(code, prefill) {
  contributeBarcode.textContent = code;
  contributeName.value = prefill ? (prefill.name || '') : '';
  renderContributeAllergenCheckboxes(contributeAllergensContains, prefill ? prefill.containsIds : []);
  renderContributeAllergenCheckboxes(contributeAllergensTraces, prefill ? prefill.tracesIds : []);
  contributeModeLabel.textContent = prefill ? '✏️ Ispravljaš postojeći proizvod' : '➕ Dodaješ novi proizvod';
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

forgetOffCredentials.addEventListener('click', (e) => {
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

  if (!name) {
    contributeStatus.textContent = 'Unesi naziv proizvoda.';
    contributeStatus.classList.add('error');
    contributeName.focus();
    return;
  }
  if (!userId || !password) {
    contributeStatus.textContent = 'Unesi OpenFoodFacts korisničko ime i lozinku.';
    contributeStatus.classList.add('error');
    return;
  }

  btnSubmitContribution.disabled = true;
  contributeStatus.classList.remove('error');
  contributeStatus.textContent = 'Šaljem...';

  try {
    await submitProductFields({ code, name, containsIds, tracesIds, userId, password });
    localStorage.setItem(OFF_USERNAME_KEY, userId);
    localStorage.setItem(OFF_PASSWORD_KEY, password);

    const frontFile = contributePhotoFront.files[0];
    const ingredientsFile = contributePhotoIngredients.files[0];
    if (frontFile) {
      contributeStatus.textContent = 'Šaljem sliku ambalaže...';
      await uploadProductImage({ code, imagefield: 'front', file: frontFile, userId, password });
    }
    if (ingredientsFile) {
      contributeStatus.textContent = 'Šaljem sliku deklaracije...';
      await uploadProductImage({ code, imagefield: 'ingredients', file: ingredientsFile, userId, password });
    }

    contributeStatus.textContent = '✅ Hvala! Podaci su poslani u OpenFoodFacts. Može potrajati par minuta dok se pojave u bazi.';
  } catch (err) {
    contributeStatus.textContent = `⚠️ Slanje nije uspjelo: ${err.message}`;
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
  setBanner('unknown', 'Provjeravam...');

  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    setBanner('unknown', 'ℹ️ Napravi i izaberi profil prije skeniranja.');
    switchTab('tab-profile');
    return;
  }

  let product;
  try {
    product = await fetchProduct(code);
  } catch (err) {
    setBanner('unknown', '⚠️ Greška pri povezivanju na bazu. Provjeri internet i pokušaj ponovo.');
    return;
  }

  if (!product.found) {
    setBanner('unknown', '❔ Proizvod nije pronađen.');
    resultDetail.textContent = 'Ovaj proizvod nije u bazi. Provjeri deklaraciju ručno, ili ga dodaj u bazu da pomogneš drugima.';
    btnAddProduct.style.display = 'block';
    addHistoryEntry({ barcode: code, name: null, level: 'unknown', matchedNames: [], profileName: activeProfile.name });
    return;
  }

  lastScannedProduct = product;
  btnEditAllergens.style.display = 'block';
  resultName.textContent = product.name || '(proizvod bez naziva u bazi)';

  if (activeProfile.allergenIds.length === 0) {
    setBanner('unknown', `ℹ️ ${activeProfile.name} nema izabranih alergena. Uredi profil.`);
    addHistoryEntry({ barcode: code, name: product.name, level: 'unknown', matchedNames: [], profileName: activeProfile.name });
    return;
  }

  const { level, matched } = matchAllergens(activeProfile.allergenIds, product.allergensTags, product.tracesTags);
  const names = matched.map((a) => a.label).join(', ');

  if (level === 'red') {
    setBanner('red', `🔴 Sadrži: ${names}`);
  } else if (level === 'orange') {
    setBanner('orange', `🟠 Može sadržati u tragovima: ${names}`);
  } else {
    setBanner('green', '🟢 Nema izabranih alergena u proizvodu');
    disclaimerBanner.classList.add('emphasized');
  }
  addHistoryEntry({ barcode: code, name: product.name, level, matchedNames: matched.map((a) => a.label), profileName: activeProfile.name });
}

async function startScanner() {
  if (!('BarcodeDetector' in window)) {
    scanStatus.textContent = 'Ovaj browser ne podržava čitanje barkoda kamerom. Koristi ručni unos ispod.';
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
    scanStatus.textContent = 'Nije moguće pristupiti kameri. Provjeri dozvole ili koristi ručni unos.';
    scanStatus.classList.add('error');
    scannerView.classList.add('active');
    startView.style.display = 'none';
    return;
  }

  video.srcObject = stream;
  startView.style.display = 'none';
  scannerView.classList.add('active');
  resultCard.classList.remove('active');

  const detector = new BarcodeDetector({
    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
  });

  const detect = async () => {
    if (!stream) return;
    try {
      const codes = await detector.detect(video);
      if (codes.length > 0) {
        handleBarcode(codes[0].rawValue);
        return;
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
  const labels = ALLERGENS.filter((a) => validIds.includes(a.id)).map((a) => a.label).join(', ') || 'nema izabranih alergena';

  const wantsImport = confirm(`Neko ti je poslao profil "${data.name}" (${labels}).\n\nDodati ovaj profil i odmah ga postaviti kao aktivan?`);
  if (!wantsImport) return false;

  const profile = { id: createProfileId(), name: data.name.slice(0, 60), allergenIds: validIds };
  upsertProfile(profile);
  setActiveProfileId(profile.id);
  return true;
}

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
