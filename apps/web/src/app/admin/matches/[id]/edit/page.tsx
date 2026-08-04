'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MatchForm, type MatchFormValues } from '@/components/admin/MatchForm';
import { getAdminMatch, updateMatch, type MatchFormInput } from '@/lib/admin-matches';

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export default function EditMatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<MatchFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminMatch(params.id)
      .then((match) =>
        setInitialValues({
          title: match.title,
          description: match.description ?? '',
          location: match.location,
          startDate: toDateInput(match.startDate),
          endDate: toDateInput(match.endDate),
          stages: match.stages?.toString() ?? '',
          rounds: match.rounds?.toString() ?? '',
          feeEuros: (match.feeCents / 100).toString(),
          registrationDeadline: toDateInput(match.registrationDeadline),
          published: match.published,
          paymentIban: match.paymentIban ?? '',
          paymentPayee: match.paymentPayee ?? '',
          paymentInstructions: match.paymentInstructions ?? '',
          squads: match.squads.map((squad) => ({
            label: squad.label,
            day: toDateInput(squad.day),
            startTime: squad.startTime,
            targetSize: squad.targetSize.toString(),
          })),
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : 'Match introuvable.'));
  }, [params.id]);

  async function handleSubmit(values: MatchFormInput) {
    await updateMatch(params.id, values);
    router.push('/admin/matches');
  }

  return (
    <div>
      <h1 className="mb-6 display text-2xl">Modifier le match</h1>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!initialValues && !error && <p className="text-sm text-ink-soft">Chargement…</p>}
      {initialValues && (
        <MatchForm
          submitLabel="Enregistrer"
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
