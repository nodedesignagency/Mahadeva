"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { pageWipe } from "@/config/animation";

/**
 * Three cards that wipe the screen between pages.
 *
 * A port of the owner's `StackedCardsTransition`. Leaving a page the cards
 * climb from below one after another until the screen is covered; arriving,
 * they carry on upward in the order they landed. See `pageWipe` for the
 * numbers and `.mh-wipe` in globals.css for the movement.
 *
 * ── What this component actually does ──────────────────────────────────────
 *
 * Almost nothing visible. The cards are plain markup and every position is
 * CSS, driven by one `data-wipe` attribute on the document element. This holds
 * the state machine that sets it, and intercepts the clicks that start it.
 *
 * The attribute is on the *document* and not on the overlay because a page
 * arrived at through the wipe has to render already covered on its first
 * paint, and the server cannot know whether it was — that fact is in
 * sessionStorage. `WipeScript` below runs before the body is painted and sets
 * the attribute; React never owns it, so there is nothing for the server and
 * the client to disagree about.
 *
 * ── Two kinds of navigation, and why both are handled ──────────────────────
 *
 * On the site itself a link is a soft navigation: the document survives, so
 * the arrival half is triggered by the pathname changing. In a published
 * preview each page is its own document at its own address, so a link is a
 * real load and the arrival half is triggered by the flag in sessionStorage.
 * Handling only the first would leave the cards stuck across the whole screen
 * on any hard navigation, which is the worst failure this component has
 * available to it.
 */

const FLAG = "mh-wipe";

/** How long the whole climb takes: one card's travel plus every stagger. */
const sweep = pageWipe.duration + pageWipe.stagger * (pageWipe.cards - 1);

/**
 * Sets the attribute before the body paints.
 *
 * Inline and blocking on purpose. Anything deferred — an effect, a module —
 * runs after the first paint, and the first paint is exactly what has to be
 * hidden: the reader would see the page they navigated to for a frame, then
 * have it covered up and revealed again.
 */
export function WipeScript() {
  return (
    <script
      // Static, developer-authored, and reads nothing but its own key.
      dangerouslySetInnerHTML={{
        __html:
          `try{if(sessionStorage.getItem(${JSON.stringify(FLAG)})){` +
          `sessionStorage.removeItem(${JSON.stringify(FLAG)});` +
          `document.documentElement.dataset.wipe="covered"}}catch(e){}`,
      }}
    />
  );
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  /** Timers, so a fast second navigation cannot leave one writing behind it. */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function after(ms: number, run: () => void) {
    timers.current.push(setTimeout(run, ms));
  }

  /**
   * Open the screen back up.
   *
   * Held covered first — the page underneath paints during that hold, which is
   * the point of it — then swept out, and finally the attribute is dropped so
   * the cards return to waiting below the fold with no transition to watch.
   */
  function reveal() {
    const root = document.documentElement;
    if (root.dataset.wipe !== "covered") return;

    clearTimers();
    after(pageWipe.hold, () => {
      root.dataset.wipe = "revealing";
      after(sweep + 50, () => {
        delete root.dataset.wipe;
      });
    });
  }

  // Arriving through a real page load: the script has already set the
  // attribute, so this only has to open it again.
  useEffect(() => {
    reveal();
    return clearTimers;
    // Once, on mount. A soft navigation is the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arriving through a soft navigation: the document survived, so the pathname
  // changing is what says the new page is here.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onClick(event: MouseEvent) {
      // Anything the browser gives its own meaning to is left alone: a new tab,
      // a download, a modified click. Taking those over would break them.
      if (
        reduced ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      // Not a page: a mail client, a phone, a jump within this page.
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin !== window.location.origin) return;
      // Somewhere on the page it is already on. Wiping the screen to arrive
      // where you already are is the one case that reads as a bug, and it is
      // also the case that would leave the cards up with no arrival to open
      // them.
      if (url.pathname === window.location.pathname) return;

      const root = document.documentElement;
      if (root.dataset.wipe) return;

      event.preventDefault();
      clearTimers();
      root.dataset.wipe = "covering";

      after(sweep, () => {
        // Covered. Held there by the arriving page, whichever way it arrives:
        // the flag for a real load, the attribute itself for a soft one.
        root.dataset.wipe = "covered";
        try {
          sessionStorage.setItem(FLAG, "1");
        } catch {
          // Private browsing, or a storage quota. The wipe still runs; only
          // the hard-navigation half of the arrival is lost.
        }

        // A same-origin absolute URL that the router does not own — a
        // published preview links page to page that way — has to be a real
        // load. Everything else stays a soft navigation.
        if (href.startsWith("/")) router.push(href);
        else window.location.href = url.href;
      });
    }

    // Capture, so a link that stops its own bubbling is still caught.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={
        {
          "--mh-wipe-duration": `${pageWipe.duration}ms`,
          "--mh-wipe-stagger": `${pageWipe.stagger}ms`,
          "--mh-wipe-count": pageWipe.cards,
        } as CSSProperties
      }
    >
      {Array.from({ length: pageWipe.cards }, (_, i) => (
        <div
          key={i}
          className="mh-wipe"
          style={
            {
              "--mh-wipe-index": i,
              backgroundColor: `var(--color-wipe-${i + 1})`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
