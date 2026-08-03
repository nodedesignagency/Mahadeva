import type { CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { CaseStudyCard } from "@/components/ui/CaseStudyCard";
import { sectionTextRevealOnDark } from "@/config/animation";
import type { CaseStudy, caseStudiesContent } from "@/content/case-studies";

/**
 * Case studies — "Latest works".
 *
 * The heading and its supporting line sit left, the link to the full index
 * right, and the cards stack beneath. Only the first three appear here; the
 * rest live on /case-study, which is what the button is for.
 *
 * Takes the studies as a prop rather than fetching. Where they come from is
 * src/lib/case-studies.ts, and this stays a plain component that renders an
 * array — which is also what makes it trivial to render with demo content
 * before a CMS exists.
 */

/** How many the home page shows, regardless of how many are published. */
const SHOWN = 3;

type CaseStudiesProps = {
  content: typeof caseStudiesContent;
  studies: CaseStudy[];
};

export function CaseStudies({ content, studies }: CaseStudiesProps) {
  return (
    <section className="bg-bg py-20 tablet:py-30">
      <Container>
        <div className="flex flex-col gap-8 tablet:flex-row tablet:items-end tablet:justify-between">
          <div>
            <TextReveal
              as="h2"
              lines={content.headingLines}
              settings={sectionTextRevealOnDark}
              className="flex flex-col gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
            />
            <p className="mt-6 max-w-[46ch] font-body text-body-md text-fg-muted">
              {content.subheading}
            </p>
          </div>

          <Button href={content.cta.href} variant="secondary" withArrow className="shrink-0">
            {content.cta.label}
          </Button>
        </div>

        <div className="mt-15 flex flex-col gap-5">
          {studies.slice(0, SHOWN).map((study) => (
            <CaseStudyCard
              key={study.slug}
              study={study}
              // The rectangles are the panel's own colour, so a card's hover
              // reads as that card's tint arriving over the artwork rather
              // than a second, louder shade laid on top.
              style={{ "--mh-case-shape": `var(--color-case-${study.tone})` } as CSSProperties}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
