"use client";

import { useEffect } from "react";

/**
 * Section-linked page background.
 *
 * Sections do not paint their own fill. They declare which one they want with
 * `data-bg`, and the page background crossfades to it as each takes over the
 * viewport — so a dark section arriving is a transition rather than an edge
 * scrolling past.
 *
 * The handover point is the viewport's middle, in both directions: a section
 * owns the background from the moment its top passes the halfway line until
 * the next section's top does. That matches the owner's Framer component —
 * Section in View, centre of the viewport, Replay on.
 *
 * Driven by a scroll listener rather than an IntersectionObserver. The
 * observer version encoded the midline in `rootMargin`, and browsers ignore
 * `rootMargin` for cross-origin embedded documents — precisely where the
 * preview artifact runs — so the background silently stuck on its first
 * value. A rAF-throttled read of six element positions per scrolled frame is
 * well under any budget, and it behaves identically everywhere.
 *
 * The fade itself is the `transition` on `body` in globals.css. This component
 * only ever writes a colour; how it arrives is CSS, and reduced motion is
 * already handled there.
 */

/**
 * The three variants the original's component switches between, under the
 * names it uses for them. "Green" is the dark surface — the whole palette is
 * built on that green, so it is the page's colour rather than a section's.
 */
const variants: Record<string, string> = {
  white: "var(--color-bg-white)",
  green: "var(--color-bg)",
  beige: "var(--color-bg-light)",
};

export function BackgroundTransition() {
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-bg]")];
    if (sections.length === 0) return;

    const root = document.documentElement;
    let current: string | null = null;
    let frame = 0;

    // The lowest section whose top is above the midline is the one in charge.
    // Recomputed from the elements on every pass, so a resize, a font swap or
    // an image loading late cannot leave it stale.
    const sync = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let active: HTMLElement | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= middle) active = section;
      }
      const value = variants[active?.dataset.bg ?? ""];
      if (value && value !== current) {
        current = value;
        root.style.setProperty("--color-bg-dynamic", value);
      }
    };

    // Coalesce to one read per frame — scroll events can arrive faster than
    // paints, and measuring between them buys nothing.
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(sync);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    sync();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return null;
}
