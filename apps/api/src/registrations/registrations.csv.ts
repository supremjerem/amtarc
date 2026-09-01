// Federation entry export. The exact FFTir import format is not documented
// yet, so this produces the columns their squad lists display, in a CSV that
// opens cleanly in French Excel (UTF-8 BOM + semicolon). When the real format
// is known, only COLUMNS and toRow below should need changing.

export type ExportableRegistration = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  licenceNumber: string;
  club: string | null;
  region: string | null;
  division: string;
  category: string;
  status: string;
  paidAt: Date | null;
  squadId: string | null;
};

export type ExportableSquad = {
  id: string;
  label: string;
};

const COLUMNS = [
  'Squad',
  'Nom',
  'Prénom',
  'Licence',
  'Division',
  'Catégorie',
  'Club',
  'Région',
  'Email',
  'Statut',
  'Référence',
  'Payé le',
] as const;

const DIVISION_LABELS: Record<string, string> = {
  OPEN: 'Open',
  STANDARD: 'Standard',
  PRODUCTION: 'Production',
  REVOLVER: 'Revolver',
  CLASSIC: 'Classic',
  PRODUCTION_OPTICS: 'Production Optics',
  OPTICS: 'Optics',
  PCC: 'PCC',
};

const CATEGORY_LABELS: Record<string, string> = {
  OVERALL: 'Overall',
  JUNIOR: 'Junior',
  LADY: 'Lady',
  SENIOR: 'Senior',
  SUPER_SENIOR: 'Super Senior',
};

const STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: 'En attente de virement',
  CONFIRMED: 'Confirmée',
  WAITLISTED: "Liste d'attente",
  CANCELLED: 'Annulée',
};

function escapeCell(value: string): string {
  // Registration fields come from an unauthenticated form and end up in an
  // organizer's spreadsheet, so neutralize every prefix a spreadsheet reads as
  // a formula — =, +, -, @ and the tab/carriage-return variants that slip past
  // a naive check — then quote anything that could break the row.
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\n\r\t]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

function formatDate(date: Date | null): string {
  return date ? new Intl.DateTimeFormat('fr-FR').format(date) : '';
}

export function buildRegistrationsCsv(
  registrations: ExportableRegistration[],
  squads: ExportableSquad[],
): string {
  const squadLabels = new Map(squads.map((squad) => [squad.id, squad.label]));

  const rows = registrations.map((registration) => [
    registration.squadId ? (squadLabels.get(registration.squadId) ?? '') : '',
    registration.lastName,
    registration.firstName,
    registration.licenceNumber,
    DIVISION_LABELS[registration.division] ?? registration.division,
    CATEGORY_LABELS[registration.category] ?? registration.category,
    registration.club ?? '',
    registration.region ?? '',
    registration.email,
    STATUS_LABELS[registration.status] ?? registration.status,
    registration.reference,
    formatDate(registration.paidAt),
  ]);

  const lines = [COLUMNS, ...rows].map((cells) => cells.map(escapeCell).join(';'));
  // BOM so Excel detects UTF-8; CRLF is what spreadsheet tools expect.
  return `\ufeff${lines.join('\r\n')}\r\n`;
}

export function exportFileName(matchTitle: string, date = new Date()): string {
  const slug =
    matchTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .join('-') || 'match';
  return `inscriptions-${slug}-${date.toISOString().slice(0, 10)}.csv`;
}
