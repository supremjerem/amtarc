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
//
// Deliberately understated: the rise is short (14px) so that attention stays
// on the heading's width-axis entrance, which is the page's signature motion.
//
// Reduced motion is handled globally by `MotionProvider`, which drops the rise
// and keeps the fade. Branching here instead would change the rendered tree
// between server and client and break hydration.
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = Readonly<{
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  step?: number;
}>;

/**
 * Reveals a grid or list one item at a time. Children are wrapped by
 * `StaggerItem`, which inherits the timing from this container.
 */
export function Stagger({ children, className, step = 0.07 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ visible: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  );
}

const STAGGER_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function StaggerItem({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <motion.div className={className} variants={STAGGER_ITEM_VARIANTS}>
      {children}
    </motion.div>
  );
}
