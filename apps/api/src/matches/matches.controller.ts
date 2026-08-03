import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ReplaceSquadsDto } from './dto/replace-squads.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findPublished() {
    return this.matchesService.findPublished();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAll() {
    return this.matchesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Get(':id')
  findOnePublic(@Param('id') id: string) {
    return this.matchesService.findOnePublic(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/squads')
  replaceSquads(@Param('id') id: string, @Body() dto: ReplaceSquadsDto) {
    return this.matchesService.replaceSquads(id, dto);
  }
}
