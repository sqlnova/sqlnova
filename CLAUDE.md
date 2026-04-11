# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Start production server
```

No test suite configured — verify changes manually in the browser.

## Architecture

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · sql.js (CDN) · MercadoPago · Cloudflare Pages

### Routing & Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Auth (Supabase magic link / OAuth) |
| `/dashboard` | Main hub — module grid, XP, streak |
| `/leccion/[id]` | Lesson player for modules 0–10 |
| `/retos` | Daily SQL challenges |
| `/pocket` | Pocket Database — upload CSV/XLSX and query |
| `/perfil` | User profile + theme toggle |
| `/leaderboard` | Global XP ranking |
| `/api/checkout` | Creates MercadoPago preference (edge runtime) |
| `/api/webhook` | MercadoPago payment confirmation → sets `es_premium = true` |

`/leccion/[id]/page.tsx` is a thin server component that passes `moduloId: number` to `LeccionClient.tsx`, where all lesson logic lives.

### Curriculum Data (`lib/curriculum*.ts`)

Lessons are static TypeScript objects, split across files by module pairs:
- `curriculum.ts` — modules 0–4 + shared types (`Leccion`, `GlosarioItem`, `MODULOS` array)
- `curriculum-m5m6.ts` — modules 5–6
- `curriculum-m7m8.ts` — modules 7–8
- `curriculum-m9m10.ts` — modules 9–10

Lesson IDs use the format `"MM-NN"` (e.g. `"03-07"`). The lesson `tipo` field determines the exercise UI: `escribir` (free-form textarea), `completar` (fill-in-the-blank template), `debugging` (pre-filled broken query).

### Supabase Schema (key tables)

- `perfiles` — `id`, `nombre`, `email`, `alias`, `xp_total`, `nivel`, `racha_actual`, `es_premium`, `tema`, `mostrar_en_leaderboard`
- `progreso` — `usuario_id`, `leccion_id`, `modulo_id`, `completada`, `xp_ganado`, `pista_usada` — unique on `(usuario_id, leccion_id)`
- `retos` — daily challenges with `fecha`, `nivel`, `dataset_sql`
- `retos_completados` — tracks which users finished each daily reto
- `actualizar_racha` — Supabase RPC function called on lesson completion to update streak + XP

`lib/supabase.ts` exports `sb` (the client instance) and the `Perfil` / `Progreso` types. The API webhook route uses a separate admin client with `SUPABASE_SERVICE_ROLE_KEY`.

### In-Browser SQL Engine

sql.js is loaded at runtime from the Cloudflare CDN (not bundled) in both `LeccionClient.tsx` and `retos/page.tsx`. To avoid loading it twice, the instance is cached on `window._sqljsInstance`. The lesson engine pre-loads `DATASET_SQL` (from `lib/curriculum.ts`) on mount; Pocket Database starts with an empty DB and populates it from uploaded files.

### Theme System

Theme is stored as `perfiles.tema` (`"oscuro"` | `"claro"`) in Supabase and synced to `document.documentElement` via `data-theme` attribute. CSS variables for both themes live in `app/globals.css` under `:root` (dark, default) and `[data-theme="claro"]`.

**SQL keyboard buttons** use hardcoded pastel hex colors (`#93c5fd`, `#a78bfa`, etc.) designed for dark mode. The `sql-keyboard` CSS class + `filter: brightness(0.45) saturate(1.8)` in globals.css handles light mode readability — always apply this class to any SQL keyboard container div.

### Payment Flow

1. Frontend calls `POST /api/checkout` with `userId`
2. API creates a MercadoPago preference (ARS, price in `lib/constants.ts`)
3. User is redirected to MercadoPago
4. MercadoPago POSTs to `/api/webhook` on approval → sets `es_premium = true` in Supabase

Both API routes use `export const runtime = 'edge'` (required for Cloudflare deployment). Do not remove this.

### Environment Variables

```
MP_ACCESS_TOKEN            # MercadoPago secret key
NEXT_PUBLIC_SUPABASE_URL   # Used in webhook route
SUPABASE_SERVICE_ROLE_KEY  # Used in webhook route (admin client)
```

The public Supabase URL and anon key in `lib/supabase.ts` are hardcoded (publishable keys).
