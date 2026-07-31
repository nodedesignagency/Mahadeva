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
   * Each participating cell appears in exactly one of these, so a bar is on
   * screen for a single beat and the field turns over continuously rather than
   * holding an arrangement long enough to read as static.
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
   * The field is a set of flush tracks, each holding a run of cells. Which way
   * round depends on the breakpoint:
   *
   *  - From tablet up, tracks are vertical columns down the left and right
   *    edges — the `1st`..`7th` groups in the Framer component — and bars grow
   *    up or down within their slot.
   *  - On mobile the whole arrangement turns ninety degrees: tracks are
   *    horizontal rows in a band across the top and bottom, and bars grow left
   *    or right. There is no room for a side field on a narrow screen.
   *
   * The generator is axis-agnostic; only these numbers and the rendering differ by
   * orientation.
   */
  vertical: {
    /** Columns per field. */
    tracks: 7,
    /** Cells stacked inside each column, sampled per column. */
    cellsPerTrack: { min: 5, max: 7 },
    /** Column widths in px, sampled per column. */
    thickness: [26, 34, 48, 70],
  },

  horizontal: {
    /** Rows per band. */
    tracks: 3,
    /** Cells laid along each row, sampled per row. */
    cellsPerTrack: { min: 4, max: 6 },
    /** Row heights in px, sampled per row. */
    thickness: [30, 34, 38],
  },

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
   * Chance a cell takes part at all. Every participating cell is then given one
   * state to appear in, and the spacing rules reject a good share, so the count
   * that reaches the screen is far lower — tune against the rendered figure,
   * not this number. At 1 the field sits around eight bars a side, matching the
   * reference; lower it to thin the field out.
   */
  showProbability: 1,

  /**
   * Minimum vertical gap between two open cells in neighbouring columns, as a
   * fraction of the field height. Zero would let bars sit edge to edge and read
   * as one block; a little space keeps each bar its own shape.
   */
  minGap: 0.03,

  /**
   * Fixed PRNG seeds. These MUST stay constant — the field is generated during
   * render on both server and client, so a time- or Math.random-based source
   * would produce different markup on each side and cause a hydration error.
   */
  seeds: { left: 20260730, right: 19880413, top: 40213377, bottom: 91827364 },
} as const;
