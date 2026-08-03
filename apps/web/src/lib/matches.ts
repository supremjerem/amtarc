export type Squad = {
  id: string;
  label: string;
  day: string;
  startTime: string;
  targetSize: number;
  position: number;
};

export type Match = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string;
  stages: number | null;
  rounds: number | null;
  feeCents: number;
  registrationDeadline: string | null;
  published: boolean;
  paymentIban: string | null;
  paymentPayee: string | null;
  paymentInstructions: string | null;
  squads: Squad[];
};

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const matchesTag = { next: { revalidate: 300, tags: ['matches'] } };

export async function getPublishedMatches(): Promise<Match[]> {
  try {
    const response = await fetch(`${API_URL}/matches`, matchesTag);
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`);
    return (await response.json()) as Match[];
  } catch {
    return [];
  }
}

export async function getPublishedMatch(id: string): Promise<Match | null> {
  try {
    const response = await fetch(`${API_URL}/matches/${id}`, matchesTag);
    if (!response.ok) return null;
    return (await response.json()) as Match;
  } catch {
    return null;
  }
}

export function formatMatchDates(match: Pick<Match, 'startDate' | 'endDate'>): string {
  const start = new Date(match.startDate);
  const end = new Date(match.endDate);
  const long = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  if (start.toDateString() === end.toDateString()) return long.format(start);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) return `${start.getDate()}–${long.format(end)}`;
  return `${long.format(start)} – ${long.format(end)}`;
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}

export function formatFee(feeCents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    feeCents / 100,
  );
}
