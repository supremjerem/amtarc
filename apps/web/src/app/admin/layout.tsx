'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();

  // Access gating happens in src/proxy.ts (cookie check) and in the API
  // (JWT validation on every proxied request).
  if (pathname === '/admin/login') return children;

  return (
    <div className="min-h-screen bg-cream-50 font-body text-ink">
      <header className="flex items-center justify-between border-b border-ink/10 bg-white px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin/news" className="display-wordmark text-xl">
            AMTARC · Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold text-ink-secondary">
            <Link href="/admin/news" className="hover:text-ink">
              Actualités
            </Link>
            <Link href="/admin/matches" className="hover:text-ink">
              Matchs
            </Link>
            <Link href="/admin/content" className="hover:text-ink">
              Contenu du site
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace('/admin/login');
          }}
          className="text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Déconnexion
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-8 py-10">{children}</main>
    </div>
  );
}
