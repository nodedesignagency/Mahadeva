import type { StaticImageData } from "next/image";
import careersLounge from "@public/uploads/images/careers-4.avif";
import careersMeeting from "@public/uploads/images/careers-6.avif";
import careersNotebook from "@public/uploads/images/careers-2.avif";
import careersPool from "@public/uploads/images/careers-3.avif";
import careersStrategist from "@public/uploads/images/careers-1.avif";
import careersTeam from "@public/uploads/images/careers-7.avif";
import careersWhiteboard from "@public/uploads/images/careers-5.avif";

import { Container } from "@/components/layout/Container";
import { PhotoFan } from "@/components/motion/PhotoFan";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { FanPhoto, growWithUsContent } from "@/content/careers";

/**
 * The photograph a frame names. Content says which; this says what it is.
 *
 * The uploads are every shape — 1536x2048 and 1024x572 among them — and none
 * of that reaches the fan: each frame is a fixed square and the picture is
 * covered into it, so the arc keeps the seven equal sizes it is drawn from.
 */
const photos: Record<FanPhoto, StaticImageData> = {
  strategist: careersStrategist,
  notebook: careersNotebook,
  pool: careersPool,
  lounge: careersLounge,
  whiteboard: careersWhiteboard,
  meeting: careersMeeting,
  team: careersTeam,
};

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

      {/* Outside the container on purpose. The fan is a fixed 1104 wide at
          every width, so it must be free to run past the text column's gutter
          and be clipped by the section rather than squeezed by it. At the
          width the design was drawn at the two happen to coincide. */}
      <div className="mt-12 tablet:mt-16">
        <PhotoFan
          photos={content.photos.map((frame) => ({
            src: photos[frame.photo],
            alt: frame.alt,
          }))}
          imagePending={content.imagePending}
        />
      </div>

      <Container className="mt-12 tablet:mt-16">
        <p className="mx-auto max-w-[52ch] text-center font-body text-body-md text-fg-on-light">
          {content.subheading}
        </p>
      </Container>
    </section>
  );
}
