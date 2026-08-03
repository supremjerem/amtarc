import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { RevalidateModule } from '../revalidate/revalidate.module';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  imports: [MailModule, RevalidateModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
})
export class RegistrationsModule {}
