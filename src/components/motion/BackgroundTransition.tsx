"use client";

import { useEffect, useRef } from "react";

/**
 * Section-linked page background.
 *
 * Sections declare the surface they want with `data-bg`, and a backdrop
 * behind the page crossfades to it as each takes over the viewport — a dark
 * section arriving is a transition rather than an edge scrolling past. This
 * is the owner's Framer "Changing Background" component: Section in View,
 * centre viewport, Replay on.
 *
 * The owning section is *the one with the most visible pixels*, measured from
 * IntersectionObserver entries. For stacked sections that is exactly the
 * midline handover — the switch lands when the incoming section covers more
 * of the viewport than the outgoing one — but unlike any formulation built on
 * `scrollY`/`innerHeight`, it also works where this page actually runs:
 *
 *  - In the preview artifact the host frame may own scrolling entirely, so
 *    `window.scrollY` never changes and scroll events never fire. Observer
 *    geometry is computed against the top-level *visible* viewport across
 *    frame boundaries, so entries keep arriving no matter who scrolls.
 *  - `rootMargin` is the one part of the API ignored for cross-origin
 *    embeds — an earlier version leaned on it and silently died — so none is
 *    used: plain thresholds only.
 *
 * Progressive by construction: sections paint their own fills in CSS, and
 * this effect clears them only inside the first observer callback — proof the
 * machinery is actually delivering — handing them back on unmount. If the
 * script never runs, the page is the hard-edged version, never light text
 * stranded on the wrong surface.
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

/**
 * Callback whenever a section's visible share crosses 5% of its own height —
 * fine enough that the handover lands within a few dozen pixels of exact.
 */
const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);

export function BackgroundTransition() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backdrop = ref.current;
    if (!backdrop) return;

    // Queried from this component's own root rather than `document`: a host
    // can isolate the page's tree where `document.querySelectorAll` sees
    // nothing.
    const rootNode = backdrop.getRootNode() as ParentNode;
    const sections = [...rootNode.querySelectorAll<HTMLElement>("[data-bg]")];
    if (sections.length === 0) return;

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
        let active: HTMLElement | null = null;
        let most = 0;
        for (const section of sections) {
          const pixels = visible.get(section) ?? 0;
          if (pixels >= most && pixels > 0) {
            most = pixels;
            active = section;
          }
        }

        const value = variants[active?.dataset.bg ?? ""];
        if (value && value !== current) {
          current = value;
          backdrop.style.backgroundColor = value;
        }
      },
      { threshold: thresholds },
    );

    sections.forEach((section) => observer.observe(section));

    // TEMPORARY diagnostics for the preview artifact: a live readout of the
    // geometry this environment actually reports. Removed once the host's
    // behaviour is understood.
    const hud = document.createElement("div");
    hud.setAttribute("style",
      "position:fixed;left:8px;bottom:8px;z-index:99999;background:#000c;color:#0f0;" +
      "font:10px/1.5 monospace;padding:6px 8px;pointer-events:none;white-space:pre;max-width:420px");
    backdrop.after(hud);
    let hits = 0;
    const origCb = () => {};
    const tick = () => {
      const rows = sections
        .map((s, i) => `${i}:${s.dataset.bg}=${Math.round(visible.get(s) ?? -1)}`)
        .join(" ");
      hud.textContent =
        `scrollY=${Math.round(window.scrollY)} innerH=${window.innerHeight} ` +
        `docH=${document.documentElement.scrollHeight}\n` +
        `hits=${hits} cleared=${cleared} cur=${current || "-"}\n${rows}`;
    };
    const hudInterval = window.setInterval(tick, 400);
    const bump = new IntersectionObserver((es) => { hits += es.length; tick(); }, { threshold: thresholds });
    sections.forEach((s) => bump.observe(s));
    void origCb;

    return () => {
      window.clearInterval(hudInterval);
      bump.disconnect();
      hud.remove();
      observer.disconnect();
      if (cleared) {
        painted.forEach((section) => {
          section.style.backgroundColor = "";
        });
      }
    };
  }, []);

  return (
    // The page's backdrop: behind everything, ignoring the pointer, starting
    // on the same dark the body paints so there is no flash before the first
    // entries land. The fade is this transition; reduced motion collapses it
    // via the global backstop.
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-bg-dynamic transition-[background-color] duration-(--duration-base) ease-(--ease-in-out)"
    />
  );
}
