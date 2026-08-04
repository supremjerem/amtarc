import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
import { SectionKicker } from '@/components/ui/SectionKicker';
import { Heading } from '@/components/ui/Heading';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { CapacityGauge } from '@/components/matches/CapacityGauge';
import { RegistrationLookup } from '@/components/matches/RegistrationLookup';
import {
  formatFee,
  formatMatchDates,
  getPublishedMatches,
  matchCapacity,
  remainingSpots,
} from '@/lib/matches';

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
          <Reveal className="mb-9">
            <SectionKicker>COMPÉTITIONS</SectionKicker>
            <Heading as="h1" className="text-[clamp(32px,4.4vw,52px)] leading-[1.02]">
              Les matchs du club.
            </Heading>
          </Reveal>

          {matches.length === 0 && (
            <p className="text-ink-soft">
              Aucun match publié pour le moment — revenez bientôt, la saison se prépare.
            </p>
          )}

          <Stagger className="flex flex-col gap-4">
            {matches.map((match) => {
              const capacity = matchCapacity(match);
              const remaining = remainingSpots(match);

              return (
                <StaggerItem key={match.id}>
                  <Link
                    href={`/matchs/${match.id}`}
                    className="group block rounded-card border border-ink/10 bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-orange/45 hover:shadow-card-hover"
                  >
                    {/*
                      Three columns rather than a left block and a far-right
                      rail: identity, then the match's measurements, then where
                      it stands and how to enter. Without the middle column the
                      card's centre reads as a void at desktop widths.
                    */}
                    <div className="grid grid-cols-1 items-start gap-x-10 gap-y-6 md:grid-cols-[minmax(0,1fr)_auto_190px]">
                      <div className="min-w-0">
                        <div className="data-label text-overline">
                          {formatMatchDates(match)} · {match.location}
                        </div>
                        <h2 className="mt-2 display text-[24px] leading-[1.1]">{match.title}</h2>
                      </div>

                      <dl className="flex flex-wrap items-baseline gap-x-7 gap-y-2">
                        {match.stages && (
                          <div>
                            <dd className="data-figure text-[19px]">{match.stages}</dd>
                            <dt className="data-label mt-0.5 text-ink-soft">stages</dt>
                          </div>
                        )}
                        {match.rounds && (
                          <div>
                            <dd className="data-figure text-[19px]">≈{match.rounds}</dd>
                            <dt className="data-label mt-0.5 text-ink-soft">coups</dt>
                          </div>
                        )}
                        <div>
                          <dd className="data-figure text-[19px]">{formatFee(match.feeCents)}</dd>
                          <dt className="data-label mt-0.5 text-ink-soft">engagement</dt>
                        </div>
                      </dl>

                      <div className="flex flex-col items-start gap-4">
                        {capacity !== null && remaining !== null && (
                          <CapacityGauge capacity={capacity} remaining={remaining} />
                        )}
                        <span className="inline-flex items-center gap-2 rounded-pill bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink transition-transform duration-200 group-hover:translate-x-0.5">
                          Détails
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>

          <div className="mt-10">
            <RegistrationLookup />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
