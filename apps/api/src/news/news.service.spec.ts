import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
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
  let fetchMock: jest.Mock;

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
    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const moduleRef = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                WEB_REVALIDATE_URL: 'http://web.test/api/revalidate',
                REVALIDATE_SECRET: 'test-secret',
              })[key],
          },
        },
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

    it('should notify the web app for revalidation', async () => {
      prisma.news.findUnique.mockResolvedValue(null);
      prisma.news.create.mockResolvedValue(newsItem);

      await service.create(dto);

      expect(fetchMock).toHaveBeenCalledWith('http://web.test/api/revalidate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret: 'test-secret', tag: 'news' }),
      });
    });

    it('should not fail when the revalidation webhook is down', async () => {
      prisma.news.findUnique.mockResolvedValue(null);
      prisma.news.create.mockResolvedValue(newsItem);
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.create(dto)).resolves.toEqual(newsItem);
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
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete and notify revalidation', async () => {
      prisma.news.delete.mockResolvedValue(newsItem);

      await service.remove('news-1');

      expect(prisma.news.delete).toHaveBeenCalledWith({ where: { id: 'news-1' } });
      expect(fetchMock).toHaveBeenCalled();
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
