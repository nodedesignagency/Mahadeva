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
 * Section headings.
 *
 * The same bars and timings as the hero — it is one effect used throughout, not
 * a second one that happens to look similar. What differs is that these are
 * scrolled to rather than landed on, so `trigger: "inView"` is doing real work
 * here: each block waits until it is 20% visible, then plays once and never
 * again.
 */
export const sectionTextReveal = {
  ...heroTextReveal,

  /**
   * These sections sit on the white wrappers, so the text resolves to ink.
   * Inheriting the hero's `afterColor` painted white on white and the
   * statement finished its reveal invisible.
   */
  afterColor: "var(--color-fg-on-light)",

  /**
   * From the owner's Reveal Blocks Item panel: 260ms per sweep, 25ms held at
   * full cover, no lead-in delay. Quicker per bar than the hero, which is what
   * lets a five-line statement stay one movement rather than a queue.
   *
   * The panel truncates the two bezier values, so the easing stays the hero's
   * 0.3 / 0.7 — worth confirming against Framer.
   */
  duration: 260,
  pause: 25,
  delay: 0,

  /**
   * Milliseconds each line waits behind the one above it, so a multi-line
   * statement resolves top to bottom instead of every line wiping at once.
   * Short on purpose: long enough to read as a sequence, well under the 620ms
   * of a single bar sweep so the lines still feel like one movement.
   */
  lineStagger: 180,
} as const;

/**
 * Site-wide smooth scrolling.
 *
 * The original runs its Smooth Scroll component at intensity 10. Expressed here
 * as Lenis's `lerp` — the share of the remaining distance the page closes each
 * frame — which is the same 0-1 quantity on a different scale.
 *
 * Lower is heavier: at 0.1 the page keeps easing for a beat after the wheel
 * stops, which is the weight the original has.
 */
export const smoothScroll = {
  lerp: 0.1,
} as const;

/**
 * The About section's 3D mark.
 *
 * Framer drives this with Scroll Speed at 130%: the mark travels 1.3x the page,
 * so it climbs past the statement above it instead of sitting still under it.
 *
 * Expressed here as a drift in each direction rather than a speed, because that
 * is what a scroll-linked transform needs. The two are the same statement: over
 * a full traverse the mark covers a viewport plus its own height, and outrunning
 * that by 30% comes to roughly the mark's own height in total — half of it in
 * each direction. At the mark's 385px in a ~900px viewport that is ~192px each
 * way, which is what 50% resolves to.
 */
export const markParallax = {
  /** Per the Framer panel. Kept for the derivation above. */
  speed: 1.3,
  /**
   * Offset at each end of the traverse, as a share of the mark's height.
   * Proportional, so the drift scales down with the mark on smaller screens
   * without needing a second number.
   */
  drift: "50%",
} as const;

/**
 * Feature strip marquee.
 *
 * Expressed as a rate rather than a duration on purpose: the row renders the
 * card set twice and slides by one copy, so a fixed duration would silently
 * speed the row up every time a card is added. Deriving the duration from this
 * keeps the travel constant however many cards there are.
 */
export const featureMarquee = {
  /** Pixels per second the row travels, leftwards. Half the original's rate. */
  speed: 50,
} as const;

/**
 * Button hover sweep.
 *
 * The original button is four stacked rectangles parked off the left edge,
 * clipped by the button. On hover they slide in one after another and together
 * form a solid accent fill; on leave they slide back out. The stagger is what
 * makes it read as a sweep rather than a fill.
 *
 * From the owner's Framer file:
 *
 *  - Four rectangles, each 11px tall in a 44px button — quarters, so they are
 *    expressed here as percentages and survive a resized or full-width button.
 *  - Resting X positions -270, -370, -470, -570 against a 267px-wide button.
 *    Stored as the overhang *past* the button's own width, so the offsets hold
 *    at any width: on mobile the button is full-bleed and a literal -270 would
 *    leave a sliver of the first bar on screen.
 *  - Delays step by 0.05s, and reverse on leave: entering, the bottom bar leads
 *    and the fill builds upward; leaving, the top bar goes first.
 *  - Transition: physics spring, mass 1, stiffness 300, damping 100.
 *
 * That spring has a damping ratio of 2.89 — overdamped, so it never overshoots
 * and its exact solution is a sum of two decaying exponentials. `--ease-button-
 * spring` in theme.css is that solution sampled as a CSS `linear()` easing,
 * which is why this is plain CSS and the button stays a server component. See
 * the note there before changing `duration`: the two are a matched pair.
 */
export const buttonSweep = {
  /**
   * Milliseconds for one bar's travel — the spring's settle time.
   *
   * The easing in theme.css is the spring's shape normalised across this
   * duration, so changing this number stretches the same spring in time rather
   * than distorting it: the result is exactly a softer spring of identical
   * damping ratio. At 2500 that is stiffness 192 / damping 80, against the
   * 300 / 100 the Framer file specifies — the same curve, 25% slower, because
   * the original read as hurried on screen. 90% of the travel now lands at
   * 943ms rather than 754ms.
   *
   * Only a change to the curve's *shape* needs the easing regenerated.
   */
  duration: 2500,

  /**
   * Top bar first. `overhang` is added to the button's own width to park the
   * bar off the left edge; at the original's 267px that reproduces Framer's
   * -270/-370/-470/-570 exactly.
   *
   * The delays step by 75ms rather than Framer's 50ms. At 50ms against a
   * ~950ms travel the four bars overlapped enough to arrive as one mass; the
   * wider step lets them read as four, which is the point of staggering them.
   */
  bars: [
    { overhang: 3, delayIn: 300, delayOut: 75 },
    { overhang: 103, delayIn: 225, delayOut: 150 },
    { overhang: 203, delayIn: 150, delayOut: 225 },
    { overhang: 303, delayIn: 75, delayOut: 300 },
  ],

  /**
   * The secondary button's label flips from light to dark as the accent
   * arrives underneath it. Framer handles this as part of the variant change;
   * these delays are ours, timed so the label turns once the sweep has reached
   * the middle of the button rather than before it.
   */
  label: { duration: 310, delayIn: 250, delayOut: 190 },
} as const;

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
    /**
     * Relative column widths, sampled per column. Read as ratios, not pixels:
     * the field is a percentage of the viewport and divides itself between its
     * columns in these proportions, so they narrow with the screen. At a
     * desktop width they land within a few pixels of these numbers, which is
     * where they came from.
     */
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
