'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { navLinks } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { PillButton } from '@/components/ui/PillButton';
import { MobileMenu } from './MobileMenu';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScrolled = () => {
      setScrolled(window.scrollY > 24);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScrolled);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed inset-x-0 top-0 z-[100] backdrop-saturate-[1.8] backdrop-blur-[18px] transition-[background-color,border-color,box-shadow] duration-[350ms] ease-in-out',
        scrolled
          ? 'border-b border-ink/[0.08] bg-white/85 shadow-[0_4px_24px_rgba(20,16,8,0.06)]'
          : 'border-b border-transparent bg-white/40',
      )}
    >
      <Container className="flex h-[60px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/panther.png"
            alt="Panthère AMTARC"
            width={698}
            height={760}
            className="h-[34px] w-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
            priority
          />
          <span className="display-wordmark bg-gold-gradient bg-clip-text text-2xl leading-none text-transparent [-webkit-text-stroke:0.6px_rgba(20,16,8,0.55)]">
            AMTARC
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13.5px] font-semibold text-ink-secondary transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <PillButton href="/#contact" variant="gold" className="px-[18px] py-2 text-[13px]">
            Nous rejoindre
          </PillButton>
        </div>

        <MobileMenu />
      </Container>
    </nav>
  );
}
