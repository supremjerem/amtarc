import { adminFetch } from './auth';

export const DIVISIONS = [
  'OPEN',
  'STANDARD',
  'PRODUCTION',
  'REVOLVER',
  'CLASSIC',
  'PRODUCTION_OPTICS',
  'OPTICS',
  'PCC',
] as const;
export type Division = (typeof DIVISIONS)[number];

export const DIVISION_LABELS: Record<Division, string> = {
  OPEN: 'Open',
  STANDARD: 'Standard',
  PRODUCTION: 'Production',
  REVOLVER: 'Revolver',
  CLASSIC: 'Classic',
  PRODUCTION_OPTICS: 'Production Optics',
  OPTICS: 'Optics',
  PCC: 'PCC',
};

export const CATEGORIES = ['OVERALL', 'JUNIOR', 'LADY', 'SENIOR', 'SUPER_SENIOR'] as const;
export type ShooterCategory = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ShooterCategory, string> = {
  OVERALL: 'Général',
  JUNIOR: 'Junior',
  LADY: 'Dame',
  SENIOR: 'Senior',
  SUPER_SENIOR: 'Super Senior',
};

export type RegistrationStatus = 'AWAITING_PAYMENT' | 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  AWAITING_PAYMENT: 'En attente de virement',
  CONFIRMED: 'Confirmée',
  WAITLISTED: "Liste d'attente",
  CANCELLED: 'Annulée',
};

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  licenceNumber: string;
  club?: string;
  region?: string;
  division: Division;
  category?: ShooterCategory;
  squadRequests?: string[];
};

export type Registration = {
  id: string;
  reference: string;
  squadId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  licenceNumber: string;
  club: string | null;
  region: string | null;
  division: Division;
  category: ShooterCategory;
  status: RegistrationStatus;
  paidAt: string | null;
  createdAt: string;
  squadRequests: { id: string; requestedName: string }[];
};

async function parseOrThrow(response: Response) {
  if (!response.ok) {
    const body = await response.text();
    let message = `Request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(body) as { message?: string | string[] };
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      }
    } catch {
      if (body) message = body;
    }
    throw new Error(message);
  }
  return response.json();
}

export async function registerForMatch(
  matchId: string,
  input: RegistrationInput,
): Promise<Registration> {
  return parseOrThrow(
    await fetch(`/api/matches/${matchId}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    }),
  );
}

export type LookupResult = {
  reference: string;
  status: RegistrationStatus;
  match: { id: string; title: string };
  feeCents: number;
  payment: string | null;
};

export async function lookupRegistration(reference: string, email: string): Promise<LookupResult> {
  const query = new URLSearchParams({ reference, email });
  return parseOrThrow(await fetch(`/api/registrations/lookup?${query}`, { cache: 'no-store' }));
}

export async function listMatchRegistrations(matchId: string): Promise<Registration[]> {
  return parseOrThrow(await adminFetch(`/matches/${matchId}/registrations`));
}

// Reads the file name the API put in content-disposition, falling back to a
// generic name if the header is missing.
function fileNameFrom(response: Response, fallback: string): string {
  const match = /filename="([^"]+)"/.exec(response.headers.get('content-disposition') ?? '');
  return match ? match[1] : fallback;
}

export async function downloadRegistrationsCsv(matchId: string): Promise<void> {
  const response = await adminFetch(`/matches/${matchId}/registrations/export`);
  if (!response.ok) throw new Error(`Export failed with status ${response.status}`);

  const blob = new Blob([await response.text()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileNameFrom(response, 'inscriptions.csv');
  link.click();
  URL.revokeObjectURL(url);
}

export type SquaddingProposal = {
  assignments: { squadId: string; registrationIds: string[] }[];
  unassigned: string[];
};

export async function getSquaddingProposal(matchId: string): Promise<SquaddingProposal> {
  return parseOrThrow(await adminFetch(`/matches/${matchId}/squadding/proposal`));
}

export async function applySquadding(
  matchId: string,
  assignments: { registrationId: string; squadId: string | null }[],
): Promise<Registration[]> {
  return parseOrThrow(
    await adminFetch(`/matches/${matchId}/squadding`, {
      method: 'PUT',
      body: JSON.stringify({ assignments }),
    }),
  );
}

export async function markRegistrationPaid(id: string): Promise<void> {
  await parseOrThrow(await adminFetch(`/registrations/${id}/paid`, { method: 'PATCH' }));
}

export async function cancelRegistration(id: string): Promise<void> {
  await parseOrThrow(await adminFetch(`/registrations/${id}/cancel`, { method: 'PATCH' }));
}
