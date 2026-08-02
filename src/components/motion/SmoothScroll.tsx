"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { smoothScroll } from "@/config/animation";

/**
 * Site-wide smooth scrolling, matching the original's Smooth Scroll component.
 *
 * A wheel tick normally jumps the page; this eases it instead, so the whole
 * page carries the same weight as the animations on it.
 *
 * It keeps driving native window scroll rather than transforming a container,
 * which matters here: the heading reveals trigger on IntersectionObserver and
 * the mark's drift reads scroll position, and both would go wrong against a
 * page whose real scroll offset never changed.
 *
 * Renders nothing — it exists to own the instance's lifetime.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    // Easing the page for someone who asked for less motion is exactly the
    // thing they asked not to have; leave the browser's own scrolling alone.
    if (reduced) return;

    const lenis = new Lenis({ lerp: smoothScroll.lerp });

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
