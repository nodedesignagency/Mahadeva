"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * The signature background: a field of pastel bars that morph between a set of
 * fixed arrangements.
 *
 * This mirrors how the original is authored in Framer. It is *not* a continuous
 * loop of bars growing from zero — there are N discrete variants
 * ("Animation State 1..N"), each a fixed arrangement, and Framer springs
 * between them on a timer. Each bar keeps its column and width; only its height
 * changes per state, which is what reads as the pattern rearranging itself.
 *
 * Two details matter for fidelity:
 *
 *  - Bars are sized relative to a *row*, not the whole field. The original's
 *    bars occupy roughly 5–22% of the hero, and treating the full height as the
 *    range makes them far too tall.
 *  - The morph is a duration-based spring (2s, no bounce), not an ease. A
 *    cubic-bezier here reads noticeably more mechanical.
 *
 * The bar set is generated from a fixed seed so server and client produce
 * identical markup — an unseeded source would be a hydration error.
 */

/** Mulberry32 — small, fast, deterministic for a given seed. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The pastel set the bars are drawn from, as theme token references. */
const BAR_COLORS = [
  "var(--mh-lavender-50)",
  "var(--mh-lavender)",
  "var(--mh-peach)",
  "var(--mh-yellow)",
  "var(--mh-green)",
  "var(--mh-green-200)",
  "var(--mh-blue-150)",
  "var(--mh-blue-25)",
] as const;

type Bar = {
  /** Horizontal position within the field, as a percentage. Fixed across states. */
  left: number;
  /** Which row the bar belongs to. */
  row: number;
  width: number;
  color: string;
  /** Which edge of its row the bar grows from. */
  origin: "top" | "bottom";
  /** Height as a fraction of the row, one entry per state. */
  scales: number[];
};

function generateBars(seed: number, count: number): Bar[] {
  const random = createRandom(seed);
  const { rows, minScale, maxScale, widths, stateCount } = patternField;

  return Array.from({ length: count }, () => ({
    left: random() * 88,
    row: Math.floor(random() * rows),
    width: widths[Math.floor(random() * widths.length)],
    color: BAR_COLORS[Math.floor(random() * BAR_COLORS.length)],
    origin: random() > 0.5 ? ("top" as const) : ("bottom" as const),
    scales: Array.from(
      { length: stateCount },
      () => minScale + random() * (maxScale - minScale),
    ),
  }));
}

type PatternFieldProps = {
  /** Which edge of the viewport this field occupies. */
  side: "left" | "right";
  className?: string;
};

export function PatternField({ side, className }: PatternFieldProps) {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState(0);

  const { rows, count, stateCount, stateInterval, spring } = patternField;

  const bars = useMemo(() => generateBars(patternField.seeds[side], count.desktop), [side, count.desktop]);

  // Cycle through the arrangements. Held still under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setState((s) => (s + 1) % stateCount), stateInterval);
    return () => clearInterval(id);
  }, [reduced, stateCount, stateInterval]);

  const rowHeight = 100 / rows;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 overflow-hidden", className)}
    >
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          // Bars past the tablet/mobile budgets are dropped in CSS rather than
          // by branching on viewport in JS, which would desync SSR markup.
          data-over-tablet={i >= count.tablet ? "" : undefined}
          data-over-mobile={i >= count.mobile ? "" : undefined}
          className="absolute block will-change-transform data-[over-mobile]:hidden tablet:data-[over-mobile]:block tablet:data-[over-tablet]:hidden desktop:data-[over-tablet]:block"
          style={{
            left: `${bar.left}%`,
            top: `${bar.row * rowHeight}%`,
            width: `${bar.width}px`,
            height: `${rowHeight}%`,
            background: bar.color,
            transformOrigin: bar.origin,
          }}
          // `initial` renders inline during SSR, so the first paint already
          // shows state 0 and nothing snaps on hydration.
          initial={{ scaleY: bar.scales[0] }}
          animate={{ scaleY: bar.scales[state] }}
          transition={reduced ? { duration: 0 } : spring}
        />
      ))}
    </div>
  );
}
