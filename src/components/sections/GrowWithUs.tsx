import { Container } from "@/components/layout/Container";
import { PhotoFan } from "@/components/motion/PhotoFan";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { growWithUsContent } from "@/content/careers";

/**
 * Grow With Mahadeva — the room, fanned out.
 *
 * Seven frames overlapping in a shallow arc, with the heading over them and
 * the line that qualifies it underneath. The arc is the whole section: seven
 * photographs in a row would be a contact sheet, and the fan is what makes
 * them read as one handful. They assemble themselves when the band is reached
 * — see PhotoFan, which owns that and declares its own client boundary.
 *
 * This is also the section that rides up over the pinned hero, so it keeps its
 * own fill — transparent, the hero would show through it for the whole climb —
 * and its heading therefore takes the *fixed* light ink rather than the live
 * token. A section that never crossfades has no live surface to resolve
 * against, and `sectionTextRevealDynamic` here would follow the dark hero
 * underneath and finish the reveal white on white.
 *
 * A server component; the two things that move bring their own boundaries.
 */

type GrowWithUsProps = {
  content: typeof growWithUsContent;
};

export function GrowWithUs({ content }: GrowWithUsProps) {
  return (
    <section
      data-bg="white"
      data-bg-keep=""
      // `relative z-10` and an opaque fill are what make it ride over the hero
      // rather than under it.
      //
      // The clip does two jobs. Horizontally it catches the outermost frames'
      // lean — they hang past the row's own width by design, and on a narrow
      // desktop that would otherwise put a scrollbar on the page. Vertically it
      // is the frame the pile rises into: it starts 1200 below its place, which
      // is well inside the next section, and this band is what it climbs out
      // of. Clipping any tighter — around the row itself — hides all but the
      // last fraction of that climb, and the pile reads as appearing rather
      // than arriving.
      className="relative z-10 overflow-clip bg-bg-white py-20 text-fg-on-light tablet:py-25"
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
        <PhotoFan photos={content.photos} imagePending={content.imagePending} />
      </Container>

      <Container className="mt-12 tablet:mt-16">
        <p className="mx-auto max-w-[52ch] text-center font-body text-body-md text-fg-on-light">
          {content.subheading}
        </p>
      </Container>
    </section>
  );
}
