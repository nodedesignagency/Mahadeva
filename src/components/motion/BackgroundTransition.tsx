"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Section-linked page background.
 *
 * Sections declare the surface they want with `data-bg`, and the page's
 * background crossfades to it as each takes over the viewport — a dark
 * section arriving is a transition rather than an edge scrolling past. This
 * is the owner's Framer "Changing Background" component: Section in View,
 * centre viewport, Replay on.
 *
 * Two decisions here were bought with debugging in the preview artifact, and
 * both are load-bearing:
 *
 * WHAT DECIDES: the section with the most visible pixels, measured from
 * IntersectionObserver entries with plain thresholds. For stacked sections
 * that is exactly the midline handover. Nothing reads `scrollY`,
 * `innerHeight` or `rootMargin` — the artifact host owns scrolling, where
 * scroll events may never fire inside this document and `rootMargin` is
 * ignored cross-origin, while observer geometry keeps arriving computed
 * against the top-level visible viewport.
 *
 * WHAT PAINTS: `body`, via inline style. A dedicated backdrop element on a
 * negative z-index proved correct in every local check and invisible in the
 * embed — the host's wrapping suppressed its paint layer while the body's
 * background remained demonstrably visible the whole time. The body canvas
 * is the bottom-most layer by specification; it cannot be occluded from
 * below, and an inline style outranks the host's own body styling. The fade
 * is the `transition` already on `body` in globals.css.
 *
 * Progressive by construction: sections paint their own fills in CSS, and
 * this effect clears them only inside the first observer callback — proof
 * the machinery is delivering — handing everything back on unmount. If the
 * script never runs, the page is the hard-edged version, never light text
 * stranded on the wrong surface.
 *
 * REBUILT PER ROUTE, and that is not an optimisation. This component lives in
 * the chrome, which outlives the page inside it, so a client-side navigation
 * swaps every `[data-bg]` section under an observer still watching the old
 * ones. Nothing then reports, the ink token keeps the surface the *previous*
 * page ended on, and the new page — which paints its own fill in CSS
 * regardless — gets the wrong ink on it. Arriving at a dark page from a light
 * one that way puts ink #0e1e1d on ground #0e1e1d: the text is not dim, it is
 * absent. It reads as correct on a hard load, which is exactly how it hides.
 */

/**
 * The three variants the original's component switches between, under the
 * names it uses for them. "Green" is the dark surface — the whole palette is
 * built on that green, so it is the page's colour rather than a section's.
 */
const variants: Record<string, { bg: string; ink: string }> = {
  white: { bg: "var(--color-bg-white)", ink: "var(--color-fg-on-light)" },
  green: { bg: "var(--color-bg)", ink: "var(--color-fg)" },
  beige: { bg: "var(--color-bg-light)", ink: "var(--color-fg-on-light)" },
};

/**
 * Callback whenever a section's visible share crosses 5% of its own height —
 * fine enough that the handover lands within a few dozen pixels of exact.
 */
const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);

export function BackgroundTransition() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const marker = ref.current;
    if (!marker) return;

    // Queried from this component's own root rather than `document`: a host
    // can isolate the page's tree where `document.querySelectorAll` sees
    // nothing.
    const rootNode = marker.getRootNode() as ParentNode;
    const sections = [...rootNode.querySelectorAll<HTMLElement>("[data-bg]")];
    if (sections.length === 0) return;

    const body = marker.ownerDocument.body;
    const rootStyle = marker.ownerDocument.documentElement.style;

    // `data-bg-keep` opts a section out of the takeover — About is pinned
    // over the hero, and transparency there would show the hero through it —
    // while still letting it compete for the handover.
    const painted = sections.filter((section) => !("bgKeep" in section.dataset));
    let cleared = false;
    let current = "";

    /** Visible pixels per section, updated from whichever entries arrive. */
    const visible = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        if (!cleared) {
          cleared = true;
          painted.forEach((section) => {
            section.style.backgroundColor = "transparent";
          });
        }

        for (const entry of entries) {
          visible.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRect.height : 0,
          );
        }

        // Most visible pixels wins; ties go to the later section, so during
        // the sticky stack the panel riding *over* the pinned hero owns the
        // surface once it covers as much as the hero does.
        //
        // Dark sections carry a handicap: their pixels count at two thirds,
        // so the dark surface owns the page only while a dark section clearly
        // dominates the viewport. That pulls both handovers of a dark section
        // toward its own edges — arriving, the page stays light a beat
        // longer; leaving, it turns light a beat sooner — which is where the
        // owner's Framer version lands them, and it means a fast fling out of
        // a dark section has already settled back to white by the time the
        // scroll stops. The light half of each crossfade also happens mostly
        // over the dark section's own ground, which is what keeps it subtle.
        let active: HTMLElement | null = null;
        let most = 0;
        for (const section of sections) {
          const pixels =
            (visible.get(section) ?? 0) *
            (section.dataset.bg === "green" ? 2 / 3 : 1);
          if (pixels >= most && pixels > 0) {
            most = pixels;
            active = section;
          }
        }

        const value = variants[active?.dataset.bg ?? ""];
        if (value && value.bg !== current) {
          current = value.bg;
          body.style.backgroundColor = value.bg;
          // The surface and its contrasting ink move as one write, so text
          // bound to the ink token fades on the same clock as the background
          // beneath it.
          rootStyle.setProperty("--color-bg-dynamic", value.bg);
          rootStyle.setProperty("--color-fg-dynamic", value.ink);
        }
      },
      { threshold: thresholds },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      if (cleared) {
        painted.forEach((section) => {
          section.style.backgroundColor = "";
        });
        body.style.backgroundColor = "";
        rootStyle.removeProperty("--color-bg-dynamic");
        rootStyle.removeProperty("--color-fg-dynamic");
      }
    };
    // `pathname`: tear the observer down and build it again against the
    // sections the new page brought with it.
  }, [pathname]);

  // Nothing visual — an inert marker whose only job is locating the tree
  // this component was mounted into.
  return <span ref={ref} hidden aria-hidden="true" />;
}
