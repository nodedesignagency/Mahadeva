/**
 * Animation configuration.
 *
 * The tunable numbers behind the two signature effects live here so they can be
 * corrected without touching component code.
 */

/** Settings for the two-bar heading wipe. Mirrors the original's prop shape. */
export type TextRevealSettings = {
  /** Colour of the first sweeping bar. */
  revealColor: string;
  /** Colour of the second sweeping bar. */
  revealColor2: string;
  /** Text colour before the reveal completes (hidden behind the bars). */
  beforeColor: string;
  /** Text colour after the reveal. */
  afterColor: string;
  /** Selection highlight background. */
  highlightColor: string;
  /** Selection highlight text colour. */
  highlightTextColor: string;
  /** Milliseconds for a single bar sweep. The full sequence runs four of these. */
  duration: number;
  /** Milliseconds held at full cover before the bars sweep back off. */
  pause: number;
  /** Milliseconds before the sequence starts. */
  delay: number;
  /** Bezier X1 — combined as cubic-bezier(easeIn, 0, easeOut, 1). */
  easeIn: number;
  /** Bezier X2. */
  easeOut: number;
  /** Which edge the bars sweep from. */
  direction: "left" | "right";
  /** Padding above and below the text that the bars extend to cover, in px. */
  overlayVerticalPadding: number;
  /** `inView` waits for the block to be scrolled to; `onAppear` plays on mount. */
  trigger: "inView" | "onAppear";
};

/**
 * Hero heading reveal — values taken from the owner's Framer inspector.
 *
 * Note the easing: the component builds `cubic-bezier(easeIn, 0, easeOut, 1)`,
 * so 0.3/0.7 gives cubic-bezier(0.3, 0, 0.7, 1) — a symmetric ease-in-out, and
 * the inverse of the component's own defaults.
 *
 * The before/after text colours are confirmed from the published CSS: fully
 * transparent white before, solid white after.
 *
 * ⚠️ `revealColor`/`revealColor2` are the Framer styles "Green 4" and
 * "Green 11". Those names are not in the published CSS, so the hex values below
 * are the closest matches in the extracted palette and are worth confirming.
 */
export const heroTextReveal: TextRevealSettings = {
  revealColor: "var(--mh-green-100)", // "Green 4" — pale green
  revealColor2: "var(--mh-ink-border)", // "Green 11" — dark green
  beforeColor: "transparent",
  afterColor: "var(--color-fg)",
  highlightColor: "var(--mh-green-100)",
  highlightTextColor: "var(--mh-ink-border)",
  duration: 620,
  pause: 25,
  delay: 40,
  easeIn: 0.3,
  easeOut: 0.7,
  direction: "left",
  overlayVerticalPadding: 0,
  trigger: "inView",
};

/**
 * Background bar-pattern field.
 *
 * The original is not a continuous loop of bars growing from zero. It is a set
 * of discrete Framer variants ("Animation State 1..N"), each holding a fixed
 * arrangement, with Framer morphing between them. Reproduced here as: a fixed
 * set of bars whose heights change per state, animated with a spring.
 *
 * Confirmed by the owner: only height changes between states — bars keep their
 * horizontal position and width throughout.
 */
export const patternField = {
  /**
   * Arrangements cycled through, matching Framer's Animation State 1..5.
   *
   * A cell may stay open across two consecutive states, so bars arrive, hold
   * for a beat, and give way to others — rather than every bar flipping on
   * every tick, which read as flashing. Each cell is still guaranteed to change
   * at least once per loop, so nothing sits frozen.
   */
  stateCount: 5,

  /**
   * Milliseconds each state is held before switching. From the owner's Framer
   * trigger: On Appear → Delay 2.4s → Set Variant.
   */
  stateInterval: 2400,

  /**
   * Open and close share one symmetric ease, so a cell collapses exactly as it
   * grew.
   *
   * Deliberately not a spring: a spring approaches its target asymptotically,
   * so `scaleY` crawls through the last fraction and leaves a hairline before
   * vanishing. A bezier lands on zero cleanly. Same 0.3/0.7 pair as the text
   * reveal.
   *
   * Kept well under `stateInterval` so a cell finishes moving and visibly rests
   * before the next state — at 2s it was still animating when the next tick
   * arrived, leaving the field permanently in motion.
   */
  transition: { duration: 1.1, ease: [0.3, 0, 0.7, 1] },

  /**
   * Maximum milliseconds a cell's start is offset by, so cells ripple rather
   * than flipping in lockstep. Set to 0 for a synchronised flip.
   */
  maxStagger: 260,

  /**
   * Vertical columns per field, matching the `1st`..`7th` groups in the Framer
   * component. Columns sit flush against each other with no horizontal gap, so
   * cells in neighbouring columns can meet and read as one larger block.
   */
  columns: 7,

  /**
   * Cells stacked inside each column, sampled per column — the `1`..`7` children
   * of each group in Framer. Cells fill the column top to bottom with no gap;
   * each holds one bar that grows within its own slot.
   */
  cellsPerColumn: { min: 5, max: 7 },

  /**
   * Relative height weight of a cell, so slots within a column differ. The
   * reference shows cells ranging from roughly 7% to 27% of the field height,
   * so the spread is wide.
   */
  minCellWeight: 0.5,
  maxCellWeight: 2.2,

  /**
   * How full a cell's bar is when open, as a fraction of the cell. Kept near 1:
   * in the reference a bar fills its slot, and slot heights supply the variety.
   */
  minTarget: 0.82,
  maxTarget: 1,

  /**
   * Chance a cell is open in any given state. The reference is sparse — around
   * eight to ten bars visible per side out of roughly forty cells.
   */
  showProbability: 0.18,

  /**
   * Column widths in px, sampled per column, measured off the reference
   * recording: a mix of hairline columns and one much wider than the rest.
   */
  columnWidths: [12, 28, 34, 48, 70],

  /**
   * Fixed PRNG seeds. These MUST stay constant — the field is generated during
   * render on both server and client, so a time- or Math.random-based source
   * would produce different markup on each side and cause a hydration error.
   */
  seeds: { left: 20260730, right: 19880413 },
} as const;
