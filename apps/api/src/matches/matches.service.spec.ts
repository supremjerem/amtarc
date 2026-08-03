import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { MatchesService } from './matches.service';
import type { CreateMatchDto } from './dto/create-match.dto';

const match = {
  id: 'match-1',
  title: 'Challenge de Chapas 2026',
  description: null,
  location: 'Meauzac',
  startDate: new Date('2026-10-02'),
  endDate: new Date('2026-10-04'),
  stages: 10,
  rounds: 210,
  feeCents: 9000,
  registrationDeadline: new Date('2026-09-20'),
  published: true,
  paymentIban: 'FR76 0000 0000 0000',
  paymentPayee: 'AMTARC',
  paymentInstructions: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  squads: [],
};

describe('MatchesService', () => {
  let service: MatchesService;
  let prisma: {
    match: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    squad: { deleteMany: jest.Mock; createMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let notifyMock: jest.Mock;

  beforeEach(async () => {
    prisma = {
      match: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      squad: { deleteMany: jest.fn(), createMany: jest.fn() },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
    };
    notifyMock = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: PrismaService, useValue: prisma },
        { provide: RevalidateService, useValue: { notify: notifyMock } },
      ],
    }).compile();

    service = moduleRef.get(MatchesService);
  });

  it('should list only published matches, soonest first, with ordered squads', async () => {
    prisma.match.findMany.mockResolvedValue([match]);

    await service.findPublished();

    expect(prisma.match.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { startDate: 'asc' },
      include: {
        squads: { orderBy: { position: 'asc' } },
        _count: {
          select: {
            registrations: { where: { status: { in: ['AWAITING_PAYMENT', 'CONFIRMED'] } } },
          },
        },
      },
    });
  });

  it('should hide unpublished matches from the public detail endpoint', async () => {
    prisma.match.findUnique.mockResolvedValue({ ...match, published: false });

    await expect(service.findOnePublic('match-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return unpublished matches on the admin endpoint', async () => {
    const draft = { ...match, published: false };
    prisma.match.findUnique.mockResolvedValue(draft);

    await expect(service.findOne('match-1')).resolves.toEqual(draft);
  });

  it('should create a match and notify revalidation', async () => {
    prisma.match.create.mockResolvedValue(match);
    const dto = { title: match.title, location: 'Meauzac' } as CreateMatchDto;

    await expect(service.create(dto)).resolves.toEqual(match);

    expect(notifyMock).toHaveBeenCalledWith('matches');
  });

  it('should replace the squad list transactionally with positions', async () => {
    prisma.match.findUnique.mockResolvedValue(match);

    await service.replaceSquads('match-1', {
      squads: [
        { label: 'Squad 1', day: '2026-10-02', startTime: '08:00' },
        { label: 'Squad 2', day: '2026-10-03', startTime: '08:00', targetSize: 10 },
      ],
    });

    expect(prisma.squad.deleteMany).toHaveBeenCalledWith({ where: { matchId: 'match-1' } });
    expect(prisma.squad.createMany).toHaveBeenCalledWith({
      data: [
        {
          label: 'Squad 1',
          day: '2026-10-02',
          startTime: '08:00',
          matchId: 'match-1',
          position: 0,
        },
        {
          label: 'Squad 2',
          day: '2026-10-03',
          startTime: '08:00',
          targetSize: 10,
          matchId: 'match-1',
          position: 1,
        },
      ],
    });
    expect(notifyMock).toHaveBeenCalledWith('matches');
  });

  it('should refuse to replace squads of an unknown match', async () => {
    prisma.match.findUnique.mockResolvedValue(null);

    await expect(service.replaceSquads('missing', { squads: [] })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.squad.deleteMany).not.toHaveBeenCalled();
  });
});
