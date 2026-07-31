/**
 * Pattern field generation.
 *
 * Pure layout logic, deliberately separate from the component that renders it:
 * it has no React dependency, so the rules below can be exercised directly.
 *
 * Three rules shape the result, all enforced here rather than left to chance —
 * independent random choices produced clustering, colour dominance and a false
 * sense of movement:
 *
 *  - Spacing: no two vertically adjacent cells open at once, and an open cell
 *    never comes within a small gap of one in the neighbouring column, so every
 *    bar keeps clear space around it.
 *  - Hand-off: a cell may not open in a state if a vertical neighbour was open
 *    in the state before. Otherwise one closes as the other opens and the eye
 *    reads a single bar sliding up or down and changing colour.
 *  - Colour: dealt from a balanced deck rather than sampled per cell, and never
 *    repeated beside itself, so no colour dominates a state.
 *
 * Everything derives from a fixed seed, so the server and the client produce
 * identical markup; an unseeded source would be a hydration error.
 */

import { patternField } from "@/config/animation";

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

/**
 * The pastel set, as theme token references. One entry per hue so the deal
 * below spreads them evenly — adding two near-identical greens here would make
 * green twice as likely as any other colour.
 */
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

export type Cell = {
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

export type Column = { width: number; cells: Cell[] };
type Span = { start: number; end: number };

/** True when two vertical spans touch or overlap, allowing for the gap. */
function overlaps(a: Span, b: Span, gap: number) {
  return a.start < b.end + gap && b.start < a.end + gap;
}

export function generateColumns(seed: number): Column[] {
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
        color: "",
        origin: random() > 0.5 ? ("top" as const) : ("bottom" as const),
        open: Array.from({ length: stateCount }, () => false),
        stagger: Math.round(random() * maxStagger),
      };
    });

    return { width: columnWidths[Math.floor(random() * columnWidths.length)], cells };
  });

  /** Cells directly above and below, within the same column. */
  const verticalNeighbours = (column: Column, index: number) =>
    [column.cells[index - 1], column.cells[index + 1]].filter(Boolean) as Cell[];

  // 2. Fill each state. Walking columns left to right and cells top to bottom
  //    means every decision only needs the column already placed, the cell
  //    directly above, and the previous state.
  for (let state = 0; state < stateCount; state += 1) {
    let previousColumnSpans: Span[] = [];

    for (const column of grid) {
      const spans: Span[] = [];
      let previousCellOpen = false;

      column.cells.forEach((cell, index) => {
        const span = { start: cell.start, end: cell.end };

        const blockedVertically = previousCellOpen;
        const blockedHorizontally = previousColumnSpans.some((other) =>
          overlaps(span, other, minGap),
        );
        // Opening where a neighbour just closed reads as that bar moving.
        const wouldHandOff =
          state > 0 &&
          verticalNeighbours(column, index).some((n) => n.open[state - 1]);

        const isOpen =
          random() < showProbability &&
          !blockedVertically &&
          !blockedHorizontally &&
          !wouldHandOff;

        cell.open[state] = isOpen;
        previousCellOpen = isOpen;
        if (isOpen) spans.push(span);
      });

      previousColumnSpans = spans;
    }
  }

  // 3. The loop wraps, so the last state hands off to the first. Close any cell
  //    in state 0 whose vertical neighbour was open in the final state.
  grid.forEach((column) => {
    column.cells.forEach((cell, index) => {
      if (!cell.open[0]) return;
      if (verticalNeighbours(column, index).some((n) => n.open[stateCount - 1])) {
        cell.open[0] = false;
      }
    });
  });

  // 4. A cell identical in every state would never animate. Give it one state
  //    where it differs, choosing one in which doing so breaks no rule.
  grid.forEach((column, columnIndex) => {
    column.cells.forEach((cell, cellIndex) => {
      if (!cell.open.every((v) => v === cell.open[0])) return;
      const span = { start: cell.start, end: cell.end };

      for (let state = 0; state < stateCount; state += 1) {
        const neighbours = verticalNeighbours(column, cellIndex);
        const previous = (state - 1 + stateCount) % stateCount;
        const next = (state + 1) % stateCount;

        const clashesNow = neighbours.some((n) => n.open[state]);
        const handsOff = neighbours.some((n) => n.open[previous] || n.open[next]);
        const clashesSideways = [grid[columnIndex - 1], grid[columnIndex + 1]].some(
          (neighbour) =>
            neighbour?.cells.some(
              (other) => other.open[state] && overlaps(span, other, minGap),
            ),
        );

        if (!clashesNow && !handsOff && !clashesSideways) {
          cell.open[state] = !cell.open[state];
          return;
        }
      }
    });
  });

  // 5. Colour. Dealt from a deck holding equal counts of every colour, then
  //    shuffled — sampling per cell let one colour dominate by chance. A card
  //    is skipped when it matches a touching neighbour, so no colour clumps.
  const cellCount = grid.reduce((sum, column) => sum + column.cells.length, 0);
  const deck = Array.from(
    { length: cellCount },
    (_, i) => BAR_COLORS[i % BAR_COLORS.length],
  );
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  grid.forEach((column, columnIndex) => {
    column.cells.forEach((cell, cellIndex) => {
      const span = { start: cell.start, end: cell.end };
      const taken = new Set<string>();

      const above = column.cells[cellIndex - 1];
      if (above) taken.add(above.color);
      grid[columnIndex - 1]?.cells.forEach((other) => {
        if (overlaps(span, other, minGap)) taken.add(other.color);
      });

      // Take the first card that does not repeat a touching neighbour, keeping
      // the deck's balance intact by swapping rather than discarding.
      let pick = deck.findIndex((color) => !taken.has(color));
      if (pick === -1) pick = 0;
      cell.color = deck.splice(pick, 1)[0];
    });
  });

  return grid;
}

