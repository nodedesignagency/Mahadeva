"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { statCounter } from "@/config/animation";
import { cn } from "@/lib/cn";
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
 *
 * The figure is Geist Regular. The owner's Framer file names the style Medium
 * but renders it at Regular, and the reference shot is the target — at 100px
 * the difference between the two is plain.
 */

/**
 * `useLayoutEffect` warns when React renders it on the server. The swap it
 * performs is client-only by definition, so there it is simply not the layout
 * one.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Two typographic sizes, both Geist against the same 50px affix.
 *
 * `display` is the trust panels': a 100px figure, its unit set as a capital
 * because at that size the panels read as a headline. `compact` is the
 * pricing page's: 56px, the affix in medium, and the unit exactly as it is
 * written — an uppercased "x" beside a 56px figure is nearly a second digit.
 */
const sizes = {
  display: { figure: "text-stat", affix: "text-stat-affix uppercase" },
  compact: { figure: "text-stat-sm", affix: "text-stat-affix font-medium" },
} as const;

type StatCounterProps = {
  /** The end number — what the figure counts up to. */
  value: number;
  /** Sits before the figure, e.g. the "$" on revenue. */
  prefix?: string;
  /** Sits after it: %, x, h, m. */
  unit: string;
  size?: keyof typeof sizes;
};

export function StatCounter({
  value,
  prefix,
  unit,
  size = "display",
}: StatCounterProps) {
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
    <p ref={ref} className="flex items-baseline font-ui font-normal text-fg-on-light">
      {prefix ? (
        <span className={sizes[size].affix}>{prefix}</span>
      ) : null}
      {/* Proportional figures, not tabular. Geist's tabular set is a different
          drawing — wider, squarer, and its 1 carries a full foot — so it reads
          as another typeface altogether at 100px. It would hold the unit still
          while the count runs; the design wins over the wobble.

          Fixed locale rather than the browser's, so the server's text and the
          client's first frame group digits the same way. */}
      <span className={cn(sizes[size].figure, "leading-none")}>
        {(counting ? shown : value).toLocaleString("en-US")}
      </span>
      <span className={sizes[size].affix}>{unit}</span>
    </p>
  );
}
