import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { CapacityGauge } from '@/components/matches/CapacityGauge';
import { RegistrationForm } from '@/components/matches/RegistrationForm';
import {
  formatDay,
  formatFee,
  formatMatchDates,
  getPublishedMatch,
  matchCapacity,
  remainingSpots,
} from '@/lib/matches';

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const match = await getPublishedMatch((await params).id);
  return { title: match ? `${match.title} — AMTARC` : 'Match — AMTARC' };
}

export default async function MatchDetailPage({ params }: PageProps) {
  const match = await getPublishedMatch((await params).id);
  if (!match) notFound();

  const deadline = match.registrationDeadline
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(match.registrationDeadline),
      )
    : null;
  const registrationsClosed = match.registrationDeadline
    ? new Date() > new Date(match.registrationDeadline)
    : false;
  const capacity = matchCapacity(match);
  const remaining = remainingSpots(match);
  const paymentRecap = [
    match.paymentPayee && `Bénéficiaire : ${match.paymentPayee}`,
    match.paymentIban && `IBAN : ${match.paymentIban}`,
    `Montant : ${formatFee(match.feeCents)}`,
    match.paymentInstructions,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="relative w-full overflow-hidden bg-page-gradient">
      <Nav />
      <main className="min-h-screen pt-[124px] pb-24">
        <Container className="max-w-4xl">
          <Link href="/matchs" className="text-sm font-semibold text-ink-soft hover:text-ink">
            ← Tous les matchs
          </Link>
          <div className="data-label mt-4 text-overline">
            {formatMatchDates(match)} · {match.location}
          </div>
          <Heading
            as="h1"
            static
            className="mt-2 mb-4 text-[clamp(32px,4.4vw,52px)] leading-[1.02]"
          >
            {match.title}
          </Heading>

          {match.description && (
            <p className="mb-8 max-w-2xl leading-[1.6] whitespace-pre-line text-ink-body">
              {match.description}
            </p>
          )}

          {/*
            The match read as one instrument panel rather than five loose stat
            cards: a single enclosure, hairline-divided, figures in the data
            face so they align down the row.
          */}
          <Reveal className="mb-10 overflow-hidden rounded-card border border-ink/10 bg-white shadow-card">
            <div className="grid grid-cols-2 divide-ink/10 md:grid-cols-4 md:divide-x">
              {match.stages && (
                <div className="border-b border-ink/10 p-5 md:border-b-0">
                  <div className="data-figure text-[26px] leading-none">{match.stages}</div>
                  <div className="data-label mt-2 text-ink-soft">stages</div>
                </div>
              )}
              {match.rounds && (
                <div className="border-b border-l border-ink/10 p-5 md:border-b-0 md:border-l-0">
                  <div className="data-figure text-[26px] leading-none">≈{match.rounds}</div>
                  <div className="data-label mt-2 text-ink-soft">coups</div>
                </div>
              )}
              <div className="border-b border-ink/10 p-5 md:border-b-0">
                <div className="data-figure text-[26px] leading-none">
                  {formatFee(match.feeCents)}
                </div>
                <div className="data-label mt-2 text-ink-soft">engagement</div>
              </div>
              {deadline && (
                <div className="border-b border-l border-ink/10 p-5 md:border-b-0 md:border-l-0">
                  <div className="data-figure text-[15px] leading-tight">{deadline}</div>
                  <div className="data-label mt-2 text-ink-soft">clôture</div>
                </div>
              )}
            </div>

            {capacity !== null && remaining !== null && (
              <div className="border-t border-ink/10 bg-cream-50 px-5 py-4">
                <CapacityGauge capacity={capacity} remaining={remaining} />
              </div>
            )}
          </Reveal>

          {match.squads.length > 0 && (
            <>
              <Heading className="mb-4 text-[22px]">Squads</Heading>
              <Reveal className="mb-10 overflow-x-auto rounded-card border border-ink/10 bg-white shadow-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink/10 bg-cream-50">
                      <th className="data-label px-5 py-3.5 text-overline">Squad</th>
                      <th className="data-label px-5 py-3.5 text-overline">Jour</th>
                      <th className="data-label px-5 py-3.5 text-overline">Départ</th>
                      <th className="data-label px-5 py-3.5 text-overline">Places</th>
                      <th className="data-label px-5 py-3.5 text-overline">Tireurs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.squads.map((squad) => {
                      const shooters = (match.registrations ?? []).filter(
                        (registration) => registration.squadId === squad.id,
                      );
                      const squadFull = shooters.length >= squad.targetSize;

                      return (
                        <tr
                          key={squad.id}
                          className="border-b border-ink/5 align-top transition-colors last:border-0 hover:bg-cream-50"
                        >
                          <td className="display px-5 py-3.5 text-[15px] whitespace-nowrap">
                            {squad.label}
                          </td>
                          <td className="px-5 py-3.5 capitalize">{formatDay(squad.day)}</td>
                          <td className="data-figure px-5 py-3.5 text-[13px] whitespace-nowrap">
                            {squad.startTime}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={clsx(
                                'data-figure text-[13px]',
                                squadFull && 'text-ink-soft',
                              )}
                            >
                              {shooters.length}
                              <span className="text-ink-soft">/{squad.targetSize}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-ink-soft">
                            {shooters
                              .map(
                                (registration) =>
                                  `${registration.firstName} ${registration.lastName}`,
                              )
                              .join(', ') || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Reveal>
              {(match.registrations ?? []).some((registration) => !registration.squadId) && (
                <p className="-mt-6 mb-10 text-sm text-ink-soft">
                  En attente de squad :{' '}
                  {(match.registrations ?? [])
                    .filter((registration) => !registration.squadId)
                    .map((registration) => `${registration.firstName} ${registration.lastName}`)
                    .join(', ')}
                </p>
              )}
            </>
          )}

          <Heading className="mb-4 text-[22px]">Inscription</Heading>
          {registrationsClosed ? (
            <p className="mb-10 text-sm text-ink-soft">
              Les inscriptions sont closes pour ce match.
            </p>
          ) : (
            <div className="mb-10">
              {remaining === 0 && (
                <p className="mb-4 text-sm font-semibold text-ink-soft">
                  Le match est complet — vous pouvez encore vous inscrire en liste d&apos;attente.
                </p>
              )}
              <RegistrationForm matchId={match.id} paymentRecap={paymentRecap || null} />
            </div>
          )}

          {(match.paymentIban || match.paymentInstructions) && (
            <div className="rounded-card border border-ink/10 bg-white p-7 shadow-card">
              <Heading className="mb-3 text-[22px]">Règlement de l&apos;engagement</Heading>
              <p className="mb-3 text-sm text-ink-soft">
                Le paiement se fait par virement bancaire au club organisateur.
              </p>
              {match.paymentPayee && (
                <p className="text-sm">
                  <span className="font-semibold">Bénéficiaire :</span> {match.paymentPayee}
                </p>
              )}
              {match.paymentIban && (
                <p className="text-sm">
                  <span className="font-semibold">IBAN :</span>{' '}
                  <span className="font-mono">{match.paymentIban}</span>
                </p>
              )}
              {match.paymentInstructions && (
                <p className="mt-3 text-sm whitespace-pre-line text-ink-body">
                  {match.paymentInstructions}
                </p>
              )}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
