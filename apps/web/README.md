# AMTARC — web (`apps/web`)

Next.js 16 App Router site: public pages for the club, the `/admin` news back-office, and the
BFF auth proxy (`/api/admin/*`) that keeps the admin JWT in an httpOnly cookie.

See the [root README](../../README.md) for full setup. Quick reference:

```bash
pnpm --filter web dev     # http://localhost:3000
pnpm --filter web test    # Vitest + Testing Library
pnpm --filter web build
```

Configuration comes from `.env.local` (copy `.env.example`): `API_URL` for server-side calls to
the NestJS API, `REVALIDATE_SECRET` shared with the API for the ISR revalidation webhook.
