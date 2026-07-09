'use client';

import { useState } from 'react';
import type { NewsFormInput } from '@/lib/admin-news';
import type { NewsCategory } from '@/lib/content';

const CATEGORIES: NewsCategory[] = ['CONCOURS', 'TRAVAUX', 'EVENEMENT'];

type NewsFormProps = Readonly<{
  initialValues?: NewsFormInput;
  submitLabel: string;
  onSubmit: (values: NewsFormInput) => Promise<void>;
}>;

const EMPTY_VALUES: NewsFormInput = {
  title: '',
  category: 'CONCOURS',
  excerpt: '',
  body: '',
  imageUrl: '',
  published: true,
};

export function NewsForm({ initialValues, submitLabel, onSubmit }: NewsFormProps) {
  const [values, setValues] = useState<NewsFormInput>(initialValues ?? EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...values,
        excerpt: values.excerpt || undefined,
        imageUrl: values.imageUrl || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Titre</span>
        <input
          required
          value={values.title}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Catégorie</span>
        <select
          value={values.category}
          onChange={(event) =>
            setValues({ ...values, category: event.target.value as NewsCategory })
          }
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Résumé</span>
        <input
          value={values.excerpt}
          onChange={(event) => setValues({ ...values, excerpt: event.target.value })}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">Texte</span>
        <textarea
          required
          rows={6}
          value={values.body}
          onChange={(event) => setValues({ ...values, body: event.target.value })}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">
          URL de l&apos;image (optionnel)
        </span>
        <input
          value={values.imageUrl}
          onChange={(event) => setValues({ ...values, imageUrl: event.target.value })}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(event) => setValues({ ...values, published: event.target.checked })}
        />
        <span className="text-sm font-semibold text-ink-secondary">Publié</span>
      </label>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-pill bg-gold-gradient px-6 py-3 text-sm font-extrabold text-ink disabled:opacity-60"
      >
        {saving ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  );
}
