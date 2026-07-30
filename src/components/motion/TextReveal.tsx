"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { TextRevealSettings } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * Two-bar heading wipe — a port of the template's Framer `TextRevealVariable`
 * component, preserving its exact animation sequence.
 *
 * The sequence, per the original:
 *
 *   1. Two overlay bars cover the text, both scaleX(0), origin on the leading
 *      edge.
 *   2. Bar 1 sweeps across (scaleX 0 -> 1).
 *   3. Bar 2 sweeps across behind it.
 *   4. With the text fully covered, every word's colour flips from `before` to
 *      `after` at once — invisible to the viewer.
 *   5. Both origins flip to the opposite edge.
 *   6. After `pause`, bar 2 sweeps back off (scaleX 1 -> 0), then bar 1.
 *
 * The result reads as two coloured bars sweeping over the heading and away,
 * leaving revealed text behind. Total ≈ 4 × duration + pause + delay.
 *
 * Kept faithful to the original deliberately: the chained `onfinish` callbacks
 * and the mid-sequence `transform-origin` flip are what give it its character,
 * and re-deriving them declaratively risks visible timing drift.
 *
 * Differences from the Framer original, all deliberate:
 *  - `prefers-reduced-motion` skips the wipe and paints the final text.
 *  - The heading carries an `aria-label` and the word spans are `aria-hidden`,
 *    so screen readers announce one heading instead of a stream of fragments.
 *  - Word text is rendered directly rather than through `dangerouslySetInnerHTML`.
 *  - Animations are cancelled on unmount so a fast route change cannot leave a
 *    callback writing to a detached node.
 */

type TextRevealProps = {
  text: string;
  settings: TextRevealSettings;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /** `onAppear` plays on mount; `inView` waits for the element to be scrolled to. */
  trigger?: "onAppear" | "inView";
  id?: string;
  className?: string;
};

export function TextReveal({
  text,
  settings,
  as: Tag = "h2",
  trigger = "onAppear",
  id,
  className,
}: TextRevealProps) {
  const reduced = useReducedMotion() ?? false;
  const blockRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const overlay2Ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reduced || hasAnimated.current) return;

    const block = blockRef.current;
    const overlay = overlayRef.current;
    const overlay2 = overlay2Ref.current;
    if (!block || !overlay || !overlay2) return;

    const {
      duration,
      pause,
      delay,
      easeIn,
      easeOut,
      direction,
      afterColor,
      overlayVerticalPadding: vPad,
    } = settings;

    const easing = `cubic-bezier(${easeIn},0,${easeOut},1)`;
    const isLeft = direction === "left";

    // Every animation and timer started here, so unmount can cancel all of them.
    const animations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const sweep = (el: HTMLElement, from: number, to: number) => {
      const animation = el.animate(
        [{ transform: `scaleX(${from})` }, { transform: `scaleX(${to})` }],
        { duration, fill: "forwards", easing },
      );
      animations.push(animation);
      return animation;
    };

    const run = () => {
      if (cancelled) return;
      hasAnimated.current = true;

      // Size the bars to the text box plus the vertical padding, matching the
      // original's measure-then-position approach.
      const { offsetWidth: width, offsetHeight: height } = block;
      for (const el of [overlay, overlay2]) {
        el.style.left = "0px";
        el.style.top = `-${vPad}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height + vPad * 2}px`;
        el.style.transform = "scaleX(0)";
        el.style.transformOrigin = isLeft ? "left center" : "right center";
      }

      // Flush the reset before animating, so the first frame is scaleX(0).
      void overlay.getBoundingClientRect();

      sweep(overlay, 0, 1).onfinish = () => {
        if (cancelled) return;

        sweep(overlay2, 0, 1).onfinish = () => {
          if (cancelled) return;

          // Text is fully covered — swap every word's colour at once.
          block.querySelectorAll<HTMLElement>("[data-reveal-word]").forEach((word) => {
            word.style.color = afterColor;
          });

          const exitOrigin = isLeft ? "right center" : "left center";
          overlay.style.transformOrigin = exitOrigin;
          overlay2.style.transformOrigin = exitOrigin;

          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              sweep(overlay2, 1, 0).onfinish = () => {
                if (cancelled) return;
                sweep(overlay, 1, 0);
              };
            }, pause),
          );
        };
      };
    };

    let observer: IntersectionObserver | undefined;

    if (trigger === "inView") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              observer?.disconnect();
              timers.push(setTimeout(run, delay));
            }
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(block);
    } else {
      // Defer a frame so layout has settled and the measure above is accurate.
      const frame = requestAnimationFrame(() => timers.push(setTimeout(run, delay)));
      timers.push(frame as unknown as ReturnType<typeof setTimeout>);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
    };
  }, [reduced, settings, trigger]);

  // Reduced motion paints the final state immediately; otherwise words start at
  // the pre-reveal colour and are flipped once the bars cover them.
  const initialColor = reduced ? settings.afterColor : settings.beforeColor;

  return (
    <Tag
      ref={blockRef}
      id={id}
      aria-label={text}
      className={cn("relative inline-block font-display", className)}
    >
      {text.split(" ").map((word, i, all) => (
        <span
          key={`${word}-${i}`}
          data-reveal-word=""
          aria-hidden="true"
          style={{ color: initialColor, transition: "color 0.25s cubic-bezier(0.7,0,0.3,1)" }}
        >
          {word}
          {i < all.length - 1 ? " " : ""}
        </span>
      ))}

      {/* Bars are aria-hidden decoration; sized and positioned at runtime. */}
      {!reduced ? (
        <>
          <span
            ref={overlayRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5] scale-x-0"
            style={{ background: settings.revealColor }}
          />
          <span
            ref={overlay2Ref}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[6] scale-x-0"
            style={{ background: settings.revealColor2 }}
          />
        </>
      ) : null}
    </Tag>
  );
}
