const LANG_KEY = 'imamalergiju:lang';

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'bs';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function localeForLang(lang) {
  return lang === 'en' ? 'en-GB' : 'bs-BA';
}

const STRINGS = {
  bs: {
    'header.subtitle': 'Skeniraj proizvod, saznaj odmah.',
    'profile.none': '— nema profila —',
    'home.scanBtn': '📷 Skeniraj barkod',
    'home.scanHint': 'Kamera se koristi samo za čitanje barkoda, ništa se ne snima ni šalje.',
    'home.scanStatusDefault': 'Usmjeri kameru na barkod proizvoda.',
    'home.manualHint': 'Ako kamera ne pročita kod, unesi ga ručno:',
    'home.manualPlaceholder': 'npr. 3017620422003',
    'common.cancel': 'Otkaži',
    'common.save': 'Sačuvaj',
    'common.share': 'Podijeli',
    'common.edit': 'Uredi',
    'common.delete': 'Obriši',
    'result.disclaimer': '⚠️ Ove informacije nisu 100% pouzdane. Uvijek provjerite deklaraciju na proizvodu.',
    'result.barcodeLabel': 'Barkod:',
    'result.addProductBtn': '➕ Dodaj proizvod u bazu',
    'result.editAllergensBtn': '✏️ Ispravi alergene',
    'contribute.disclaimer': '📦 Ovi podaci idu direktno u <strong>OpenFoodFacts</strong> — javnu, besplatnu bazu koju koristi ova i mnoge druge aplikacije. Hvala što doprinosiš za dobrobit svih!',
    'contribute.nameLabel': 'Naziv proizvoda',
    'contribute.namePlaceholder': 'npr. Čokolino 250g',
    'contribute.containsLabel': 'Proizvod sadrži:',
    'contribute.tracesLabel': 'Može sadržati u tragovima:',
    'contribute.photoFrontLabel': 'Slika ambalaže/barkoda (opciono)',
    'contribute.photoIngredientsLabel': 'Slika deklaracije/sastojaka (opciono)',
    'contribute.offAccountNote': 'Za slanje treba besplatan OpenFoodFacts nalog (sprječava zloupotrebu baze). <a href="https://world.openfoodfacts.org/cgi/user.pl?type=add&action=display" target="_blank" rel="noopener">Napravi nalog</a> ako ga nemaš. <strong>Važno:</strong> unesi korisničko ime, ne email adresu.',
    'contribute.usernamePlaceholder': 'korisničko ime (ne email!)',
    'contribute.passwordPlaceholder': 'OpenFoodFacts lozinka',
    'contribute.credentialsNote': 'Podaci se pamte na ovom telefonu da ih ne kucaš svaki put. <a href="#" id="forget-off-credentials">Zaboravi ih</a>',
    'contribute.submitBtn': 'Pošalji doprinos',
    'contribute.fallbackLink': 'Ili dodaj direktno na OpenFoodFacts sajtu ↗',
    'contribute.modeEdit': '✏️ Ispravljaš postojeći proizvod',
    'contribute.modeAdd': '➕ Dodaješ novi proizvod',
    'contribute.errNoName': 'Unesi naziv proizvoda.',
    'contribute.errNoCreds': 'Unesi OpenFoodFacts korisničko ime i lozinku.',
    'contribute.sending': 'Šaljem...',
    'contribute.sendingFrontPhoto': 'Šaljem sliku ambalaže...',
    'contribute.sendingIngredientsPhoto': 'Šaljem sliku deklaracije...',
    'contribute.success': '✅ Hvala! Podaci su poslani u OpenFoodFacts. Može potrajati par minuta dok se pojave u bazi.',
    'contribute.failPrefix': '⚠️ Slanje nije uspjelo: {0}',
    'profile.addPersonBtn': '+ Dodaj osobu',
    'profile.nameLabel': 'Ime osobe:',
    'profile.namePlaceholder': 'npr. Dijete 1',
    'profile.allergensLabel': 'Alergeni:',
    'profile.emptyHint': 'Još nema dodanih osoba.',
    'profile.allergenCount': '{0} alergen(a)',
    'profile.confirmDelete': 'Obrisati profil "{0}"?',
    'footer.support': '💛 Podrži aplikaciju',
    'footer.blog': '📝 Blog',
    'history.title': 'Skenirani proizvodi:',
    'history.clearAllBtn': '🗑️ Obriši sve',
    'history.emptyHint': 'Još nema skeniranih proizvoda.',
    'history.unknownProduct': 'Nepoznat proizvod',
    'history.confirmClearAll': 'Obrisati cijelu istoriju skeniranja?',
    'nav.home': 'Početna',
    'nav.profile': 'Profil',
    'nav.history': 'Istorija',
    'share.title': 'imamAlergiju profil',
    'share.text': 'Alergeni za {0} — otvori link, app se sama podesi.',
    'share.copied': 'Link je kopiran u clipboard. Pošalji ga kome želiš.',
    'share.copyManually': 'Kopiraj ovaj link ručno:',
    'share.importConfirm': 'Neko ti je poslao profil "{0}" ({1}).\n\nDodati ovaj profil i odmah ga postaviti kao aktivan?',
    'share.noAllergensFallback': 'nema izabranih alergena',
    'scan.checking': 'Provjeravam...',
    'scan.needProfile': 'ℹ️ Napravi i izaberi profil prije skeniranja.',
    'scan.networkError': '⚠️ Greška pri povezivanju na bazu. Provjeri internet i pokušaj ponovo.',
    'scan.notFound': '❔ Proizvod nije pronađen.',
    'scan.notFoundDetail': 'Ovaj proizvod nije u bazi. Provjeri deklaraciju ručno, ili ga dodaj u bazu da pomogneš drugima.',
    'scan.noNameProduct': '(proizvod bez naziva u bazi)',
    'scan.noAllergensSelected': 'ℹ️ {0} nema izabranih alergena. Uredi profil.',
    'scan.contains': '🔴 Sadrži: {0}',
    'scan.mayContain': '🟠 Može sadržati u tragovima: {0}',
    'scan.clear': '🟢 Nema izabranih alergena u proizvodu',
    'scanner.unsupported': 'Ovaj browser ne podržava čitanje barkoda kamerom. Koristi ručni unos ispod.',
    'scanner.cameraError': 'Nije moguće pristupiti kameri. Provjeri dozvole ili koristi ručni unos.',
    'off.wrongCreds': 'Pogrešno korisničko ime ili lozinka. Napomena: OFF traži korisničko ime, ne email adresu.',
    'off.badResponse': 'Neispravan odgovor od OpenFoodFacts servera.',
    'off.rejected': 'OpenFoodFacts je odbio podatke (provjeri korisničko ime/lozinku).'
  },
  en: {
    'header.subtitle': 'Scan a product, know right away.',
    'profile.none': '— no profile —',
    'home.scanBtn': '📷 Scan barcode',
    'home.scanHint': 'The camera is only used to read the barcode — nothing is recorded or sent.',
    'home.scanStatusDefault': 'Point the camera at the product barcode.',
    'home.manualHint': "If the camera can't read the code, enter it manually:",
    'home.manualPlaceholder': 'e.g. 3017620422003',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.share': 'Share',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'result.disclaimer': '⚠️ This information is not 100% reliable. Always check the label on the product.',
    'result.barcodeLabel': 'Barcode:',
    'result.addProductBtn': '➕ Add product to database',
    'result.editAllergensBtn': '✏️ Fix allergens',
    'contribute.disclaimer': '📦 This data goes directly into <strong>OpenFoodFacts</strong> — the free, public database used by this and many other apps. Thanks for contributing for everyone\'s benefit!',
    'contribute.nameLabel': 'Product name',
    'contribute.namePlaceholder': 'e.g. Chocolate spread 250g',
    'contribute.containsLabel': 'Product contains:',
    'contribute.tracesLabel': 'May contain traces of:',
    'contribute.photoFrontLabel': 'Photo of packaging/barcode (optional)',
    'contribute.photoIngredientsLabel': 'Photo of ingredients label (optional)',
    'contribute.offAccountNote': 'Submitting requires a free OpenFoodFacts account (this prevents database abuse). <a href="https://world.openfoodfacts.org/cgi/user.pl?type=add&action=display" target="_blank" rel="noopener">Create an account</a> if you don\'t have one. <strong>Important:</strong> enter your username, not your email address.',
    'contribute.usernamePlaceholder': 'username (not email!)',
    'contribute.passwordPlaceholder': 'OpenFoodFacts password',
    'contribute.credentialsNote': 'This is remembered on this phone so you don\'t retype it every time. <a href="#" id="forget-off-credentials">Forget it</a>',
    'contribute.submitBtn': 'Submit contribution',
    'contribute.fallbackLink': 'Or add it directly on the OpenFoodFacts site ↗',
    'contribute.modeEdit': '✏️ Fixing an existing product',
    'contribute.modeAdd': '➕ Adding a new product',
    'contribute.errNoName': 'Enter a product name.',
    'contribute.errNoCreds': 'Enter your OpenFoodFacts username and password.',
    'contribute.sending': 'Sending...',
    'contribute.sendingFrontPhoto': 'Sending packaging photo...',
    'contribute.sendingIngredientsPhoto': 'Sending ingredients photo...',
    'contribute.success': '✅ Thank you! The data was sent to OpenFoodFacts. It may take a few minutes to appear in the database.',
    'contribute.failPrefix': '⚠️ Submission failed: {0}',
    'profile.addPersonBtn': '+ Add person',
    'profile.nameLabel': 'Name:',
    'profile.namePlaceholder': 'e.g. Child 1',
    'profile.allergensLabel': 'Allergens:',
    'profile.emptyHint': 'No one added yet.',
    'profile.allergenCount': '{0} allergen(s)',
    'profile.confirmDelete': 'Delete profile "{0}"?',
    'footer.support': '💛 Support the app',
    'footer.blog': '📝 Blog',
    'history.title': 'Scanned products:',
    'history.clearAllBtn': '🗑️ Clear all',
    'history.emptyHint': 'No scans yet.',
    'history.unknownProduct': 'Unknown product',
    'history.confirmClearAll': 'Clear the entire scan history?',
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.history': 'History',
    'share.title': 'imamAlergiju profile',
    'share.text': 'Allergens for {0} — open the link, the app sets itself up.',
    'share.copied': 'Link copied to clipboard. Send it to whoever you like.',
    'share.copyManually': 'Copy this link manually:',
    'share.importConfirm': 'Someone sent you the profile "{0}" ({1}).\n\nAdd this profile and set it as active right away?',
    'share.noAllergensFallback': 'no allergens selected',
    'scan.checking': 'Checking...',
    'scan.needProfile': 'ℹ️ Create and select a profile before scanning.',
    'scan.networkError': '⚠️ Error connecting to the database. Check your internet and try again.',
    'scan.notFound': '❔ Product not found.',
    'scan.notFoundDetail': "This product isn't in the database. Check the label manually, or add it to help others.",
    'scan.noNameProduct': '(product has no name in the database)',
    'scan.noAllergensSelected': 'ℹ️ {0} has no allergens selected. Edit the profile.',
    'scan.contains': '🔴 Contains: {0}',
    'scan.mayContain': '🟠 May contain traces of: {0}',
    'scan.clear': '🟢 None of the selected allergens found',
    'scanner.unsupported': "This browser doesn't support camera barcode scanning. Use manual entry below.",
    'scanner.cameraError': "Can't access the camera. Check permissions or use manual entry.",
    'off.wrongCreds': 'Wrong username or password. Note: OFF wants your username, not your email address.',
    'off.badResponse': 'Invalid response from the OpenFoodFacts server.',
    'off.rejected': 'OpenFoodFacts rejected the data (check username/password).'
  }
};

function t(key, ...args) {
  const lang = getLang();
  let str = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.bs[key] || key;
  args.forEach((val, i) => {
    str = str.split(`{${i}}`).join(val);
  });
  return str;
}

function applyStaticTranslations() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}
