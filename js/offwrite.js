const OFF_WRITE_BASE = 'https://world.openfoodfacts.org';

// Uzima jedan (primarni) OFF tag po izabranoj kategoriji alergena — dovoljno
// precizno za doprinos, korisnik ovdje bira opštu kategoriju, ne konkretnu vrstu oraha i sl.
function allergenIdsToOffTags(ids) {
  return ALLERGENS.filter((a) => ids.includes(a.id)).map((a) => a.tags[0]);
}

// OFF vraća HTML (ne JSON) na 403 kad su kredencijali pogrešni — prepoznajemo
// taj slučaj posebno da korisniku damo jasnu poruku umjesto "neispravan odgovor".
async function parseOffResponse(response) {
  try {
    return await response.json();
  } catch (e) {
    if (response.status === 403) {
      throw new Error(t('off.wrongCreds'));
    }
    throw new Error(t('off.badResponse'));
  }
}

// Piše osnovne podatke o proizvodu (naziv, alergeni, tragovi) preko OFF write API-ja.
// OFF-ova dokumentacija šalje ovo kao multipart/form-data (curl -F) — kod
// application/x-www-form-urlencoded polja se autentifikuju ispravno, ali se sadržaj
// (naziv, alergeni...) tiho ne snima. Zato ovdje koristimo FormData i ne postavljamo
// Content-Type ručno (browser sam doda ispravan multipart boundary).
async function submitProductFields({ code, name, containsIds, tracesIds, userId, password }) {
  const form = new FormData();
  form.set('code', code);
  form.set('user_id', userId);
  form.set('password', password);
  form.set('product_name', name);
  form.set('lang', getLang());

  const containsTags = allergenIdsToOffTags(containsIds);
  const tracesTags = allergenIdsToOffTags(tracesIds);
  if (containsTags.length) form.set('allergens', containsTags.join(','));
  if (tracesTags.length) form.set('traces', tracesTags.join(','));

  const response = await fetch(`${OFF_WRITE_BASE}/cgi/product_jqm2.pl`, {
    method: 'POST',
    body: form
  });

  const data = await parseOffResponse(response);

  if (data.status !== 1) {
    throw new Error(data.status_verbose || t('off.rejected'));
  }
  return data;
}

// imagefield: 'front' (ambalaža/barkod) ili 'ingredients' (deklaracija).
// Ne baca grešku na neuspjeh — slika je "po mogućnosti", ne smije srušiti cijeli doprinos.
async function uploadProductImage({ code, imagefield, file, userId, password }) {
  const form = new FormData();
  form.set('code', code);
  form.set('user_id', userId);
  form.set('password', password);
  form.set('imagefield', imagefield);
  form.set(`imgupload_${imagefield}`, file);

  try {
    const response = await fetch(`${OFF_WRITE_BASE}/cgi/product_image_upload.pl`, {
      method: 'POST',
      body: form
    });
    return await response.json();
  } catch (e) {
    return { status: 'error', error: String(e) };
  }
}
