import {
  buildRegistrationsCsv,
  exportFileName,
  type ExportableRegistration,
} from './registrations.csv';

function registration(overrides: Partial<ExportableRegistration> = {}): ExportableRegistration {
  return {
    reference: 'AMT-ABC234',
    firstName: 'Jérémie',
    lastName: 'Cavellec',
    email: 'jc@example.com',
    licenceNumber: '123456',
    club: 'AMTARC',
    region: 'Occitanie',
    division: 'PRODUCTION_OPTICS',
    category: 'OVERALL',
    status: 'CONFIRMED',
    paidAt: new Date('2026-09-15T10:00:00Z'),
    squadId: 'sq1',
    ...overrides,
  };
}

const squads = [{ id: 'sq1', label: 'Squad 1' }];

describe('buildRegistrationsCsv', () => {
  it('starts with a BOM and a semicolon-separated header', () => {
    const csv = buildRegistrationsCsv([], squads);

    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Squad;Nom;Prénom;Licence;Division;Catégorie');
  });

  it('writes one CRLF row per registration with readable labels', () => {
    const csv = buildRegistrationsCsv([registration()], squads);
    const [, row] = csv.split('\r\n');

    expect(row).toBe(
      'Squad 1;Cavellec;Jérémie;123456;Production Optics;Général;AMTARC;Occitanie;jc@example.com;Confirmée;AMT-ABC234;15/09/2026',
    );
  });

  it('leaves the squad and paid-on cells empty when unset', () => {
    const csv = buildRegistrationsCsv([registration({ squadId: null, paidAt: null })], squads);
    const [, row] = csv.split('\r\n');

    expect(row.startsWith(';Cavellec')).toBe(true);
    expect(row.endsWith('AMT-ABC234;')).toBe(true);
  });

  it('quotes cells containing the delimiter, quotes, or newlines', () => {
    const csv = buildRegistrationsCsv(
      [registration({ club: 'Club "Le Trèfle"; Section IPSC' })],
      squads,
    );

    expect(csv).toContain('"Club ""Le Trèfle""; Section IPSC"');
  });

  it.each([
    ['=', '=SUM(A1:A9)'],
    ['+', '+1+1'],
    ['-', '-1+1'],
    ['@', '@SUM(A1)'],
    ['tab', '\t=HYPERLINK(https://evil.test)'],
    ['carriage return', '\r=cmd|calc'],
  ])('neutralizes a leading %s that a spreadsheet would read as a formula', (_label, payload) => {
    const csv = buildRegistrationsCsv([registration({ lastName: payload })], squads);

    expect(csv).toContain(`'${payload}`);
  });

  it('falls back to the raw enum value for unknown divisions', () => {
    const csv = buildRegistrationsCsv([registration({ division: 'FUTURE_DIVISION' })], squads);

    expect(csv).toContain('FUTURE_DIVISION');
  });
});

describe('exportFileName', () => {
  it('slugifies the match title and stamps the date', () => {
    expect(exportFileName('Challenge Montagne Noire 2026', new Date('2026-08-04T12:00:00Z'))).toBe(
      'inscriptions-challenge-montagne-noire-2026-2026-08-04.csv',
    );
  });

  it('strips accents and punctuation', () => {
    expect(exportFileName('Coupe d’Été — Chapas', new Date('2026-08-04T12:00:00Z'))).toBe(
      'inscriptions-coupe-d-ete-chapas-2026-08-04.csv',
    );
  });

  it('falls back when the title has no usable characters', () => {
    expect(exportFileName('«»', new Date('2026-08-04T12:00:00Z'))).toBe(
      'inscriptions-match-2026-08-04.csv',
    );
  });
});
