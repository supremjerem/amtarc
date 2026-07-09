# AMTARC — website monorepo

Website for **AMTARC** (Association Meauzacaise de Tireurs aux Armes Rayées et de Chasse), a sports-shooting club in Meauzac (Tarn-et-Garonne, France).

Rebuilt from a Claude Design HTML prototype into a real, maintainable stack.

## Stack

- **`apps/web`** — Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Motion (Framer Motion).
- **`apps/api`** — NestJS, TypeScript, Prisma + PostgreSQL, JWT auth.
- pnpm workspaces monorepo (no Turborepo/Nx — not needed at this scale).

The public site is statically generated with a 5-minute ISR safety net; the API pings a `/api/revalidate` webhook on every news write for near-instant updates without full rebuilds.

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
- Admin back-office (manage news without touching code): http://localhost:3000/admin/login — log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `apps/api/.env` (seeded on first `prisma db seed` run).

> **Note on local Postgres:** `docker compose up -d` is the intended way to run Postgres locally, but requires Docker Hub to be reachable. If Docker Hub isn't accessible from your machine/network, install PostgreSQL directly instead (e.g. `brew install postgresql@16 && brew services start postgresql@16`) and create a matching role/database (`amtarc`/`amtarc`) so `DATABASE_URL` in `apps/api/.env` resolves without changes.

## Scripts (repo root)

- `pnpm dev` — run `apps/web` and `apps/api` concurrently.
- `pnpm build` — production build both apps.
- `pnpm lint` — lint both apps.
- `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:studio` — Prisma commands scoped to `apps/api`.

## Project structure

```
apps/
  web/    Next.js site (public pages + /admin back-office)
  api/    NestJS API (news CRUD + JWT auth)
docker-compose.yml   local Postgres for development
```

## Roadmap

The `news` module (public listing + admin CRUD) is the first backend module. Future modules — match booking, Stripe payments, transactional emails — are expected to be added as additional NestJS modules alongside it, without restructuring the existing code.
