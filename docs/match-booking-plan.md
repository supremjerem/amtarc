# Match booking & payment system — design plan

Status: planned (roadmap item). Drafted 2026-08-03 from an analysis of the current
federation flow at ipsc.fftir.org (Challenge Montagne Noire 2026 used as reference).

## Problem

Today IPSC match registration for club shooters goes through the federation site:

- Payment is a manual bank transfer with a 15-day prepayment window; confirmation lags.
- Registration lands on a wait-list; organizers assign shooters to squads themselves.
- Changing squads means emailing the organizer.
- No self-service view of remaining capacity per squad.

The goal is to run this flow on the AMTARC site for matches the club organizes:
pick a squad with live capacity, pay online, get instant confirmation.

## Data model (Prisma)

```
Match         title, description, startDate, endDate, location, stages, rounds,
              feeCents, registrationDeadline, published
Squad         matchId, label, day, startTime, capacity
Registration  matchId, squadId?, firstName, lastName, email, licenceNumber,
              division (enum: OPEN|STANDARD|PRODUCTION|REVOLVER|CLASSIC|
              PRODUCTION_OPTICS|OPTICS|PCC),
              category (enum: OVERALL|JUNIOR|LADY|SENIOR|SUPER_SENIOR),
              club, region,
              status (enum: PENDING_PAYMENT|CONFIRMED|WAITLISTED|CANCELLED),
              stripeCheckoutSessionId, paidAt, createdAt
```

Capacity rule: a squad is full when its CONFIRMED + PENDING_PAYMENT registrations
reach `capacity`; PENDING_PAYMENT expires (and frees the spot) when the Stripe
Checkout session expires (~30 min).

## API (new NestJS modules)

- **matches**: public `GET /matches`, `GET /matches/:id` (squads + remaining spots);
  admin CRUD behind the JWT guard, following the existing news/content module layering.
- **registrations**: `POST /matches/:id/registrations` — validates deadline/capacity in a
  transaction, creates the registration as PENDING_PAYMENT (or WAITLISTED when full),
  returns a Stripe Checkout URL. Admin list/export per match. Cancellation triggers
  wait-list promotion (oldest WAITLISTED gets a payment link by email).
- **payments**: thin wrapper around the Stripe SDK. `POST /stripe/webhook` (signature
  verified, raw body) handles `checkout.session.completed` → CONFIRMED + confirmation
  email, and session expiry → back to capacity pool.

## Web

- Public: `/matchs` list + detail page with a live squad picker (remaining spots per
  squad), registration form, redirect to Stripe Checkout, confirmation page.
- Admin: match CRUD (reusing the section-form patterns), squad management, registration
  list with statuses and CSV export.

## Transactional email

Booking confirmations, wait-list promotions, and pre-match reminders via a provider
with an EU presence (Brevo or Resend); covered by the existing roadmap item.

## Rollout phases

1. Data model + admin match/squad CRUD + public match listing (no payment yet).
2. Registration + Stripe Checkout + webhook + confirmation emails.
3. Wait-list automation and self-service squad changes.
4. Exports (stats/WinMSS) and results publication.

## Open questions (to settle before phase 2)

- Stripe account: created under the association? (SIRET/IBAN of the club needed.)
- Refund policy when a shooter cancels (full/partial/none, and until when).
- Whether federation reporting still requires a parallel entry on ipsc.fftir.org for
  sanctioned (Level 2+) matches — if so, scope an export matching their format.
