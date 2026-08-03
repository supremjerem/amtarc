import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
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
          <div className="mt-3 text-xs font-extrabold tracking-[0.08em] text-overline">
            {formatMatchDates(match)} · {match.location}
          </div>
          <h1 className="mt-1 mb-4 text-[clamp(30px,4vw,46px)] leading-[1.02] font-extrabold tracking-[-0.02em]">
            {match.title}
          </h1>

          {match.description && (
            <p className="mb-8 max-w-2xl leading-[1.6] whitespace-pre-line text-ink-body">
              {match.description}
            </p>
          )}

          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {match.stages && (
              <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card">
                <div className="text-2xl font-extrabold">{match.stages}</div>
                <div className="text-sm text-ink-soft">stages</div>
              </div>
            )}
            {match.rounds && (
              <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card">
                <div className="text-2xl font-extrabold">≈{match.rounds}</div>
                <div className="text-sm text-ink-soft">coups</div>
              </div>
            )}
            <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card">
              <div className="text-2xl font-extrabold">{formatFee(match.feeCents)}</div>
              <div className="text-sm text-ink-soft">engagement</div>
            </div>
            {deadline && (
              <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card">
                <div className="text-base font-extrabold">{deadline}</div>
                <div className="text-sm text-ink-soft">clôture des inscriptions</div>
              </div>
            )}
            {capacity !== null && (
              <div className="rounded-card border border-ink/10 bg-white p-5 shadow-card">
                <div className="text-2xl font-extrabold">
                  {remaining} / {capacity}
                </div>
                <div className="text-sm text-ink-soft">places restantes</div>
              </div>
            )}
          </div>

          {match.squads.length > 0 && (
            <>
              <h2 className="mb-4 text-xl font-extrabold tracking-[-0.01em]">Squads</h2>
              <div className="mb-10 overflow-x-auto rounded-card border border-ink/10 bg-white shadow-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink/10 text-xs font-extrabold tracking-[0.08em] text-overline">
                      <th className="px-5 py-3">SQUAD</th>
                      <th className="px-5 py-3">JOUR</th>
                      <th className="px-5 py-3">DÉPART</th>
                      <th className="px-5 py-3">PLACES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.squads.map((squad) => (
                      <tr key={squad.id} className="border-b border-ink/5 last:border-0">
                        <td className="px-5 py-3 font-semibold">{squad.label}</td>
                        <td className="px-5 py-3 capitalize">{formatDay(squad.day)}</td>
                        <td className="px-5 py-3">{squad.startTime}</td>
                        <td className="px-5 py-3">{squad.targetSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h2 className="mb-4 text-xl font-extrabold tracking-[-0.01em]">Inscription</h2>
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
              <h2 className="mb-3 text-xl font-extrabold tracking-[-0.01em]">
                Règlement de l&apos;engagement
              </h2>
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
