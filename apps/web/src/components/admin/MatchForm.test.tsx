import { describe, expect, it } from 'vitest';
import { EMPTY_MATCH_VALUES, toApiInput } from './MatchForm';

describe('toApiInput', () => {
  it('converts form values to the API shape', () => {
    const input = toApiInput({
      ...EMPTY_MATCH_VALUES,
      title: 'Challenge de Chapas',
      location: 'Meauzac',
      startDate: '2026-10-02',
      endDate: '2026-10-04',
      stages: '10',
      feeEuros: '90',
      published: true,
      squads: [{ label: 'Squad 1', day: '2026-10-02', startTime: '08:00', targetSize: '12' }],
    });

    expect(input).toMatchObject({
      title: 'Challenge de Chapas',
      startDate: '2026-10-02T00:00:00.000Z',
      endDate: '2026-10-04T00:00:00.000Z',
      stages: 10,
      feeCents: 9000,
      published: true,
      squads: [
        { label: 'Squad 1', day: '2026-10-02T00:00:00.000Z', startTime: '08:00', targetSize: 12 },
      ],
    });
  });

  it('omits empty optional fields and defaults the fee to zero', () => {
    const input = toApiInput({
      ...EMPTY_MATCH_VALUES,
      title: 'Entraînement club',
      location: 'Meauzac',
      startDate: '2026-11-01',
      endDate: '2026-11-01',
    });

    expect(input.description).toBeUndefined();
    expect(input.stages).toBeUndefined();
    expect(input.registrationDeadline).toBeUndefined();
    expect(input.feeCents).toBe(0);
    expect(input.squads).toEqual([]);
  });

  it('rounds fees expressed with decimals to exact cents', () => {
    const input = toApiInput({
      ...EMPTY_MATCH_VALUES,
      title: 'x',
      location: 'x',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      feeEuros: '89.90',
    });

    expect(input.feeCents).toBe(8990);
  });
});
