import Image from "next/image";

import ornamentLeft from "@/assets/badge-ornament-left.svg";
import ornamentRight from "@/assets/badge-ornament-right.svg";
import mark from "@/assets/hero-mahadeva.png";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { TextReveal } from "@/components/motion/TextReveal";
import { markParallax, sectionTextReveal } from "@/config/animation";
import type { aboutContent } from "@/content/home";

/**
 * About — the white wrapper directly below the hero.
 *
 * A kicker flanked by two ornaments, one long statement, and the 3D mark. On
 * desktop the mark hangs below the block rather than sitting inside it, so the
 * section stays `relative` and whatever follows must not clip it.
 *
 * The statement is an `h2`, not an `h1`: the hero above already carries the
 * page's only `h1`, and a second would leave the document with two competing
 * top-level headings.
 */

type AboutProps = {
  content: typeof aboutContent;
};

export function About({ content }: AboutProps) {
  return (
    // `sticky` makes this its own stacking context, so the mark's z-index
    // cannot lift it out on its own. The layer goes on the section: above the
    // hero it slides over, and above whatever follows, so the mark stays on top
    // of the next section's heading wherever the two overlap.
    //
    // It also keeps its own fill, unlike the sections below it: pinned over the
    // hero, a transparent panel would show the hero through it the whole time
    // it is riding up. It still declares the surface, so the page background is
    // already white by the time it takes over.
    <section
      data-bg="white"
      className="sticky top-0 z-10 bg-bg-white px-10 pt-20 pb-30 text-fg-on-light"
    >
      <Container className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-0">
        <p className="flex items-center justify-center gap-2 text-body-md">
          <Image src={ornamentLeft} alt="" aria-hidden className="h-8 w-auto" />
          {content.eyebrow}
          <Image src={ornamentRight} alt="" aria-hidden className="h-8 w-auto" />
        </p>

        <TextReveal
          as="h2"
          lines={content.bodyLines}
          mobileLines={content.bodyLinesMobile}
          settings={sectionTextReveal}
          lineStagger={sectionTextReveal.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        {/* Decorative: the statement above already names the brand.
         *
         * Positioning lives on the wrapper so the parallax has something of its
         * own to transform. Tailwind centres it with the `translate` property
         * while the drift writes `transform`; the two compose rather than
         * overwrite, so the mark stays centred as it climbs. */}
        <Parallax
          drift={markParallax.drift}
          className="z-20 lg:absolute lg:-bottom-[431px] lg:left-1/2 lg:-translate-x-1/2"
        >
          <Image
            src={mark}
            alt=""
            aria-hidden
            priority
            sizes="(min-width: 1024px) 376px, (min-width: 640px) 260px, 200px"
            className="h-auto w-[200px] object-cover sm:w-[260px] lg:h-[467px] lg:w-[376px]"
          />
        </Parallax>
      </Container>
    </section>
  );
}
