# Mobile (Flutter) redizajn — taskovi

Brief za Claude agenta na **mobile repo-u**. Cilj: uskladiti Flutter aplikaciju sa novim
vizuelnim identitetom web frontenda (brend **BehindClasses**). Dokument je samostalan — sadrži
sve vrednosti, ne treba pristup web repo-u.

## Princip (isti kao web)

Profinjeni minimalizam + Material elevacija. **Navy = struktura + primarne akcije.
Zlatna = jedini akcenat** (aktivna stavka, istaknuti badge, highlight). Status boje zasebne.
Navy dominira, zlatna se koristi štedljivo. Zlatna **nije** primarna boja dugmadi (loš kontrast);
primarne akcije su navy.

## Brend boje (iz loga)

- **Navy** `#0E2443` · **Gold** `#F8C007` · Belo `#FFFFFF`

### Skala brand (navy)
```
50 #EEF3FA  100 #D8E3F1  200 #B3C6E0  300 #84A1C9  400 #5278AB
500 #335F94 600 #244C7D  700 #1B3C66  800 #142E51  900 #0E2443  950 #081627
```
### Skala accent (gold)
```
50 #FFF9E6  100 #FDEFB8  200 #FBE085  300 #F9CF4A  400 #F8C007
500 #DBA600 600 #B07F00  700 #855E00  800 #5E4200  900 #3F2C00
```

---

## TASK 1 — Token sloj (uradi prvo)

Napravi `lib/theme/app_colors.dart` sa brand i accent skalama (gore) kao `Color` konstantama,
plus status: `success #10B981`, `warning #F59E0B`, `danger #DC2626`, `info #2F6FC0`.

Napravi `lib/theme/app_theme.dart` sa `lightTheme` i `darkTheme` (`ThemeData`), mapirano:

| Flutter (ColorScheme / ThemeData) | Light | Dark |
|---|---|---|
| `scaffoldBackgroundColor` | `#F6F8FC` | `#081627` |
| `colorScheme.surface` (kartice) | `#FFFFFF` | `#0E2443` |
| `colorScheme.onSurface` | `#0E2443` | `#E6EDF6` |
| `colorScheme.primary` | `#0E2443` | `#4F86C6` |
| `colorScheme.onPrimary` | `#FFFFFF` | `#06101F` |
| `colorScheme.secondary` (akcenat) | `#F8C007` | `#F8C007` |
| `colorScheme.onSecondary` | `#0E2443` | `#0E2443` |
| `colorScheme.error` | `#DC2626` | `#F87171` |
| `colorScheme.outline` (border) | `#E3E8EF` | `#1B3C66` |
| muted text | `#5B6B82` | `#93A4BD` |
| muted surface | `#F1F5F9` | `#142E51` |

> Napomena: u Material 3 terminologiji „accent" = `secondary`. Ne stavljaj zlatnu u `primary`.

## TASK 2 — Dark mode

- `ThemeMode` (light/dark/system) preko provajdera (Provider/Riverpod/`ValueNotifier` — šta repo
  već koristi).
- Persistuj izbor (`shared_preferences`, ključ npr. `sp.theme`). Default = `ThemeMode.system`.
- Dodaj prebacivač (ikone sunce/mesec) u app bar (vidi TASK 4).

## TASK 3 — Navigacija (ekvivalent navy sidebar-a)

Web ima **navy sidebar + svetao sadržaj**. Na mobilnom:
- `NavigationDrawer` i/ili `NavigationBar` sa **navy pozadinom** (`#0E2443`, u dark `#0A1C34`).
- Stavke: neaktivne = svetao tekst/ikona (`#C3D0E4`); **aktivna = zlatna** (tekst+ikona `#F8C007`)
  sa suptilnim zlatnim tint pozadinom (`#F8C007` @ 15% alfa) i zaobljenim indikatorom.
- Header drawera: logo ikona + „BehindClasses" beli tekst, podnaslov = uloga.
- Logout stavka: crveni hover/press (`danger`).

## TASK 4 — App bar

- Pozadina = `surface` (belo/navy po temi), donja hairline = `outline`.
- Desno: dugme za temu (sunce u dark / mesec u light) + user meni (avatar `primary` boje,
  ime + uloga, dropdown sa badge uloge u `accent` @ 15% i logout u `danger`).

## TASK 5 — Komponente

| Element | Pravilo |
|---|---|
| Kartica | `surface`, radius **16**, border `outline` 1px, suptilna senka |
| Primarno dugme | `primary` pozadina, `onPrimary` tekst, radius **12** |
| Accent dugme (retko) | `secondary` (zlatna) + `onSecondary` (navy) tekst |
| Sekundarno/outline | `outline` border, transparentno/`secondary surface` |
| Input | fill = muted surface, border `outline`, focus border/ring = `primary` (light) / `#4F86C6` (dark), radius 12 |
| Badge/Chip uloge | `accent` @ 15% pozadina, `accent` @ 40% ivica |
| StatCard ikonica | obojeni tint kvadrat: brand/accent/success/warning/danger/info (50-tint pozadina + 600-700 ikona u light; 15% tint + svetla ikona u dark) |
| Status (uspeh/upoz./greška) | `success`/`warning`/`danger` — uvek ikona + tekst, ne samo boja |

Radius tokeni: kartice **16**, kontrole **12**.

## TASK 6 — Tipografija

Sistemski font (bez custom fonta, kao web). `TextTheme`:
- headlineLarge ~32/bold, titleLarge ~24/w600, titleMedium ~20/w600, bodyLarge 16, bodyMedium 14.
- Naslovi: blago negativan letter-spacing (~ -0.5).

## TASK 7 — Brend / assets

- Ubaci logo (icon SVG iz loga; koristi `flutter_svg` ako već nije). App ikona/splash u navy
  pozadini sa zlatnim znakom.
- Sve pojave starog imena („EduPlan"/„Skolska platforma") → **BehindClasses**.
- Splash/launch screen: navy pozadina `#0E2443`.

## TASK 8 — Pristupačnost

- Kontrast ≥ 4.5:1 za tekst. Zlatni tekst samo na tamnoj podlozi; za zlatno-na-svetlom koristi
  `accent 700 #855E00`.
- Vidljiv focus/press state na svim kontrolama. Boja nije jedini indikator statusa.

## Definicija „gotovo"

- [ ] `app_colors.dart` + `app_theme.dart` (light+dark) postoje i koriste se globalno
- [ ] Nema hardkodovanih boja u ekranima — sve ide preko theme/`ColorScheme`
- [ ] Dark mode radi + persistuje + ima prebacivač
- [ ] Navigacija navy + zlatni aktivni indikator
- [ ] Kartice/dugmad/inputi prate radius i token pravila
- [ ] Logo + ime „BehindClasses" svuda; splash navy
- [ ] Provereno na svetloj i tamnoj temi (kontrast, nevidljivi tekst)

> Referenca vizuelnog jezika: `DESIGN.md` u web repo-u. Boje su autoritativne ovde.
