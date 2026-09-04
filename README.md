# AMTARC — website monorepo

![AMTARC homepage screenshot](docs/screenshot.jpg)

Website for **AMTARC** (Association Meauzacaise de Tireurs aux Armes Rayées et de Chasse), a sports-shooting club in Meauzac (Tarn-et-Garonne, France).

Rebuilt from a Claude Design HTML prototype into a real, maintainable stack.

## Stack

- **`apps/web`** — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Motion (Framer Motion).
- **`apps/api`** — NestJS, TypeScript, Prisma + PostgreSQL, JWT auth.
- pnpm workspaces monorepo (no Turborepo/Nx — not needed at this scale).

The public site is statically generated with a 5-minute ISR safety net; the API pings a `/api/revalidate` webhook on every news write for near-instant updates without full rebuilds.

## Design system

Three type roles, defined as classes in `apps/web/src/app/globals.css` — use these rather than raw
font utilities, so every page stays on the same system:

| Role    | Face                               | Class                           | Used for                                                                         |
| ------- | ---------------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| Display | Archivo (variable `wght` + `wdth`) | `.display`, `.display-wordmark` | Headings, card titles, the AMTARC wordmark                                       |
| Body    | Instrument Sans                    | inherited from `<body>`         | Paragraphs, form labels, links                                                   |
| Data    | Martian Mono                       | `.data-label`, `.data-figure`   | Section kickers, and measured values: dates, start times, capacities, fees, IBAN |

**The signature** is the display face's width axis. `<Heading>` (`components/ui/Heading.tsx`) renders
text at `wdth` 85 and settles it to 100 when it scrolls into view. The final state is the widest one,
so line count is fixed by the end state and the animation can never reflow the page. Card titles use
the plain `.display` class without the entrance — the width animation is reserved for section
headings so it keeps its impact.

Motion is layered deliberately: the width axis on section headings, a short 14px fade-up (`<Reveal>`)
for blocks, and `<Stagger>`/`<StaggerItem>` for grids and lists. `MotionProvider` applies
`reducedMotion="user"` globally, which drops movement but keeps cross-fades when the OS asks for
reduced motion; handle the preference there rather than branching on `useReducedMotion()` inside a
component, which would change the tree between server and client and break hydration.

Admin authentication uses an httpOnly cookie held by a Next.js BFF proxy (`/api/admin/*`) that forwards requests to the API server-side — the JWT is never exposed to browser JavaScript. See [ADR 0001](docs/adr/0001-admin-auth-httponly-cookie-bff.md).

## Requirements

- Node.js 20+
- pnpm (`npm install -g pnpm`, or `corepack enable` on Node versions that still ship it)
- A local PostgreSQL instance (via `docker compose up -d`, or Homebrew/any local install — see note below)

## Getting started

```bash
pnpm install

# start Postgres (requires Docker Hub access)
docker compose up -d

# apps/api: create the schema and seed sample data
cp apps/api/.env.example apps/api/.env   # adjust DATABASE_URL etc. if needed
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma db seed

# apps/web: point at the local API
cp apps/web/.env.example apps/web/.env.local

# run both apps together
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

- Admin back-office (manage news without touching code): http://localhost:3000/admin/login — log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `apps/api/.env`. Each `prisma db seed` run re-applies that password, so changing the variable and re-seeding is how you rotate it.

The seed creates the admin account, a few news items, and one published demo match with squads and a
partly-squadded roster, so `/matchs` and the admin squadding board have something to show on a fresh
install. Its dates are relative to the seed run, so the demo match is always upcoming and still open
for registration. Every seed write is an upsert on a fixed id — re-running it never duplicates
anything, and never overwrites rows you have edited (the admin password hash aside, which is
re-applied so it can be rotated). The demo match is skipped when `NODE_ENV=production`, since its
payment details are fictional; set `SEED_DEMO_MATCH=true` if a production-like environment needs it.

> **Note on local Postgres:** `docker compose up -d` is the intended way to run Postgres locally, but requires Docker Hub to be reachable. If Docker Hub isn't accessible from your machine/network, install PostgreSQL directly instead (e.g. `brew install postgresql@16 && brew services start postgresql@16`) and create a matching role/database (`amtarc`/`amtarc`) so `DATABASE_URL` in `apps/api/.env` resolves without changes.

## Scripts (repo root)

- `pnpm dev` — run `apps/web` and `apps/api` concurrently.
- `pnpm build` — production build both apps.
- `pnpm lint` — lint both apps.
- `pnpm typecheck` — type-check both apps without emitting.
- `pnpm test` — run every workspace test suite.
- `pnpm format` / `pnpm format:check` — Prettier over the whole repo.
- `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:studio` — Prisma commands scoped to `apps/api`.

## Project structure

```
apps/
  web/    Next.js site (public pages, /matchs, /admin back-office, BFF auth proxy)
  api/    NestJS API (news, site content, uploads, matches, registrations, JWT auth)
docs/
  adr/    architecture decision records
.github/  CI (lint, tests, build), CodeQL, Dependabot, GHCR image publish
docker-compose.yml        local Postgres for development
docker-compose.prod.yml   production stack (deployed to the VPS, not used locally)
```

## Development workflow

- `main` is protected and always deployable; day-to-day work happens on `develop` (or feature branches based on it) and reaches `main` through reviewed pull requests with green CI.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `test:`, `docs:`, …).

## Deployment

Every merge to `main` that passes CI triggers `.github/workflows/docker-publish.yml`, which builds
`apps/web` and `apps/api` into Docker images and pushes them to GHCR:

- `ghcr.io/supremjerem/amtarc-web`
- `ghcr.io/supremjerem/amtarc-api`

tagged `latest` and with the commit SHA. This is build-and-push only — nothing connects to the
server automatically. On the VPS (`~/apps/live/amtarc/`, see `docker-compose.prod.yml`):

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

The site is live at **https://amtarc.supremjerem.com**, served over HTTPS by the VPS's existing
Traefik (Let's Encrypt). `docker-compose.prod.yml` is heavily commented with the network layout it
expects (a project-private bridge network for app↔DB, only the web container joined to Traefik's
shared `web` network); `.env.prod.example` lists every variable it reads — copy it to `.env` on the
server (that exact name, so `docker compose` picks it up) and fill in real secrets, never committing
the filled-in version.

## Roadmap

Done:

- [x] Public site (Next.js, ISR + revalidation webhook)
- [x] News module: public listing + admin CRUD (NestJS, Prisma)
- [x] Admin auth hardening: httpOnly cookie via BFF proxy, middleware gating ([ADR 0001](docs/adr/0001-admin-auth-httponly-cookie-bff.md))
- [x] Test foundation: API unit + e2e (Jest), web (Vitest + Testing Library), coverage floor
- [x] CI (GitHub Actions), CodeQL, Dependabot; protected `main` + `develop` workflow
- [x] Admin panel v2: edit site content sections (hero, announcements, practical info, contact) and upload news images
- [x] Match booking system: match/squad catalog, online registration with "shoot with" wishes,
      wait-list with auto-promotion, bank-transfer tracking, transactional emails, auto-squadding
      proposal with an admin board, public squad rosters, and a CSV export for federation entry —
      see [docs/match-booking-plan.md](docs/match-booking-plan.md)
- [x] Deployment safety rails: the API refuses to boot on placeholder or short secrets, the seed
      rotates the admin password hash instead of only creating it, and the demo match stays out of
      production
- [x] Docker images for `web`/`api` published to GHCR on every merge to `main`
      ([workflow](.github/workflows/docker-publish.yml)); pulling and restarting on the VPS is a
      deliberate manual step
- [x] First deploy to the VPS: live at **https://amtarc.supremjerem.com** over HTTPS (Let's Encrypt
      via the existing Traefik), the API/DB on a project-private Docker network, images pulled from
      GHCR. Fixes found on the way: pin the Traefik router to the `web` network, and ship `tsx` +
      the generated Prisma client in the API image so `prisma db seed` runs in-container
- [x] Club logo artwork refreshed: a proper vector-style panther across the site, and the full
      AMTARC lockup (panther + wordmark + pistol / occitan cross / IPSC shield) in the TSV section

Planned:

- [ ] Switch transactional email to a real provider in production — Resend is wired up
      (`MAIL_DRIVER=resend` + API key); needs the account and a verified sending domain. The log
      driver covers development
- [ ] Shared `packages/` workspace for API/web DTO types
- [ ] Raise the API coverage threshold as controller/guard tests land
- [ ] ESLint 10 — blocked upstream: `eslint-plugin-react` (pulled in by `eslint-config-next`) still
      calls APIs removed in ESLint 10, and ESLint 10's `no-useless-assignment` false-positives on
      NestJS decorator metadata. Revisit when `eslint-config-next` supports ESLint 10.
- [ ] TypeScript 7 — blocked upstream: TS 7.0 ships only the `tsc` binary, with no programmatic
      compiler API, so the Nest CLI cannot build. Microsoft expects the API back in 7.1; the repo
      runs TypeScript 6 in the meantime.

## License

© AMTARC. All rights reserved. The source is public for transparency; it is not licensed for reuse.
