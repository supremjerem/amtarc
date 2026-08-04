'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';

/**
 * Applies the user's motion preference to every animation on the site.
 *
 * `reducedMotion="user"` disables transform and layout animation when the OS
 * asks for reduced motion, while leaving opacity fades in place — movement is
 * what causes vestibular discomfort, not a cross-fade.
 *
 * Handling this centrally (rather than branching on `useReducedMotion()` inside
 * each component) also keeps the server and client trees identical, so the
 * preference can never cause a hydration mismatch.
 */
export function MotionProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
