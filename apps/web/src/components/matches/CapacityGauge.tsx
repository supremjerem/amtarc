'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import clsx from 'clsx';

type CapacityGaugeProps = Readonly<{
  capacity: number;
  remaining: number;
  className?: string;
}>;

/**
 * How full a match is, read as a gauge rather than a sentence.
 *
 * The bar fills to its true proportion when it scrolls into view — the same
 * "arrive, then settle" logic as the display headings, applied to data. Once a
 * match is full the track turns to ink, so a closed match reads at a glance.
 */
export function CapacityGauge({ capacity, remaining, className }: CapacityGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  const taken = Math.max(0, capacity - remaining);
  const ratio = capacity > 0 ? Math.min(1, taken / capacity) : 0;
  const full = remaining <= 0;

  return (
    <div ref={ref} className={clsx('w-full', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="data-label text-ink-soft">{full ? 'Complet' : 'Places'}</span>
        <span className="data-figure text-[13px] text-ink">
          {taken}
          <span className="text-ink-soft">/{capacity}</span>
        </span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-pill bg-ink/[0.09]">
        <motion.div
          className={clsx('h-full rounded-pill', full ? 'bg-brand' : 'bg-gold-gradient')}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isInView ? ratio : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left', width: '100%' }}
        />
      </div>
    </div>
  );
}
