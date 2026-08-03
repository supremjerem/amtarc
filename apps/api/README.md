# AMTARC — api (`apps/api`)

NestJS API: news CRUD (public read, JWT-guarded writes), admin JWT auth, Prisma + PostgreSQL.
Pings the web app's revalidation webhook on every news write.

See the [root README](../../README.md) for full setup. Quick reference:

```bash
pnpm --filter api start:dev   # http://localhost:3001
pnpm --filter api test        # unit tests
pnpm --filter api test:e2e    # needs the local Postgres from docker-compose
pnpm --filter api test:cov    # unit tests + coverage floor
```

Configuration comes from `.env` (copy `.env.example`); required variables are validated with Zod
at startup in `src/config/env.validation.ts`.
