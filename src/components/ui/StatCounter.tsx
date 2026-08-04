"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { statCounter } from "@/config/animation";
import { easings, viewport } from "@/lib/motion";

/**
 * One trust statistic's figure: prefix, counting number, unit.
 *
 * The original is Framer's NumberCounter — every figure climbs from the same
 * start number to its own end number when the section is scrolled to, once.
 * Its Increment is Integer, so this is a plain tween rounded to whole numbers
 * rather than the rolling digit columns the pricing figures use: those swap
 * between two values of the same length, while these grow from one digit to
 * two and the rolling component animates that width by sliding the new column
 * in from outside its own box — digits appear beyond the panel's padding.
 *
 * Three states, in the order a visitor can meet them:
 *
 *  1. Server-rendered, and with JS off or still loading: the real figure. A
 *     counter that never runs must not leave "1" on the page.
 *  2. Mounted: parked at the start number. The swap is a layout effect, so it
 *     lands in the same frame as hydration and the final figure is never
 *     painted and then taken away.
 *  3. Scrolled to: the count runs, on the shared viewport threshold, so it
 *     starts with the rest of the section's entrance.
 *
 * Reduced motion keeps state 1 — the figure is the content, so it stays
 * present and correct rather than being animated or withheld.
 */

/**
 * `useLayoutEffect` warns when React renders it on the server. The swap it
 * performs is client-only by definition, so there it is simply not the layout
 * one.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type StatCounterProps = {
  /** The end number — what the figure counts up to. */
  value: number;
  /** Sits before the figure, e.g. the "$" on revenue. */
  prefix?: string;
  /** Sits after it: %, x, h, m. */
  unit: string;
};

export function StatCounter({ value, prefix, unit }: StatCounterProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, viewport);
  const reduced = useReducedMotion() ?? false;
  const [counting, setCounting] = useState(false);
  // Annotated: the config is `as const`, so an inferred state type would be
  // the literal 1 and nothing else could ever be counted to.
  const [shown, setShown] = useState<number>(statCounter.start);

  useIsomorphicLayoutEffect(() => {
    if (!reduced) setCounting(true);
  }, [reduced]);

  useEffect(() => {
    if (!counting || !inView) return;
    const controls = animate(statCounter.start, value, {
      duration: statCounter.duration / 1000,
      ease: easings.out,
      onUpdate: (current) => setShown(Math.round(current)),
    });
    return () => controls.stop();
  }, [counting, inView, value]);

  return (
    <p ref={ref} className="flex items-baseline font-ui font-medium text-fg-on-light">
      {prefix ? <span className="text-stat-affix">{prefix}</span> : null}
      {/* Fixed locale rather than the browser's, so the server's text and the
          client's first frame group digits the same way. */}
      <span className="text-stat leading-none tabular-nums">
        {(counting ? shown : value).toLocaleString("en-US")}
      </span>
      <span className="text-stat-affix uppercase">{unit}</span>
    </p>
  );
}
