'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NewsForm } from '@/components/admin/NewsForm';
import { getAdminNews, updateNews, type NewsFormInput } from '@/lib/admin-news';

export default function EditNewsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<NewsFormInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminNews(params.id)
      .then((item) =>
        setInitialValues({
          title: item.title,
          category: item.category,
          excerpt: item.excerpt ?? '',
          body: item.body,
          imageUrl: item.imageUrl ?? '',
          published: item.published,
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : 'Actu introuvable.'));
  }, [params.id]);

  async function handleSubmit(values: NewsFormInput) {
    await updateNews(params.id, values);
    router.push('/admin/news');
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl tracking-[0.02em]">Modifier l&apos;actu</h1>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!initialValues && !error && <p className="text-sm text-ink-soft">Chargement…</p>}
      {initialValues && (
        <NewsForm submitLabel="Enregistrer" initialValues={initialValues} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
