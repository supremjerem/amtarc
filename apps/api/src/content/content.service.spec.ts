import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;
  let prisma: {
    siteContent: { findMany: jest.Mock; upsert: jest.Mock; deleteMany: jest.Mock };
  };
  let notifyMock: jest.Mock;

  beforeEach(async () => {
    prisma = { siteContent: { findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() } };
    notifyMock = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: PrismaService, useValue: prisma },
        { provide: RevalidateService, useValue: { notify: notifyMock } },
      ],
    }).compile();

    service = moduleRef.get(ContentService);
  });

  it('should return stored sections keyed by section name', async () => {
    prisma.siteContent.findMany.mockResolvedValue([
      { key: 'hero', data: { title: 'Nouveau titre' }, updatedAt: new Date() },
    ]);

    await expect(service.getAll()).resolves.toEqual({ hero: { title: 'Nouveau titre' } });
  });

  it('should upsert a known section and notify revalidation', async () => {
    const row = { key: 'hero', data: { title: 'Nouveau titre' }, updatedAt: new Date() };
    prisma.siteContent.upsert.mockResolvedValue(row);

    await expect(service.upsert('hero', { title: 'Nouveau titre' })).resolves.toEqual(row);

    expect(prisma.siteContent.upsert).toHaveBeenCalledWith({
      where: { key: 'hero' },
      update: { data: { title: 'Nouveau titre' } },
      create: { key: 'hero', data: { title: 'Nouveau titre' } },
    });
    expect(notifyMock).toHaveBeenCalledWith('content');
  });

  it('should reject unknown section keys', async () => {
    await expect(service.upsert('not-a-section', {})).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.siteContent.upsert).not.toHaveBeenCalled();
  });

  it('should drop a section override on reset and notify revalidation', async () => {
    prisma.siteContent.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.reset('hero')).resolves.toEqual({ key: 'hero', reset: true });

    expect(prisma.siteContent.deleteMany).toHaveBeenCalledWith({ where: { key: 'hero' } });
    expect(notifyMock).toHaveBeenCalledWith('content');
  });

  it('should treat resetting a section that was never overridden as a no-op', async () => {
    prisma.siteContent.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.reset('contact')).resolves.toEqual({ key: 'contact', reset: true });
  });

  it('should reject unknown section keys on reset', async () => {
    await expect(service.reset('not-a-section')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.siteContent.deleteMany).not.toHaveBeenCalled();
  });
});
