# imamAlergiju — Vodilja za razvoj aplikacije

*Verzija 1.0 · 11.08.2026.*

Ovaj dokument je vodilja koju pratiš dok gradiš aplikaciju. Sve što je ovdje već je dogovoreno. Ne mora se sve napraviti odjednom — na dnu je predloženi redoslijed.

---

## 1. Šta je aplikacija

Jednostavna aplikacija koja u prodavnici, skeniranjem barkoda proizvoda, odmah kaže roditelju/korisniku da li proizvod sadrži alergen na koji je neko u porodici alergičan. Odgovor je vizuelni semafor: zeleno / narandžasto / crveno.

**Vodeći princip:** radi **jedno**, i radi to jasno. Ne pretvarati je u „sve za svakoga" (to je greška zbog koje su druge slične aplikacije nepregledne). Jedno pitanje: *„Ima li ovdje alergena koji nas se tiče?"* — jasan odgovor.

**Tehnički oblik:** PWA (web aplikacija koja se „instalira" na telefon kao ikonica, radi u browseru, koristi kameru). Bez app store-a.

**Jezik:** naš jezik od prvog dana. Struktura spremna za kasniji prevod na druge jezike.

---

## 2. Ključne odluke (već dogovorene)

- **Bez registracije i logina.** Nema mejla, nema naloga. Profili se čuvaju **lokalno na telefonu** (u browseru). Privatnije je i nema trenja.
- **Izvor podataka:** OpenFoodFacts API. Poziva ga korisnikov browser direktno.
- **Hosting:** poddomen `alergeni.sattlio.com` na postojećem VPS-u. Bez novog hostinga i troška. Statični fajlovi + Nginx blok + Let's Encrypt SSL.
- **Boja:** ne koristiti plavu. Ostatak dizajna slobodan — jednostavno za korištenje, lijepo za oko.
- **Dodavanje proizvoda kojih nema u bazi** ide preko **doprinosa OpenFoodFactsu** (ne u vlastitu bazu — izbjegava održavanje, moderaciju i OCR).

---

## 3. Funkcionalnosti (MVP)

### 3.1 Profili alergija
- Kreiranje profila **bez registracije**, čuva se lokalno na telefonu.
- Više osoba u profilu (npr. do 5 — dijete 1, dijete 2, itd.).
- Svaka osoba može imati **više alergena** (npr. lješnjak + mlijeko + orašasti plodovi).
- Profil se može uređivati i brisati.
- Prilikom skeniranja, aktivni profil određuje na koje alergene se provjerava.

### 3.2 Čitač barkoda
- Skeniranje barkoda kamerom telefona.
- **Ručni unos barkoda** kao rezerva (ako kamera ne pročita ili je kod oštećen).
- Nakon očitavanja → poziv OpenFoodFactsu → rezultat (semafor).

### 3.3 Semafor rezultata
Nakon skeniranja, na osnovu alergena iz aktivnog profila:

| Boja | Značenje |
|---|---|
| 🟢 **Zeleno** | Nema zadatih alergena u proizvodu |
| 🟠 **Narandžasto** | Alergen se može naći **u tragovima** / „može sadržati" |
| 🔴 **Crveno** | Proizvod **sadrži** alergen |

- Logika mora hvatati **sinonime** (lješnjak / hazelnut / orašasti plodovi) i razlikovati **„sadrži"** od **„u tragovima / može sadržati"**.
- Semafor se računa **samo iz strukturiranih polja alergena** iz baze — nikad iz slike/nagađanja.

### 3.4 Baner upozorenja (na svakom rezultatu)
- Vidljiv na **svakom** skeniranom proizvodu, ne samo u uslovima korištenja.
- Poruka u smislu: *„Ove informacije nisu 100% pouzdane. Uvijek provjerite deklaraciju na proizvodu."*
- Posebno naglašen kod zelenog rezultata (da zeleno ne uljuljka u lažnu sigurnost).

### 3.5 Proizvod nije u bazi
- Jasan ekran umjesto prazne greške: *„Proizvod nije pronađen."*
- Poziv da se provjeri deklaracija ručno.
- Opcija: **„Dodaj proizvod"** → polja za unos + slika, šalje se **doprinos OpenFoodFactsu**.
  - Polja: barkod (već očitan), naziv, alergeni (tekstualno/strukturirano), po mogućnosti slika barkoda i deklaracije.
  - **Važno:** semafor za taj proizvod radi tek kad su alergeni uneseni **strukturirano** (kao tekst/polje), ne samo kao slika. Dok se ne obrade, proizvod ostaje „provjeri deklaraciju ručno".

### 3.6 Istorija skeniranja
- Lista skeniranih proizvoda (lokalno na telefonu).
- Brisanje **pojedinačno** i **sve odjednom**.

### 3.7 Donacija
- Dugme za donaciju putem **PayPal-a** (PayPal.me link ili slično).
- Nenametljivo — npr. u meniju ili podnožju.

### 3.8 Dugme za blog
- Malo dugme koje vodi na blog (koji Brko piše).
- Za sada samo link/preusmjerenje.

---

## 4. Dizajn

- **Bez plave boje.**
- Jednostavno za korištenje, lijepo za oko.
- Semafor boje (zelena/narandžasta/crvena) su funkcionalne — ostatak palete birati tako da se s njima slaže i da ostane čitko.
- Veliki, jasni elementi — koriste se u prodavnici, na brzinu, jednom rukom.
- Prijedlog: topao, „ljudski" ton (aplikacija se tiče djece i zdravlja), ne hladan/korporativni.

---

## 5. Izvan MVP-a (kasnije, ne sada)

- **Offline keš** zadnjih skeniranja (loš signal u prodavnicama).
- **Prevod** na druge jezike (struktura spremna od početka).
- **Plaćena verzija — AI čita alergen sa slike deklaracije** (za proizvode van baze).
  - Oprez: AI **ne smije** davati zeleno ni garantovati sigurnost. Samo „pomoć pri čitanju" — istakne gdje vidi alergen/tragove, korisnik potvrđuje očima. Disclaimer jači nego kod baze.
- **Vlastiti domen** (npr. `imamalergiju.app`) — tek ako aplikacija zaživi i poželi svoj brend odvojen od Sattlija.

---

## 6. Predloženi redoslijed izrade

Radi se **fajl po fajl, s testiranjem između** (Brkov način rada).

1. **Skelet + PWA + čitač barkoda** — jedini dio s tehničkim rizikom. Prvo potvrditi da skener radi na telefonu.
2. **OpenFoodFacts + logika semafora** — srce aplikacije, ne žuriti (sinonimi, tragovi, više alergena).
3. **Profili (lokalno) + više osoba + više alergena.**
4. **Baner upozorenja + ekran „nije u bazi".**
5. **Istorija skeniranja (brisanje pojedinačno/sve).**
6. **Ručni unos barkoda + donacija + dugme za blog.**
7. **Dodavanje proizvoda → doprinos OpenFoodFactsu.**

**Procjena:** za osnovni upotrebljiv MVP (skener + baza + semafor + profil + baner + „nije u bazi") realno ~2 sata fokusiranog rada, ako skener odmah proradi. Za sve iz liste ~3–4 sata, u više navrata.

---

## 7. Podsjetnik o pouzdanosti

Aplikacija je **pomoć**, ne zamjena za čitanje deklaracije. Nijedna ovakva aplikacija nije 100% pouzdana. Kod alergena greška može biti opasna — zato baner ide na svaki rezultat, a semafor se nikad ne oslanja na nagađanje. Zeleno znači „nismo našli u dostupnim podacima", ne „garantovano sigurno".
