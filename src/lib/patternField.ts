/**
 * Pattern field generation.
 *
 * Pure layout logic, deliberately separate from the component that renders it:
 * it has no React dependency, so the rules below can be exercised directly.
 *
 * Four rules shape the result, all enforced here rather than left to chance —
 * independent random choices produced clustering, colour dominance, a false
 * sense of movement, and bars that lingered long enough to read as static:
 *
 *  - Spacing: no two vertically adjacent cells open at once, and an open cell
 *    never comes within a small gap of one in the neighbouring column, so every
 *    bar keeps clear space around it.
 *  - Rotation: a cell open in one state must close in the next, so no bar holds
 *    for two beats and the field keeps turning over.
 *  - Hand-off: a cell may not open where a vertical neighbour was open in the
 *    state before. Otherwise one closes as the other opens and the eye reads a
 *    single bar sliding up or down and changing colour.
 *  - Colour: chosen to minimise repeats among the bars visible *at the same
 *    time*, rather than merely balancing totals across the whole field.
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
 * The pastel set, as theme token references. One entry per hue so no colour is
 * structurally more likely than another.
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
  /** Which end of its slot the bar grows from, along the track's axis. */
  origin: "start" | "end";
  open: boolean[];
  stagger: number;
};

/**
 * A track holds a run of cells. It is a column when the field is vertical and a
 * row when horizontal; `thickness` is its width or its height accordingly.
 */
export type Track = { thickness: number; cells: Cell[] };

/** Which way the tracks run, and so which axis the bars grow along. */
export type Orientation = "vertical" | "horizontal";

type Span = { start: number; end: number };

/** True when two spans along a track touch or overlap, allowing for the gap. */
function overlaps(a: Span, b: Span, gap: number) {
  return a.start < b.end + gap && b.start < a.end + gap;
}

export function generateTracks(seed: number, orientation: Orientation): Track[] {
  const random = createRandom(seed);
  const {
    minCellWeight,
    maxCellWeight,
    minTarget,
    maxTarget,
    showProbability,
    stateCount,
    maxStagger,
    minGap,
  } = patternField;
  const { tracks, cellsPerTrack, thickness } = patternField[orientation];

  // 1. Geometry. Fixed for the lifetime of the field.
  const grid: Track[] = Array.from({ length: tracks }, () => {
    const count =
      cellsPerTrack.min +
      Math.floor(random() * (cellsPerTrack.max - cellsPerTrack.min + 1));

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
        // Which end of its slot the bar grows from. Rendering maps this to the
        // right edge for the axis in use.
        origin: random() > 0.5 ? ("start" as const) : ("end" as const),
        open: Array.from({ length: stateCount }, () => false),
        stagger: Math.round(random() * maxStagger),
      };
    });

    return { thickness: thickness[Math.floor(random() * thickness.length)], cells };
  });

  // 2. Assign each cell a single state to be visible in — its phase.
  //
  //    Deciding open/closed per state independently could not work: with the
  //    loop wrapping, the first state borders two others rather than one, so it
  //    was squeezed to near-empty however the passes were ordered. Giving a
  //    cell one phase makes rotation automatic (it is open for exactly one beat
  //    of the five) and lets density be spread evenly across states by simply
  //    preferring whichever phase is currently least used.
  const phaseUsage: number[] = Array.from({ length: stateCount }, () => 0);

  grid.forEach((track, trackIndex) => {
    track.cells.forEach((cell, cellIndex) => {
      if (random() >= showProbability) return;

      const span = { start: cell.start, end: cell.end };
      const forbidden = new Set<number>();

      const noteAlongTrack = (neighbour: Cell | undefined) => {
        neighbour?.open.forEach((isOpen, state) => {
          if (!isOpen) return;
          // Sharing a state would butt two bars together end to end; the states
          // either side would show one closing as the other opens, which reads
          // as a single bar sliding along the track.
          forbidden.add(state);
          forbidden.add((state + 1) % stateCount);
          forbidden.add((state - 1 + stateCount) % stateCount);
        });
      };
      noteAlongTrack(track.cells[cellIndex - 1]);
      noteAlongTrack(track.cells[cellIndex + 1]);

      // Across tracks only sharing a state matters — bars in different tracks
      // cannot be mistaken for one bar travelling along a single track.
      grid[trackIndex - 1]?.cells.forEach((other) => {
        if (!overlaps(span, other, minGap)) return;
        other.open.forEach((isOpen, state) => {
          if (isOpen) forbidden.add(state);
        });
      });

      const allowed = Array.from({ length: stateCount }, (_, state) => state).filter(
        (state) => !forbidden.has(state),
      );
      if (allowed.length === 0) return;

      // Least-used phase keeps the states evenly populated; the random offset
      // stops ties always resolving to the same state.
      const offset = Math.floor(random() * allowed.length);
      let phase = allowed[offset];
      allowed.forEach((candidate) => {
        if (phaseUsage[candidate] < phaseUsage[phase]) phase = candidate;
      });

      cell.open[phase] = true;
      phaseUsage[phase] += 1;
    });
  });

  // 3. Colour.
  //
  //    Balancing totals across the field is not enough: what the eye judges is
  //    the handful of bars on screen together, and those can still repeat a hue
  //    while the overall counts look even. Each cell takes the colour that is
  //    least used in the states where it is actually visible, with overall
  //    usage only breaking ties, so the field stays balanced as well.
  const stateColorCounts: Record<string, number>[] = Array.from(
    { length: stateCount },
    () => ({}),
  );
  const totalUsage: Record<string, number> = {};

  grid.forEach((track, trackIndex) => {
    track.cells.forEach((cell, cellIndex) => {
      const openStates = cell.open
        .map((isOpen, state) => (isOpen ? state : -1))
        .filter((state) => state >= 0);

      // Cells closed in every state are never painted, so their colour is
      // irrelevant and must not skew the balance of the ones that are.
      if (openStates.length === 0) {
        cell.color = BAR_COLORS[0];
        return;
      }

      const span = { start: cell.start, end: cell.end };
      const touching = new Set<string>();
      const previousInTrack = track.cells[cellIndex - 1];
      if (previousInTrack) touching.add(previousInTrack.color);
      grid[trackIndex - 1]?.cells.forEach((other) => {
        if (overlaps(span, other, minGap)) touching.add(other.color);
      });

      let best: string = BAR_COLORS[0];
      let bestScore = Infinity;

      for (const color of BAR_COLORS) {
        // On-screen repeats dominate; touching a same-coloured neighbour is a
        // lesser penalty; overall usage only breaks ties.
        const onScreen = openStates.reduce(
          (sum, state) => sum + (stateColorCounts[state][color] ?? 0),
          0,
        );
        const score =
          onScreen * 1000 + (touching.has(color) ? 100 : 0) + (totalUsage[color] ?? 0);

        if (score < bestScore) {
          bestScore = score;
          best = color;
        }
      }

      cell.color = best;
      totalUsage[best] = (totalUsage[best] ?? 0) + 1;
      openStates.forEach((state) => {
        stateColorCounts[state][best] = (stateColorCounts[state][best] ?? 0) + 1;
      });
    });
  });

  return grid;
}
