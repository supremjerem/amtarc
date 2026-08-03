'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ContentSectionForm } from '@/components/admin/ContentSectionForm';
import { fetchSectionValues, getSectionConfig } from '@/lib/admin-content';

export default function EditContentSectionPage() {
  const params = useParams<{ key: string }>();
  const config = getSectionConfig(params.key);
  const [initialValues, setInitialValues] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    fetchSectionValues(config.key)
      .then(setInitialValues)
      .catch((err) => setError(err instanceof Error ? err.message : 'Section introuvable.'));
  }, [config]);

  if (!config) {
    return <p className="text-sm font-semibold text-red-600">Section inconnue.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-[0.02em]">{config.title}</h1>
        <Link href="/admin/content" className="text-sm font-semibold text-ink-soft hover:text-ink">
          ← Contenu du site
        </Link>
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {initialValues === null && !error && <p className="text-sm text-ink-soft">Chargement…</p>}
      {initialValues !== null && (
        <ContentSectionForm config={config} initialValues={initialValues} />
      )}
    </div>
  );
}
