"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * The signature background: columns of pastel cells that open and close.
 *
 * Structure mirrors the Framer component. A field is seven vertical columns
 * (`1st`..`7th`) flush against each other, each stacking five to seven cells
 * (`1`..`7`) with no gap. Every cell holds one bar that grows within its own
 * slot, so bars in a column share an x position and width.
 *
 * Geometry (column widths, cell heights) is fixed. Only which cells are open
 * changes between states, and each cell toggles between 0 and a single target
 * height — never drifting through intermediate values.
 *
 * Spacing is what gives the field its breathing room, and it is enforced when
 * the states are built rather than left to chance:
 *
 *  - No two vertically adjacent cells in a column are open at once, so cells
 *    cannot stack into one tall block.
 *  - An open cell's vertical span may not overlap an open cell in the
 *    neighbouring column, so bars cannot merge side by side.
 *
 * Rolling each cell independently produced clusters of touching bars, which
 * read as heavy and unlike the reference. Density alone cannot fix that — it is
 * about where open cells land relative to each other.
 *
 * Generated from a fixed seed so server and client produce identical markup;
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
  weight: number;
  /** Vertical span within the column, 0–1, used for the spacing checks. */
  start: number;
  end: number;
  target: number;
  color: string;
  origin: "top" | "bottom";
  open: boolean[];
  stagger: number;
};

type Column = {
  width: number;
  cells: Cell[];
};

type Span = { start: number; end: number };

/** True when two vertical spans touch or overlap, allowing for the gap. */
function overlaps(a: Span, b: Span, gap: number) {
  return a.start < b.end + gap && b.start < a.end + gap;
}

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
    minGap,
  } = patternField;

  // 1. Geometry. Fixed for the lifetime of the field.
  const grid: Column[] = Array.from({ length: columns }, () => {
    const count =
      cellsPerColumn.min +
      Math.floor(random() * (cellsPerColumn.max - cellsPerColumn.min + 1));

    const weights = Array.from(
      { length: count },
      () => minCellWeight + random() * (maxCellWeight - minCellWeight),
    );
    const total = weights.reduce((a, b) => a + b, 0);

    let cursor = 0;
    const cells = weights.map((weight) => {
      const start = cursor;
      cursor += weight / total;
      return {
        weight,
        start,
        end: cursor,
        target: minTarget + random() * (maxTarget - minTarget),
        color: BAR_COLORS[Math.floor(random() * BAR_COLORS.length)],
        origin: random() > 0.5 ? ("top" as const) : ("bottom" as const),
        open: Array.from({ length: stateCount }, () => false),
        stagger: Math.round(random() * maxStagger),
      };
    });

    return { width: columnWidths[Math.floor(random() * columnWidths.length)], cells };
  });

  // 2. Fill each state, honouring the spacing rules. Walking left to right and
  //    top to bottom means every decision only needs to look at the column
  //    already placed and the cell directly above.
  for (let state = 0; state < stateCount; state += 1) {
    let previousColumnSpans: Span[] = [];

    for (const column of grid) {
      const spans: Span[] = [];
      let previousCellOpen = false;

      column.cells.forEach((cell) => {
        const span = { start: cell.start, end: cell.end };

        const blockedVertically = previousCellOpen;
        const blockedHorizontally = previousColumnSpans.some((other) =>
          overlaps(span, other, minGap),
        );

        const wants = random() < showProbability;
        const isOpen = wants && !blockedVertically && !blockedHorizontally;

        cell.open[state] = isOpen;
        previousCellOpen = isOpen;
        if (isOpen) spans.push(span);
      });

      previousColumnSpans = spans;
    }
  }

  // 3. A cell identical in every state would never animate. Give it one state
  //    where it differs, choosing a state in which doing so breaks no rule.
  for (let columnIndex = 0; columnIndex < grid.length; columnIndex += 1) {
    const column = grid[columnIndex];

    column.cells.forEach((cell, cellIndex) => {
      if (!cell.open.every((v) => v === cell.open[0])) return;

      const span = { start: cell.start, end: cell.end };

      for (let state = 0; state < stateCount; state += 1) {
        const above = column.cells[cellIndex - 1]?.open[state] ?? false;
        const below = column.cells[cellIndex + 1]?.open[state] ?? false;
        const neighbourClash = [grid[columnIndex - 1], grid[columnIndex + 1]].some(
          (neighbour) =>
            neighbour?.cells.some(
              (other) => other.open[state] && overlaps(span, other, minGap),
            ),
        );

        if (!above && !below && !neighbourClash) {
          cell.open[state] = !cell.open[state];
          return;
        }
      }
    });
  }

  return grid;
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
