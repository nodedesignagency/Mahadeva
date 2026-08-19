import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Accordion } from "@/components/motion/Accordion";
import { TextReveal } from "@/components/motion/TextReveal";
import { ctaCardHover, sectionTextRevealBeige } from "@/config/animation";
import type { faqContent } from "@/content/faq";

/**
 * FAQ — "Answers to Your Questions".
 *
 * Heading and pitch on the left with the strategy-call card anchored to the
 * column's foot; the accordion fills the right. On a phone the card follows
 * the accordion rather than floating mid-air.
 *
 * The second beige section, running straight on from pricing — the surface
 * holds rather than changing, which is the point of adjacent same-colour
 * sections in the changing-background zone.
 */

type FaqProps = {
  content: typeof faqContent;
};

export function Faq({ content }: FaqProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light">
      <Container className="grid gap-12 px-10 desktop:grid-cols-[5fr_7fr] desktop:gap-20">
        <div className="flex flex-col">
          <TextReveal
            as="h2"
            lines={content.headingLines}
            settings={sectionTextRevealBeige}
            lineStagger={sectionTextRevealBeige.lineStagger}
            className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
          <p className="text-ink-dynamic mt-8 max-w-[38ch] font-body text-body-md">
            {content.subheading}
          </p>

          {/* The whole card is the link. The arrow rides its top right corner
              in a bordered box, the same cut-out language as the buttons.

              Two things move on hover and the card is neither: the fill swells
              a couple of pixels past every edge, and the arrow is replaced —
              one leaves through the corner as another arrives behind it. Both
              are `.mh-cta-*` in globals.css; the numbers are `ctaCardHover`. */}
          <Link
            href={content.cta.href}
            className="mh-cta-card group relative mt-16 flex w-full max-w-[26rem] items-center gap-5 p-4 pr-14 desktop:mt-auto"
            style={
              {
                "--mh-cta-grow": `${ctaCardHover.grow}px`,
                "--mh-cta-travel": `${ctaCardHover.arrowTravel}px`,
                "--mh-cta-duration": `${ctaCardHover.duration}ms`,
              } as CSSProperties
            }
          >
            {/* The fill is its own layer because it has to be able to outgrow
                the card. On the card itself there is nothing to grow — a
                background is the box. */}
            <span aria-hidden="true" className="mh-cta-fill absolute bg-bg-white" />

            {/* Portrait placeholder until the photo lands — it keeps the
                card's geometry so the file is a drop-in. */}
            <span
              aria-hidden="true"
              className="relative block size-14 shrink-0 bg-placeholder"
            />
            <span className="relative flex flex-col gap-1">
              <span className="font-display text-heading-md text-fg-on-light">
                {content.cta.title}
              </span>
              <span className="font-body text-body-md text-fg-on-light">
                {content.cta.body}
              </span>
            </span>

            {/* The corner clips both arrows, which is what makes one leave and
                the other arrive rather than both simply sliding about. */}
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 flex size-8 items-center justify-center overflow-hidden border border-border-on-light bg-bg-white"
            >
              <ArrowUpRight className="mh-cta-arrow-out absolute size-4 text-fg-on-light" />
              <ArrowUpRight className="mh-cta-arrow-in absolute size-4 text-fg-on-light" />
            </span>
          </Link>
        </div>

        <Accordion items={content.items} />
      </Container>
    </section>
  );
}
