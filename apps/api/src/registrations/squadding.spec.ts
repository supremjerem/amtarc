import { buildSquaddingProposal, type SquaddingShooter } from './squadding';

let clock = 0;
function shooter(
  id: string,
  firstName: string,
  lastName: string,
  requestedNames: string[] = [],
): SquaddingShooter {
  clock += 1000;
  return { id, firstName, lastName, createdAt: new Date(clock), requestedNames };
}

const twoSquads = [
  { id: 'sq1', targetSize: 3 },
  { id: 'sq2', targetSize: 3 },
];

describe('buildSquaddingProposal', () => {
  beforeEach(() => {
    clock = 0;
  });

  it('keeps mutual requests in the same squad', () => {
    const proposal = buildSquaddingProposal(
      [
        shooter('a', 'Alice', 'Martin', ['Bob Durand']),
        shooter('b', 'Bob', 'Durand', ['Alice Martin']),
        shooter('c', 'Chloé', 'Petit'),
      ],
      twoSquads,
    );

    const squadOfA = proposal.assignments.find((entry) => entry.registrationIds.includes('a'));
    expect(squadOfA?.registrationIds).toContain('b');
    expect(proposal.unassigned).toEqual([]);
  });

  it('matches names despite accents, case, and reversed order', () => {
    const proposal = buildSquaddingProposal(
      [
        shooter('a', 'Jérémie', 'Cavellec', ['cavellec jeremie']),
        shooter('b', 'Léa', 'Dubois', ['JEREMIE CAVELLEC']),
      ],
      twoSquads,
    );

    const squadOfB = proposal.assignments.find((entry) => entry.registrationIds.includes('b'));
    expect(squadOfB?.registrationIds).toContain('a');
  });

  it('groups transitively (a wants b, c wants b)', () => {
    const proposal = buildSquaddingProposal(
      [
        shooter('a', 'Alice', 'Martin', ['Bob Durand']),
        shooter('b', 'Bob', 'Durand'),
        shooter('c', 'Chloé', 'Petit', ['Bob Durand']),
      ],
      twoSquads,
    );

    const squadOfB = proposal.assignments.find((entry) => entry.registrationIds.includes('b'));
    expect(squadOfB?.registrationIds).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('ignores requests that match nobody', () => {
    const proposal = buildSquaddingProposal(
      [shooter('a', 'Alice', 'Martin', ['Personne Inconnue']), shooter('b', 'Bob', 'Durand')],
      twoSquads,
    );

    const total = proposal.assignments.flatMap((entry) => entry.registrationIds);
    expect(total).toHaveLength(2);
  });

  it('splits groups larger than the biggest squad', () => {
    const proposal = buildSquaddingProposal(
      [
        shooter('a', 'A', 'One', ['B Two']),
        shooter('b', 'B', 'Two', ['C Three']),
        shooter('c', 'C', 'Three', ['D Four']),
        shooter('d', 'D', 'Four', ['E Five']),
        shooter('e', 'E', 'Five', ['A One']),
      ],
      twoSquads,
    );

    for (const entry of proposal.assignments) {
      expect(entry.registrationIds.length).toBeLessThanOrEqual(3);
    }
    const total = proposal.assignments.flatMap((entry) => entry.registrationIds);
    expect(total).toHaveLength(5);
    expect(proposal.unassigned).toEqual([]);
  });

  it('leaves overflow unassigned when every squad is full', () => {
    const proposal = buildSquaddingProposal(
      [shooter('a', 'A', 'One'), shooter('b', 'B', 'Two'), shooter('c', 'C', 'Three')],
      [{ id: 'sq1', targetSize: 2 }],
    );

    const assigned = proposal.assignments.flatMap((entry) => entry.registrationIds);
    expect(assigned).toHaveLength(2);
    expect(proposal.unassigned).toHaveLength(1);
  });

  it('is deterministic for identical input', () => {
    const build = () => {
      clock = 0;
      return buildSquaddingProposal(
        [
          shooter('a', 'Alice', 'Martin', ['Bob Durand']),
          shooter('b', 'Bob', 'Durand'),
          shooter('c', 'Chloé', 'Petit'),
          shooter('d', 'Dan', 'Roux'),
        ],
        twoSquads,
      );
    };

    expect(build()).toEqual(build());
  });
});
