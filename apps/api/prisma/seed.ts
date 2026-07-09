import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SEED_NEWS = [
  {
    slug: 'concours-interne-fin-de-saison',
    category: 'CONCOURS' as const,
    title: 'Concours interne de fin de saison',
    excerpt:
      "Retrouvez le calendrier des compétitions et les classements du club, mis à jour tout au long de l'année.",
    body: "Retrouvez le calendrier des compétitions et les classements du club, mis à jour tout au long de l'année.",
  },
  {
    slug: 'amelioration-continue-du-stand',
    category: 'TRAVAUX' as const,
    title: 'Amélioration continue du stand',
    excerpt:
      'Pas de tir, alvéoles, buttes : les bénévoles entretiennent et modernisent les installations en permanence.',
    body: 'Pas de tir, alvéoles, buttes : les bénévoles entretiennent et modernisent les installations en permanence.',
  },
  {
    slug: 'bourse-aux-armes',
    category: 'EVENEMENT' as const,
    title: 'Bourse aux armes',
    excerpt:
      'Un rendez-vous attendu des passionnés. Achat, vente et échange dans le respect de la réglementation.',
    body: 'Un rendez-vous attendu des passionnés. Achat, vente et échange dans le respect de la réglementation.',
  },
];

async function main() {
  for (const news of SEED_NEWS) {
    await prisma.news.upsert({
      where: { slug: news.slug },
      update: {},
      create: news,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, passwordHash, name: 'Admin AMTARC' },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
