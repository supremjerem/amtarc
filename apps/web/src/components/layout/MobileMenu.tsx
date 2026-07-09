'use client';

import { useState } from 'react';
import Link from 'next/link';
import { navLinks } from '@/lib/content';
import { PillButton } from '@/components/ui/PillButton';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
      >
        <span
          className={`block h-[2px] w-5 bg-ink transition-transform duration-200 ${
            open ? 'translate-y-[7px] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[2px] w-5 bg-ink transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
        />
        <span
          className={`block h-[2px] w-5 bg-ink transition-transform duration-200 ${
            open ? '-translate-y-[7px] -rotate-45' : ''
          }`}
        />
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[60px] flex flex-col gap-1 border-b border-ink/[0.08] bg-white/95 p-6 shadow-[0_4px_24px_rgba(20,16,8,0.06)] backdrop-blur-[18px]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-[15px] font-semibold text-ink-secondary hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <PillButton href="#contact" variant="gold" className="mt-3 justify-center">
            Nous rejoindre
          </PillButton>
        </div>
      )}
    </div>
  );
}
