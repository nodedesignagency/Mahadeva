"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { Button } from "@/components/ui/Button";
import { caseCardCursor } from "@/config/animation";

/**
 * The button that rides the pointer over a case study card.
 *
 * The owner's Custom Cursor component, set to Follow rather than Replace — the
 * reader keeps their own pointer and this arrives above it, so the card can say
 * where it leads without taking the arrow away. It is the site's own button,
 * `compare` at `md`: the white body, the dark label and the quiet grey arrow
 * frame, at the 44px height with the 4/4/4/12 padding the panel gives it.
 *
 * ── Why it is drawn on the body ────────────────────────────────────────────
 *
 * The card is `overflow-clip`, because the hover blocks and the growing
 * artwork have to be cut at its edges. A cursor drawn inside it would be cut
 * at them too, and the pointer spends much of its time near an edge — so the
 * one thing that must never be clipped is exactly the thing that would be. A
 * portal puts it on the body, out of every card's clip.
 *
 * ── Why a spring and not a duration ────────────────────────────────────────
 *
 * It trails the pointer and settles rather than tracking it exactly, and no
 * curve over a fixed time can do that: the distance to cover is however far
 * the pointer moved since the last frame, which is not known in advance. The
 * numbers are the panel's own — see `caseCardCursor`.
 *
 * ── Who does not get it ────────────────────────────────────────────────────
 *
 * A pointer that cannot hover has nothing to follow, so a touch screen is
 * never given one; the card is a link and works as it always did. Asking for
 * less motion drops the spring rather than the button — it still appears,
 * pinned to the pointer, because the information is the point and the trailing
 * is the decoration.
 */

/**
 * Whether there is a document to draw into.
 *
 * `false` while the server renders and on the first client render, `true`
 * after — which is what a portal needs, and what the two have to agree on.
 * A `useState` set from an effect would say the same thing and is what this
 * looked like first; it is a cascading render, and the project's lint refuses
 * it. This asks the question directly instead: a store that never changes,
 * answering one way on the server and the other in the browser.
 */
const noSubscribe = () => () => {};
const useHasDocument = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

type CardCursorProps = {
  /** The words on the button. */
  label: string;
};

export function CardCursor({ label }: CardCursorProps) {
  // A zero-size anchor, only ever used to find the card this belongs to. The
  // card is a server component and stays one; this is the only client thing
  // inside it.
  const anchor = useRef<HTMLSpanElement>(null);
  const mounted = useHasDocument();
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, caseCardCursor.spring);
  const sy = useSpring(y, caseCardCursor.spring);

  useEffect(() => {
    const card = anchor.current?.closest("article");
    if (!card) return;

    // No hover, nothing to follow.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const at = (event: PointerEvent) => ({
      px: event.clientX + caseCardCursor.offset.x,
      py: event.clientY + caseCardCursor.offset.y,
    });

    const enter = (event: PointerEvent) => {
      const { px, py } = at(event);
      // Put it where the pointer is before showing it. Without this the spring
      // starts from wherever it was left — the last card, or the origin on the
      // first hover — and the button flies across the page to arrive.
      x.set(px);
      y.set(py);
      sx.jump(px);
      sy.jump(py);
      setShown(true);
    };

    const move = (event: PointerEvent) => {
      const { px, py } = at(event);
      x.set(px);
      y.set(py);
    };

    const leave = () => setShown(false);

    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, [sx, sy, x, y]);

  return (
    <>
      <span ref={anchor} aria-hidden="true" className="hidden" />
      {mounted
        ? createPortal(
            <motion.div
              // Decorative twice over: the card is already a link with its own
              // name, and this repeats what that link does.
              aria-hidden="true"
              // `pointer-events-none` is not a nicety — the button sits under
              // the pointer, and without it the card would lose the hover to
              // its own cursor the moment it appeared, which would flicker
              // for as long as the reader stayed still.
              className="pointer-events-none fixed top-0 left-0 z-[60]"
              style={reduced ? { x, y } : { x: sx, y: sy }}
            >
              {/* Above the pointer and centred on it — the panel's Position
                  and Align. The shift is its own element so that it composes
                  with the spring's transform rather than fighting it. */}
              <div
                className="-translate-x-1/2 -translate-y-full transition-opacity ease-(--ease-out)"
                style={{
                  opacity: shown ? 1 : 0,
                  transitionDuration: `${caseCardCursor.fade}ms`,
                }}
              >
                <Button variant="compare" size="md" withArrow tabIndex={-1}>
                  {label}
                </Button>
              </div>
            </motion.div>,
            document.body,
          )
        : null}
    </>
  );
}
