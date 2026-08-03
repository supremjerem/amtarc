import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';
import type { Prisma } from '../../generated/prisma/client';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  getAll() {
    return this.contentService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':key')
  update(@Param('key') key: string, @Body() dto: UpdateContentDto) {
    return this.contentService.upsert(key, dto.data as Prisma.InputJsonObject);
  }
}
