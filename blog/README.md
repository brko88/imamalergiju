# imamAlergiju blog

## Kako napisati novu objavu

1. Napravi novi fajl u `posts/`, npr. `posts/2026-09-01-nova-objava.md`
2. Na vrh stavi:
   ```
   ---
   title: Naslov objave
   date: 2026-09-01
   image: images/naslovna.jpg
   ---
   ```
   (`image` red je opcion — izostavi ga ako objava nema naslovnu sliku)
3. Ispod napiši tekst. Podržano:
   - `**podebljano**`, `*kurziv*`, `` `kod` ``
   - `## Podnaslov`
   - `[link](https://...)`
   - `![opis slike](images/naziv.jpg)` — sliku prije toga sačuvaj u `images/`
4. Slike stavi u `images/` folder (bilo koje ime fajla)

## Kako generisati stranicu

U `blog/` folderu pokreni:

```
node build.js
```

Sve gotove HTML stranice se pojave u `dist/` — to je ono što se postavlja na hosting (cijeli `dist/` folder, uključujući `style.css` i `images/` koje skripta sama kopira).

## Pregled prije objave

Otvori `dist/index.html` direktno u browseru (dvoklik na fajl) da vidiš kako izgleda, bez potrebe za serverom.
