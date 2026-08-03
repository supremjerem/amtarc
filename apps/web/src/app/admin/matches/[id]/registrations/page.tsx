'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  cancelRegistration,
  CATEGORY_LABELS,
  DIVISION_LABELS,
  downloadRegistrationsCsv,
  listMatchRegistrations,
  markRegistrationPaid,
  STATUS_LABELS,
  type Registration,
} from '@/lib/registrations';

const STATUS_STYLES: Record<Registration['status'], string> = {
  AWAITING_PAYMENT: 'bg-cream-50 text-ink',
  CONFIRMED: 'bg-green-100 text-green-800',
  WAITLISTED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function MatchRegistrationsPage() {
  const params = useParams<{ id: string }>();
  const [items, setItems] = useState<Registration[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await listMatchRegistrations(params.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les inscriptions.');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial client-side data fetch
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load only depends on params.id
  }, [params.id]);

  async function act(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-[0.02em]">Inscriptions</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              act(async () => {
                await downloadRegistrationsCsv(params.id);
              })
            }
            className="rounded-pill bg-gold-gradient px-5 py-2.5 text-sm font-extrabold text-ink"
          >
            Exporter en CSV
          </button>
          <Link
            href="/admin/matches"
            className="text-sm font-semibold text-ink-soft hover:text-ink"
          >
            ← Matchs
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}
      {!items && !error && <p className="text-sm text-ink-soft">Chargement…</p>}
      {items && items.length === 0 && (
        <p className="text-sm text-ink-soft">Aucune inscription pour le moment.</p>
      )}

      {items && items.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-ink/10 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-extrabold tracking-[0.08em] text-overline">
                <th className="px-4 py-3">TIREUR</th>
                <th className="px-4 py-3">DIVISION</th>
                <th className="px-4 py-3">RÉFÉRENCE</th>
                <th className="px-4 py-3">SOUHAITE TIRER AVEC</th>
                <th className="px-4 py-3">STATUT</th>
                <th className="px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-ink/5 align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {item.firstName} {item.lastName}
                    </div>
                    <div className="text-xs text-ink-soft">
                      {item.email} · lic. {item.licenceNumber}
                      {item.club ? ` · ${item.club}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {DIVISION_LABELS[item.division]}
                    <div className="text-xs text-ink-soft">{CATEGORY_LABELS[item.category]}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{item.reference}</td>
                  <td className="px-4 py-3 text-xs text-ink-soft">
                    {item.squadRequests.map((request) => request.requestedName).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-pill px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[item.status]}`}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs font-semibold">
                      {item.status === 'AWAITING_PAYMENT' && (
                        <button
                          type="button"
                          onClick={() => act(() => markRegistrationPaid(item.id))}
                          className="text-left text-green-700 hover:text-green-900"
                        >
                          Virement reçu ✓
                        </button>
                      )}
                      {item.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Annuler l'inscription de ${item.firstName} ${item.lastName} ?`,
                              )
                            ) {
                              act(() => cancelRegistration(item.id));
                            }
                          }}
                          className="text-left text-red-600 hover:text-red-800"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
