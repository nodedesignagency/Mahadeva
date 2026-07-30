"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, transitions, viewport } from "@/lib/motion";
import { motionTags, type MotionTagName } from "@/lib/motionTag";

/**
 * The workhorse scroll entrance: fade + rise once, when the element comes into
 * view.
 *
 * Two properties matter for correctness:
 *
 * 1. SSR-safe. The markup renders with its real content and layout; only
 *    opacity/transform differ before hydration, so there is no hydration
 *    mismatch and no layout shift.
 * 2. Reduced-motion honest. When the user asks for less motion, the transform
 *    is dropped and the element is simply present — never hidden.
 */

type RevealProps = {
  children: ReactNode;
  /** Rise distance in px. */
  distance?: number;
  /** Seconds before the animation begins. */
  delay?: number;
  as?: MotionTagName;
  className?: string;
};

export function Reveal({ children, distance = 32, delay = 0, as, className }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  const Component = as ? motionTags[as] : motion.div;

  return (
    <Component
      className={className}
      variants={fadeUp(reduced, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={
        reduced ? transitions.instant : { ...transitions.base, delay }
      }
    >
      {children}
    </Component>
  );
}
