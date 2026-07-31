"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * The signature background: columns of pastel cells that open and close.
 *
 * Structure mirrors the Framer component exactly. A field is seven vertical
 * columns (`1st`..`7th`) sitting flush against each other with no horizontal
 * gap. Each column stacks five to seven cells (`1`..`7`) top to bottom, again
 * with no gap. Every cell holds one bar that grows within its own slot, so
 * bars in a column share an x position and width — they are vertically
 * aligned, and cells in neighbouring columns can meet to read as one larger
 * block.
 *
 * Motion: each cell has a single target height and toggles between 0 and that
 * target, never drifting through intermediate values. A cell may stay open
 * across consecutive states, so bars arrive, hold, and give way to others; each
 * is guaranteed to change at least once per loop so nothing sits frozen.
 *
 * Generated from a fixed seed so server and client produce identical markup —
 * an unseeded source would be a hydration error.
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

/** The pastel set the cells are drawn from, as theme token references. */
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

type Cell = {
  /** Share of the column's height this cell occupies. */
  weight: number;
  /** How full the cell is when open, as a fraction of its slot. */
  target: number;
  color: string;
  /** Which edge of its slot the bar grows from. */
  origin: "top" | "bottom";
  /** Whether the cell is open, per state. */
  open: boolean[];
  /** Milliseconds this cell's change is offset by. */
  stagger: number;
};

type Column = {
  width: number;
  cells: Cell[];
};

function generateColumns(seed: number): Column[] {
  const random = createRandom(seed);
  const {
    columns,
    cellsPerColumn,
    minCellWeight,
    maxCellWeight,
    minTarget,
    maxTarget,
    showProbability,
    columnWidths,
    stateCount,
    maxStagger,
  } = patternField;

  return Array.from({ length: columns }, () => {
    const count =
      cellsPerColumn.min +
      Math.floor(random() * (cellsPerColumn.max - cellsPerColumn.min + 1));

    const cells = Array.from({ length: count }, () => {
      const open = Array.from({ length: stateCount }, () => random() < showProbability);

      // A cell identical in every state would never animate. Flip one so every
      // cell takes part in the loop at least once.
      if (open.every((v) => v === open[0])) {
        const i = Math.floor(random() * stateCount);
        open[i] = !open[i];
      }

      return {
        weight: minCellWeight + random() * (maxCellWeight - minCellWeight),
        target: minTarget + random() * (maxTarget - minTarget),
        color: BAR_COLORS[Math.floor(random() * BAR_COLORS.length)],
        origin: random() > 0.5 ? ("top" as const) : ("bottom" as const),
        open,
        stagger: Math.round(random() * maxStagger),
      };
    });

    return {
      width: columnWidths[Math.floor(random() * columnWidths.length)],
      cells,
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

  const { stateCount, stateInterval, transition } = patternField;
  const columns = useMemo(() => generateColumns(patternField.seeds[side]), [side]);

  // Cycle through the arrangements. Held still under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setState((s) => (s + 1) % stateCount), stateInterval);
    return () => clearInterval(id);
  }, [reduced, stateCount, stateInterval]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 flex overflow-hidden", className)}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          // Columns are flush: no gap, so neighbouring cells can form one block.
          className="mh-col flex h-full shrink-0 flex-col"
          style={{ width: `${column.width}px` }}
        >
          {column.cells.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              // The slot holds its height regardless of the bar's scale, so the
              // stack never reflows as cells open and close.
              className="w-full"
              style={{ flex: `${cell.weight} 1 0%` }}
            >
              <motion.span
                className="block h-full w-full will-change-transform"
                style={{ background: cell.color, transformOrigin: cell.origin }}
                // `initial` renders inline during SSR, so the first paint
                // already shows state 0 and nothing snaps on hydration.
                initial={{ scaleY: cell.open[0] ? cell.target : 0 }}
                animate={{ scaleY: cell.open[state] ? cell.target : 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { ...transition, delay: cell.stagger / 1000 }
                }
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
