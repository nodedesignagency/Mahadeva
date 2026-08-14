"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { photoFan } from "@/config/animation";

/**
 * Seven frames that assemble themselves into a fan.
 *
 * A port of the owner's `Image Animation` component — four variants stepped
 * through when the section is reached: the frames land stacked in one square,
 * the pile shrinks, and then it opens into the arc. See `photoFan` in
 * src/config/animation.ts for the sequence and its numbers.
 *
 * ── Why React holds only the stage ─────────────────────────────────────────
 *
 * Every transform is CSS, driven off one `data-fan` attribute. That is not
 * shorter than doing it with motion values — it is the only version that is
 * correct at both breakpoints.
 *
 * Below the tablet breakpoint the same seven frames are a plain scroll rail:
 * no arc, no pile, nothing to assemble. Seven overlapping squares on a phone
 * are a smudge, and animating them into one is a smudge that moves. An inline
 * `transform` cannot be undone by a media query — it outranks every stylesheet
 * rule at every width — so a JS-driven transform would have to know which
 * breakpoint it was on, and reading the viewport during render is exactly the
 * thing that makes the server and the client disagree. In CSS the whole
 * arrangement simply lives inside `@media (min-width: 810px)` and the phone
 * never sees it.
 *
 * ── Why the sequence has to arm itself ────────────────────────────────────
 *
 * The resting state — no `data-fan` attribute at all — is the finished fan,
 * and that is what the server renders. It has to be: `out` is `opacity: 0`,
 * so a server-rendered `data-fan="out"` would leave anyone whose script never
 * arrives looking at an empty band where seven photographs should be, and
 * nothing would ever come along to fix it.
 *
 * So the attribute is withheld until the client has taken over, and it is a
 * *layout* effect that arms it — before the browser paints, so hiding the fan
 * costs no flash of it first. The same move the mission card makes, for the
 * same reason. Asking for less motion never arms it, which is why that case
 * needs no branch of its own: it simply stays at the arrangement.
 */

type Photo = { alt: string };

type PhotoFanProps = {
  photos: readonly Photo[];
  /** Stands in each frame until the photographs land. */
  imagePending: string;
};

type Stage = "out" | "stacked" | "small" | "expanded";

/** See Mission: the layout effect is the client's, and only the client's. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PhotoFan({ photos, imagePending }: PhotoFanProps) {
  const rail = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion() ?? false;

  // A third of the band, so the sequence starts once the row is properly on
  // screen rather than the instant its top edge clears the fold — the pile
  // would otherwise be halfway open before there is anything to look at.
  const inView = useInView(rail, { once: true, amount: 0.3 });

  // Off for the server's markup and the first client render, so the two agree
  // — and so the fan is simply present for anyone without the script, and for
  // anyone who asked for less motion.
  const [armed, setArmed] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  /**
   * Which beat the sequence has reached: 0 is the pile landing, 1 the breath,
   * 2 the opening.
   *
   * A counter the timers advance rather than the stage itself, so nothing sets
   * state synchronously inside an effect — the stage is *derived* below, which
   * is what it always was: a function of whether the row has been reached and
   * how long ago.
   */
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    const { arrive, hold, squash } = photoFan;
    // The pile is complete when the *last* frame has landed, which is its own
    // travel plus every stagger before it.
    const piled = arrive.duration + arrive.stagger * (photos.length - 1);

    const timers = [
      setTimeout(() => setBeat(1), piled + hold),
      setTimeout(() => setBeat(2), piled + hold + squash.duration),
    ];

    return () => timers.forEach(clearTimeout);
  }, [inView, reduced, photos.length]);

  const stage: Stage | undefined =
    !armed ? undefined
    : !inView ? "out"
    : beat === 0 ? "stacked"
    : beat === 1 ? "small"
    : "expanded";

  const middle = (photos.length - 1) / 2;

  return (
    <ul
      ref={rail}
      data-fan={stage}
      className="mh-rail mh-fan flex items-center gap-4 overflow-x-auto tablet:justify-center tablet:gap-0 tablet:overflow-visible"
      style={
        {
          "--mh-fan-width": `${photoFan.cardWidth}%`,
          "--mh-fan-overlap": `-${photoFan.overlap}%`,
          "--mh-fan-advance": `${photoFan.advance}%`,
          "--mh-fan-arrive": `${photoFan.arrive.duration}ms`,
          "--mh-fan-arrive-stagger": `${photoFan.arrive.stagger}ms`,
          "--mh-fan-arrive-scale": photoFan.arrive.from,
          "--mh-fan-squash": `${photoFan.squash.duration}ms`,
          "--mh-fan-squash-scale": photoFan.squash.scale,
          "--mh-fan-spread": `${photoFan.spread.duration}ms`,
          "--mh-fan-spread-stagger": `${photoFan.spread.stagger}ms`,
        } as CSSProperties
      }
    >
      {photos.map((photo, i) => {
        const { rotate, drop } = photoFan.arc[i];
        const fromMiddle = middle - i;

        return (
          <li
            key={photo.alt}
            className="mh-fan-card w-[62%] shrink-0 tablet:w-(--mh-fan-width)"
            style={
              {
                // How many places this frame is from the middle of the row.
                // Multiplied by the advance, it is the distance back to the
                // pile — and the pile sits on the middle frame, whose step is
                // zero and which therefore never moves.
                "--mh-fan-step": fromMiddle,
                "--mh-fan-rotate": `${rotate}deg`,
                "--mh-fan-drop": `${drop}%`,
                "--mh-fan-stack-rotate": `${photoFan.stack.rotate + fromMiddle * photoFan.stack.rotateSpread}deg`,
                "--mh-fan-stack-drift": `${fromMiddle * photoFan.stack.drift}%`,
                // Two orders, because the two halves of the sequence run in
                // different directions: the pile builds left to right, and it
                // opens from the middle outwards.
                "--mh-fan-order-in": i,
                "--mh-fan-order-out": Math.abs(fromMiddle),
              } as CSSProperties
            }
          >
            {/* Named rather than blank, as the agency frame on the About page
                is: an empty grey block reads as a layout bug, and this reads
                as a slot waiting for its picture.

                The ring is the section's own fill, and it is doing structural
                work rather than decorating: seven overlapping frames in one
                flat grey merge into a single slab with a ragged foot, and both
                the pile and the arc disappear. A hairline of the ground
                between them is what makes the fan a fan. It earns its place
                once the photographs land too — overlapping prints read as
                stacked rather than collaged. `ring` rather than a border, so
                it draws outside the frame and cannot shrink the picture. */}
            <div className="flex aspect-square w-full items-center justify-center overflow-clip bg-placeholder p-3 text-center ring-2 ring-bg-white">
              <p className="font-body text-label text-fg-on-light/40">
                {imagePending}
                {/* What this frame will hold, for anything reading the list
                    rather than looking at it. */}
                <span className="sr-only">{` — ${photo.alt}`}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
