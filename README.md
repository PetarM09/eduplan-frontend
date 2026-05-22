# Skolska platforma — frontend

React 18 + TypeScript + Vite 6 + Tailwind 4 + shadcn/ui aplikacija koja konzumira
[backend](https://github.com/PetarM09/skolska-platforma-backend) — multi-tenant
Spring Boot REST API.

## Pokretanje

```bash
cp .env.example .env.local   # promeni VITE_API_BASE_URL ako backend ide na drugom hostu
npm install
npm run dev
```

Backend mora biti pokrenut na `http://localhost:8080` (ili na portu iz `.env.local`).

## Skripte

| Komanda            | Sta radi                                       |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Vite dev server na `http://localhost:5173/`    |
| `npm run build`    | Produkcioni build u `dist/`                    |
| `npm run preview`  | Pregled produkcionog build-a                   |
| `npm run typecheck`| Samo TypeScript provera (bez build-a)          |

## Struktura

```
src/
  app/
    App.tsx              role-based routing
    components/
      LoginPage.tsx
      ForgotPasswordPage.tsx
      ProtectedRoute.tsx
      dashboard/         stranice za nastavnika, koordinatora, PP sluzbu...
      ui/                shadcn primitivi (button, card, dialog, input, ...)
  context/
    AuthContext.tsx      login/logout, current user iz localStorage-a
  lib/
    api.ts               fetch wrapper sa JWT, refresh on 401, ApiResponse<T> unwrap
    utils.ts             cn() helper (clsx + tailwind-merge)
  main.tsx               StrictMode + QueryClient + BrowserRouter + AuthProvider
  styles/
    index.css            global entry (tailwind + tema)
    tailwind.css
    theme.css            CSS varijable
```

## Backend integracija

`src/lib/api.ts` razume Spring Boot `ApiResponse<T>` wrapper i automatski raspakuje
`data` polje. Na `401 Unauthorized` pokusava refresh token jednom — ako i to
fail-uje, redirektuje na `/login`.

Sve rute osim `/login` i `/forgot-password` su `ProtectedRoute` — bez tokena ide
na login, sa pogresnom ulogom ide na home redirect (`/`).
