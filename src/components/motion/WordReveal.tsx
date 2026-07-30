"use client";

import { useRef, type ComponentType, type Ref } from "react";
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { durations, easings } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { motionTags, type MotionTagName } from "@/lib/motionTag";

/**
 * The template's signature heading treatment: words fade in one at a time by
 * animating their *text colour* from transparent to the final colour.
 *
 * This mirrors the original exactly — there, each word is a span that starts at
 * `rgba(255,255,255,0)` and transitions to `#fff` over 250ms on
 * `cubic-bezier(0.7, 0, 0.3, 1)`. It is deliberately not a transform/mask
 * reveal: there is no vertical movement, so a mask-based implementation would
 * look visibly different.
 *
 * Accessibility: the words are split for animation only. The parent carries the
 * full string as its accessible name and the individual spans are hidden from
 * assistive tech, so a screen reader announces one heading rather than a stream
 * of fragments. The original ships 112 unlabelled fragment spans; this fixes
 * that.
 *
 * SSR: the text is present in the server-rendered HTML — only its colour
 * differs before hydration — so there is no hydration mismatch, no layout shift
 * and the copy is indexable.
 */

type WordRevealProps = {
  /** The heading text. Split on whitespace for the animation. */
  text: string;
  as?: MotionTagName;
  /** Play once on mount (hero) or when scrolled into view (everything else). */
  trigger?: "mount" | "inView";
  /** Seconds between consecutive words. */
  stagger?: number;
  /** Seconds before the first word begins. */
  delay?: number;
  id?: string;
  className?: string;
  /**
   * Final text colour. Defaults to the page foreground; pass a token class or
   * CSS colour when a heading sits on a light section.
   */
  color?: string;
};

export function WordReveal({
  text,
  as: Tag = "h2",
  trigger = "inView",
  stagger = 0.06,
  delay = 0,
  id,
  className,
  color = "var(--color-fg)",
}: WordRevealProps) {
  const reduced = useReducedMotion() ?? false;
  // Typed as the widest element the `as` prop can produce; motion.create()
  // narrows per tag, so the cast at the ref site keeps the generic usable.
  const ref = useRef<HTMLHeadingElement>(null);
  // `once` matters: headings should not re-animate every time they scroll back
  // into view. Matching the margin used by the other scroll entrances.
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const words = text.split(" ");
  const isActive = reduced || trigger === "mount" || inView;

  // The map's value type is a union across every supported tag, so its `ref`
  // prop narrows to an intersection of unrelated element types. The tag is
  // chosen by the caller and always an HTMLElement, so widen the ref here.
  const MotionTag = motionTags[Tag] as ComponentType<
    HTMLMotionProps<"div"> & { ref?: Ref<HTMLElement> }
  >;

  return (
    <MotionTag
      ref={ref}
      id={id}
      aria-label={text}
      className={cn("font-display", className)}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden="true"
          // Hook for the no-JS fallback in app/layout.tsx: without JS the words
          // would stay at their transparent initial colour and the heading
          // would be invisible.
          data-word-reveal=""
          // `inline` + a normal space keeps native wrapping and justification
          // intact, unlike inline-block words which break text-wrap: balance.
          className="inline"
          // Reduced motion skips the initial state entirely so the word is
          // painted at its final colour on the very first frame. Otherwise the
          // word starts transparent and animates in.
          initial={reduced ? false : { color: "var(--color-reveal-from)" }}
          animate={{ color: isActive ? color : "var(--color-reveal-from)" }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: durations.word,
                  ease: easings.reveal,
                  delay: delay + i * stagger,
                }
          }
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}
