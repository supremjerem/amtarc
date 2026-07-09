import type { ReactNode } from 'react';
import clsx from 'clsx';

type ContainerProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={clsx('mx-auto w-full max-w-[1240px] px-[28px]', className)}>{children}</div>
  );
}
