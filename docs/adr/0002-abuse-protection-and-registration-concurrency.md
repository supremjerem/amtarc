# 0002 — Abuse protection and registration concurrency

Date: 2026-08-04
Status: accepted

## Context

The booking system exposes endpoints anyone on the internet can call: match
registration (which holds a spot and sends an email), registration lookup (which
takes a reference and an email), and admin login. Left unprotected these allow
spot squatting, email flooding, reference enumeration and password guessing.

Separately, registration decides between "confirmed spot" and "wait-list" by
counting active registrations and comparing against total squad capacity. Under
Prisma's default read-committed isolation, two simultaneous registrations can both
read the same count and both take the last spot.

## Decision

**Rate limiting** with `@nestjs/throttler`, applied globally as an `APP_GUARD`:

- baseline 120 requests/minute per IP for every route;
- login 10 per 5 minutes (the only credential-guessing surface);
- registration 5 per 10 minutes (holds a spot, sends mail);
- lookup 10 per minute (makes reference enumeration impractical).

Behind a reverse proxy the client IP only arrives in `X-Forwarded-For`, so the app
reads `TRUST_PROXY` (hop count, default 0) and configures Express accordingly.
Without it every request would appear to come from the proxy and share one bucket.

The web app's login route forwards a 429 as a 429 with its `Retry-After` header
instead of collapsing it into 401 — an admin locked out by rate limiting must not
be told their password is wrong.

**Registration concurrency**: the count-then-create transaction runs at
`Serializable` isolation. Postgres aborts the losing transaction of a true race,
which surfaces as a failed request the shooter can retry, rather than silently
overfilling a match.

**Input validation**: the global `ValidationPipe` adds `forbidNonWhitelisted`, so
unknown fields are a 400 instead of being silently dropped.

## Consequences

- Throttler state is in-memory: counters reset on restart and are per-instance.
  Fine for the single instance this runs on; a horizontally scaled deployment
  would need the Redis storage adapter.
- Serializable isolation costs a retry under genuine contention. At club-match
  volume (tens of registrations) conflicts are rare, and correctness of the
  wait-list boundary matters more than the occasional retry.
- `forbidNonWhitelisted` turns client/server field drift into a visible 400
  during development instead of data quietly going missing.
- Rate limits are deliberately generous enough for a shooter retrying after a
  validation error, but low enough that scripted abuse is impractical.
