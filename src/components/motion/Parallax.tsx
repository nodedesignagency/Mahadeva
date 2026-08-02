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
 * Runs at every breakpoint — the element is sized down on smaller screens
 * rather than pinned, which is what keeps the drift from crowding the content
 * around it. The one reader who gets no movement is the one who asked for none.
 */

type ParallaxProps = {
  children: ReactNode;
  /** Offset at each end of the traverse, as a percentage of the element. */
  drift: string;
  className?: string;
};

export function Parallax({ children, drift, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Off for the server's markup and the first client render, so they agree.
  // Without it the element paints at one end of its drift and then jumps to
  // wherever the scroll position actually puts it.
  //
  // Turned on a frame later rather than synchronously: the scroll position has
  // settled by then, and setting state straight from an effect would cascade a
  // render before the browser has painted anything.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEnabled(!reduced));
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

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
