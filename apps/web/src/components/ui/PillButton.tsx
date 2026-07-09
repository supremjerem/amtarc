import Link from 'next/link';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type PillButtonVariant = 'gold' | 'gold-lg' | 'dark' | 'outline';

type PillButtonProps = Readonly<{
  href: string;
  children: ReactNode;
  variant?: PillButtonVariant;
  external?: boolean;
  className?: string;
}>;

const VARIANT_CLASSES: Record<PillButtonVariant, string> = {
  gold: 'bg-gold-gradient text-ink font-extrabold shadow-btn-gold hover:brightness-[1.04] hover:-translate-y-0.5',
  'gold-lg':
    'bg-gold-gradient text-ink font-extrabold shadow-btn-gold-lg hover:brightness-[1.04] hover:-translate-y-0.5',
  dark: 'bg-brand text-white font-bold hover:bg-brand-black hover:-translate-y-0.5',
  outline: 'bg-white/75 border border-ink/15 text-ink font-bold hover:bg-white',
};

export function PillButton({
  href,
  children,
  variant = 'dark',
  external,
  className,
}: PillButtonProps) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener' : undefined}
      className={clsx(
        'inline-flex items-center gap-2 rounded-pill px-7 py-3.5 text-[15px] transition-all duration-200 ease-out',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
