'use client';

import { useRouter } from 'next/navigation';
import { NewsForm } from '@/components/admin/NewsForm';
import { createNews, type NewsFormInput } from '@/lib/admin-news';

export default function NewNewsPage() {
  const router = useRouter();

  async function handleSubmit(values: NewsFormInput) {
    await createNews(values);
    router.push('/admin/news');
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl tracking-[0.02em]">Nouvelle actu</h1>
      <NewsForm submitLabel="Créer" onSubmit={handleSubmit} />
    </div>
  );
}
