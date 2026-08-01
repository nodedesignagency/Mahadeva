"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";

import agents from "@/assets/card-custom-ai-agents.png";
import data from "@/assets/card-data-intelligence.png";
import revenue from "@/assets/card-revenue-optimization.png";
import workflow from "@/assets/card-workflow-automation.png";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { FeatureImage, featuresContent } from "@/content/home";

/**
 * Feature strip — a horizontally scrollable row of cards.
 *
 * Wider than the frame by design: cards bleed off both edges so the row reads
 * as continuing rather than ending. That only works where there is room for the
 * bleed to look deliberate, so below desktop the row starts at the first card
 * instead of centred. Either way it stays scrollable by pointer, touch and
 * keyboard — only the scrollbar itself is hidden.
 *
 * Artwork is keyed from content rather than imported there, so the content
 * module stays free of bundler imports and remains plain data.
 */

const artwork: Record<FeatureImage, StaticImageData> = {
  revenue,
  agents,
  data,
  workflow,
};

type FeaturesProps = {
  content: typeof featuresContent;
};

export function Features({ content }: FeaturesProps) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Matches the `lg:` breakpoint the bleed is designed around.
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    <section className="bg-bg-white text-fg-on-light">
      <Container className="flex flex-col items-center justify-center gap-15 overflow-clip py-section-lg">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextReveal}
          lineStagger={sectionTextReveal.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        <div
          ref={scroller}
          className="no-scrollbar w-full overflow-x-auto overscroll-x-contain"
        >
          <ul className="flex w-max items-center gap-5">
            {content.cards.map((card, i) => (
              <li
                // The repeated titles are deliberate, so position is what makes
                // each entry distinct.
                key={`${card.title}-${i}`}
                className="relative h-[400px] w-[265px] shrink-0 overflow-clip bg-card"
              >
                <h3 className="absolute top-[29px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-body-md tracking-(--tracking-display) whitespace-nowrap uppercase">
                  {card.title}
                </h3>

                <Image
                  src={artwork[card.image]}
                  alt=""
                  aria-hidden
                  sizes="260px"
                  className="absolute top-[calc(50%-28px)] left-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 object-cover"
                />

                <p className="absolute bottom-5 left-1/2 w-[225px] -translate-x-1/2 text-center text-body-md leading-(--leading-card) font-light">
                  {card.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
