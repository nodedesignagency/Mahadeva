"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { pageTransition } from "@/config/animation";

/**
 * Three cards that cover the page on the way out and clear it on the way in.
 *
 * The sequence is one movement across a navigation: the cards climb over the
 * page bottom to top, the route changes underneath them while nothing is
 * visible, and they carry on off the top to reveal the page that arrived. The
 * cover is staggered so it reads as three cards rather than one block, and it
 * unstacks in reverse — last card on is first card off.
 *
 * It lives above the router rather than inside a page, so it survives the
 * navigation it is animating. A component that unmounted with the outgoing
 * page could only ever play the first half.
 *
 * Three rules keep it from touching anything else on the page, and all three
 * are deliberate:
 *
 *  1. **It renders in place, not through a portal.** A portal would append to
 *     `document.body`, mutating a tree React itself owns here. There is nothing
 *     to gain from it: `position: fixed` is only relative to something other
 *     than the viewport when an ancestor carries a transform or a filter, and
 *     this renders as a direct child of the body already.
 *  2. **It renders identically on the server and the client.** No mount flag,
 *     nothing that resolves differently in the two passes — the cards are in
 *     the markup from the start, parked a full screen below. Hydration
 *     therefore has nothing to reconcile, which is what stops this from
 *     disturbing the components that measure the page on the way up.
 *  3. **It never blocks a navigation.** Everything up to `preventDefault` is
 *     inside a try/catch that falls through to the browser's own handling, and
 *     a route that does not arrive sweeps the cards off anyway. A broken
 *     animation costs the animation, not the link.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;

  const c1 = useAnimationControls();
  const c2 = useAnimationControls();
  const c3 = useAnimationControls();

  /** Guards against a second click while a transition is already running. */
  const busy = useRef(false);
  /** The path being navigated to, held until the router reports it arrived. */
  const pending = useRef<string | null>(null);
  const overlay = useRef<HTMLDivElement | null>(null);

  /*
   * While a transition runs, the overlay takes the pointer. The cards do not
   * cover the screen for the first stretch of the cover, so without this a
   * second link is still clickable underneath a wipe that is already underway —
   * and that click has nowhere to go, since a transition in flight ignores it.
   * Taking the pointer makes the page visibly inert for the length of the
   * sequence instead of leaving one live link that silently does nothing.
   *
   * Set on the node rather than through state: this says nothing about what to
   * render, and a re-render mid-sequence is exactly what should not happen.
   */
  const setInert = (inert: boolean) => {
    if (overlay.current) overlay.current.style.pointerEvents = inert ? "auto" : "none";
  };

  const cover = useCallback(async () => {
    c1.set(OFF_IN);
    c2.set(OFF_IN);
    c3.set(OFF_IN);
    c1.start({ ...CENTER, transition: TRANSITION });
    await wait(pageTransition.stagger);
    c2.start({ ...CENTER, transition: TRANSITION });
    await wait(pageTransition.stagger);
    await c3.start({ ...CENTER, transition: TRANSITION });
  }, [c1, c2, c3]);

  const clear = useCallback(async () => {
    c3.start({ ...OFF_OUT, transition: TRANSITION });
    await wait(pageTransition.stagger);
    c2.start({ ...OFF_OUT, transition: TRANSITION });
    await wait(pageTransition.stagger);
    await c1.start({ ...OFF_OUT, transition: TRANSITION });
    // Back to where a fresh cover starts from, so the next one is not a jump.
    c1.set(OFF_IN);
    c2.set(OFF_IN);
    c3.set(OFF_IN);
  }, [c1, c2, c3]);

  /** Sweep off once the route the cards were raised for has actually arrived. */
  useEffect(() => {
    if (pending.current === null || pending.current !== pathname) return;
    pending.current = null;

    if (reduced) {
      busy.current = false;
      return;
    }

    let cancelled = false;
    void clear().then(() => {
      if (cancelled) return;
      busy.current = false;
      setInert(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, reduced, clear]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      let destination: string;
      let target: string;

      // Everything that decides whether to take the click is in here. If any of
      // it throws, the click is left alone and the browser navigates normally.
      try {
        if (event.defaultPrevented || event.button !== 0) return;
        // A modified click is asking for a new tab or a download, not a
        // navigation to animate.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const node = event.target;
        const anchor =
          node instanceof Element ? node.closest<HTMLAnchorElement>("a[href]") : null;
        if (!anchor || anchor.hasAttribute("download")) return;

        const anchorTarget = anchor.getAttribute("target");
        if (anchorTarget && anchorTarget !== "_self") return;

        const href = anchor.getAttribute("href");
        if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return;

        const url = new URL(href, window.location.href);
        // Another site is the browser's business, and a link to the page we are
        // already on has nothing to transition to — covering the screen for it
        // would be a curtain over nothing.
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;

        destination = url.pathname + url.search + url.hash;
        target = url.pathname;
      } catch {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (busy.current) return;
      busy.current = true;
      setInert(true);
      pending.current = target;

      if (reduced) {
        setInert(false);
        router.push(destination);
        return;
      }

      void cover().then(() => {
        router.push(destination);
        /*
         * If the route never commits, the arrival effect never fires and the
         * cards stay parked over the page. Sweeping off after a grace period
         * costs nothing when the navigation did work — `pending` is already
         * cleared by then and this does nothing.
         */
        window.setTimeout(() => {
          if (pending.current === null) return;
          pending.current = null;
          void clear().then(() => {
            busy.current = false;
            setInert(false);
          });
        }, pageTransition.commitTimeout);
      });
    };

    /*
     * Capture on the document, which is what puts this ahead of next/link:
     * Link's handler runs on React's root, so the document is earlier in the
     * propagation path. Taking the click here and pushing the route ourselves
     * is what keeps the animation and the navigation in step rather than
     * racing.
     */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduced, router, cover, clear]);

  return (
    <div
      ref={overlay}
      aria-hidden
      data-page-transition=""
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
    >
      {[c1, c2, c3].map((controls, i) => (
        <motion.div
          key={i}
          animate={controls}
          initial={OFF_IN}
          className="absolute inset-0 h-full w-full"
          style={{ backgroundColor: pageTransition.cards[i] }}
        />
      ))}
    </div>
  );
}

const OFF_IN = pageTransition.direction === "horizontal" ? { x: "100%" } : { y: "100%" };
const CENTER = pageTransition.direction === "horizontal" ? { x: "0%" } : { y: "0%" };
const OFF_OUT = pageTransition.direction === "horizontal" ? { x: "-100%" } : { y: "-100%" };

const TRANSITION = { duration: pageTransition.duration, ease: pageTransition.ease };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
