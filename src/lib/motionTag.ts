import { motion } from "motion/react";

/**
 * Static motion component map.
 *
 * Motion components must be created once at module scope, never during render.
 * `motion.create(tag)` called in a render body returns a new component type
 * each time, so React unmounts and remounts the whole subtree — destroying DOM
 * state and restarting animations. React's `react-hooks/static-components` rule
 * catches exactly this.
 *
 * Restricting the set of animatable tags is a feature, not a limitation: it
 * keeps `as` type-safe and documents which elements the motion primitives
 * actually support.
 */
export const motionTags = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  figure: motion.figure,
  blockquote: motion.blockquote,
} as const;

/** Tags the motion primitives can render as. */
export type MotionTagName = keyof typeof motionTags;
