import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
}

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  findPublished() {
    return this.prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Public route: unpublished drafts must stay invisible, like matches.
  async findBySlug(slug: string) {
    const item = await this.prisma.news.findUnique({ where: { slug } });
    if (!item || !item.published) throw new NotFoundException(`News "${slug}" not found`);
    return item;
  }

  async findOne(id: string) {
    const item = await this.prisma.news.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`News "${id}" not found`);
    return item;
  }

  async create(dto: CreateNewsDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    const created = await this.prisma.news.create({
      data: { ...dto, slug },
    });
    await this.revalidate.notify('news');
    return created;
  }

  async update(id: string, dto: UpdateNewsDto) {
    const updated = await this.prisma.news.update({
      where: { id },
      data: dto,
    });
    await this.revalidate.notify('news');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.prisma.news.delete({ where: { id } });
    await this.revalidate.notify('news');
    return removed;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;
    while (await this.prisma.news.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }
}
