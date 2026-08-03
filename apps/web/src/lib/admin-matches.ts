import { adminFetch } from './auth';
import type { Match } from './matches';

export type SquadInput = {
  label: string;
  day: string;
  startTime: string;
  targetSize?: number;
};

export type MatchFormInput = {
  title: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  stages?: number;
  rounds?: number;
  feeCents?: number;
  registrationDeadline?: string;
  published?: boolean;
  paymentIban?: string;
  paymentPayee?: string;
  paymentInstructions?: string;
  squads: SquadInput[];
};

async function parseOrThrow(response: Response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function listAdminMatches(): Promise<Match[]> {
  return parseOrThrow(await adminFetch('/matches/admin'));
}

export async function getAdminMatch(id: string): Promise<Match> {
  return parseOrThrow(await adminFetch(`/matches/admin/${id}`));
}

export async function createMatch(input: MatchFormInput): Promise<Match> {
  const { squads, ...match } = input;
  const created = (await parseOrThrow(
    await adminFetch('/matches', { method: 'POST', body: JSON.stringify(match) }),
  )) as Match;
  return replaceSquads(created.id, squads);
}

export async function updateMatch(id: string, input: MatchFormInput): Promise<Match> {
  const { squads, ...match } = input;
  await parseOrThrow(
    await adminFetch(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify(match) }),
  );
  return replaceSquads(id, squads);
}

export async function deleteMatch(id: string): Promise<void> {
  const response = await adminFetch(`/matches/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Delete failed with status ${response.status}`);
}

async function replaceSquads(matchId: string, squads: SquadInput[]): Promise<Match> {
  return parseOrThrow(
    await adminFetch(`/matches/${matchId}/squads`, {
      method: 'PUT',
      body: JSON.stringify({ squads }),
    }),
  );
}
