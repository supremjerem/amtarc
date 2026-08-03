import { describe, expect, it } from 'vitest';
import { matchCapacity, remainingSpots } from './matches';

const squads = [
  { id: 's1', label: 'Squad 1', day: '', startTime: '08:00', targetSize: 12, position: 0 },
  { id: 's2', label: 'Squad 2', day: '', startTime: '08:00', targetSize: 10, position: 1 },
];

describe('matchCapacity / remainingSpots', () => {
  it('sums squad target sizes', () => {
    expect(matchCapacity({ squads })).toBe(22);
  });

  it('returns null when no squads are defined (no cap)', () => {
    expect(matchCapacity({ squads: [] })).toBeNull();
    expect(remainingSpots({ squads: [], _count: { registrations: 5 } })).toBeNull();
  });

  it('subtracts active registrations', () => {
    expect(remainingSpots({ squads, _count: { registrations: 15 } })).toBe(7);
  });

  it('never goes negative when overbooked', () => {
    expect(remainingSpots({ squads, _count: { registrations: 30 } })).toBe(0);
  });
});
