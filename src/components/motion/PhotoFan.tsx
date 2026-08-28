"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { photoFan } from "@/config/animation";

/**
 * Seven frames that rise, settle, and open into a fan.
 *
 * A port of the owner's `Image Animation` component — four variants stepped
 * through when the section is reached:
 *
 *   Out         the pile is 1200 below its place, turned -40, held at 1.2
 *   In          it has risen, and unwound to -14
 *   Scale Down  it has come upright and down to its true size
 *   Expand      the frames spread out into the arc
 *
 * See `photoFan` in src/config/animation.ts for the sequence and its numbers,
 * and for why the turn and the scale belong to the container rather than to
 * the frames.
 *
 * ── One arrangement, every width ───────────────────────────────────────────
 *
 * There is no phone layout. The fan is one object of a fixed size — seven
 * 184px frames, 1104 wide in total — and a narrow window simply clips it at
 * both edges, which is the owner's design. So the sequence runs at every
 * width and there is no breakpoint anywhere in this component or its CSS.
 *
 * ── Why React holds only the stage ─────────────────────────────────────────
 *
 * Every transform is CSS, driven off one `data-fan` attribute, and React only
 * ever says which of the four states is current. The states are static — four
 * fixed arrangements with a duration between them, not values scrubbed against
 * a scroll position — so a stylesheet expresses them directly and the browser
 * runs all nine transforms on the compositor without a frame of JS. It is the
 * same division the button sweep and the nav overlay already make.
 *
 * ── Why the sequence has to arm itself ─────────────────────────────────────
 *
 * The resting state — no `data-fan` attribute at all — is the finished fan,
 * and that is what the server renders. It has to be: `out` puts the pile 1200
 * below and outside the frame's clip, so a server-rendered `data-fan="out"`
 * would leave anyone whose script never arrives looking at an empty band where
 * seven photographs should be, and nothing would ever come along to fix it.
 *
 * So the attribute is withheld until the client has taken over, and it is a
 * *layout* effect that arms it — before the browser paints, so hiding the fan
 * costs no flash of it first. The same move the mission card makes, for the
 * same reason. Asking for less motion never arms it, which is why that case
 * needs no branch of its own: it simply stays at the arrangement.
 */

type Photo = { src?: StaticImageData; alt: string };

type PhotoFanProps = {
  photos: readonly Photo[];
  /** Stands in each frame until the photographs land. */
  imagePending: string;
};

/** The owner's four variants, in the order they are stepped through. */
type Stage = "out" | "piled" | "settled" | "open";

/** See Mission: the layout effect is the client's, and only the client's. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PhotoFan({ photos, imagePending }: PhotoFanProps) {
  /**
   * What is watched, and why it is not the row itself.
   *
   * `out` carries the row 1200px down, and an IntersectionObserver reports
   * where an element has been *transformed* to. Watching the row therefore
   * asks "is the pile on screen?" — and the pile is a long way below the
   * window precisely because the sequence has not run. It never intersects,
   * so it never starts, and the fan stays away for good.
   *
   * This wrapper is the row's untransformed box: a transform does not touch
   * layout, so it sits still while the row moves, and asks the question that
   * was meant — "has the reader reached the band?"
   */
  const band = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // A third of the band, so the sequence starts once the row is properly on
  // screen rather than the instant its top edge clears the fold — the pile
  // would otherwise have risen and settled before there is anything to look at.
  const inView = useInView(band, { once: true, amount: 0.3 });

  // Off for the server's markup and the first client render, so the two agree
  // — and so the fan is simply present for anyone without the script, and for
  // anyone who asked for less motion.
  const [armed, setArmed] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  /**
   * Which of the owner's triggers have fired: 0 is Appear, 1 and 2 are the two
   * After Delays.
   *
   * A counter the timers advance rather than the stage itself, so nothing sets
   * state synchronously inside an effect — the stage is *derived* below, which
   * is what it always was: a function of whether the row has been reached and
   * how long ago.
   */
  const [fired, setFired] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    // Each delay is counted from the moment the state before it was entered,
    // so they accumulate: 0, then 0.4, then another 0.4.
    const { piled, settled, open } = photoFan.steps;
    const atSettled = piled.delay + settled.delay;

    const timers = [
      setTimeout(() => setFired(1), atSettled),
      setTimeout(() => setFired(2), atSettled + open.delay),
    ];

    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  const stage: Stage | undefined =
    !armed ? undefined
    : !inView ? "out"
    : fired === 0 ? "piled"
    : fired === 1 ? "settled"
    : "open";

  const middle = (photos.length - 1) / 2;

  return (
    <div ref={band}>
      {/* `justify-center` is what puts the overflow on both edges rather than
          only the right one, so a narrow window clips the fan evenly. */}
      <ul
        data-fan={stage}
        className="mh-fan flex items-center justify-center"
        style={
          {
            "--mh-fan-width": `${photoFan.card}px`,
            "--mh-fan-overlap": `-${photoFan.overlap}px`,
            "--mh-fan-advance": `${photoFan.advance}%`,
            "--mh-fan-lift": `${photoFan.lift}px`,
            "--mh-fan-rotate-out": `${photoFan.rotate.out}deg`,
            "--mh-fan-rotate-piled": `${photoFan.rotate.piled}deg`,
            "--mh-fan-scale-piled": photoFan.scale.piled,
            "--mh-fan-rise": `${photoFan.steps.piled.duration}ms`,
            "--mh-fan-settle": `${photoFan.steps.settled.duration}ms`,
            "--mh-fan-open": `${photoFan.steps.open.duration}ms`,
          } as CSSProperties
        }
      >
        {photos.map((photo, i) => {
          const { rotate, drop } = photoFan.arc[i];

          return (
            <li
              key={photo.alt}
              className="mh-fan-card w-(--mh-fan-width) shrink-0"
              style={
                {
                  // How many places this frame is from the middle of the row.
                  // Multiplied by the advance, it is the distance back to the
                  // pile — and the pile sits on the middle frame, whose step
                  // is zero and which therefore never moves.
                  "--mh-fan-step": middle - i,
                  // Carried at every stage, piled and fanned alike. It is what
                  // shows the pile's edges.
                  "--mh-fan-rotate": `${rotate}deg`,
                  "--mh-fan-drop": `${drop}%`,
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
              <div className="relative flex aspect-square w-full items-center justify-center overflow-clip bg-placeholder p-3 text-center ring-2 ring-bg-white">
                {photo.src ? (
                  /* `fill` and `object-cover`, so the square is the frame's
                     and never the upload's. The seven arrive at every shape —
                     1536x2048 through 1024x572 — and a picture left in flow
                     would carry its own proportion into the arc and break the
                     one size all seven are drawn at. Out of flow it cannot:
                     the frame keeps its square and the photograph is covered
                     into it.

                     `sizes` is the frame's real width, which never changes —
                     the fan is one fixed object at every breakpoint — so the
                     browser fetches one size rather than the whole ladder. */
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={`${photoFan.card}px`}
                    className="object-cover object-center"
                  />
                ) : (
                  <p className="font-body text-label text-fg-on-light/40">
                    {imagePending}
                    {/* What this frame will hold, for anything reading the list
                        rather than looking at it. */}
                    <span className="sr-only">{` — ${photo.alt}`}</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
