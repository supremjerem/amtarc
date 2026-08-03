// Pure squadding-proposal algorithm: group shooters who asked to shoot
// together, then pack groups into squads close to their target size. The
// output is a proposal — organizers review and adjust before applying.

export type SquaddingShooter = {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  requestedNames: string[];
};

export type SquaddingSquad = {
  id: string;
  targetSize: number;
};

export type SquaddingProposal = {
  assignments: { squadId: string; registrationIds: string[] }[];
  unassigned: string[];
};

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

class UnionFind {
  private readonly parent = new Map<string, string>();

  find(id: string): string {
    const parent = this.parent.get(id) ?? id;
    if (parent === id) return id;
    const root = this.find(parent);
    this.parent.set(id, root);
    return root;
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootA, rootB);
  }
}

// A request matches a shooter when the free-text name equals "first last" or
// "last first" once accents/case/whitespace are normalized.
function buildNameIndex(shooters: SquaddingShooter[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const shooter of shooters) {
    index.set(normalizeName(`${shooter.firstName} ${shooter.lastName}`), shooter.id);
    index.set(normalizeName(`${shooter.lastName} ${shooter.firstName}`), shooter.id);
  }
  return index;
}

export function buildSquaddingProposal(
  shooters: SquaddingShooter[],
  squads: SquaddingSquad[],
): SquaddingProposal {
  const nameIndex = buildNameIndex(shooters);
  const unionFind = new UnionFind();

  for (const shooter of shooters) {
    for (const requestedName of shooter.requestedNames) {
      const targetId = nameIndex.get(normalizeName(requestedName));
      if (targetId && targetId !== shooter.id) unionFind.union(shooter.id, targetId);
    }
  }

  // Groups of shooters who asked (directly or transitively) to be together,
  // members ordered by registration date for deterministic output.
  const byId = new Map(shooters.map((shooter) => [shooter.id, shooter]));
  const groupsByRoot = new Map<string, string[]>();
  for (const shooter of [...shooters].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )) {
    const root = unionFind.find(shooter.id);
    groupsByRoot.set(root, [...(groupsByRoot.get(root) ?? []), shooter.id]);
  }

  // Split any group larger than the biggest squad so it stays packable; the
  // registration-date ordering keeps early buddies together.
  const maxSquadSize = Math.max(0, ...squads.map((squad) => squad.targetSize));
  const groups: string[][] = [];
  for (const members of groupsByRoot.values()) {
    if (maxSquadSize > 0 && members.length > maxSquadSize) {
      for (let start = 0; start < members.length; start += maxSquadSize) {
        groups.push(members.slice(start, start + maxSquadSize));
      }
    } else {
      groups.push(members);
    }
  }

  // Pack groups (largest first) into the squad with the fewest remaining
  // places that still fits, so big squads keep room for big groups.
  const remaining = new Map(squads.map((squad) => [squad.id, squad.targetSize]));
  const assignments = new Map<string, string[]>(squads.map((squad) => [squad.id, []]));
  const unassigned: string[] = [];

  const sortedGroups = groups.sort(
    (a, b) =>
      b.length - a.length ||
      byId.get(a[0])!.createdAt.getTime() - byId.get(b[0])!.createdAt.getTime(),
  );
  for (const group of sortedGroups) {
    const candidates = squads
      .filter((squad) => (remaining.get(squad.id) ?? 0) >= group.length)
      .sort((a, b) => remaining.get(a.id)! - remaining.get(b.id)!);
    const squad = candidates[0];
    if (!squad) {
      unassigned.push(...group);
      continue;
    }
    assignments.get(squad.id)!.push(...group);
    remaining.set(squad.id, remaining.get(squad.id)! - group.length);
  }

  return {
    assignments: squads.map((squad) => ({
      squadId: squad.id,
      registrationIds: assignments.get(squad.id) ?? [],
    })),
    unassigned,
  };
}
