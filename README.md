# 🐷 Kasica — Budget App

> Pametno upravljanje novcem. Jednostavna, brza i offline-ready PWA aplikacija za praćenje troškova i prihoda.

![Kasica App](https://img.shields.io/badge/PWA-ready-3a7d5a?style=for-the-badge&logo=pwa)
![HTML5](https://img.shields.io/badge/HTML5-vanilla-E34F26?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-responsive-1572B6?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)

---

## 📱 Funkcionalnosti

| Ekran | Opis |
|---|---|
| 🏠 Početna | Donut grafikon, balans, troškovi/prihodi po kategorijama |
| ➕ Dodaj transakciju | Unos iznosa, konverzija valuta, kategorija, datum, komentar |
| 📋 Operacije | Lista transakcija grupisana po datumu sa brisanjem |
| 🗂️ Kategorije | Pregled, dodavanje i brisanje kategorija |
| ✏️ Nova kategorija | Izbor ikone, boje i tipa (trošak/prihod) |
| 📊 Grafikoni | Bar chart po mesecima + pie chart po kategorijama |
| 💰 Računi | Pregled računa sa balansom |
| ⚙️ Podešavanja | Valuta, tema (svetla/tamna), izvoz podataka |

---

## 🚀 Pokretanje

### Online (GitHub Pages)
Aplikacija je dostupna na:
```
https://milan12t.github.io/kasica/
```

### Lokalno
```bash
git clone https://github.com/milan12t/kasica.git
cd kasica
# Otvori index.html u browseru ili pokreni lokalni server:
npx serve .
```

---

## 📲 Instalacija kao PWA

### Android (Chrome)
1. Otvori aplikaciju u Chrome-u
2. Tap na **⋮** meni (gore desno)
3. Izaberi **"Dodaj na početni ekran"**
4. Tap **Dodaj**

### iOS (Safari)
1. Otvori aplikaciju u Safari-ju
2. Tap na dugme **Podeli** (□↑)
3. Izaberi **"Dodaj na početni ekran"**
4. Tap **Dodaj**

---

## 🗂️ Struktura projekta

```
kasica/
├── index.html      # Glavni HTML — svi ekrani aplikacije
├── style.css       # Stilovi — responsive dizajn, dark mode
├── app.js          # Logika — navigacija, CRUD, grafikoni
├── manifest.json   # PWA manifest
├── sw.js           # Service Worker — offline podrška
└── README.md       # Dokumentacija
```

---

## 💾 Podaci

Svi podaci se čuvaju lokalno u **localStorage** — nema servera, nema registracije, nema oblaka. Podaci ostaju na tvom uređaju.

Izvoz podataka je dostupan u **Podešavanja → Izvezi podatke (JSON)**.

---

## 🎨 Tehnologije

- **Vanilla HTML/CSS/JS** — bez frameworka, bez zavisnosti
- **PWA** — instalabilna, radi offline
- **Canvas API** — donut i bar grafikoni
- **localStorage** — lokalno čuvanje podataka
- **CSS Variables** — podrška za svetlu i tamnu temu
- **Google Fonts** — Nunito tipografija

---

## 📸 Ekrani

| Početna | Dodaj transakciju | Operacije |
|---|---|---|
| Balans + donut grafikon | Unos iznosa i kategorije | Lista po datumu |

---

## 🛠️ Razvoj

Doprinosi su dobrodošli! Otvori **Issue** ili **Pull Request**.

### Planirane funkcionalnosti
- [ ] Sinhronizacija u oblaku
- [ ] Višejezična podrška
- [ ] Budžet limiti po kategorijama
- [ ] Ponavljajuće transakcije
- [ ] Widget za početni ekran
- [ ] Backup na Google Drive

---

## 📄 Licenca

MIT License — slobodno koristi, menjaj i deli.

---

<div align="center">
  Napravljeno sa ❤️ u Srbiji
</div>
