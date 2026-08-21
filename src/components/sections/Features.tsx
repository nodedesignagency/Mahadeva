import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";

// The filenames carried over from the export do not describe what is in them:
// card-custom-ai-agents is the lightning bolt, card-data-intelligence is the
// robot, card-workflow-automation is the database. Imported under what each
// picture actually is, so the map below reads true.
import lightning from "@public/uploads/images/card-custom-ai-agents.png";
import robot from "@public/uploads/images/card-data-intelligence.png";
import coin from "@public/uploads/images/card-revenue-optimization.png";
import database from "@public/uploads/images/card-workflow-automation.png";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { featureMarquee, sectionTextRevealDynamic } from "@/config/animation";
import type { FeatureImage, featuresContent } from "@/content/home";

/**
 * Feature strip — the cards travelling left on a continuous marquee.
 *
 * The set is rendered twice and the track slides by exactly one copy, so the
 * loop point lands with the second copy where the first started and there is no
 * seam. That is the whole trick; everything else is arithmetic.
 *
 * A server component: the marquee is CSS, and the only client work on the page
 * is the heading reveal, which declares itself.
 */

/**
 * Card geometry, in px, matching the tile in FeatureCard and the `gap-5`
 * below. The travel distance is derived from these rather than measured, so
 * the markup is identical on the server and the client and the row is already
 * moving on the first frame.
 */
const CARD_WIDTH = 265;
const CARD_GAP = 20;

/**
 * Card key to picture. `integrations` (puzzle) and `improvement` (arrows) are
 * still to come and are absent on purpose — those two cards render a
 * placeholder until the files land.
 */
const artwork: Partial<Record<FeatureImage, StaticImageData>> = {
  agents: robot,
  data: database,
  workflow: lightning,
  revenue: coin,
};

type FeaturesProps = {
  content: typeof featuresContent;
};

export function Features({ content }: FeaturesProps) {
  // One lap is exactly one copy of the set, including the gap that follows its
  // last card — which is why the track and each copy share the same gap.
  const cycle = content.cards.length * (CARD_WIDTH + CARD_GAP);
  const duration = Math.round((cycle / featureMarquee.speed) * 1000);

  const cards = content.cards.map((card, i) => (
    <li key={`${card.title}-${i}`}>
      <FeatureCard
        title={card.title}
        body={card.body}
        tone={card.tone}
        image={artwork[card.image]}
      />
    </li>
  ));

  return (
    // 80px top and bottom, 40px either side, to the owner's measurement — a
    // fixed gutter here rather than the container's fluid one.
    <section data-bg="white" className="bg-bg-white py-20 text-fg-on-light">
      <Container className="flex flex-col items-center justify-center px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealDynamic}
          lineStagger={sectionTextRevealDynamic.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />
      </Container>

      {/* 40px below the heading on a phone, 60px from tablet up. Full-bleed:
          the row runs edge to edge, so it sits outside the container's gutter
          rather than inside it. */}
      <div className="mh-marquee-frame no-scrollbar mt-10 w-full overflow-hidden tablet:mt-15">
        <div
          className="mh-marquee flex w-max items-center gap-5"
          style={
            {
              "--mh-marquee-cycle": `${cycle}px`,
              "--mh-marquee-duration": `${duration}ms`,
            } as CSSProperties
          }
        >
          <ul className="flex items-center gap-5">{cards}</ul>
          {/* The second copy exists to make the loop seamless. It is the same
              six cards, so it is hidden from assistive tech — the set should be
              announced once. */}
          <ul aria-hidden="true" className="flex items-center gap-5">
            {cards}
          </ul>
        </div>
      </div>
    </section>
  );
}
