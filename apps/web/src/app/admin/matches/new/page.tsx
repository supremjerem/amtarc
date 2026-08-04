'use client';

import { useRouter } from 'next/navigation';
import { MatchForm } from '@/components/admin/MatchForm';
import { createMatch, type MatchFormInput } from '@/lib/admin-matches';

export default function NewMatchPage() {
  const router = useRouter();

  async function handleSubmit(values: MatchFormInput) {
    await createMatch(values);
    router.push('/admin/matches');
  }

  return (
    <div>
      <h1 className="mb-6 display text-2xl">Nouveau match</h1>
      <MatchForm submitLabel="Créer" onSubmit={handleSubmit} />
    </div>
  );
}
