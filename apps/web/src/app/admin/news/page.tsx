'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteNews, listAdminNews, type AdminNewsItem } from '@/lib/admin-news';

export default function AdminNewsListPage() {
  const [items, setItems] = useState<AdminNewsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await listAdminNews());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les actus.');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial client-side data fetch
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Supprimer « ${title} » ?`)) return;
    await deleteNews(id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-[0.02em]">Actualités</h1>
        <Link
          href="/admin/news/new"
          className="rounded-pill bg-gold-gradient px-5 py-2.5 text-sm font-extrabold text-ink"
        >
          + Nouvelle actu
        </Link>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!items && !error && <p className="text-sm text-ink-soft">Chargement…</p>}

      {items && items.length === 0 && (
        <p className="text-sm text-ink-soft">Aucune actu pour le moment.</p>
      )}

      <ul className="flex flex-col gap-3">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-card border border-ink/10 bg-white p-5 shadow-card"
          >
            <div>
              <div className="text-xs font-extrabold tracking-[0.08em] text-overline">
                {item.category} {!item.published && '· BROUILLON'}
              </div>
              <div className="font-semibold">{item.title}</div>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link
                href={`/admin/news/${item.id}/edit`}
                className="text-ink-secondary hover:text-ink"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(item.id, item.title)}
                className="text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
