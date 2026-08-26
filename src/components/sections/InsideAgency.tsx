import Image from "next/image";
import insideTheAgency from "@public/uploads/images/inside-the-agency.png";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { insideAgencyContent } from "@/content/about";

/**
 * Inside The Agency — the room the work happens in.
 *
 * A heading with its paragraph set beside it, and one wide photograph under
 * the pair. The split is the same one the trust band makes: statement on the
 * left, the line that qualifies it on the right, stacked on a phone.
 *
 * The frame holds its 2:1 whatever the container's width, so the section's
 * rhythm is already right before the photograph arrives and does not shift
 * when it does.
 */

type InsideAgencyProps = {
  content: typeof insideAgencyContent;
};

export function InsideAgency({ content }: InsideAgencyProps) {
  return (
    <section data-bg="white" className="bg-bg-white py-20 text-fg-on-light tablet:py-25">
      <Container>
        <div className="flex flex-col gap-8 tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-15">
          <TextReveal
            as="h2"
            lines={content.headingLines}
            settings={sectionTextReveal}
            className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
          {/* Nudged onto the heading's own line rather than its box's top,
              which sits a little above the cap height. */}
          <p className="max-w-[46ch] font-body text-body-md text-fg-on-light tablet:w-2/5 tablet:shrink-0 tablet:pt-2">
            {content.subheading}
          </p>
        </div>

        {/* The photograph is 1376x768 and the frame is 2:1, so `cover` takes
            a little off the top and foot rather than letterboxing it. The
            frame's ratio is the owner's and stays as drawn. */}
        <div className="relative mt-15 aspect-[2/1] w-full overflow-clip bg-placeholder">
          <Image
            src={insideTheAgency}
            alt={content.imageAlt}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
