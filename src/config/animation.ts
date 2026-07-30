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
};

/** ⚠️ PROVISIONAL — awaiting the owner's exact Framer values. */
export const heroTextReveal: TextRevealSettings = {
  revealColor: "var(--mh-green)",
  revealColor2: "var(--mh-ink)",
  beforeColor: "transparent",
  afterColor: "var(--color-fg)",
  duration: 700,
  pause: 0,
  delay: 0,
  easeIn: 0.7,
  easeOut: 0.3,
  direction: "left",
  overlayVerticalPadding: 4,
};

/**
 * Background bar-pattern field.
 *
 * The original is not a continuous loop of bars growing from zero. It is a set
 * of discrete Framer variants ("Animation State 1..N"), each holding a fixed
 * arrangement, with Framer morphing between them. Reproduced here as: a fixed
 * set of bars whose heights change per state, animated with a spring.
 *
 * Verified against the published CSS: in State 1 every bar sits at `height: 1%`,
 * matching the Framer inspector.
 */
export const patternField = {
  /** Number of discrete arrangements cycled through. */
  stateCount: 4,

  /**
   * Milliseconds each state is held before switching. Taken from the owner's
   * Framer trigger: On Appear → Delay 2.4s → Set Variant.
   */
  stateInterval: 2400,

  /**
   * Spring for the morph between states. The owner's Framer transition is a
   * time-based spring: 2s, no delay, no bounce. Framer Motion expresses that as
   * a duration-based spring with `bounce: 0`.
   */
  spring: { type: "spring", duration: 2, bounce: 0 },

  /**
   * The field is split into horizontal rows, mirroring the `1st`..`7th` groups
   * in the Framer component. A bar occupies one row and grows within it, which
   * is what keeps bars short relative to the viewport.
   */
  rows: 6,

  /**
   * Bar height as a fraction of its row, per state. Never a fraction of the
   * whole field — that was the sizing error in the first pass, which produced
   * bars up to full viewport height instead of the ~5–22% the original shows.
   */
  minScale: 0.15,
  maxScale: 1,

  /** Bar widths in px, sampled per bar. Matches the Figma fixed widths. */
  widths: [14, 30, 48, 56],

  /** Bars per side, by breakpoint. */
  count: { desktop: 20, tablet: 15, mobile: 9 },

  /**
   * Fixed PRNG seeds. These MUST stay constant — the field is generated during
   * render on both server and client, so a time- or Math.random-based source
   * would produce different markup on each side and cause a hydration error.
   */
  seeds: { left: 20260730, right: 19880413 },
} as const;
