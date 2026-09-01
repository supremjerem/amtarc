import { Division } from '../generated/prisma/client';

// Divisions the public registration form offers. The `Division` enum stays
// complete (historical registrations, admin views, CSV export); this is the
// subset a new entry is allowed to pick. Keep in sync with
// REGISTRABLE_DIVISIONS in apps/web/src/lib/registrations.ts.
export const REGISTRABLE_DIVISIONS: readonly Division[] = [
  Division.OPEN,
  Division.STANDARD,
  Division.PRODUCTION,
  Division.PRODUCTION_OPTICS,
  Division.OPTICS,
  Division.CLASSIC,
  Division.PCC,
];
