import type { LucideIcon } from "lucide-react";
import { Crown, GraduationCap, Handshake, HeartPulse, Laptop, Layers } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealDynamic } from "@/config/animation";
import type { BenefitMark, BenefitTone, whyJoinContent } from "@/content/careers";

/**
 * Why Join Mahadeva? — the six benefits, three across.
 *
 * Deliberately the same object as the About page's principles: a tinted square
 * carrying a drawing, a title and a line of copy, sitting straight on the
 * surface with no card around it. Six of anything in boxes reads as a wall,
 * and the two sections are answering the same kind of question.
 *
 * White, and it crossfades with the page rather than painting itself, so the
 * heading resolves into the live ink token.
 *
 * A server component. Nothing here moves except the heading, which brings its
 * own client boundary.
 */

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<BenefitTone, string> = {
  blue: "bg-principle-blue",
  peach: "bg-principle-peach",
  lavender: "bg-principle-lavender",
  rose: "bg-principle-rose",
  green: "bg-principle-green",
  magenta: "bg-principle-magenta",
};

/** The drawing a benefit names. Content says which; this says what it is. */
const marks: Record<BenefitMark, LucideIcon> = {
  laptop: Laptop,
  crown: Crown,
  wellness: HeartPulse,
  layers: Layers,
  learning: GraduationCap,
  team: Handshake,
};

type WhyJoinProps = {
  content: typeof whyJoinContent;
};

export function WhyJoin({ content }: WhyJoinProps) {
  return (
    <section data-bg="white" className="bg-bg-white py-20 text-fg-on-light tablet:py-25">
      <Container>
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealDynamic}
          className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        {/* Three across from desktop, two on a tablet, one on a phone. The row
            gap is much larger than the column gap on purpose: with six entries
            and no cards, it is the space between rows that groups them. */}
        <ul className="mt-15 grid grid-cols-1 gap-x-10 gap-y-15 tablet:grid-cols-2 desktop:grid-cols-3">
          {content.benefits.map((benefit) => {
            const Mark = marks[benefit.mark];

            return (
              <li key={benefit.title} className="flex flex-col items-start">
                <span
                  aria-hidden="true"
                  className={`flex size-16 items-center justify-center ${tones[benefit.tone]}`}
                >
                  {/* Ink, not the tint's own darker step: the drawing is the
                      readable part of the mark and the square behind it is
                      what carries the colour. */}
                  <Mark className="size-6 text-fg-on-light" strokeWidth={1.75} />
                </span>

                <h3 className="mt-6 font-body text-heading-sm leading-(--leading-heading)">
                  {benefit.title}
                </h3>
                <p className="mt-4 max-w-[36ch] font-body text-body-md text-fg-on-light-muted">
                  {benefit.body}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
