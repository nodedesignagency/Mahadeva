"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Scroll-linked drift, the equivalent of Framer's Scroll Speed effect.
 *
 * At 100% an element travels with the page. Above that it outruns it, so it
 * climbs the content around it as you scroll — which is the effect here: the 3D
 * mark rises past the statement above it rather than sitting still beneath it.
 *
 * `drift` is expressed as a percentage of the element's own height, so nothing
 * has to be measured and the server and client agree on the markup. Framer's
 * 130% works out to roughly half the element's height in each direction over a
 * full traverse of the viewport — see `markParallax` for that arithmetic.
 *
 * Two things deliberately do not move: a reader who asked for reduced motion,
 * and any breakpoint below `minWidth`, where the mark sits in the flow and
 * drifting it would push it into the text.
 */

type ParallaxProps = {
  children: ReactNode;
  /** Offset at each end of the traverse, as a percentage of the element. */
  drift: string;
  /** Below this viewport width the element stays put. */
  minWidth: number;
  className?: string;
};

export function Parallax({ children, drift, minWidth, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Starts off so the server's markup and the first client render agree; the
  // effect turns it on where it applies.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [reduced, minWidth]);

  // Measured from the element entering the viewport to it leaving, so the
  // midpoint of the drift is the midpoint of its journey across the screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [drift, `-${drift}`]);

  return (
    <motion.div ref={ref} className={className} style={enabled ? { y } : undefined}>
      {children}
    </motion.div>
  );
}
