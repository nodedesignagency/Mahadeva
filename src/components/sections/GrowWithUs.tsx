import type { CSSProperties } from "react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { growWithUsContent } from "@/content/careers";

/**
 * Grow With Mahadeva — the room, fanned out.
 *
 * Seven frames overlapping in a shallow arc, with the heading over them and
 * the line that qualifies it underneath. The arc is the whole section: seven
 * photographs in a row would be a contact sheet, and the fan is what makes
 * them read as one handful.
 *
 * This is the section that rides up over the pinned hero, so it keeps its own
 * fill — transparent, the hero would show through it for the whole climb —
 * and its heading therefore takes the *fixed* light ink rather than the live
 * token. A section that never crossfades has no live surface to resolve
 * against, and `sectionTextRevealDynamic` here would follow the dark hero
 * underneath and finish the reveal in white on white.
 *
 * A server component. Only the heading moves, and it brings its own client
 * boundary.
 */

type GrowWithUsProps = {
  content: typeof growWithUsContent;
};

/**
 * Each frame's place in the fan, left to right: how far it is turned, and how
 * far it hangs below the middle one.
 *
 * Two things were got wrong here before they were looked at in a browser, and
 * both are worth stating.
 *
 * The turn is taken about each card's *centre*, not its foot. Pivoting at the
 * foot keeps the bottom edges level in theory, but each card's lower outside
 * corner then rises past its neighbour's and the row's foot comes out as a
 * staircase of notches. About the centre the corners splay symmetrically and
 * the overlap closes them.
 *
 * And the turn is small. At ±9° the row read as a hand of cards being dealt;
 * the design is a set of prints laid down slightly askew, which is a few
 * degrees, not ten. The drop is what actually shapes the arc — the outermost
 * pair hangs a good deal lower than the middle, which is the arrangement in
 * the design and is also what stops the fan reading as perfectly geometric.
 */
const FAN = [
  { rotate: -7, drop: 26 },
  { rotate: -5, drop: 12 },
  { rotate: -3, drop: 4 },
  { rotate: 0, drop: 0 },
  { rotate: 3, drop: 4 },
  { rotate: 5, drop: 12 },
  { rotate: 7, drop: 26 },
] as const;

/**
 * A card's share of the row, and how much of it the next one covers.
 *
 * The frames in the design touch and barely lap — enough that the row reads as
 * one object, not so much that any picture is half hidden.
 */
const CARD_WIDTH = 15;
const OVERLAP = 1.5;

export function GrowWithUs({ content }: GrowWithUsProps) {
  return (
    <section
      data-bg="white"
      data-bg-keep=""
      // `relative z-10` and an opaque fill are what make it ride over the hero
      // rather than under it. `overflow-x-clip` catches the outermost cards'
      // lean: they hang past the row's own width by design, and on a narrow
      // desktop that would otherwise put a scrollbar on the page.
      className="relative z-10 overflow-x-clip bg-bg-white py-20 text-fg-on-light tablet:py-25"
    >
      <Container>
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextReveal}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />
      </Container>

      <Container className="mt-12 tablet:mt-16">
        {/* Two arrangements from one list. Below the tablet breakpoint the
            frames are a plain scroll rail — seven overlapping cards on a phone
            are a smudge, and turning them makes it worse. From tablet up the
            rail's gap and its scrolling both go, and the fan rules take over. */}
        <ul
          className="mh-rail mh-fan flex items-center gap-4 overflow-x-auto tablet:justify-center tablet:gap-0 tablet:overflow-visible"
          style={{ "--mh-fan-overlap": `-${OVERLAP}%` } as CSSProperties}
        >
          {content.photos.map((photo, i) => (
            <li
              key={photo.alt}
              className="mh-fan-card w-[62%] shrink-0 tablet:w-(--mh-fan-width)"
              style={
                {
                  "--mh-fan-width": `${CARD_WIDTH}%`,
                  "--mh-fan-rotate": `${FAN[i].rotate}deg`,
                  "--mh-fan-drop": `${FAN[i].drop}px`,
                } as CSSProperties
              }
            >
              {/* Named rather than blank, as the agency frame on the About
                  page is: an empty grey block reads as a layout bug, and this
                  reads as a slot waiting for its picture.

                  The ring is the section's fill, and it is doing structural
                  work rather than decorating: seven overlapping frames in one
                  flat grey merge into a single slab with a ragged foot, and
                  the arrangement disappears. A hairline of the ground between
                  them is what makes the fan a fan. It earns its place once the
                  photographs land too — overlapping prints read as stacked
                  rather than collaged. `ring` rather than a border, so it
                  draws outside the frame and cannot shrink the picture. */}
              <div className="flex aspect-[7/13] w-full items-center justify-center overflow-clip bg-placeholder p-3 text-center ring-2 ring-bg-white">
                <p className="font-body text-label text-fg-on-light/40">
                  {content.imagePending}
                  {/* What this frame will hold, for anything reading the list
                      rather than looking at it. */}
                  <span className="sr-only">{` — ${photo.alt}`}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-12 tablet:mt-16">
        <p className="mx-auto max-w-[52ch] text-center font-body text-body-md text-fg-on-light">
          {content.subheading}
        </p>
      </Container>
    </section>
  );
}
