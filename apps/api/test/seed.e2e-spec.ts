import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// The seed is what a fresh checkout renders, so it is worth asserting that it
// actually produces a usable demo match rather than just inserting rows: the
// match has to be published, squadded, and still open for registration.
const SEED_MATCH_ID = 'seed-match-level-ii';

type PublicSquad = { id: string; label: string; targetSize: number };
type PublicRegistration = { firstName: string; lastName: string; squadId: string | null };
type PublicMatch = {
  id: string;
  published: boolean;
  registrationDeadline: string | null;
  squads: PublicSquad[];
  registrations?: PublicRegistration[];
};

describe('Seeded demo match (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should expose the demo match on the public listing', async () => {
    const response = await request(app.getHttpServer()).get('/matches').expect(200);

    const match = (response.body as PublicMatch[]).find((row) => row.id === SEED_MATCH_ID);
    if (!match) {
      throw new Error('Demo match missing — run `pnpm db:seed` before the e2e suite.');
    }
    expect(match.published).toBe(true);
    expect(match.squads).toHaveLength(3);
  });

  it('should keep the demo match open for registration', async () => {
    const response = await request(app.getHttpServer())
      .get(`/matches/${SEED_MATCH_ID}`)
      .expect(200);

    const match = response.body as PublicMatch;
    expect(match.registrationDeadline).not.toBeNull();
    // Dates are seeded relative to the run, so the demo never goes stale.
    expect(new Date(match.registrationDeadline!).getTime()).toBeGreaterThan(Date.now());
  });

  it('should seed a roster covering squadded and unsquadded shooters', async () => {
    const response = await request(app.getHttpServer())
      .get(`/matches/${SEED_MATCH_ID}`)
      .expect(200);

    const registrations = (response.body as PublicMatch).registrations ?? [];
    expect(registrations).toHaveLength(8);
    expect(registrations.some((entry) => entry.squadId !== null)).toBe(true);
    expect(registrations.some((entry) => entry.squadId === null)).toBe(true);
  });

  it('should not duplicate the demo match when the seed is replayed', async () => {
    const response = await request(app.getHttpServer()).get('/matches').expect(200);

    const seeded = (response.body as PublicMatch[]).filter((row) => row.id === SEED_MATCH_ID);
    expect(seeded).toHaveLength(1);
  });
});
