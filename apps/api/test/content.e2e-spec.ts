import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// Covers the editable-content lifecycle against a real database, and in
// particular that a saved section can be cleared again — without a reset the
// only way back to the built-in defaults was a manual SQL delete.
describe('Site content (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;

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

    const login = await request(app.getHttpServer()).post('/auth/login').send(admin);
    if (login.status !== 201) {
      throw new Error(
        `Could not authenticate as ${admin.email} (status ${login.status}). ` +
          'Run `pnpm db:seed` so the admin account exists before the e2e suite.',
      );
    }
    token = (login.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    await prisma.siteContent.deleteMany({ where: { key: 'hero' } });
    await app.close();
  });

  beforeEach(async () => {
    await prisma.siteContent.deleteMany({ where: { key: 'hero' } });
  });

  it('should store an override and hand it back on the public endpoint', async () => {
    await request(app.getHttpServer())
      .put('/content/hero')
      .set(auth())
      .send({ data: { title: 'Titre e2e' } })
      .expect(200);

    const response = await request(app.getHttpServer()).get('/content').expect(200);
    expect((response.body as Record<string, unknown>).hero).toEqual({ title: 'Titre e2e' });
  });

  it('should clear the override on reset so the section falls back to defaults', async () => {
    await request(app.getHttpServer())
      .put('/content/hero')
      .set(auth())
      .send({ data: { title: 'Titre e2e' } })
      .expect(200);

    await request(app.getHttpServer()).delete('/content/hero').set(auth()).expect(200);

    const response = await request(app.getHttpServer()).get('/content').expect(200);
    expect((response.body as Record<string, unknown>).hero).toBeUndefined();
  });

  it('should treat resetting a section that was never overridden as a no-op', async () => {
    await request(app.getHttpServer()).delete('/content/hero').set(auth()).expect(200);
    await request(app.getHttpServer()).delete('/content/hero').set(auth()).expect(200);
  });

  it('should reject an unknown section key', async () => {
    await request(app.getHttpServer()).delete('/content/not-a-section').set(auth()).expect(400);
  });

  it('should require authentication to reset a section', async () => {
    await request(app.getHttpServer())
      .put('/content/hero')
      .set(auth())
      .send({ data: {} })
      .expect(200);

    await request(app.getHttpServer()).delete('/content/hero').expect(401);

    // The override must survive the rejected call.
    const response = await request(app.getHttpServer()).get('/content').expect(200);
    expect((response.body as Record<string, unknown>).hero).toEqual({});
  });
});
