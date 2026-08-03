# 0001 — Admin auth via httpOnly cookie and Next.js BFF proxy

Date: 2026-08-03
Status: accepted

## Context

The admin back-office originally stored the API JWT in `localStorage` and attached it
client-side as a `Bearer` header, with access gating done in a client `useEffect`. A token
in `localStorage` is readable by any script running on the page, so a single XSS flaw
would leak admin credentials, and client-only gating briefly renders protected shells
before redirecting.

## Decision

Move token handling server-side using a backend-for-frontend (BFF) proxy inside the
Next.js app; the NestJS API stays stateless and unchanged:

- `POST /api/admin/login` proxies to the API's `/auth/login` and stores the returned JWT
  in an `amtarc_admin_token` cookie: httpOnly, `SameSite=Lax`, `Secure` in production,
  session-scoped (no `Max-Age`).
- `/api/admin/[...path]` forwards admin CRUD calls to the API with the cookie's token as
  a `Bearer` header. Forwardable method/path pairs are allowlisted (news endpoints only).
- `POST /api/admin/logout` clears the cookie.
- `src/proxy.ts` (Next.js middleware) redirects `/admin/*` to the login page when the
  cookie is absent, and the login page to the dashboard when it is present. This is
  UX-level gating only — real authorization is the API validating the JWT on every
  proxied request.

## Consequences

- The token is never exposed to browser JavaScript; XSS can no longer exfiltrate it.
- The browser only ever talks to the web app's own origin for admin calls, so the API
  needs no CORS-with-credentials configuration.
- The web server becomes a hop for every admin request (negligible at this scale).
- CSRF exposure is limited: the cookie is `SameSite=Lax` and all mutating admin routes
  are POST/PATCH/DELETE proxied under `/api/admin`, which cross-site forms cannot reach
  with `Lax`. Revisit with explicit CSRF tokens if cookie policy ever loosens.
- Session lifetime equals JWT lifetime: an expired token yields a 401, which the client
  helper turns into a redirect to the login page.
