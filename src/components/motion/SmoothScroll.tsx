"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { anchorScroll, smoothScroll } from "@/config/animation";
import { cubicBezier, easings } from "@/lib/motion";

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
 * It also owns in-page jumps, for the same reason it owns the wheel: a link
 * to a `#id` on the page it is already on was landing in a single frame, and
 * the usual fix — `scroll-behavior: smooth` — cannot work here. That is the
 * browser scrolling the window, and Lenis is already scrolling the window from
 * its own frame loop; the two would be moving the same page at once. Whatever
 * owns the scroll has to own the jump, so the jump is handed to Lenis.
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

    const ease = cubicBezier(easings.out);

    function onClick(event: MouseEvent) {
      // Leave anything the browser is about to treat specially alone: a
      // modified click is a request for a new tab or a download, and a
      // non-primary button is not a navigation at all.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      // The skip link, which must keep the browser's own handling — see the
      // note on it. Anything else can opt out the same way.
      if (anchor.hasAttribute("data-instant")) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href.length < 2) return;

      let target: Element | null = null;
      try {
        target = document.querySelector(href);
      } catch {
        // A fragment that is not a valid selector. Let the browser have it.
        return;
      }
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();

      /**
       * No offset, and that is measured rather than assumed.
       *
       * `scroll-padding-top` on the root is already the header's height, and
       * it is honoured here — the target lands exactly clear of the header
       * with nothing passed, the same place the browser's own jump puts it.
       * Taking the header off again on top of that pushed it a second header
       * further down: 160px from the top instead of 80.
       *
       * So the padding is the one place the header's height is stated, and
       * this does not restate it.
       */
      lenis.scrollTo(target, {
        duration: anchorScroll.duration,
        easing: ease,
      });

      // The address still gets the fragment, so the link is shareable and the
      // back button has something to go back to — pushed rather than assigned,
      // which would make the browser jump the page out from under the scroll.
      window.history.pushState(null, "", href);
    }

    // Capture, so a link that stops its own bubbling is still caught.
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
