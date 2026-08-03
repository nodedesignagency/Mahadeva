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
 * The handover point is the viewport's middle: a section owns the background
 * from the moment its top passes the halfway line until the next section's top
 * does. Expressed as a `rootMargin` that collapses the observer's box to that
 * single line, so this stays one IntersectionObserver rather than a scroll
 * handler measuring every section on every frame.
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
    const apply = (section: HTMLElement) => {
      const value = variants[section.dataset.bg ?? ""];
      if (value) root.style.setProperty("--color-bg-dynamic", value);
    };

    // The lowest section whose top is above the midline is the one on screen.
    // Recomputed from the elements rather than tracked incrementally, so a
    // resize, a font swap or an image loading late cannot leave it stale.
    const sync = () => {
      const middle = window.innerHeight / 2;
      let active: HTMLElement | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= middle) active = section;
      }
      if (active) apply(active);
    };

    // Fires once per crossing rather than continuously: the observer's box is
    // the midline itself, so any section entering or leaving it is exactly the
    // handover this cares about.
    const observer = new IntersectionObserver(sync, {
      rootMargin: `-${Math.round(window.innerHeight / 2)}px 0px -${
        window.innerHeight - Math.round(window.innerHeight / 2) - 1
      }px 0px`,
      threshold: 0,
    });
    sections.forEach((section) => observer.observe(section));

    // The observer's margins are pixel values captured at setup, so a resize
    // has to rebuild it. Cheap, and it keeps the handover on the real midline.
    const onResize = () => sync();
    window.addEventListener("resize", onResize, { passive: true });

    sync();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
