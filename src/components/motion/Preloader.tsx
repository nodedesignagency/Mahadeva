"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useState } from "react";

import { preloader } from "@/config/animation";
import { siteConfig } from "@/config/site.config";
import { generateTiles, originOf } from "@/lib/preloader";
import { PRELOAD_UNTIL, preloadHold } from "@/lib/preloadHold";

/**
 * The home page's preloader.
 *
 * A sheet of green over everything with the wordmark on it. The wordmark
 * arrives and leaves, and then the sheet comes apart: it is tiled into
 * rectangles of unequal size and each one swipes itself out of existence along
 * its own axis, towards its own edge, a moment after its neighbours — so the
 * page is not uncovered so much as taken apart to reveal what was underneath
 * the whole time.
 *
 * The owner's Framer component and its numbers are in `preloader`; the tiling
 * and the rules that shape it are in `lib/preloader`; every position and
 * timing is in `.mh-preload*` in globals.css.
 *
 * ── What this component actually does ──────────────────────────────────────
 *
 * Almost nothing visible, in the same way `PageTransition` does not. The sheet
 * is plain markup, the run is CSS, and neither needs this component to happen:
 * a reader with no JavaScript at all still gets the whole animation. What is
 * left here is one decision — whether the sheet runs at all — and the tidying
 * up afterwards.
 *
 * The run has to be CSS. A preloader's promise is that it is gone 1.7 seconds
 * after the reader first sees it, and anything JavaScript can start begins at
 * hydration instead — later than the first paint by a margin that grows on
 * exactly the slow connection a preloader exists for.
 *
 * ── Why only the skip has a state ──────────────────────────────────────────
 *
 * Two things must be true before the browser's first paint, and neither is
 * something the server can know: whether this reader has already seen the
 * preloader this session, and whether they have asked for less motion. Both
 * live in the browser, so a blocking script decides and — when the answer is
 * no — writes `data-preloader="skip"` onto `<html>` where CSS can act on it.
 *
 * Only that direction. Holding the *run* behind an attribute is the obvious
 * shape and it is wrong: hydration reconciles `<html>` against what the layout
 * rendered and removes anything else on it, which cancels the animations, and
 * putting it back restarts them. The run re-anchors itself to hydration
 * without a word — measured at 2.0s end to end instead of 1.7s, with the swipe
 * cut off a quarter of the way through because this component was still
 * counting from the first paint. Nothing can cancel an animation that was
 * never conditional.
 */

/** sessionStorage key, and the window flag. Present means: shown already, don't again. */
const SEEN = "mh-preload-seen";

/** A layout effect where there is a layout, and quiet about it where there is not. */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Decision = "run" | "skip";
type Flagged = Window & { [PRELOAD_UNTIL]?: number; [SEEN]?: Decision };

/**
 * Decides, before the body paints, whether the preloader runs.
 *
 * Inline and blocking on purpose. Anything deferred — an effect, a module —
 * runs after the first paint, and on the skip path the first paint is exactly
 * what must not show: the reader would get a flash of a full green screen on
 * their way back to a page they have already seen.
 */
export function PreloaderScript() {
  return (
    <script
      // Static, developer-authored, and reads nothing but its own two keys.
      dangerouslySetInnerHTML={{
        __html:
          `(function(){var s="run";try{` +
          `if(sessionStorage.getItem(${JSON.stringify(SEEN)})||` +
          `matchMedia("(prefers-reduced-motion: reduce)").matches)s="skip";` +
          `else sessionStorage.setItem(${JSON.stringify(SEEN)},"1")}catch(e){}` +
          // Only the skip is written to the document. See the note above.
          `if(s==="skip")document.documentElement.dataset.preloader=s;` +
          // The flag hydration cannot reach: what was decided, and — when it
          // runs — when the cover lifts, so an entrance underneath can wait.
          `window[${JSON.stringify(SEEN)}]=s;` +
          `if(s==="run")window[${JSON.stringify(PRELOAD_UNTIL)}]=` +
          `performance.now()+${preloader.run};})();`,
      }}
    />
  );
}

export function Preloader() {
  // Server-side and on the very first client render this is `null`: undecided,
  // and therefore covered. The sheet is rendered until something says
  // otherwise, which is the only order that cannot flash the page.
  const [decision, setDecision] = useState<Decision | null>(null);

  useBeforePaint(() => {
    const decided = (window as Flagged)[SEEN] === "skip" ? "skip" : "run";
    setDecision(decided);

    if (decided === "run") {
      // Nothing scrolls behind the cover, or the reader arrives at a hero they
      // have scrolled past without ever having seen it. Done here and not in
      // CSS so that a reader without JavaScript — who still gets the whole
      // animation — cannot be left on a page that never scrolls again.
      document.body.style.overflow = "hidden";
    }
  }, []);

  useEffect(() => {
    // The pass belonging to the render before the decision was made. React
    // still runs it, after the layout effect above; it must touch nothing.
    if (decision === null) return;

    if (decision === "skip") {
      // Hydration takes the attribute off `<html>` on its own; this is for the
      // pass at the end of a run, where the sheet is being retired.
      delete document.documentElement.dataset.preloader;
      document.body.style.removeProperty("overflow");
      return;
    }

    const finish = () => {
      setDecision("skip");
      delete (window as Flagged)[PRELOAD_UNTIL];
    };

    // The sheet is retired when the tile that lands last has landed — asked of
    // the animation itself rather than worked out from the clock.
    //
    // The arithmetic version is off by however far the script that stamped the
    // deadline ran ahead of the first frame the sheet was styled on, which is
    // small but is not zero and is not predictable: measured here, it left one
    // tile of twenty-seven still mid-swipe when the sheet was taken out from
    // under it. There is no margin that is both safe on a cold connection and
    // tight on a warm one, so this does not guess.
    const onEnd = (event: AnimationEvent) => {
      if (!event.animationName.startsWith("mh-preload-out")) return;
      if (!(event.target as HTMLElement | null)?.dataset?.mhLast) return;
      finish();
    };
    document.addEventListener("animationend", onEnd);

    // And a backstop, for the case where that event never comes: a reader who
    // turns on reduced motion mid-run, or anything else that cancels the
    // animation. Counted from the stamped deadline rather than from here,
    // since this effect is hydration and the run began at the first paint.
    const timer = setTimeout(finish, (preloadHold() || preloader.run) + preloader.settle);

    return () => {
      document.removeEventListener("animationend", onEnd);
      clearTimeout(timer);
    };
  }, [decision]);

  if (decision === "skip") return null;

  const rows = generateTiles();

  return (
    <div
      aria-hidden="true"
      // Above the wipe's cards, which are the only other thing that covers the
      // whole screen. On the one frame both exist, the preloader is the outer
      // of the two.
      className="mh-preload pointer-events-none fixed inset-0 z-[10000] flex flex-col overflow-hidden"
      style={
        {
          "--mh-preload-start": `${preloader.start}ms`,
          "--mh-preload-collapse": `${preloader.collapse}ms`,
          "--mh-preload-word-fade": `${preloader.wordmarkFade}ms`,
          "--mh-preload-word-out": `${preloader.wordmarkOut}ms`,
        } as CSSProperties
      }
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex w-full"
          // Rows and tiles divide the viewport in proportion rather than
          // taking sizes, so the sheet covers whatever it is given. Fixed
          // pixels tile a laptop and leave a seam down the side of a monitor.
          style={{ flex: `${row.weight} 1 0%` }}
        >
          {row.tiles.map((tile, tileIndex) => (
            <span
              key={tileIndex}
              className={`mh-preload-tile mh-preload-tile-${tile.axis} block h-full bg-preloader will-change-transform`}
              style={
                {
                  flex: `${tile.weight} 1 0%`,
                  transformOrigin: originOf(tile),
                  "--mh-preload-delay": `${Math.round(tile.delay)}ms`,
                } as CSSProperties
              }
              // The one the sheet's own end is read from. See the effect above.
              data-mh-last={tile.last ? "" : undefined}
            />
          ))}
        </div>
      ))}

      <div className="absolute inset-0 grid place-items-center">
        <span className="mh-preload-word font-display text-display-md tracking-(--tracking-display) text-preloader-fg opacity-0">
          {siteConfig.shortName}
        </span>
      </div>
    </div>
  );
}
