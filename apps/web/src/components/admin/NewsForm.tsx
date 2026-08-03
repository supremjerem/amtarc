'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/admin-content';
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
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setValues((current) => ({ ...current, imageUrl: url }));
    } catch {
      setError("Le téléversement de l'image a échoué.");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

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

      <div className="flex flex-col gap-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">
            Image (optionnel)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            disabled={uploading}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-pill file:border-0 file:bg-gold-gradient file:px-4 file:py-1.5 file:text-xs file:font-extrabold disabled:opacity-60"
          />
        </label>
        {uploading && <p className="text-sm text-ink-soft">Téléversement…</p>}
        {values.imageUrl && (
          <div className="flex items-center gap-3">
            {/* Simple thumbnail of an admin-provided URL; next/image needs remote host config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.imageUrl}
              alt="Aperçu"
              className="h-16 w-24 rounded-lg border border-ink/10 object-cover"
            />
            <button
              type="button"
              onClick={() => setValues({ ...values, imageUrl: '' })}
              className="text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Retirer l&apos;image
            </button>
          </div>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-secondary">
            ou URL de l&apos;image
          </span>
          <input
            value={values.imageUrl}
            onChange={(event) => setValues({ ...values, imageUrl: event.target.value })}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-orange"
          />
        </label>
      </div>

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
