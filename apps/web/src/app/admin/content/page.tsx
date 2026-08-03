import Link from 'next/link';
import { SECTION_CONFIGS } from '@/lib/admin-content';

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl tracking-[0.02em]">Contenu du site</h1>
      <ul className="flex flex-col gap-3">
        {SECTION_CONFIGS.map((section) => (
          <li
            key={section.key}
            className="flex items-center justify-between rounded-card border border-ink/10 bg-white p-5 shadow-card"
          >
            <div>
              <div className="font-semibold">{section.title}</div>
              <div className="text-sm text-ink-soft">{section.description}</div>
            </div>
            <Link
              href={`/admin/content/${section.key}`}
              className="text-sm font-semibold text-ink-secondary hover:text-ink"
            >
              Modifier
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
