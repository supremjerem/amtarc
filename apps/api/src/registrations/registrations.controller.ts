import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { seconds, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrationsService } from './registrations.service';
import { ApplySquaddingDto } from './dto/apply-squadding.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Registering sends an email and holds a spot, so keep it well below what a
  // human needs (a few retries after a validation error).
  @Throttle({ default: { ttl: seconds(600), limit: 5 } })
  @Post('matches/:matchId/registrations')
  register(@Param('matchId') matchId: string, @Body() dto: CreateRegistrationDto) {
    return this.registrationsService.register(matchId, dto);
  }

  // Reference + email is guessable in principle; throttle to make enumeration
  // impractical.
  @Throttle({ default: { ttl: seconds(60), limit: 10 } })
  @Get('registrations/lookup')
  lookup(@Query('reference') reference = '', @Query('email') email = '') {
    return this.registrationsService.lookup(reference, email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches/:matchId/registrations')
  listByMatch(@Param('matchId') matchId: string) {
    return this.registrationsService.listByMatch(matchId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches/:matchId/registrations/export')
  @Header('content-type', 'text/csv; charset=utf-8')
  async exportCsv(@Param('matchId') matchId: string, @Res({ passthrough: true }) res: Response) {
    const { fileName, csv } = await this.registrationsService.exportCsv(matchId);
    res.setHeader('content-disposition', `attachment; filename="${fileName}"`);
    return csv;
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches/:matchId/squadding/proposal')
  buildProposal(@Param('matchId') matchId: string) {
    return this.registrationsService.buildProposal(matchId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('matches/:matchId/squadding')
  applySquadding(@Param('matchId') matchId: string, @Body() dto: ApplySquaddingDto) {
    return this.registrationsService.applySquadding(matchId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('registrations/:id/paid')
  markPaid(@Param('id') id: string) {
    return this.registrationsService.markPaid(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('registrations/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.registrationsService.cancel(id);
  }
}
