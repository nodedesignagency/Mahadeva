/**
 * Animation configuration.
 *
 * The tunable numbers behind the two signature effects live here so they can be
 * corrected without touching component code.
 *
 * ⚠️ PROVISIONAL VALUES
 * The reveal colours/timings and the bar timings below are placeholders pending
 * the real values from the template owner's Framer project. They are the
 * component defaults from the original `TextRevealVariable`, with the reveal
 * colours swapped to the site palette. Replace them here and nowhere else.
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

/** PROVISIONAL — awaiting the owner's Framer values. */
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
 * Bars grow from zero height to a random target and loop. Heights are animated
 * via `scaleY` rather than `height` so the work stays on the compositor.
 *
 * ⚠️ PROVISIONAL — awaiting the owner's timing details.
 */
export const patternField = {
  /** Milliseconds for one bar to grow to its target height. */
  growDuration: 1200,
  /** Milliseconds between consecutive bars starting — creates the ripple. */
  stagger: 90,
  /** Milliseconds held at full height before the next cycle re-randomises. */
  holdDuration: 900,
  /** Bar heights as a fraction of the field height. */
  minHeight: 0.08,
  maxHeight: 1,
  /** Bar widths in px, picked at random per bar. Matches the Figma values. */
  widths: [30, 48],
  /**
   * Bars per side, by breakpoint. Density drops on smaller screens: the field
   * is decorative and every bar is an animated element.
   */
  count: { desktop: 22, tablet: 16, mobile: 10 },
  /**
   * Fixed PRNG seeds. These MUST stay constant — the field is generated during
   * render on both server and client, so an unseeded or time-based source would
   * produce different markup on each side and cause a hydration error.
   */
  seeds: { left: 20260730, right: 19880413 },
} as const;
