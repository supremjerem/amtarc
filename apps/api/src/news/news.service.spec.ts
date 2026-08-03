import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { NewsService } from './news.service';
import type { CreateNewsDto } from './dto/create-news.dto';

const newsItem = {
  id: 'news-1',
  slug: 'resultats-du-concours-d-ete',
  title: "Résultats du concours d'été",
  category: 'CONCOURS',
  excerpt: null,
  body: 'Body',
  imageUrl: null,
  published: true,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NewsService', () => {
  let service: NewsService;
  let prisma: {
    news: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let notifyMock: jest.Mock;

  beforeEach(async () => {
    prisma = {
      news: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    notifyMock = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RevalidateService, useValue: { notify: notifyMock } },
      ],
    }).compile();

    service = moduleRef.get(NewsService);
  });

  describe('create', () => {
    const dto = {
      title: "Résultats du concours d'été",
      category: 'CONCOURS',
      body: 'Body',
    } as CreateNewsDto;

    it('should slugify the title with accents stripped', async () => {
      prisma.news.findUnique.mockResolvedValue(null);
      prisma.news.create.mockResolvedValue(newsItem);

      await service.create(dto);

      expect(prisma.news.create).toHaveBeenCalledWith({
        data: { ...dto, slug: 'resultats-du-concours-d-ete' },
      });
    });

    it('should suffix the slug when it already exists', async () => {
      prisma.news.findUnique
        .mockResolvedValueOnce(newsItem)
        .mockResolvedValueOnce(newsItem)
        .mockResolvedValueOnce(null);
      prisma.news.create.mockResolvedValue(newsItem);

      await service.create(dto);

      expect(prisma.news.create).toHaveBeenCalledWith({
        data: { ...dto, slug: 'resultats-du-concours-d-ete-3' },
      });
    });

    it('should notify revalidation with the news tag', async () => {
      prisma.news.findUnique.mockResolvedValue(null);
      prisma.news.create.mockResolvedValue(newsItem);

      await service.create(dto);

      expect(notifyMock).toHaveBeenCalledWith('news');
    });
  });

  describe('update', () => {
    it('should update and notify revalidation', async () => {
      prisma.news.update.mockResolvedValue(newsItem);

      const result = await service.update('news-1', { title: 'New title' });

      expect(result).toEqual(newsItem);
      expect(prisma.news.update).toHaveBeenCalledWith({
        where: { id: 'news-1' },
        data: { title: 'New title' },
      });
      expect(notifyMock).toHaveBeenCalledWith('news');
    });
  });

  describe('remove', () => {
    it('should delete and notify revalidation', async () => {
      prisma.news.delete.mockResolvedValue(newsItem);

      await service.remove('news-1');

      expect(prisma.news.delete).toHaveBeenCalledWith({ where: { id: 'news-1' } });
      expect(notifyMock).toHaveBeenCalledWith('news');
    });
  });

  describe('findOne / findBySlug', () => {
    it('should return the item when found', async () => {
      prisma.news.findUnique.mockResolvedValue(newsItem);

      await expect(service.findOne('news-1')).resolves.toEqual(newsItem);
    });

    it('should throw NotFoundException for an unknown id', async () => {
      prisma.news.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw NotFoundException for an unknown slug', async () => {
      prisma.news.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should hide unpublished drafts from the public slug route', async () => {
      prisma.news.findUnique.mockResolvedValue({ ...newsItem, published: false });

      await expect(service.findBySlug(newsItem.slug)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should still return unpublished items on the admin id route', async () => {
      const draft = { ...newsItem, published: false };
      prisma.news.findUnique.mockResolvedValue(draft);

      await expect(service.findOne('news-1')).resolves.toEqual(draft);
    });
  });

  describe('findPublished', () => {
    it('should only query published items, newest first', async () => {
      prisma.news.findMany.mockResolvedValue([newsItem]);

      await service.findPublished();

      expect(prisma.news.findMany).toHaveBeenCalledWith({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
      });
    });
  });
});
