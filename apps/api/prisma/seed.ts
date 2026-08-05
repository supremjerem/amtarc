import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

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

// Demo match, so a fresh install has something to show on /matchs and in the
// admin squadding board. Ids are fixed and every write is an upsert, so
// re-seeding never duplicates it.
const SEED_MATCH_ID = 'seed-match-level-ii';

const SEED_SQUADS = [
  { id: 'seed-squad-1', label: 'Squad 1', dayOffset: 0, startTime: '08:30' },
  { id: 'seed-squad-2', label: 'Squad 2', dayOffset: 0, startTime: '09:00' },
  { id: 'seed-squad-3', label: 'Squad 3', dayOffset: 1, startTime: '08:30' },
];

// Fictional shooters — these names are rendered on the public squad roster.
const SEED_REGISTRATIONS = [
  ['Camille', 'Duprat', 'seed-squad-1', 'PRODUCTION_OPTICS', 'LADY', 'CONFIRMED'],
  ['Antoine', 'Berthier', 'seed-squad-1', 'PRODUCTION', 'OVERALL', 'CONFIRMED'],
  ['Sofia', 'Renard', 'seed-squad-1', 'OPEN', 'LADY', 'CONFIRMED'],
  ['Marc', 'Olivier', 'seed-squad-2', 'STANDARD', 'SENIOR', 'CONFIRMED'],
  ['Léo', 'Bastien', 'seed-squad-2', 'PCC', 'JUNIOR', 'CONFIRMED'],
  ['Anne', 'Vidal', 'seed-squad-3', 'CLASSIC', 'SENIOR', 'CONFIRMED'],
  // Not yet squadded, and one still owing the transfer: both states are
  // visible on the public page and on the admin board.
  ['Paul', 'Chatelain', null, 'REVOLVER', 'OVERALL', 'CONFIRMED'],
  ['Nina', 'Roux', null, 'PRODUCTION', 'LADY', 'AWAITING_PAYMENT'],
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function atMidnight(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

async function seedDemoMatch() {
  // Dates are relative to the seed run so the demo match is always upcoming
  // with registrations still open, however old the checkout is.
  const startDate = new Date(Date.now() + 45 * DAY_MS);
  const endDate = new Date(startDate.getTime() + DAY_MS);
  const registrationDeadline = new Date(startDate.getTime() - 9 * DAY_MS);

  await prisma.match.upsert({
    where: { id: SEED_MATCH_ID },
    update: {},
    create: {
      id: SEED_MATCH_ID,
      title: 'Match Level II de Meauzac',
      description:
        'Match de niveau II sur le stand de Chapas. Douze stages, terrain varié, chronographe sur place.',
      location: 'Meauzac (82)',
      startDate,
      endDate,
      stages: 12,
      rounds: 320,
      feeCents: 5500,
      registrationDeadline,
      published: true,
      paymentPayee: 'AMTARC',
      paymentIban: 'FR76 3000 4000 0300 0000 0000 143',
      paymentInstructions: 'Merci d’indiquer votre référence d’inscription en libellé du virement.',
    },
  });

  for (const [position, squad] of SEED_SQUADS.entries()) {
    await prisma.squad.upsert({
      where: { id: squad.id },
      update: {},
      create: {
        id: squad.id,
        matchId: SEED_MATCH_ID,
        label: squad.label,
        day: atMidnight(new Date(startDate.getTime() + squad.dayOffset * DAY_MS)),
        startTime: squad.startTime,
        targetSize: 12,
        position,
      },
    });
  }

  for (const [
    index,
    [firstName, lastName, squadId, division, category, status],
  ] of SEED_REGISTRATIONS.entries()) {
    const number = String(index + 1).padStart(5, '0');
    await prisma.registration.upsert({
      where: { id: `seed-registration-${number}` },
      update: {},
      create: {
        id: `seed-registration-${number}`,
        reference: `AMT-S${number}`,
        matchId: SEED_MATCH_ID,
        squadId,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.test`,
        licenceNumber: `0000000${number}`,
        club: index % 3 === 0 ? 'AMTARC' : 'TSC Montauban',
        division,
        category,
        status,
      },
    });
  }
}

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

  await seedDemoMatch();

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
