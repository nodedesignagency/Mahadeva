"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, staggerParent, stagger as staggerTokens, viewport } from "@/lib/motion";
import { motionTags, type MotionTagName } from "@/lib/motionTag";

/**
 * Sequences a list of children into view.
 *
 * Wrap the group in `StaggerGroup` and each child in `StaggerItem`. Framer
 * Motion propagates the `hidden`/`visible` states down automatically, so no
 * per-child delay arithmetic is needed — which is what keeps grids consistent
 * when items are added or reordered.
 */

type StaggerGroupProps = {
  children: ReactNode;
  /** Seconds between children. */
  each?: number;
  /** Seconds before the first child starts. */
  delayChildren?: number;
  as?: MotionTagName;
  className?: string;
};

export function StaggerGroup({
  children,
  each = staggerTokens.base,
  delayChildren = 0,
  as,
  className,
}: StaggerGroupProps) {
  const reduced = useReducedMotion() ?? false;
  const Component = as ? motionTags[as] : motion.div;

  return (
    <Component
      className={className}
      variants={staggerParent(reduced, each, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </Component>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  distance?: number;
  as?: MotionTagName;
  className?: string;
};

export function StaggerItem({ children, distance = 24, as, className }: StaggerItemProps) {
  const reduced = useReducedMotion() ?? false;
  const Component = as ? motionTags[as] : motion.div;

  return (
    <Component className={className} variants={fadeUp(reduced, distance)}>
      {children}
    </Component>
  );
}
