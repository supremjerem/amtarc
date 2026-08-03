# Match booking system — design plan

Status: planned (roadmap item). Drafted 2026-08-03 from an analysis of the current
federation flow at ipsc.fftir.org (Challenge Montagne Noire 2026 used as reference),
revised the same day after review with the club.

## Problem

Today IPSC match registration for club shooters goes through the federation site:

- Registration lands on a wait-list; organizers assign shooters to squads themselves.
- Shooters who want to squad together have to email the organizer and hope.
- No self-service view of remaining capacity per squad.
- Payment is a bank transfer with a prepayment window and slow confirmation.

The goal is to run this flow on the AMTARC site for matches the club organizes:
register online, say who you want to shoot with, get squadded automatically, and see
your payment status. **Payment stays by bank transfer** — each match's fees go to the
bank account of the club hosting the competition, so a central Stripe account does not
fit; Stripe remains a possible later addition, not part of the initial scope.

## Decisions (settled)

- **Payment**: bank transfer per match, to the host club's account (IBAN and payee are
  per-match data). Organizers confirm receipt manually; no online payment initially.
- **Refund policy**: none, as today.
- **Federation**: Level 2/3 matches still require an entry on the federation side —
  plan an export of registrations matching their format from day one.
- **Squadding**: shooters can express who they want to squad with; an algorithm groups
  as many requested people together as possible. Squads target ~12 shooters (soft
  limit — organizers can go over or under).

## Data model (Prisma)

```
Match         title, description, startDate, endDate, location, stages, rounds,
              feeCents, registrationDeadline, published,
              paymentIban, paymentPayee, paymentInstructions
Squad         matchId, label, day, startTime, targetSize (default 12)
Registration  matchId, squadId?, firstName, lastName, email, licenceNumber,
              division (enum: OPEN|STANDARD|PRODUCTION|REVOLVER|CLASSIC|
              PRODUCTION_OPTICS|OPTICS|PCC),
              category (enum: OVERALL|JUNIOR|LADY|SENIOR|SUPER_SENIOR),
              club, region,
              status (enum: AWAITING_PAYMENT|CONFIRMED|WAITLISTED|CANCELLED),
              paidAt, createdAt
SquadRequest  registrationId, requestedName  (free-text "I want to shoot with...")
```

A spot is held from registration; organizers mark the transfer received
(AWAITING_PAYMENT → CONFIRMED). Spots unpaid past the match's payment window can be
released to the wait-list by the organizer.

## Squadding algorithm

Inputs: registrations, their squad requests, squads with `targetSize` (~12).

1. Normalize requests into a graph: an edge between two registrations when either
   requested the other (mutual requests weigh double).
2. Build groups from connected components; split any component larger than the target
   size at its weakest links.
3. Pack groups into squads (largest first, best-fit), respecting each shooter's day
   availability if declared.
4. Output is a _proposal_: organizers review, drag shooters between squads, then
   publish. Manual placement always wins over the algorithm.

Same-division balance across squads is a nice-to-have tiebreaker, not a constraint.

## API (new NestJS modules)

- **matches**: public `GET /matches`, `GET /matches/:id` (squads + remaining spots);
  admin CRUD behind the JWT guard, following the existing news/content module layering.
- **registrations**: `POST /matches/:id/registrations` — validates deadline/capacity in
  a transaction, records squad requests, returns the match's bank-transfer
  instructions; WAITLISTED when full. Admin: list per match, mark paid, cancel
  (triggers wait-list promotion + email), run/apply the squadding proposal.
- **exports**: per-match CSV of registrations formatted for the federation entry
  (Level 2/3 requirement).

## Web

- Public: `/matchs` list + detail page showing squads, remaining spots and payment
  instructions; registration form with a "je veux tirer avec…" field (repeatable);
  a confirmation page recapping the transfer details; shooter can look up their
  registration status by email + reference.
- Admin: match CRUD (reusing the section-form patterns), registration list with
  payment toggles, squadding board (proposal + manual drag), CSV export.

## Transactional email

Registration received (with bank details), payment confirmed, wait-list promotion,
squad assignment published. Provider with an EU presence (Brevo or Resend).

## Rollout phases

1. ✅ Data model + admin match/squad CRUD + public match listing (`/matchs`). Shipped
   2026-08: `Match`/`Squad` models, `matches` API module (public list/detail hiding
   drafts, guarded CRUD, transactional squad replacement), admin match forms with a
   squad editor, ISR pages revalidated via the `matches` tag.
2. ✅ Registration with squad requests, bank-transfer instructions, admin payment
   confirmation, emails. Shipped 2026-08: `Registration`/`SquadRequest` models with
   per-match unique email and `AMT-XXXXXX` transfer references, capacity/wait-list
   logic with automatic promotion on cancellation, public registration form and
   status lookup, admin registrations board (mark paid / cancel), and a MailService
   (log driver by default, Resend via `MAIL_DRIVER=resend` + `RESEND_API_KEY`).
3. ✅ Squadding algorithm + squadding board. Shipped 2026-08: pure proposal
   algorithm (accent/case/word-order-insensitive name matching, union-find
   grouping of transitive requests, oversized-group splitting, best-fit packing
   into target sizes), JWT-guarded proposal/apply endpoints, an admin board with
   per-squad columns and manual overrides, and FFTir-style public squad rosters
   (names and divisions only). Wait-list automation shipped with phase 2.
4. ✅ Federation export (Level 2/3). Shipped 2026-08: guarded CSV export of a
   match's active registrations (cancelled entries are never reported), ordered
   by squad, downloadable from the admin registrations page.

   **The exact FFTir import format is still unknown** — no template was
   available when this was built. The export therefore mirrors the columns
   their public squad lists display (squad, name, licence, division, category,
   club, region) plus the fields organizers need for reconciliation (email,
   status, transfer reference, paid-on date), as a CSV that opens cleanly in
   French Excel: UTF-8 BOM, semicolon delimiter, CRLF rows, quoted cells, and
   leading `=`/`+`/`-`/`@` neutralized against formula injection. When the real
   format surfaces, only `COLUMNS` and the row mapping in
   `apps/api/src/registrations/registrations.csv.ts` should need changing.

Optional later: online payment if a workable per-club setup appears (e.g.
Stripe Connect routing to host clubs).
