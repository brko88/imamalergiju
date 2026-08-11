const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product/';
const OFF_FIELDS = 'product_name,brands,allergens_tags,traces_tags,code,status';

// Semafor se računa isključivo iz ovih strukturiranih polja — nikad iz slike ili nagađanja.
async function fetchProduct(barcode) {
  const url = `${OFF_API_BASE}${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`;
  const response = await fetch(url);
  // OFF vraća HTTP 404 čak i za validan "nije pronađeno" odgovor (status:0 u tijelu),
  // pa ne smijemo baciti grešku na osnovu response.ok — samo probamo parsirati JSON.
  const data = await response.json();
  if (data.status !== 1 || !data.product) {
    return { found: false, barcode };
  }
  const p = data.product;
  return {
    found: true,
    barcode,
    name: p.product_name || null,
    brand: p.brands || null,
    allergensTags: p.allergens_tags || [],
    tracesTags: p.traces_tags || []
  };
}
