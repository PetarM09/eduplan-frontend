# BehindClasses — Design System

Vizuelni jezik frontenda izveden iz loga (`BehindClasses.svg` / `BehindClassesIcon.svg`).
Cilj: **jednostavno ali moderno**, akademski karakter, jak ali nenametljiv brend.

## 1. Princip

**Profinjeni minimalizam + Material-stil elevacija.**
Čiste površine, dosta praznog prostora, jedna struktura boje (navy) i jedan akcenat (zlatna).
Boja se koristi namenski — ne dekorativno. Status (uspeh/upozorenje/greška) ostaje u zasebnim
bojama da bi se brzo čitao.

## 2. Paleta (iz loga)

| Uloga | Hex | Gde |
|---|---|---|
| **Brand navy** | `#0e2443` | Struktura, primarne akcije, sidebar, naslovi |
| **Accent gold** | `#f8c007` | Aktivna stavka, istaknuti badge, ključni highlight |
| Belo | `#ffffff` | Kartice / površine |

Navy dominira (kao logo); zlatna je _samo_ akcenat. Zlatna se **ne** koristi kao boja
primarne dugmadi (loš kontrast na belom) — primarne akcije su navy.

### Skala — `brand` (navy), anchor #0e2443 @ 900
```
50 #eef3fa · 100 #d8e3f1 · 200 #b3c6e0 · 300 #84a1c9 · 400 #5278ab
500 #335f94 · 600 #244c7d · 700 #1b3c66 · 800 #142e51 · 900 #0e2443 · 950 #081627
```
### Skala — `accent` (gold), anchor #f8c007 @ 400
```
50 #fff9e6 · 100 #fdefb8 · 200 #fbe085 · 300 #f9cf4a · 400 #f8c007
500 #dba600 · 600 #b07f00 · 700 #855e00 · 800 #5e4200 · 900 #3f2c00
```

## 3. Semantički tokeni

Sve komponente troše semantičke tokene (ne sirove boje). Definicija: `src/styles/theme.css`.

| Token | Light | Dark |
|---|---|---|
| `background` | `#f6f8fc` | `#081627` |
| `foreground` | `#0e2443` | `#e6edf6` |
| `card` / `card-foreground` | `#ffffff` / `#0e2443` | `#0e2443` / `#e6edf6` |
| `primary` / `primary-foreground` | `#0e2443` / `#ffffff` | `#4f86c6` / `#06101f` |
| `secondary` | `#eef3fa` | `#142e51` |
| `muted` / `muted-foreground` | `#f1f5f9` / `#5b6b82` | `#142e51` / `#93a4bd` |
| `accent` / `accent-foreground` | `#f8c007` / `#0e2443` | `#f8c007` / `#0e2443` |
| `destructive` | `#dc2626` | `#f87171` |
| `success` / `warning` / `info` | `#10b981` / `#f59e0b` / `#2f6fc0` | `#34d399` / `#fbbf24` / `#60a5fa` |
| `border` / `input` | `#e3e8ef` | `#1b3c66` |
| `ring` | `#1b3c66` | `#4f86c6` |
| **sidebar** | `#0e2443` shell, `#f8c007` aktiv | `#0a1c34` shell, `#f8c007` aktiv |

Workspace je blago siv (`background`), kartice bele (`card`) → prirodna elevacija bez senki.

## 4. Layout

- **Navy sidebar + svetao sadržaj** (za sve uloge — uklonjeno staro SUPER_ADMIN slate/orange
  posebno tretiranje; sada svi koriste isti navy+gold shell).
- Sidebar širina 288px (`w-72`), aktivna stavka = zlatni tint `bg-sidebar-primary/15` + zlatni
  tekst/ikona + `ChevronRight`.
- TopBar: visina 64px, prebacivač teme (sunce/mesec), user dropdown.
- Sadržaj: `max-w-7xl`, padding 32px, vertikalni razmak 24px.

## 5. Komponentne konvencije

| Element | Pravilo |
|---|---|
| Radius | kartice `rounded-2xl` (16px), kontrole/dugmad `rounded-xl` (12px); token `--radius: 0.75rem` |
| Dugme – default | `bg-primary text-primary-foreground` (navy) |
| Dugme – accent | `bg-accent text-accent-foreground` (zlatna, retko, za istaknute akcije) |
| Dugme – outline/secondary/ghost | preko `border`/`secondary` tokena |
| Input | `bg-input-background border-input`, focus `ring-ring/30` |
| Kartica | `bg-card border-border shadow-sm` |
| Badge uloge | `bg-accent/15` + `ring-accent/40` |
| Senke | suptilne; `hover-lift` koristi navy-tintovanu senku |

## 6. Tipografija

Sistemski font stack (bez custom fonta). Skala: h1 2rem/700, h2 1.5rem/600, h3 1.25rem/600,
h4 1rem/600, body 0.875–1rem. Negativan letter-spacing na naslovima (`-0.02em` h1).

## 7. Pristupačnost

- Kontrast: navy/belo i belo/navy ≫ 4.5:1. Zlatna se nikad ne koristi kao tekst na belom bez
  tamne podloge; za tekst-na-svetlom koristi `accent-700`.
- Vidljiv focus ring (`ring-ring`) na svim kontrolama.
- Boja nikad nije jedini indikator (ikona + tekst uz status).
- `prefers-color-scheme` poštovan pri prvom učitavanju; izbor se pamti u `localStorage` (`sp.theme`).

## 8. Dark mode

- Klasa `dark` na `<html>`. Anti-flash inline skripta u `index.html` postavlja temu pre paint-a.
- `ThemeProvider` (`src/context/ThemeContext.tsx`) + toggle u TopBar.
- U dark temi primarna akcija prelazi na svetliji brand-plavi (`#4f86c6`) radi vidljivosti na
  tamnom navy-u; zlatna ostaje isti akcenat.

## 9. Šta je promenjeno (sažetak migracije)

- Stari indigo/cyan token sistem → navy/gold izveden iz loga.
- Sve hardkodovane boje (`blue/indigo/sky/cyan` i super-admin `slate/orange`) → `brand`/`accent`
  Tailwind skale; svi `gray-*` neutrali → semantički tokeni (`card/foreground/muted/border`…).
- Dodat pun dark mode (provider + toggle + perzistencija + anti-flash).
- Logo integrisan: sidebar header, login, favicon. Ime brenda ujednačeno na **BehindClasses**.

Pun, koraka-po-korak vodič za repliciranje na Flutter mobilnoj aplikaciji: `MOBILE_REDESIGN_TASKS.md`.
