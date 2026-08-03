import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    PrismaModule,
    NewsModule,
    AuthModule,
    ContentModule,
    MatchesModule,
    RegistrationsModule,
    UploadsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
