/**
 * Motion tokens and shared variants.
 *
 * The rule this file exists to enforce: no component contains a literal
 * duration, delay or easing curve. Everything imports from here, so the site's
 * motion can be retuned in one place and stays internally consistent.
 *
 * The easing arrays mirror the `--ease-*` custom properties in
 * styles/theme.css one-to-one. If you change one, change both.
 */

import type { Transition, Variants } from "motion/react";

/**
 * Cubic-bezier control points, matching the CSS easing tokens.
 *
 * `reveal` is taken verbatim from the original site's inline transition on the
 * heading reveal spans — it is the template's signature curve, so prefer it for
 * anything that reads as "content appearing".
 */
export const easings = {
  reveal: [0.7, 0, 0.3, 1],
  out: [0.33, 1, 0.68, 1],
  outExpo: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  linear: [0, 0, 1, 1],
} as const;

/** Seconds. Mirrors `--duration-*`. */
export const durations = {
  /** Per-word heading reveal, from the original. */
  word: 0.25,
  fast: 0.18,
  hover: 0.25,
  base: 0.6,
  slow: 0.8,
  transition: 0.7,
} as const;

export const stagger = {
  tight: 0.05,
  base: 0.08,
  loose: 0.12,
} as const;

/**
 * Shared viewport config for scroll-triggered entrances. `once` matters: the
 * original is a polished marketing site, not a toy — sections should not
 * re-animate every time they re-enter the viewport.
 *
 * The negative margin delays the trigger until the section is meaningfully
 * on screen rather than one pixel in.
 */
export const viewport = { once: true, margin: "-15% 0px" } as const;

export const transitions = {
  base: { duration: durations.base, ease: easings.out },
  slow: { duration: durations.slow, ease: easings.outExpo },
  hover: { duration: durations.hover, ease: easings.out },
  /** Collapsed transition used whenever reduced motion is requested. */
  instant: { duration: 0.01 },
} satisfies Record<string, Transition>;

/* ---------------------------------------------------------------------------
 * Variants
 *
 * Each factory takes `reduced` so a single `useReducedMotion()` read at the
 * component boundary can collapse the animation. The resting (`animate`) state
 * is always the fully visible one, which means: if JS never runs, or the user
 * asked for no motion, the content is present and correct.
 * ------------------------------------------------------------------------- */

/** Fade + rise. The workhorse entrance for nearly every block on the site. */
export function fadeUp(reduced: boolean, distance = 32): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduced ? transitions.instant : transitions.base,
    },
  };
}

export function fade(reduced: boolean): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduced ? transitions.instant : transitions.base,
    },
  };
}

/** Scale-in, for imagery and the hero illustration. */
export function scaleIn(reduced: boolean, from = 0.92): Variants {
  return {
    hidden: { opacity: 0, scale: reduced ? 1 : from },
    visible: {
      opacity: 1,
      scale: 1,
      transition: reduced ? transitions.instant : transitions.slow,
    },
  };
}

/**
 * Masked line reveal — the line slides up from behind an `overflow-hidden`
 * parent. Used for display headings. See components/motion/SplitText.
 */
export function maskReveal(reduced: boolean): Variants {
  return {
    hidden: { y: reduced ? "0%" : "110%" },
    visible: {
      y: "0%",
      transition: reduced
        ? transitions.instant
        : { duration: durations.slow, ease: easings.outExpo },
    },
  };
}

/**
 * Parent variant that sequences children. Children inherit `hidden`/`visible`
 * automatically, so a stagger group needs no per-child delay arithmetic.
 */
export function staggerParent(
  reduced: boolean,
  each: number = stagger.base,
  delayChildren = 0,
): Variants {
  return {
    hidden: {},
    visible: {
      transition: reduced
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: each, delayChildren },
    },
  };
}
