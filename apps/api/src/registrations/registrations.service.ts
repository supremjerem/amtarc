import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { ApplySquaddingDto } from './dto/apply-squadding.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { buildRegistrationsCsv, exportFileName } from './registrations.csv';
import { buildSquaddingProposal } from './squadding';
import {
  RegistrationStatus,
  type Match,
  type Prisma,
  type Registration,
} from '../../generated/prisma/client';

// Statuses that hold a spot against squad capacity.
const ACTIVE_STATUSES: RegistrationStatus[] = [
  RegistrationStatus.AWAITING_PAYMENT,
  RegistrationStatus.CONFIRMED,
];

// Unambiguous alphabet (no O/0, I/1) for bank-transfer references.
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function formatEuros(feeCents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    feeCents / 100,
  );
}

function paymentInstructionsText(match: Match, reference: string): string {
  const lines = [
    `Pour confirmer votre place, effectuez un virement de ${formatEuros(match.feeCents)} :`,
  ];
  if (match.paymentPayee) lines.push(`Bénéficiaire : ${match.paymentPayee}`);
  if (match.paymentIban) lines.push(`IBAN : ${match.paymentIban}`);
  lines.push(`Libellé du virement (obligatoire) : ${reference}`);
  if (match.paymentInstructions) lines.push('', match.paymentInstructions);
  return lines.join('\n');
}

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly revalidate: RevalidateService,
  ) {}

  async register(matchId: string, dto: CreateRegistrationDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { squads: true },
    });
    if (!match || !match.published) throw new NotFoundException(`Match "${matchId}" not found`);
    if (match.registrationDeadline && new Date() > match.registrationDeadline) {
      throw new BadRequestException('Registrations are closed for this match');
    }

    const capacity = match.squads.length
      ? match.squads.reduce((total, squad) => total + squad.targetSize, 0)
      : null;
    const requestedNames = (dto.squadRequests ?? [])
      .map((name) => name.trim())
      .filter((name) => name !== '');

    const registration = await this.prisma.$transaction(async (tx) => {
      const activeCount = await tx.registration.count({
        where: { matchId, status: { in: ACTIVE_STATUSES } },
      });
      const waitlisted = capacity !== null && activeCount >= capacity;
      try {
        return await tx.registration.create({
          data: {
            matchId,
            reference: await this.generateReference(tx),
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email.toLowerCase(),
            licenceNumber: dto.licenceNumber,
            club: dto.club,
            region: dto.region,
            division: dto.division,
            category: dto.category,
            status: waitlisted
              ? RegistrationStatus.WAITLISTED
              : RegistrationStatus.AWAITING_PAYMENT,
            squadRequests: {
              create: requestedNames.map((requestedName) => ({ requestedName })),
            },
          },
          include: { squadRequests: true },
        });
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          (error as { code?: string }).code === 'P2002'
        ) {
          throw new ConflictException('This email is already registered for this match');
        }
        throw error;
      }
    });

    await this.sendRegistrationEmail(match, registration);
    return registration;
  }

  listByMatch(matchId: string) {
    return this.prisma.registration.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      include: { squadRequests: true },
    });
  }

  async lookup(reference: string, email: string) {
    const registration = await this.prisma.registration.findFirst({
      where: { reference: reference.toUpperCase(), email: email.toLowerCase() },
      include: { match: true },
    });
    if (!registration) throw new NotFoundException('Registration not found');
    return {
      reference: registration.reference,
      status: registration.status,
      match: { id: registration.match.id, title: registration.match.title },
      feeCents: registration.match.feeCents,
      payment:
        registration.status === RegistrationStatus.AWAITING_PAYMENT
          ? paymentInstructionsText(registration.match, registration.reference)
          : null,
    };
  }

  async markPaid(id: string) {
    const registration = await this.findWithMatch(id);
    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Cannot mark a cancelled registration as paid');
    }
    const updated = await this.prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.CONFIRMED, paidAt: new Date() },
    });
    await this.mail.send({
      to: registration.email,
      subject: `Place confirmée — ${registration.match.title}`,
      text: `Bonjour ${registration.firstName},\n\nVotre virement a bien été reçu : votre place pour « ${registration.match.title} » est confirmée.\n\nÀ bientôt sur le pas de tir,\nAMTARC`,
    });
    return updated;
  }

  async cancel(id: string) {
    const registration = await this.findWithMatch(id);
    if (registration.status === RegistrationStatus.CANCELLED) return registration;

    const freedSpot = ACTIVE_STATUSES.includes(registration.status);
    const cancelled = await this.prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.CANCELLED },
    });
    if (freedSpot) await this.promoteOldestWaitlisted(registration.matchId);
    return cancelled;
  }

  // Federation entry export: active registrations only (cancelled entries are
  // never reported), squadded shooters first in squad order.
  async exportCsv(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { squads: { orderBy: { position: 'asc' } } },
    });
    if (!match) throw new NotFoundException(`Match "${matchId}" not found`);

    const squadPositions = new Map(match.squads.map((squad, index) => [squad.id, index]));
    const registrations = await this.prisma.registration.findMany({
      where: { matchId, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: 'asc' },
    });
    const ordered = [...registrations].sort(
      (a, b) =>
        (a.squadId ? (squadPositions.get(a.squadId) ?? 0) : Number.MAX_SAFE_INTEGER) -
        (b.squadId ? (squadPositions.get(b.squadId) ?? 0) : Number.MAX_SAFE_INTEGER),
    );

    return {
      fileName: exportFileName(match.title),
      csv: buildRegistrationsCsv(ordered, match.squads),
    };
  }

  async buildProposal(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { squads: { orderBy: { position: 'asc' } } },
    });
    if (!match) throw new NotFoundException(`Match "${matchId}" not found`);

    const registrations = await this.prisma.registration.findMany({
      where: { matchId, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: 'asc' },
      include: { squadRequests: true },
    });
    return buildSquaddingProposal(
      registrations.map((registration) => ({
        id: registration.id,
        firstName: registration.firstName,
        lastName: registration.lastName,
        createdAt: registration.createdAt,
        requestedNames: registration.squadRequests.map((request) => request.requestedName),
      })),
      match.squads,
    );
  }

  async applySquadding(matchId: string, dto: ApplySquaddingDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { squads: true },
    });
    if (!match) throw new NotFoundException(`Match "${matchId}" not found`);

    const validSquadIds = new Set(match.squads.map((squad) => squad.id));
    for (const assignment of dto.assignments) {
      if (assignment.squadId && !validSquadIds.has(assignment.squadId)) {
        throw new BadRequestException(`Unknown squad "${assignment.squadId}" for this match`);
      }
    }
    const registrationIds = dto.assignments.map((assignment) => assignment.registrationId);
    const known = await this.prisma.registration.count({
      where: { id: { in: registrationIds }, matchId },
    });
    if (known !== new Set(registrationIds).size) {
      throw new BadRequestException('Some registrations do not belong to this match');
    }

    await this.prisma.$transaction(
      dto.assignments.map((assignment) =>
        this.prisma.registration.update({
          where: { id: assignment.registrationId },
          data: { squadId: assignment.squadId ?? null },
        }),
      ),
    );
    await this.revalidate.notify('matches');
    return this.listByMatch(matchId);
  }

  private async promoteOldestWaitlisted(matchId: string) {
    const next = await this.prisma.registration.findFirst({
      where: { matchId, status: RegistrationStatus.WAITLISTED },
      orderBy: { createdAt: 'asc' },
      include: { match: true },
    });
    if (!next) return;
    await this.prisma.registration.update({
      where: { id: next.id },
      data: { status: RegistrationStatus.AWAITING_PAYMENT },
    });
    await this.mail.send({
      to: next.email,
      subject: `Une place s'est libérée — ${next.match.title}`,
      text: `Bonjour ${next.firstName},\n\nBonne nouvelle : une place s'est libérée pour « ${next.match.title} » et elle vous revient.\n\n${paymentInstructionsText(next.match, next.reference)}\n\nAMTARC`,
    });
  }

  private async findWithMatch(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { match: true },
    });
    if (!registration) throw new NotFoundException(`Registration "${id}" not found`);
    return registration;
  }

  private async generateReference(tx: Prisma.TransactionClient): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = Array.from(
        { length: 6 },
        () => REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)],
      ).join('');
      const reference = `AMT-${code}`;
      if (!(await tx.registration.findUnique({ where: { reference } }))) return reference;
    }
    throw new ConflictException('Could not generate a unique reference, please retry');
  }

  private async sendRegistrationEmail(match: Match, registration: Registration) {
    if (registration.status === RegistrationStatus.WAITLISTED) {
      await this.mail.send({
        to: registration.email,
        subject: `Liste d'attente — ${match.title}`,
        text: `Bonjour ${registration.firstName},\n\nLe match « ${match.title} » est complet : vous êtes inscrit(e) en liste d'attente (référence ${registration.reference}).\n\nSi une place se libère, vous recevrez un email avec les instructions de paiement.\n\nAMTARC`,
      });
      return;
    }
    await this.mail.send({
      to: registration.email,
      subject: `Inscription reçue — ${match.title}`,
      text: `Bonjour ${registration.firstName},\n\nVotre inscription à « ${match.title} » est enregistrée (référence ${registration.reference}).\n\n${paymentInstructionsText(match, registration.reference)}\n\nVotre place sera confirmée à réception du virement.\n\nAMTARC`,
    });
  }
}
