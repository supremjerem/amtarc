import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrationsService } from './registrations.service';
import { ApplySquaddingDto } from './dto/apply-squadding.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('matches/:matchId/registrations')
  register(@Param('matchId') matchId: string, @Body() dto: CreateRegistrationDto) {
    return this.registrationsService.register(matchId, dto);
  }

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
