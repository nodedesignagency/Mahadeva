"use client";

import { motion, useReducedMotion } from "motion/react";
import { maskReveal, stagger as staggerTokens, staggerParent, viewport } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { motionTags, type MotionTagName } from "@/lib/motionTag";

/**
 * Masked line-by-line heading reveal: each line slides up from behind a clipped
 * wrapper.
 *
 * Lines are passed in explicitly rather than measured from a rendered string.
 * That is deliberate — measuring line breaks requires reading layout on the
 * client, which means either a hydration mismatch or a flash of unstyled text,
 * and it silently breaks when a font loads late. Explicit lines are also how
 * the original was almost certainly authored, since Framer text layers hold
 * their own line breaks.
 *
 * Accessibility: the lines are joined into a single accessible string on the
 * host element and the visual pieces are hidden from assistive tech, so a
 * screen reader announces one heading rather than several fragments.
 */

type SplitTextProps = {
  lines: string[];
  as?: MotionTagName;
  /** Play on mount (hero) instead of on scroll into view (everything else). */
  trigger?: "mount" | "inView";
  delay?: number;
  each?: number;
  id?: string;
  className?: string;
  lineClassName?: string;
};

export function SplitText({
  lines,
  as: Tag = "h2",
  trigger = "inView",
  delay = 0,
  each = staggerTokens.base,
  id,
  className,
  lineClassName,
}: SplitTextProps) {
  const reduced = useReducedMotion() ?? false;
  const MotionTag = motionTags[Tag];

  const animationProps =
    trigger === "mount"
      ? { animate: "visible" as const }
      : { whileInView: "visible" as const, viewport };

  return (
    <MotionTag
      id={id}
      className={cn("font-display", className)}
      aria-label={lines.join(" ")}
      variants={staggerParent(reduced, each, delay)}
      initial="hidden"
      {...animationProps}
    >
      {lines.map((line, i) => (
        // The clip wrapper is what makes the reveal read as a mask rather than
        // a slide. `pb`/`-mb` prevents descenders being shaved off by the clip.
        <span
          key={i}
          aria-hidden="true"
          className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span className={cn("block", lineClassName)} variants={maskReveal(reduced)}>
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
