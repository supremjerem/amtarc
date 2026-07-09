'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { animate } from 'motion';

type StatCounterProps = Readonly<{
  target: number;
  suffix?: string;
  className?: string;
}>;

// Replaces the design reference's IntersectionObserver + rAF counter (same
// 1300ms duration and `1 - (1-p)^3` ease-out cubic easing) with Motion's
// value animation, triggered once when the element enters the viewport.
export function StatCounter({ target, suffix = '', className }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, target, {
      duration: 1.3,
      ease: (t: number) => 1 - Math.pow(1 - t, 3),
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, target]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
