---
title: Dobrodošli na imamAlergiju blog
date: 2026-08-11
---

Ovo je prva objava na blogu. Ovdje ću pisati o razvoju aplikacije **imamAlergiju**, alergijama, i svemu što je korisno roditeljima koji se svakodnevno bore sa čitanjem deklaracija.

## Kako pisati objavu

Napravi novi `.md` fajl u `posts/` folderu, po uzoru na ovaj. Na vrhu ide:

```
---
title: Naslov tvoje objave
date: 2026-08-11
image: images/naslovna.jpg
---
```

`image` red je opcion — ako ga izostaviš, objava neće imati naslovnu sliku.

Ispod toga pišeš tekst normalno. Podržano je: **podebljano**, *kurziv*, [linkovi](https://openfoodfacts.org), podnaslovi sa `##`, i slike sa `![opis slike](images/naziv.jpg)` (sliku prije toga samo sačuvaj u `images/` folder).

Kad završiš, pokreni `node build.js` u `blog/` folderu — sve se generiše u `dist/`.
