"use client";

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * The signature background: a field of coloured bars that grow from zero height
 * and loop, clustered toward the edges so the centre stays clear for content.
 *
 * Generated from a seeded PRNG rather than hand-authored states. The original
 * ships five Framer variants per side, but those are just hand-made randomness —
 * a seeded generator reproduces the effect with tunable density and far less
 * data.
 *
 * The seed must be fixed: this renders on the server and again on the client,
 * and any time- or `Math.random()`-based source would produce different markup
 * on each side, which is a hydration error.
 *
 * Bars animate `scaleY` from a bottom or top origin — a compositor-only
 * property. Animating `height` here would force layout on every frame for every
 * bar.
 */

/**
 * Mulberry32 — a small, fast, well-distributed 32-bit PRNG. Deterministic for a
 * given seed, which is the whole point.
 */
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
  "var(--mh-blue-50)",
] as const;

type Bar = {
  /** Horizontal position within the field, as a percentage. */
  left: number;
  /** Vertical position of the bar's anchored edge, as a percentage. */
  top: number;
  width: number;
  height: number;
  color: string;
  /** Which edge the bar grows from. */
  origin: "top" | "bottom";
  delay: number;
  duration: number;
};

function generateBars(seed: number, count: number): Bar[] {
  const random = createRandom(seed);
  const { minHeight, maxHeight, widths, growDuration, stagger, holdDuration } = patternField;
  const cycle = growDuration + holdDuration;

  return Array.from({ length: count }, (_, i) => {
    const top = random() * 85;
    // Clamp so a bar never extends past the bottom of the field. Without this a
    // tall bar with a low anchor is silently clipped by the overflow, which
    // reads as a truncated rectangle rather than a deliberate one.
    const height = Math.min((minHeight + random() * (maxHeight - minHeight)) * 100, 100 - top);

    return {
      left: random() * 100,
      top,
      height,
      width: widths[Math.floor(random() * widths.length)],
      color: BAR_COLORS[Math.floor(random() * BAR_COLORS.length)],
      origin: random() > 0.5 ? ("top" as const) : ("bottom" as const),
      // Spread starts across the cycle so bars ripple rather than pulse together.
      delay: (i * stagger) % cycle,
      duration: cycle,
    };
  });
}

type PatternFieldProps = {
  /** Which edge of the viewport this field occupies. */
  side: "left" | "right";
  className?: string;
};

export function PatternField({ side, className }: PatternFieldProps) {
  const reduced = useReducedMotion() ?? false;

  // Generated once per side. `patternField.count.desktop` is used for the markup
  // and denser bars are hidden by CSS at smaller widths, so the server and
  // client always agree on the DOM regardless of viewport.
  const bars = useMemo(
    () => generateBars(patternField.seeds[side], patternField.count.desktop),
    [side],
  );

  const { count } = patternField;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 overflow-hidden", className)}
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          // Bars beyond the tablet/mobile budgets are dropped by CSS rather than
          // by branching on viewport in JS, which would desync SSR markup.
          data-over-tablet={i >= count.tablet ? "" : undefined}
          data-over-mobile={i >= count.mobile ? "" : undefined}
          className="absolute block will-change-transform data-[over-mobile]:hidden tablet:data-[over-mobile]:block desktop:data-[over-tablet]:block tablet:data-[over-tablet]:hidden"
          style={{
            left: `${bar.left}%`,
            top: `${bar.top}%`,
            width: `${bar.width}px`,
            height: `${bar.height}%`,
            background: bar.color,
            transformOrigin: bar.origin,
            // Reduced motion holds the bars at their generated height so the
            // composition still reads, without any movement.
            transform: reduced ? "scaleY(1)" : undefined,
            animation: reduced
              ? undefined
              : `mh-bar-grow ${bar.duration}ms ${bar.delay}ms infinite`,
          }}
        />
      ))}
    </div>
  );
}
