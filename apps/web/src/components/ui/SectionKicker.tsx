import clsx from 'clsx';

type SectionKickerProps = Readonly<{
  children: string;
  className?: string;
}>;

export function SectionKicker({ children, className }: SectionKickerProps) {
  return (
    <div className={clsx('mb-3 text-xs font-extrabold tracking-[0.16em] text-overline', className)}>
      {children}
    </div>
  );
}
