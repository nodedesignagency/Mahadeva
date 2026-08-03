"use client";

import { useEffect, useRef } from "react";

/**
 * Section-linked page background.
 *
 * Sections declare the surface they want with `data-bg`, and a backdrop
 * behind the page crossfades to it as each takes over the viewport — so a
 * dark section arriving is a transition rather than an edge scrolling past.
 * The handover point is the viewport's middle, in both directions, matching
 * the owner's Framer component: Section in View, centre viewport, Replay on.
 *
 * Progressive by construction. Every section still paints its own fill in
 * CSS; this effect *takes the fills over* at runtime, clearing them only once
 * it is actually running, and hands them back on unmount. If this script
 * never executes — or cannot find the sections — the page is simply the
 * hard-edged version, never white text on the wrong surface. An earlier
 * version inverted that dependency and the preview embed, where the page runs
 * inside a host it does not own, shipped broken.
 *
 * Two more embed lessons are load-bearing here:
 *  - Sections are queried from this component's own root node, not
 *    `document` — a host can isolate the page's DOM tree where
 *    `document.querySelectorAll` sees nothing.
 *  - The colour is painted on an element this component renders, not on
 *    `body` — a host owns `body`, and a stylesheet rule for it may never
 *    reach ours.
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backdrop = ref.current;
    if (!backdrop) return;

    const rootNode = backdrop.getRootNode() as ParentNode;
    const sections = [...rootNode.querySelectorAll<HTMLElement>("[data-bg]")];
    if (sections.length === 0) return;

    // Take over the painting. `data-bg-keep` opts a section out — About is
    // pinned over the hero, and transparent there would show the hero through
    // it — while still letting it act as a handover trigger.
    const painted = sections.filter((section) => !("bgKeep" in section.dataset));
    painted.forEach((section) => {
      section.style.backgroundColor = "transparent";
    });

    let current = "";
    let frame = 0;

    // The lowest section whose top is above the midline owns the background.
    // Recomputed from the elements on every pass, so a resize, a font swap or
    // a late-loading image cannot leave it stale.
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
        backdrop.style.backgroundColor = value;
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
      painted.forEach((section) => {
        section.style.backgroundColor = "";
      });
    };
  }, []);

  return (
    // The page's backdrop: behind everything, ignoring the pointer, starting
    // on the same dark the body paints so there is no flash before the first
    // sync. The fade is this transition; reduced motion collapses it via the
    // global backstop.
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-bg-dynamic transition-[background-color] duration-(--duration-base) ease-(--ease-in-out)"
    />
  );
}
