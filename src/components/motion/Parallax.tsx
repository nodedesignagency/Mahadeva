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
 * `drift` is the total climb over a full traverse, as a percentage of the
 * element's own height, so nothing has to be measured and the server and client
 * agree on the markup. See `markParallax` for how it derives from a speed.
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

  /**
   * Progress is measured against the section, not against this element.
   *
   * The mark hangs far below its section, so its own box enters the viewport
   * late and leaves after the page has run out of scroll — most of its travel
   * was simply unreachable, and it stopped short of the text every time no
   * matter how far the drift was pushed. The section enters as soon as it
   * appears, which is when the effect should start.
   */
  const track = useRef<HTMLElement | null>(null);

  // Off for the server's markup and the first client render, so they agree.
  // Without it the element paints at one end of its drift and then jumps to
  // wherever the scroll position actually puts it.
  //
  // Turned on a frame later rather than synchronously: the scroll position has
  // settled by then, and setting state straight from an effect would cascade a
  // render before the browser has painted anything.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    track.current = ref.current?.closest("section") ?? ref.current;
    const frame = requestAnimationFrame(() => setEnabled(!reduced));
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  // Measured from the element entering the viewport to it leaving, so the
  // midpoint of the drift is the midpoint of its journey across the screen.
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start end", "end start"],
  });
  // Starts where the layout puts it and accumulates upward, rather than
  // swinging symmetrically about its resting place. That is what "scroll
  // speed" means: the element is in position when it appears and outruns the
  // page from there. Swinging both ways started it below its own position and
  // spent half the travel just getting back, which is why it never reached the
  // text.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `-${drift}`]);

  return (
    <motion.div ref={ref} className={className} style={enabled ? { y } : undefined}>
      {children}
    </motion.div>
  );
}
