import { Injectable, NotFoundException } from '@nestjs/common';
import { RegistrationStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ReplaceSquadsDto } from './dto/replace-squads.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

const squadsOrdered = { squads: { orderBy: { position: 'asc' as const } } };

// Registrations holding a spot, surfaced on public endpoints as _count so the
// site can show remaining places.
const activeRegistrationsCount = {
  _count: {
    select: {
      registrations: {
        where: {
          status: { in: [RegistrationStatus.AWAITING_PAYMENT, RegistrationStatus.CONFIRMED] },
        },
      },
    },
  },
};

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  findPublished() {
    return this.prisma.match.findMany({
      where: { published: true },
      orderBy: { startDate: 'asc' },
      include: { ...squadsOrdered, ...activeRegistrationsCount },
    });
  }

  async findOnePublic(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        ...squadsOrdered,
        ...activeRegistrationsCount,
        // Public roster, FFTir-style: name, division, category and squad —
        // what a start list shows. No contact or licence data, and
        // deliberately no payment status: who has not paid yet is the
        // organizers' business, not the public's.
        registrations: {
          where: {
            status: { in: [RegistrationStatus.AWAITING_PAYMENT, RegistrationStatus.CONFIRMED] },
          },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            division: true,
            category: true,
            squadId: true,
          },
        },
      },
    });
    if (!match || !match.published) throw new NotFoundException(`Match "${id}" not found`);
    return match;
  }

  findAll() {
    return this.prisma.match.findMany({ orderBy: { startDate: 'desc' }, include: squadsOrdered });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: squadsOrdered,
    });
    if (!match) throw new NotFoundException(`Match "${id}" not found`);
    return match;
  }

  async create(dto: CreateMatchDto) {
    const created = await this.prisma.match.create({ data: dto, include: squadsOrdered });
    await this.revalidate.notify('matches');
    return created;
  }

  async update(id: string, dto: UpdateMatchDto) {
    const updated = await this.prisma.match.update({
      where: { id },
      data: dto,
      include: squadsOrdered,
    });
    await this.revalidate.notify('matches');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.prisma.match.delete({ where: { id } });
    await this.revalidate.notify('matches');
    return removed;
  }

  // The admin form edits the squad list as a whole, so the API replaces it as
  // a whole too (transactionally). Revisit once squads carry registrations.
  async replaceSquads(matchId: string, dto: ReplaceSquadsDto) {
    await this.findOne(matchId);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.squad.deleteMany({ where: { matchId } });
      await tx.squad.createMany({
        data: dto.squads.map((squad, position) => ({ ...squad, matchId, position })),
      });
      return tx.match.findUnique({ where: { id: matchId }, include: squadsOrdered });
    });
    await this.revalidate.notify('matches');
    return updated;
  }
}
