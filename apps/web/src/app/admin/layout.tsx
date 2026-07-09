'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearToken, getToken } from '@/lib/auth';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !getToken()) {
      router.replace('/admin/login');
      return;
    }
    // Gating protected content on a client-only localStorage check, not derived render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [isLoginPage, router]);

  if (isLoginPage) return children;
  if (!ready) return null;

  return (
    <div className="min-h-screen bg-cream-50 font-body text-ink">
      <header className="flex items-center justify-between border-b border-ink/10 bg-white px-8 py-4">
        <Link href="/admin/news" className="font-display text-xl tracking-[0.03em]">
          AMTARC · Admin
        </Link>
        <button
          type="button"
          onClick={() => {
            clearToken();
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
