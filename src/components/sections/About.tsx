import Image from "next/image";

import ornamentLeft from "@/assets/badge-ornament-left.svg";
import ornamentRight from "@/assets/badge-ornament-right.svg";
import mark from "@/assets/hero-mahadeva.png";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
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
    <section className="relative bg-bg-white text-fg-on-light">
      <Container className="flex flex-col items-center justify-center gap-10 py-section-lg lg:min-h-[50rem]">
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
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        {/* Decorative: the statement above already names the brand. */}
        <Image
          src={mark}
          alt=""
          aria-hidden
          priority
          sizes="(min-width: 1024px) 311px, (min-width: 640px) 260px, 200px"
          className="h-auto w-[200px] object-cover sm:w-[260px] lg:absolute lg:-bottom-24 lg:left-1/2 lg:h-[385px] lg:w-[311px] lg:-translate-x-1/2"
        />
      </Container>
    </section>
  );
}
