import { Module } from '@nestjs/common';
import { RevalidateModule } from '../revalidate/revalidate.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [RevalidateModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
