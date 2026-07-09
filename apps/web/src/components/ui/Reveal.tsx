'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

type RevealProps = Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
}>;

// Replaces the design reference's `animation-timeline: view()` scroll-driven
// reveal — flagged in the handoff README as unreliable cross-browser (it left
// sections stuck at low opacity). whileInView + IntersectionObserver under
// the hood is the robust equivalent.
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
