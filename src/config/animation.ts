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
   * Two alternating arrangements. Every bar flips on each tick — one set opens
   * as the other closes — which is what keeps the field continuously in motion.
   * Assigning on/off randomly per state left some bars on (or off) for several
   * states running, so parts of the field sat still.
   */
  stateCount: 2,

  /**
   * Milliseconds each state is held before switching. From the owner's Framer
   * trigger: On Appear → Delay 2.4s → Set Variant.
   */
  stateInterval: 2400,

  /**
   * Open and close share one symmetric ease, so a bar collapses exactly as it
   * grew.
   *
   * This deliberately is not a spring. A spring approaches its target
   * asymptotically, so `scaleY` crawls through the last fraction and leaves a
   * visible hairline before finally vanishing — the trailing line in the
   * owner's screenshot. A bezier lands on zero cleanly. The curve is the same
   * 0.3/0.7 pair used by the text reveal.
   */
  transition: { duration: 2, ease: [0.3, 0, 0.7, 1] },

  /**
   * Maximum milliseconds a bar's start is offset by. Without it every bar flips
   * in lockstep and the field blinks; with it, bars come and go in a ripple.
   * Set to 0 for a perfectly synchronised flip.
   */
  maxStagger: 420,

  /**
   * Horizontal rows the field is split into, matching the `1st`..`7th` groups
   * in the Framer component. Rows sit flush with no gap between them.
   */
  rows: 7,

  /**
   * Bars per row, sampled per row. Each row lays its bars out side by side, so
   * bars can never overlap — an earlier version positioned them at random
   * offsets, which collided.
   */
  barsPerRow: { min: 5, max: 7 },

  /**
   * Each bar has a single target height, as a fraction of its row, and toggles
   * between 0 and that target — never drifting between arbitrary values. A bar
   * whose target is 1 reads as the full-height "100 → 0 → 100" case.
   */
  minTarget: 0.35,
  maxTarget: 1,

  /**
   * Chance a bar starts in the open half of the alternation. Bars hold their
   * position and width throughout — only their open/closed state changes — so
   * the arrangement appears to rearrange without anything actually moving.
   */
  openFirstProbability: 0.5,

  /** Bar widths in px, sampled per bar. Matches the Figma fixed widths. */
  widths: [14, 30, 48, 56],

  /** Extra left margin per bar, in px, to break up the rhythm within a row. */
  maxBarOffset: 18,

  /** Row inset as a percentage, sampled per row so bars do not line up column-wise. */
  maxRowInset: 14,

  /**
   * Fixed PRNG seeds. These MUST stay constant — the field is generated during
   * render on both server and client, so a time- or Math.random-based source
   * would produce different markup on each side and cause a hydration error.
   */
  seeds: { left: 20260730, right: 19880413 },
} as const;
