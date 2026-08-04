'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAdminMatch } from '@/lib/admin-matches';
import type { Match } from '@/lib/matches';
import {
  applySquadding,
  DIVISION_LABELS,
  getSquaddingProposal,
  listMatchRegistrations,
  type Registration,
} from '@/lib/registrations';

// Only shooters holding a spot get squadded.
const SQUADDABLE = new Set(['AWAITING_PAYMENT', 'CONFIRMED']);

export default function SquaddingPage() {
  const params = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);
  const [assignment, setAssignment] = useState<Record<string, string | null>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminMatch(params.id), listMatchRegistrations(params.id)])
      .then(([loadedMatch, loadedRegistrations]) => {
        setMatch(loadedMatch);
        setRegistrations(loadedRegistrations);
        setAssignment(
          Object.fromEntries(
            loadedRegistrations
              .filter((registration) => SQUADDABLE.has(registration.status))
              .map((registration) => [registration.id, registration.squadId]),
          ),
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible.'));
  }, [params.id]);

  const shooters = useMemo(
    () => (registrations ?? []).filter((registration) => SQUADDABLE.has(registration.status)),
    [registrations],
  );

  async function generateProposal() {
    setError(null);
    setStatus('idle');
    try {
      const proposal = await getSquaddingProposal(params.id);
      const next: Record<string, string | null> = {};
      for (const shooter of shooters) next[shooter.id] = null;
      for (const entry of proposal.assignments) {
        for (const registrationId of entry.registrationIds) {
          next[registrationId] = entry.squadId;
        }
      }
      setAssignment(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de générer la proposition.');
    }
  }

  async function save() {
    setStatus('saving');
    setError(null);
    try {
      const updated = await applySquadding(
        params.id,
        Object.entries(assignment).map(([registrationId, squadId]) => ({
          registrationId,
          squadId,
        })),
      );
      setRegistrations(updated);
      setStatus('saved');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : "L'enregistrement a échoué.");
    }
  }

  function ShooterCard({ shooter }: Readonly<{ shooter: Registration }>) {
    return (
      <div className="rounded-lg border border-ink/10 bg-cream-50 px-3 py-2">
        <div className="text-sm font-semibold">
          {shooter.firstName} {shooter.lastName}
          <span className="ml-2 text-xs font-normal text-ink-soft">
            {DIVISION_LABELS[shooter.division]}
          </span>
        </div>
        {shooter.squadRequests.length > 0 && (
          <div className="text-xs text-ink-soft">
            Souhaite : {shooter.squadRequests.map((request) => request.requestedName).join(', ')}
          </div>
        )}
        <select
          aria-label={`Squad de ${shooter.firstName} ${shooter.lastName}`}
          value={assignment[shooter.id] ?? ''}
          onChange={(event) => {
            setStatus('idle');
            setAssignment((current) => ({
              ...current,
              [shooter.id]: event.target.value || null,
            }));
          }}
          className="mt-1 w-full rounded-lg border border-ink/15 px-2 py-1 text-xs outline-none focus:border-orange"
        >
          <option value="">Non squadé</option>
          {match?.squads.map((squad) => (
            <option key={squad.id} value={squad.id}>
              {squad.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const unassigned = shooters.filter((shooter) => !assignment[shooter.id]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-2xl">Squadding{match ? ` — ${match.title}` : ''}</h1>
        <Link href="/admin/matches" className="text-sm font-semibold text-ink-soft hover:text-ink">
          ← Matchs
        </Link>
      </div>

      {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}
      {(!match || !registrations) && !error && <p className="text-sm text-ink-soft">Chargement…</p>}

      {match && registrations && (
        <>
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={generateProposal}
              className="rounded-pill bg-gold-gradient px-5 py-2.5 text-sm font-extrabold text-ink"
            >
              Générer une proposition
            </button>
            <button
              type="button"
              onClick={save}
              disabled={status === 'saving'}
              className="rounded-pill bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {status === 'saving' ? 'Enregistrement…' : 'Enregistrer la répartition'}
            </button>
            {status === 'saved' && (
              <span className="text-sm font-semibold text-green-700">
                Répartition enregistrée ✓
              </span>
            )}
          </div>

          {shooters.length === 0 && (
            <p className="text-sm text-ink-soft">Aucun tireur actif à répartir.</p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {match.squads.map((squad) => {
              const members = shooters.filter((shooter) => assignment[shooter.id] === squad.id);
              const overCapacity = members.length > squad.targetSize;
              return (
                <div
                  key={squad.id}
                  className="rounded-card border border-ink/10 bg-white p-4 shadow-card"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-extrabold">{squad.label}</span>
                    <span
                      className={`text-sm font-bold ${overCapacity ? 'text-red-600' : 'text-ink-soft'}`}
                    >
                      {members.length} / {squad.targetSize}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {members.map((shooter) => (
                      <ShooterCard key={shooter.id} shooter={shooter} />
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="rounded-card border border-dashed border-ink/20 bg-white/60 p-4">
              <div className="mb-3 font-extrabold text-ink-soft">
                Non squadés ({unassigned.length})
              </div>
              <div className="flex flex-col gap-2">
                {unassigned.map((shooter) => (
                  <ShooterCard key={shooter.id} shooter={shooter} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
