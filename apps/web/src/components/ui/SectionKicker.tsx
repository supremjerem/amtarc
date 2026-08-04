import clsx from 'clsx';

type SectionKickerProps = Readonly<{
  children: string;
  className?: string;
}>;

/**
 * Section label, set in the data face with a gold tick — the same treatment as
 * the figures in match tables, so labels across the site read as one family of
 * instrument markings rather than decorative eyebrows.
 */
export function SectionKicker({ children, className }: SectionKickerProps) {
  return (
    <div className={clsx('data-label mb-3 flex items-center gap-2.5 text-overline', className)}>
      <span aria-hidden="true" className="h-px w-6 bg-gold-gradient" />
      {children}
    </div>
  );
}
