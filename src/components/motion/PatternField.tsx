"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * The signature background: a field of pastel bars that switch on and off
 * between a set of fixed arrangements.
 *
 * Structure mirrors the Framer component: seven flush horizontal rows, each
 * holding five to seven bars laid out side by side. Because a row lays its bars
 * out in normal flow rather than at absolute offsets, bars cannot overlap —
 * which an earlier absolute-positioned version did.
 *
 * Motion: each bar has one target height and toggles between 0 and that target.
 * It never drifts between arbitrary intermediate values. This is also what
 * makes the arrangement appear to rearrange between states — every bar keeps
 * its position and width, and only its on/off state changes, so bars appear to
 * come and go rather than move.
 *
 * The bar set is generated from a fixed seed so server and client produce
 * identical markup; an unseeded source would be a hydration error.
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
  width: number;
  color: string;
  /** Which edge of the row the bar grows from. */
  origin: "top" | "bottom";
  /** Height as a fraction of the row when switched on. */
  target: number;
  /** Whether the bar is switched on, per state. */
  on: boolean[];
  marginLeft: number;
};

type Row = {
  bars: Bar[];
  insetLeft: number;
  insetRight: number;
};

function generateRows(seed: number): Row[] {
  const random = createRandom(seed);
  const {
    rows,
    barsPerRow,
    minTarget,
    maxTarget,
    onProbability,
    widths,
    stateCount,
    maxBarOffset,
    maxRowInset,
  } = patternField;

  return Array.from({ length: rows }, () => {
    const count =
      barsPerRow.min + Math.floor(random() * (barsPerRow.max - barsPerRow.min + 1));

    const bars = Array.from({ length: count }, () => {
      const on = Array.from({ length: stateCount }, () => random() < onProbability);
      // A bar that is never on would just be dead markup, so guarantee one.
      if (!on.some(Boolean)) on[Math.floor(random() * stateCount)] = true;

      return {
        width: widths[Math.floor(random() * widths.length)],
        color: BAR_COLORS[Math.floor(random() * BAR_COLORS.length)],
        origin: random() > 0.5 ? ("top" as const) : ("bottom" as const),
        target: minTarget + random() * (maxTarget - minTarget),
        on,
        marginLeft: Math.round(random() * maxBarOffset),
      };
    });

    return {
      bars,
      insetLeft: random() * maxRowInset,
      insetRight: random() * maxRowInset,
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
  const [state, setState] = useState(0);

  const { rows, stateCount, stateInterval, spring } = patternField;
  const rowSet = useMemo(() => generateRows(patternField.seeds[side]), [side]);

  // Cycle through the arrangements. Held still under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setState((s) => (s + 1) % stateCount), stateInterval);
    return () => clearInterval(id);
  }, [reduced, stateCount, stateInterval]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 overflow-hidden", className)}
    >
      {rowSet.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-stretch justify-between"
          style={{
            height: `${100 / rows}%`,
            paddingLeft: `${row.insetLeft}%`,
            paddingRight: `${row.insetRight}%`,
          }}
        >
          {row.bars.map((bar, barIndex) => (
            <motion.span
              key={barIndex}
              // Trailing bars are dropped at narrower widths in CSS rather than
              // by branching in JS, which would desync the SSR markup.
              className="mh-bar block shrink-0"
              style={{
                width: `${bar.width}px`,
                marginLeft: barIndex === 0 ? 0 : `${bar.marginLeft}px`,
                background: bar.color,
                transformOrigin: bar.origin,
              }}
              // `initial` renders inline during SSR, so the first paint already
              // shows state 0 and nothing snaps on hydration.
              initial={{ scaleY: bar.on[0] ? bar.target : 0 }}
              animate={{ scaleY: bar.on[state] ? bar.target : 0 }}
              transition={reduced ? { duration: 0 } : spring}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
