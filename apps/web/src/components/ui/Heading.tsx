'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { useInView } from 'motion/react';
import clsx from 'clsx';

type HeadingProps = Readonly<{
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Skip the scroll-in animation for headings already visible on load. */
  static?: boolean;
}>;

/**
 * The site's display heading, and its signature motion.
 *
 * Archivo is loaded with its `wdth` axis, so the heading enters compressed
 * (wdth 85) and settles to full width (wdth 100) once it scrolls into view.
 * The widest state is the final one, so line count is fixed by the end state
 * and the animation never reflows the page.
 *
 * `prefers-reduced-motion` is handled in CSS: `.display-compressed` collapses
 * to the full-width setting, so the heading simply renders finished.
 */
export function Heading({
  as: Tag = 'h2',
  children,
  className,
  static: isStatic = false,
}: HeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const settled = isStatic || isInView;

  return (
    <Tag
      ref={ref}
      className={clsx('display display-animated', !settled && 'display-compressed', className)}
    >
      {children}
    </Tag>
  );
}
