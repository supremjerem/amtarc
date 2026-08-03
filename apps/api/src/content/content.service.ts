import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import type { Prisma } from '../../generated/prisma/client';

// Sections the web app knows how to render; keep in sync with
// apps/web/src/lib/site-content.ts.
export const SECTION_KEYS = ['hero', 'announcements', 'practical-info', 'contact'] as const;

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.siteContent.findMany();
    return Object.fromEntries(rows.map((row) => [row.key, row.data]));
  }

  async upsert(key: string, data: Prisma.InputJsonObject) {
    if (!(SECTION_KEYS as readonly string[]).includes(key)) {
      throw new BadRequestException(`Unknown content section "${key}"`);
    }
    const row = await this.prisma.siteContent.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
    await this.revalidate.notify('content');
    return row;
  }
}
