"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { pageWipe } from "@/config/animation";

/**
 * Three cards that wipe the screen between pages.
 *
 * A port of the owner's `StackedCardsTransition`. Leaving a page the cards
 * cross in from the right one after another until the screen is covered; arriving,
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
 * the attribute.
 *
 * It does not survive on its own, though. Hydration reconciles `<html>` against
 * what the layout rendered and removes everything else on it — measured: both
 * `data-wipe` and a control attribute set beside it were gone the frame
 * hydration finished. So the script also raises a flag on `window`, which is
 * out of React's reach, and the mount effect below re-asserts the attribute
 * from it. That effect is a layout effect for the same reason the script is
 * blocking: it has to land in the commit that hydration itself paints, or the
 * page shows through uncovered for a frame.
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

/** A layout effect where there is a layout, and quiet about it where there is not. */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** How long the whole cross takes: one card's travel plus every stagger. */
const sweep = pageWipe.duration + pageWipe.stagger * (pageWipe.cards - 1);

/**
 * Whether two paths are the same page.
 *
 * A link written with a trailing slash and the route without one are the same
 * page to a reader, and telling them apart here would start a wipe with
 * nothing at the other end of it.
 */
const samePath = (a: string, b: string) =>
  a.replace(/(.)\/+$/, "$1") === b.replace(/(.)\/+$/, "$1");

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
          `window[${JSON.stringify(FLAG)}]=1;` +
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
   * the cards return to waiting off the right edge with no transition to watch.
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

  /**
   * Opens the screen back up when the arrival never came.
   *
   * `covered` is the one state this component cannot leave by itself: it waits
   * to be told the new page is here, and if that never happens — a navigation
   * that stalls, a payload that never lands — the cards stay across the whole
   * screen and the only way out is a reload. Reported as a page that simply
   * would not open, showing one flat colour.
   *
   * So entering `covered` always arms this. It is not a substitute for a
   * navigation working; it is the guarantee that failing to navigate never
   * costs the reader the page they are already on.
   */
  function armRescue() {
    after(pageWipe.rescue, () => {
      if (document.documentElement.dataset.wipe === "covered") reveal();
    });
  }

  // Arriving through a real page load. The attribute the script set has just
  // been reconciled away, so put it back from the flag — which hydration cannot
  // touch — and then open it.
  useBeforePaint(() => {
    const flagged = window as Window & { [FLAG]?: unknown };
    if (flagged[FLAG]) {
      delete flagged[FLAG];
      document.documentElement.dataset.wipe = "covered";
      armRescue();
    }
    reveal();
    return clearTimers;
    // Once, on mount. A soft navigation is the effect below.
  }, []);

  /**
   * Where the router thinks it is.
   *
   * Kept in a ref because the click handler below is bound once and would
   * otherwise close over the route that was current when it was bound. The
   * effect that keeps it current is the arrival effect itself — the two ask
   * the same question, and a soft navigation is the only thing that changes
   * the answer.
   */
  const here = useRef(pathname);

  // Arriving through a soft navigation: the document survived, so the pathname
  // changing is what says the new page is here.
  const first = useRef(true);
  useEffect(() => {
    here.current = pathname;
    if (first.current) {
      first.current = false;
      return;
    }

    // Home is no different here, and that is the whole handover: the
    // preloader's sheet is already up behind the cards by the time they sweep,
    // so what the sweep uncovers is the sheet, and the preloader carries on
    // from there. Cutting the sweep short — or skipping the wipe for home,
    // which this page did for a while — takes the join away and leaves a
    // preloader that appears from nowhere.
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
      //
      // Asked of the router and not of the address bar. On the site the two
      // are the same string and it made no difference; in a published artifact
      // they are not. That bundle freezes the address at whatever path the
      // host serves it from — deliberately, because it is one file with no
      // server behind it and a router that writes /about into the address
      // sends the next reload to a page nothing can answer for. So
      // `location.pathname` there is `/_f/<id>/` and never equals any route,
      // this never matched, and every link to the page already open started a
      // wipe that no arrival could ever end: the cards closed over the screen
      // and sat there, one flat colour, until the rescue below let them go
      // 2.5 seconds later. Measured on three of six navigations.
      if (samePath(url.pathname, here.current)) return;

      const root = document.documentElement;
      if (root.dataset.wipe) return;

      event.preventDefault();
      clearTimers();
      root.dataset.wipe = "covering";

      after(sweep, () => {
        // Covered. Held there by the arriving page, whichever way it arrives:
        // the flag for a real load, the attribute itself for a soft one — and
        // by the rescue below if it never arrives at all.
        root.dataset.wipe = "covered";
        armRescue();
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
    // `armRescue` closes over nothing that changes, and re-binding the click
    // listener on every render is what this dependency list exists to avoid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div
      aria-hidden="true"
      // Above the preloader's sheet, and that ordering is the handover.
      //
      // The sheet goes up the moment the home page mounts, which is while the
      // cards are still covering. Under it, the sweep that follows happens out
      // of sight: the reader watches the cards cross in, the screen turns
      // green, and the wipe appears to play only half before something else
      // takes over. Over it, the sweep is the thing that uncovers the sheet,
      // which is the join every other page gets.
      className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden"
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
