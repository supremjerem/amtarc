'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      if (!response.ok) throw new Error('Identifiants invalides.');
      router.replace('/admin/news');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 font-body text-ink">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-ink/10 bg-white p-8 shadow-card"
      >
        <h1 className="mb-6 font-display text-2xl tracking-[0.03em]">AMTARC · Admin</h1>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">
            Mot de passe
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
          />
        </label>

        {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-pill bg-gold-gradient px-5 py-3 text-sm font-extrabold text-ink disabled:opacity-60"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
