/**
 * The preloader's tiling.
 *
 * Pure layout, deliberately kept out of the component: what shape the sheet
 * breaks into and which way each piece leaves is the whole of the effect, and
 * it is worth being able to reason about — and test — without a browser.
 *
 * Three rules shape the result. Each is here because the obvious version
 * looked wrong:
 *
 *  - Direction: no tile leaves the same way as the one beside it. Two
 *    neighbours collapsing towards the same edge read as a single wide bar
 *    sliding away, and the sheet stops looking like it is coming apart.
 *  - Timing: the offsets are an even spread across the stagger window, then
 *    shuffled. Sampling each one independently clusters them — most of the
 *    sheet goes at once and two or three rectangles are left hanging over the
 *    hero afterwards, which is the failure that reads as a bug rather than a
 *    flourish.
 *  - Proportion: rows and tiles take flex weights rather than sizes, so the
 *    sheet fills whatever viewport it is handed. Fixed pixels tile a laptop
 *    and leave a seam down the side of anything wider.
 *
 * Everything derives from a fixed seed. The overlay is server-rendered — it
 * has to be, or the page shows through before the cover arrives — so an
 * unseeded source would be a hydration error.
 */

import { preloader } from "@/config/animation";
import { createRandom } from "./random";

/** Which axis a tile collapses along, and which edge it collapses towards. */
export type Axis = "x" | "y";
export type Origin = "start" | "end";

export type Tile = {
  /** Share of the row's width. */
  weight: number;
  axis: Axis;
  /** The edge that stays put: `start` is left or top, `end` is right or bottom. */
  origin: Origin;
  /** Milliseconds after the collapse begins that this tile starts moving. */
  delay: number;
  /** True for the one tile that starts last, and so lands last. */
  last?: true;
};

/** A band across the sheet. `weight` is its share of the height. */
export type Row = { weight: number; tiles: Tile[] };

/** The four ways a tile can leave, as an axis and the edge it retreats to. */
const DIRECTIONS: ReadonlyArray<{ axis: Axis; origin: Origin }> = [
  { axis: "x", origin: "start" }, // collapses leftwards, right edge travelling
  { axis: "x", origin: "end" }, // collapses rightwards
  { axis: "y", origin: "start" }, // collapses upwards
  { axis: "y", origin: "end" }, // collapses downwards
];

/**
 * The sheet, top row first.
 *
 * `seed` defaults to the configured one; it is a parameter so the arrangement
 * can be exercised across seeds rather than only the one that ships.
 */
export function generateTiles(seed: number = preloader.seed): Row[] {
  const { rows, tilesPerRow, rowWeight, tileWeight, maxStagger } = preloader;
  const random = createRandom(seed);

  const between = (min: number, max: number) => min + random() * (max - min);

  // 1. Geometry and direction. Neighbours within a row are kept apart; rows
  //    are left alone, since a tile's neighbour above is rarely the same width
  //    and the two do not read as one shape.
  const sheet: Row[] = Array.from({ length: rows }, () => {
    const count =
      tilesPerRow.min +
      Math.floor(random() * (tilesPerRow.max - tilesPerRow.min + 1));

    let previous = -1;
    const tiles: Tile[] = Array.from({ length: count }, () => {
      // Choose among the directions the neighbour did not take, so the
      // exclusion costs nothing in evenness — rejection sampling would bias
      // towards whichever direction happens to come up first.
      const choices = DIRECTIONS.map((_, i) => i).filter((i) => i !== previous);
      const index = choices[Math.floor(random() * choices.length)];
      previous = index;

      return {
        weight: between(tileWeight.min, tileWeight.max),
        ...DIRECTIONS[index],
        // Filled in below, once the total is known.
        delay: 0,
      };
    });

    return { weight: between(rowWeight.min, rowWeight.max), tiles };
  });

  // 2. Timing. One slot per tile, evenly spaced across the window, dealt out in
  //    a shuffled order — so the sheet empties at a steady rate whatever the
  //    tile count works out to, and no tile is left behind at the end.
  const all = sheet.flatMap((row) => row.tiles);
  const slots = all.map((_, i) =>
    all.length > 1 ? (i / (all.length - 1)) * maxStagger : 0,
  );

  // Fisher-Yates, over the slots rather than the tiles: the tiles are already
  // in the order they are rendered in and shuffling them would scramble the
  // sheet's geometry along with its timing.
  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  all.forEach((tile, i) => {
    tile.delay = slots[i];
  });

  // The sheet is over when this one lands. Flagged rather than recomputed by
  // the component, and flagged here rather than assumed to be the last in
  // document order — the slots were shuffled, so it is any of them.
  //
  // Every tile takes the same time to collapse, so the last to start is the
  // last to finish. The offsets are distinct, so there is exactly one.
  let latest = all[0];
  for (const tile of all) if (tile.delay > latest.delay) latest = tile;
  latest.last = true;

  return sheet;
}

/** CSS `transform-origin` for a tile: the edge it collapses towards. */
export function originOf(tile: Tile): string {
  if (tile.axis === "x") return tile.origin === "start" ? "left" : "right";
  return tile.origin === "start" ? "top" : "bottom";
}
