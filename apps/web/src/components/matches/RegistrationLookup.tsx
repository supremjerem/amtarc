'use client';

import { useState } from 'react';
import { lookupRegistration, STATUS_LABELS, type LookupResult } from '@/lib/registrations';

export function RegistrationLookup() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await lookupRegistration(reference.trim(), email.trim()));
    } catch {
      setError('Aucune inscription trouvée pour cette référence et cet email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-ink/10 bg-white p-7 shadow-card">
      <h2 className="mb-1 text-xl font-extrabold tracking-[-0.01em]">Suivre mon inscription</h2>
      <p className="mb-4 text-sm text-ink-soft">
        Retrouvez le statut de votre inscription avec la référence reçue par email.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Référence</span>
          <input
            required
            value={reference}
            placeholder="AMT-XXXXXX"
            onChange={(e) => setReference(e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2 font-mono text-sm outline-none focus:border-orange"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-pill bg-gold-gradient px-5 py-2.5 text-sm font-extrabold text-ink disabled:opacity-60"
        >
          {loading ? 'Recherche…' : 'Vérifier'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 text-sm">
          <p>
            <span className="font-semibold">{result.match.title}</span> — statut :{' '}
            <span className="font-extrabold">{STATUS_LABELS[result.status]}</span>
          </p>
          {result.payment && (
            <p className="mt-2 whitespace-pre-line text-ink-soft">{result.payment}</p>
          )}
        </div>
      )}
    </div>
  );
}
