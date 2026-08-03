import { Module } from '@nestjs/common';
import { RevalidateModule } from '../revalidate/revalidate.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [RevalidateModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
