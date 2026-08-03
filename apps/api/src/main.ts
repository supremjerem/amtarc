import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './uploads/uploads.controller';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Behind a reverse proxy, rate limiting and logs need the forwarded client
  // IP; TRUST_PROXY is the number of proxy hops in front of the app.
  const trustProxy = config.get<number>('TRUST_PROXY')!;
  if (trustProxy > 0) app.set('trust proxy', trustProxy);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' });
  app.enableCors({ origin: config.get<string>('CORS_ORIGIN')!.split(',') });
  app.useGlobalPipes(
    // forbidNonWhitelisted surfaces client/server drift as a 400 instead of
    // silently dropping fields.
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  // Lets Prisma close its pool on SIGTERM during deploys.
  app.enableShutdownHooks();

  await app.listen(config.get<number>('PORT')!);
}
void bootstrap();
