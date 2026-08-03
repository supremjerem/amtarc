import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationsService } from './registrations.service';
import type { CreateRegistrationDto } from './dto/create-registration.dto';

const match = {
  id: 'match-1',
  title: 'Challenge de Chapas 2026',
  published: true,
  feeCents: 9000,
  registrationDeadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  paymentIban: 'FR76 0000',
  paymentPayee: 'AMTARC',
  paymentInstructions: null,
  squads: [
    { id: 's1', targetSize: 2 },
    { id: 's2', targetSize: 2 },
  ],
};

const dto: CreateRegistrationDto = {
  firstName: 'Jeremie',
  lastName: 'Cavellec',
  email: 'Jeremie@Example.COM',
  licenceNumber: '123456',
  division: 'PRODUCTION_OPTICS',
  squadRequests: ['  Alice Martin ', '', 'Bob Durand'],
};

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let prisma: {
    match: { findUnique: jest.Mock };
    registration: {
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let sendMock: jest.Mock;

  beforeEach(async () => {
    prisma = {
      match: { findUnique: jest.fn() },
      registration: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
    };
    sendMock = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: { send: sendMock } },
      ],
    }).compile();

    service = moduleRef.get(RegistrationsService);
  });

  describe('register', () => {
    beforeEach(() => {
      prisma.match.findUnique.mockResolvedValue(match);
      prisma.registration.findUnique.mockResolvedValue(null);
      prisma.registration.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'reg-1', ...data, squadRequests: [] }),
      );
    });

    it('registers as awaiting payment when capacity remains', async () => {
      prisma.registration.count.mockResolvedValue(3);

      const result = await service.register('match-1', dto);

      expect(result.status).toBe('AWAITING_PAYMENT');
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining('Inscription reçue') }),
      );
    });

    it('normalizes email and trims squad requests', async () => {
      prisma.registration.count.mockResolvedValue(0);

      await service.register('match-1', dto);

      const created = prisma.registration.create.mock.calls[0][0].data;
      expect(created.email).toBe('jeremie@example.com');
      expect(created.squadRequests.create).toEqual([
        { requestedName: 'Alice Martin' },
        { requestedName: 'Bob Durand' },
      ]);
      expect(created.reference).toMatch(/^AMT-[A-Z2-9]{6}$/);
    });

    it('waitlists when the match is full', async () => {
      prisma.registration.count.mockResolvedValue(4);

      const result = await service.register('match-1', dto);

      expect(result.status).toBe('WAITLISTED');
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining("Liste d'attente") }),
      );
    });

    it('rejects registrations after the deadline', async () => {
      prisma.match.findUnique.mockResolvedValue({
        ...match,
        registrationDeadline: new Date(Date.now() - 1000),
      });

      await expect(service.register('match-1', dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate email for the same match', async () => {
      prisma.registration.count.mockResolvedValue(0);
      prisma.registration.create.mockRejectedValue(
        Object.assign(new Error('unique constraint'), { code: 'P2002' }),
      );

      await expect(service.register('match-1', dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('hides unpublished matches', async () => {
      prisma.match.findUnique.mockResolvedValue({ ...match, published: false });

      await expect(service.register('match-1', dto)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('markPaid', () => {
    it('confirms the registration and emails the shooter', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: 'AWAITING_PAYMENT',
        email: 'j@example.com',
        firstName: 'Jeremie',
        match,
      });
      prisma.registration.update.mockResolvedValue({ id: 'reg-1', status: 'CONFIRMED' });

      await service.markPaid('reg-1');

      expect(prisma.registration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: 'CONFIRMED', paidAt: expect.any(Date) },
      });
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining('Place confirmée') }),
      );
    });

    it('refuses to confirm a cancelled registration', async () => {
      prisma.registration.findUnique.mockResolvedValue({ id: 'reg-1', status: 'CANCELLED', match });

      await expect(service.markPaid('reg-1')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('promotes the oldest waitlisted registration when a spot frees up', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: 'CONFIRMED',
        matchId: 'match-1',
        match,
      });
      prisma.registration.update.mockResolvedValue({ id: 'reg-1', status: 'CANCELLED' });
      prisma.registration.findFirst.mockResolvedValue({
        id: 'reg-2',
        firstName: 'Alice',
        email: 'alice@example.com',
        reference: 'AMT-ABC234',
        status: 'WAITLISTED',
        match,
      });

      await service.cancel('reg-1');

      expect(prisma.registration.update).toHaveBeenCalledWith({
        where: { id: 'reg-2' },
        data: { status: 'AWAITING_PAYMENT' },
      });
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          subject: expect.stringContaining("place s'est libérée"),
        }),
      );
    });

    it('does not promote anyone when a waitlisted registration cancels', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-3',
        status: 'WAITLISTED',
        matchId: 'match-1',
        match,
      });
      prisma.registration.update.mockResolvedValue({ id: 'reg-3', status: 'CANCELLED' });

      await service.cancel('reg-3');

      expect(prisma.registration.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('lookup', () => {
    it('returns status and payment instructions while awaiting payment', async () => {
      prisma.registration.findFirst.mockResolvedValue({
        reference: 'AMT-XYZ789',
        status: 'AWAITING_PAYMENT',
        email: 'j@example.com',
        match,
      });

      const result = await service.lookup('amt-xyz789', 'J@Example.com');

      expect(prisma.registration.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reference: 'AMT-XYZ789', email: 'j@example.com' },
        }),
      );
      expect(result.status).toBe('AWAITING_PAYMENT');
      expect(result.payment).toContain('AMT-XYZ789');
    });

    it('404s on unknown reference/email pair', async () => {
      prisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.lookup('AMT-NOPE22', 'x@example.com')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
