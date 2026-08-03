import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// End-to-end cover of the booking flow against a real database: capacity and
// wait-list boundaries, payment state transitions, squadding and export.
describe('Booking flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let matchId: string;
  let squadId: string;

  const admin = { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! };
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const login = await request(app.getHttpServer()).post('/auth/login').send(admin).expect(201);
    token = (login.body as { accessToken: string }).accessToken;

    const match = await request(app.getHttpServer())
      .post('/matches')
      .set(auth())
      .send({
        title: 'E2E booking match',
        location: 'Meauzac',
        startDate: '2027-05-01T00:00:00.000Z',
        endDate: '2027-05-01T00:00:00.000Z',
        feeCents: 5000,
        published: true,
        paymentPayee: 'AMTARC',
        paymentIban: 'FR76 0000 1111 2222',
      })
      .expect(201);
    matchId = (match.body as { id: string }).id;

    const withSquads = await request(app.getHttpServer())
      .put(`/matches/${matchId}/squads`)
      .set(auth())
      .send({
        squads: [
          { label: 'Squad 1', day: '2027-05-01T00:00:00.000Z', startTime: '08:00', targetSize: 2 },
        ],
      })
      .expect(200);
    squadId = (withSquads.body as { squads: { id: string }[] }).squads[0].id;
  });

  afterAll(async () => {
    if (matchId) await prisma.match.delete({ where: { id: matchId } }).catch(() => undefined);
    await app.close();
  });

  const register = (email: string, extra: Record<string, unknown> = {}) =>
    request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .send({
        firstName: 'Jeremie',
        lastName: 'Cavellec',
        email,
        licenceNumber: '123456',
        division: 'PRODUCTION_OPTICS',
        ...extra,
      });

  describe('registration', () => {
    it('accepts a shooter while spots remain and issues a transfer reference', async () => {
      const response = await register('e2e-1@example.test', {
        squadRequests: ['Alice Martin'],
      }).expect(201);

      expect(response.body).toMatchObject({ status: 'AWAITING_PAYMENT' });
      expect((response.body as { reference: string }).reference).toMatch(/^AMT-[A-Z2-9]{6}$/);
    });

    it('rejects a second registration with the same email', async () => {
      await register('e2e-1@example.test').expect(409);
    });

    it('rejects unknown fields and invalid enums', async () => {
      await register('e2e-bad@example.test', { unexpected: 'x' }).expect(400);
      await register('e2e-bad@example.test', { division: 'BAZOOKA' }).expect(400);
    });

    it('wait-lists once squad capacity is reached', async () => {
      await register('e2e-2@example.test', { firstName: 'Alice', lastName: 'Martin' }).expect(201);

      const third = await register('e2e-3@example.test', {
        firstName: 'Bob',
        lastName: 'Durand',
      }).expect(201);

      expect(third.body).toMatchObject({ status: 'WAITLISTED' });
    });
  });

  describe('lookup', () => {
    it('returns status and payment instructions for the right reference/email pair', async () => {
      const registration = await prisma.registration.findFirstOrThrow({
        where: { matchId, email: 'e2e-1@example.test' },
      });

      const response = await request(app.getHttpServer())
        .get('/registrations/lookup')
        .query({ reference: registration.reference.toLowerCase(), email: 'E2E-1@example.test' })
        .expect(200);

      expect(response.body).toMatchObject({ status: 'AWAITING_PAYMENT' });
      expect((response.body as { payment: string }).payment).toContain(registration.reference);
    });

    it('does not reveal a registration to the wrong email', async () => {
      const registration = await prisma.registration.findFirstOrThrow({
        where: { matchId, email: 'e2e-1@example.test' },
      });

      await request(app.getHttpServer())
        .get('/registrations/lookup')
        .query({ reference: registration.reference, email: 'someone-else@example.test' })
        .expect(404);
    });
  });

  describe('payment and wait-list promotion', () => {
    it('confirms on payment, then promotes the wait-list when a spot is cancelled', async () => {
      const first = await prisma.registration.findFirstOrThrow({
        where: { matchId, email: 'e2e-1@example.test' },
      });

      await request(app.getHttpServer())
        .patch(`/registrations/${first.id}/paid`)
        .set(auth())
        .expect(200)
        .expect(({ body }) => expect(body).toMatchObject({ status: 'CONFIRMED' }));

      await request(app.getHttpServer())
        .patch(`/registrations/${first.id}/cancel`)
        .set(auth())
        .expect(200);

      const promoted = await prisma.registration.findFirstOrThrow({
        where: { matchId, email: 'e2e-3@example.test' },
      });
      expect(promoted.status).toBe('AWAITING_PAYMENT');
    });
  });

  describe('squadding', () => {
    it('proposes and applies squad assignments', async () => {
      const proposal = await request(app.getHttpServer())
        .get(`/matches/${matchId}/squadding/proposal`)
        .set(auth())
        .expect(200);

      const assignments = (
        proposal.body as { assignments: { squadId: string; registrationIds: string[] }[] }
      ).assignments.flatMap((entry) =>
        entry.registrationIds.map((registrationId) => ({ registrationId, squadId: entry.squadId })),
      );
      expect(assignments.length).toBeGreaterThan(0);

      await request(app.getHttpServer())
        .put(`/matches/${matchId}/squadding`)
        .set(auth())
        .send({ assignments })
        .expect(200);

      const squadded = await prisma.registration.count({ where: { matchId, squadId } });
      expect(squadded).toBe(assignments.length);
    });

    it('refuses assignments referencing another match', async () => {
      const registration = await prisma.registration.findFirstOrThrow({ where: { matchId } });

      await request(app.getHttpServer())
        .put(`/matches/${matchId}/squadding`)
        .set(auth())
        .send({ assignments: [{ registrationId: registration.id, squadId: 'not-a-squad' }] })
        .expect(400);
    });
  });

  describe('export', () => {
    it('serves a BOM-prefixed CSV of active registrations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/matches/${matchId}/registrations/export`)
        .set(auth())
        .expect(200)
        .expect('content-type', /text\/csv/);

      expect(response.headers['content-disposition']).toContain('inscriptions-e2e-booking-match');
      expect(response.text.startsWith('\ufeff')).toBe(true);
      // Header plus the two active registrations; the cancelled one is excluded.
      expect(response.text.trim().split('\r\n')).toHaveLength(3);
    });
  });

  describe('authorization', () => {
    it.each([
      ['get', `/matches/:id/registrations`],
      ['get', `/matches/:id/squadding/proposal`],
      ['get', `/matches/:id/registrations/export`],
    ])('rejects unauthenticated %s %s', async (method, path) => {
      await request(app.getHttpServer())[method as 'get'](path.replace(':id', matchId)).expect(401);
    });

    it('hides unpublished matches from the public endpoint', async () => {
      await request(app.getHttpServer())
        .patch(`/matches/${matchId}`)
        .set(auth())
        .send({ published: false })
        .expect(200);

      await request(app.getHttpServer()).get(`/matches/${matchId}`).expect(404);

      await request(app.getHttpServer())
        .patch(`/matches/${matchId}`)
        .set(auth())
        .send({ published: true })
        .expect(200);
    });
  });
});
