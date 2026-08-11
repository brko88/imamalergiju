// 14 EU standardnih alergena, mapiranih na OpenFoodFacts taksonomiju.
// OFF već normalizuje sastojke (na bilo kom jeziku) u ove tagove, pa ne moramo
// sami parsirati tekst deklaracije — samo poredimo tagove.
const ALLERGENS = [
  { id: 'gluten', label: 'Gluten (žitarice)', tags: ['en:gluten'] },
  { id: 'crustaceans', label: 'Rakovi', tags: ['en:crustaceans'] },
  { id: 'eggs', label: 'Jaja', tags: ['en:eggs'] },
  { id: 'fish', label: 'Riba', tags: ['en:fish'] },
  { id: 'peanuts', label: 'Kikiriki', tags: ['en:peanuts'] },
  { id: 'soybeans', label: 'Soja', tags: ['en:soybeans'] },
  { id: 'milk', label: 'Mlijeko', tags: ['en:milk'] },
  {
    id: 'nuts',
    label: 'Orašasti plodovi',
    tags: [
      'en:nuts', 'en:hazelnuts', 'en:almonds', 'en:walnuts',
      'en:cashew-nuts', 'en:pecan-nuts', 'en:pistachios',
      'en:brazil-nuts', 'en:macadamia-nuts', 'en:queensland-nuts'
    ]
  },
  { id: 'celery', label: 'Celer', tags: ['en:celery'] },
  { id: 'mustard', label: 'Gorušica', tags: ['en:mustard'] },
  { id: 'sesame-seeds', label: 'Susam', tags: ['en:sesame-seeds'] },
  { id: 'sulphur-dioxide-and-sulphites', label: 'Sumpor-dioksid i sulfiti', tags: ['en:sulphur-dioxide-and-sulphites'] },
  { id: 'lupin', label: 'Lupina', tags: ['en:lupin'] },
  { id: 'molluscs', label: 'Mekušci', tags: ['en:molluscs'] }
];

// selectedIds: niz id-jeva iz ALLERGENS koje trenutno provjeravamo.
// allergensTags / tracesTags: nizovi OFF tagova sa proizvoda ("sadrži" / "može sadržati").
function matchAllergens(selectedIds, allergensTags, tracesTags) {
  const selected = ALLERGENS.filter((a) => selectedIds.includes(a.id));
  const contains = [];
  const traces = [];

  for (const allergen of selected) {
    const hitsContains = allergen.tags.some((tag) => allergensTags.includes(tag));
    const hitsTraces = allergen.tags.some((tag) => tracesTags.includes(tag));
    if (hitsContains) contains.push(allergen);
    else if (hitsTraces) traces.push(allergen);
  }

  if (contains.length > 0) return { level: 'red', matched: contains };
  if (traces.length > 0) return { level: 'orange', matched: traces };
  return { level: 'green', matched: [] };
}

// Obrnuto od matchAllergens: iz OFF tagova na proizvodu izvodi koje su naše
// 14 kategorije trenutno označene kao "sadrži" / "u tragovima" — za pre-popunjavanje forme za ispravku.
function deriveAllergenIdsFromTags(allergensTags, tracesTags) {
  const containsIds = [];
  const tracesIds = [];

  for (const allergen of ALLERGENS) {
    const hitsContains = allergen.tags.some((tag) => allergensTags.includes(tag));
    const hitsTraces = allergen.tags.some((tag) => tracesTags.includes(tag));
    if (hitsContains) containsIds.push(allergen.id);
    else if (hitsTraces) tracesIds.push(allergen.id);
  }

  return { containsIds, tracesIds };
}
