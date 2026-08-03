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
 * The same section reveal, for headings on the dark surface.
 *
 * `sectionTextReveal` resolves to ink because the sections that came first sit
 * on white. Reusing it on a dark section finishes the sweep with dark text on
 * dark ground — the reveal plays correctly and leaves nothing visible, which is
 * a hard bug to see and an easy one to cause. Naming the two cases separately
 * makes the choice explicit at each call site.
 */
export const sectionTextRevealOnDark = {
  ...sectionTextReveal,
  afterColor: "var(--color-fg)",
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
 * The hero's contents.
 *
 * Scroll Speed 120% on the whole section: as the stack scrolls, the hero's
 * heading and buttons creep upward instead of sitting rigid while About slides
 * over them. Subtle by design — 20% against the mark's 30%.
 *
 * Tracked against the stack rather than the hero itself. The hero is pinned, so
 * its own measured position never changes and a drift keyed to it would sit
 * still for exactly the stretch it is meant to move.
 */
export const heroParallax = {
  /** Per the Framer panel. The climb below is derived from it. */
  speed: 1.2,
  /** Total climb across the stack, as a share of the hero content's height. */
  drift: "146%",
} as const;

/**
 * The About section's 3D mark.
 *
 * Framer drives this with Scroll Speed at 130%: the mark travels 1.3x the page,
 * so it climbs past the statement above it instead of sitting still under it.
 *
 * Converted to a total climb, which is what a scroll-linked transform needs.
 * Outrunning the page by 30% across a traverse of one viewport plus the
 * section's height — 900 + 1100 here — comes to 600px, and the mark is 467
 * tall, so 600/467 is a shade over 128%.
 *
 * That lands where the original does: the mark rests 220px below the statement,
 * so by the time the section is centred it has climbed ~300px and overlaps the
 * last lines by ~80px, with the whole statement still on screen.
 *
 * Measured against the section rather than the mark, since the mark hangs far
 * below its section and its own box would enter the viewport far too late.
 */
export const markParallax = {
  /** Per the Framer panel. The climb below is derived from it. */
  speed: 1.3,
  /** Total climb over a full traverse, as a share of the mark's height. */
  drift: "128%",
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
 * Mobile / tablet navigation overlay.
 *
 * Two animations run when the panel opens. The links travel in from the left
 * on the same spring as the button sweep — the Framer file specifies stiffness
 * 300, damping 100, mass 1 for both — and the hairline between each pair of
 * links draws itself left to right.
 *
 * Both are CSS: the links get `--ease-button-spring` (see the note in
 * theme.css — that easing *is* this spring), the rules get their own bezier.
 * Only the open/closed state is React's.
 */
export const mobileNav = {
  /**
   * Milliseconds for one link's travel. The spring's own settle time at the
   * specified constants, so the links move at the physics the file asks for
   * rather than the deliberately slackened 2500ms the buttons use. It is
   * overdamped, so this reads much faster than the number suggests: 90% of the
   * distance is covered in the first 830ms and the rest is sub-pixel.
   */
  linkDuration: 2000,

  /** Framer's per-link delay step, applied top to bottom. */
  linkStagger: 50,

  /**
   * Where each link starts, in pixels left of its resting place: -130 for the
   * first, stepping 10 further out down the list. Taken from the Framer file.
   *
   * The staggered delay alone was not enough to read as one-by-one — every
   * link covered the same distance, so they moved as a block that happened to
   * start at slightly different moments. Giving the lower ones further to
   * travel spreads out their *arrivals*, which is the part the eye follows.
   */
  linkOffsetStart: -130,
  linkOffsetStep: -10,

  /**
   * How long the header takes to grow from its closed height to the full
   * viewport. This is the whole "opening" gesture — there is no separate
   * panel sliding or fading in over the page, the strip itself becomes the
   * screen. It is also why the hero heading is still visible partway through
   * the owner's recording: the header simply has not reached it yet.
   *
   * 1s on bezier 0.8, 0, 0.2, 1, from the owner's transition panel. Long, but
   * that curve spends most of it barely moving at either end and crosses the
   * screen in the middle third, so it reads as a fast sweep with a soft start
   * and a soft landing rather than a slow one.
   */
  openDuration: 1000,

  /**
   * The hairline between links, from the owner's BorderReveal component: a
   * 1px rule whose width goes 0 to 100%, custom bezier, 1s, 200ms delay. Every
   * rule uses the same delay — the component triggers on visibility, and they
   * all become visible in the same frame — so they draw together beneath the
   * links arriving above them.
   *
   * They do not un-draw. Closing the panel in the recording clears every rule
   * at once while the links are still walking out, so the exit is its own much
   * shorter fade rather than the entrance run backwards.
   */
  rule: { duration: 1000, delay: 200, exitDuration: 150 },
} as const;

/**
 * Case study card hover.
 *
 * Blocks slide in from the four edges and sit over the card while the pointer
 * is on it, then retreat. Each one enters from the edge it is parked against,
 * so the card looks assembled from its own border rather than sprinkled.
 *
 * `edge` is where it comes from and which side it hugs. `x`/`y` place it along
 * that side, `w`/`h` size it — all percentages of the artwork half they live
 * in, so the arrangement holds at every width instead of drifting as the card
 * grows.
 *
 * Delays are deliberately uneven. An even stagger reads as a mechanical sweep;
 * clustering two or three arrivals and leaving a gap reads as scatter.
 */
export const caseHover = {
  /** From the owner's transition panel: bezier 0.8, 0, 0.2, 1 over 0.7s. */
  duration: 700,

  /** The cover image grows behind the blocks. */
  imageScale: 1.05,

  /**
   * The artwork half is 560x552 in the Framer file, and the rectangles are
   * placed in its pixels. Kept as pixels rather than converted to percentages:
   * this is a fixed arrangement in the original, and the reference is used
   * only for the half's aspect ratio.
   */
  reference: { width: 560, height: 552 },

  /**
   * The seven rectangles, from the owner's Framer layers.
   *
   * Each is given at its *hovered* position — the edges it is anchored to and
   * the offsets from them — plus `dx`/`dy`, how far from there it waits at
   * rest. Written that way because it is what the browser animates: the
   * element is laid out where it ends up, and `translate` carries it to and
   * from the outside. Animating `left`/`top` would relayout every frame.
   *
   * The three at the top left arrive from the left, the tall one at the top
   * right drops from above, and the three along the bottom rise from below.
   */
  rects: [
    { w: 92, h: 92, left: 0, top: 0, dx: -100, dy: 0 },
    { w: 40, h: 40, left: 92, top: 92, dx: -192, dy: 0 },
    { w: 92, h: 40, left: 0, top: 132, dx: -100, dy: 0 },
    { w: 32, h: 140, right: 0, top: 0, dx: 0, dy: -160 },
    { w: 40, h: 40, left: 0, bottom: 0, dx: 0, dy: 100 },
    { w: 40, h: 40, left: 40, bottom: 40, dx: 0, dy: 220 },
    { w: 40, h: 40, left: 80, bottom: 0, dx: 0, dy: 100 },
  ],
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
