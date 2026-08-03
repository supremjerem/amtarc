import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { NewsModule } from './news/news.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { MatchesModule } from './matches/matches.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { UploadsModule } from './uploads/uploads.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Baseline per-IP limit for every route; endpoints that are cheap to abuse
    // (login, registration, lookup) tighten it with their own @Throttle.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: seconds(60), limit: 120 }],
    }),
    PrismaModule,
    NewsModule,
    AuthModule,
    ContentModule,
    MatchesModule,
    RegistrationsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
