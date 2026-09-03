/**
 * Motion tokens and shared variants.
 *
 * The rule this file exists to enforce: no component contains a literal
 * duration, delay or easing curve. Everything imports from here, so the site's
 * motion can be retuned in one place and stays internally consistent.
 *
 * The easing arrays and the duration table mirror the `--ease-*` and
 * `--duration-*` custom properties in styles/theme.css one-to-one. If you
 * change one, change both — and that mirror is why some entries here are read
 * by nothing in this file: they exist because the CSS side has them, not
 * because something imports them.
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

/** Seconds between one child's entrance and the next. */
export const stagger = { base: 0.08 } as const;

/**
 * Shared viewport config for scroll-triggered entrances. `once` matters: the
 * original is a polished marketing site, not a toy — sections should not
 * re-animate every time they re-enter the viewport.
 *
 * The negative margin delays the trigger until the section is meaningfully
 * on screen rather than one pixel in.
 */
export const viewport = { once: true, margin: "-15% 0px" } as const;

/**
 * The same, without the wait — for anything that has nothing to show until it
 * starts.
 *
 * A block that fades or rises is already legible while it waits, so holding it
 * back until it is meaningfully on screen costs nothing. A scrambled label is
 * not: it paints nothing at all until its run begins, so the delay above is
 * dead space where the words should be. On a 900px window that is 135px of
 * margin, and the mission heading sat blank through some 300px of scrolling
 * while plainly on screen.
 *
 * So the rule is not "start late" but "start when there is something to
 * look at" — which for these is the moment the label is reached.
 */
export const viewportOnEntry = { once: true } as const;

export const transitions = {
  base: { duration: durations.base, ease: easings.out },
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
