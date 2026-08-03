import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { formatFee, formatMatchDates, getPublishedMatches } from '@/lib/matches';

export const metadata: Metadata = {
  title: 'Matchs — AMTARC',
  description: 'Les compétitions organisées par l’AMTARC : dates, lieux, squads et inscriptions.',
};

export default async function MatchesPage() {
  const matches = await getPublishedMatches();

  return (
    <div className="relative w-full overflow-hidden bg-page-gradient">
      <Nav />
      <main className="min-h-screen pt-[124px] pb-24">
        <Container>
          <SectionKicker>COMPÉTITIONS</SectionKicker>
          <h1 className="mb-8 text-[clamp(30px,4vw,46px)] leading-[1.02] font-extrabold tracking-[-0.02em]">
            Les matchs du club.
          </h1>

          {matches.length === 0 && (
            <p className="text-ink-soft">
              Aucun match publié pour le moment — revenez bientôt, la saison se prépare.
            </p>
          )}

          <ul className="flex flex-col gap-4">
            {matches.map((match) => (
              <li
                key={match.id}
                className="rounded-card border border-ink/10 bg-white p-7 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-extrabold tracking-[0.08em] text-overline">
                      {formatMatchDates(match)} · {match.location}
                    </div>
                    <h2 className="mt-1 text-[22px] font-extrabold tracking-[-0.01em]">
                      {match.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      {match.stages ? `${match.stages} stages · ` : ''}
                      {match.rounds ? `≈${match.rounds} coups · ` : ''}
                      {formatFee(match.feeCents)}
                    </p>
                  </div>
                  <Link
                    href={`/matchs/${match.id}`}
                    className="rounded-pill bg-gold-gradient px-5 py-2.5 text-sm font-extrabold text-ink"
                  >
                    Détails →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
