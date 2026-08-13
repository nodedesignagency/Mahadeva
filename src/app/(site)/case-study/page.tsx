import type { CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { CaseStudyCard } from "@/components/ui/CaseStudyCard";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { caseStudyIndexContent } from "@/content/case-studies";
import { getCaseStudies } from "@/lib/case-studies";

export const metadata = buildMetadata({
  title: "Case Studies",
  description: caseStudyIndexContent.subheadingLines.join(" "),
  path: "/case-study",
});

/**
 * Case study index.
 *
 * Every published study, in the order the CMS gives them — the home page shows
 * the first three of the same list, so a study appears here the moment it is
 * published rather than having to be added to a second place.
 *
 * The opening is the dark surface with the pattern band across the top of it,
 * which is the site's other entrance: a page that starts on the page's own
 * colour rather than on a white or beige wrapper.
 */
export default async function CaseStudyIndexPage() {
  const studies = await getCaseStudies();

  return (
    <>
      <PageSurface value="dark" />

      {/* `overflow-hidden` so the band's cells cannot widen the page as they
          animate, and the top offset clears the fixed header — the field runs
          from under it rather than behind it, which would cut its first row
          in half. */}
      <section
        data-bg="green"
        className="relative overflow-hidden bg-bg pt-[calc(var(--header-height)+10rem)] pb-15 text-fg"
      >
        {/* 26px rows, to the owner's Framer measurement. The band's own
            30/34/38 are the hero's, sampled per row; this one is a flat
            height, which is what `thickness` is for. */}
        <PatternField
          side="top"
          orientation="horizontal"
          thickness={26}
          className="top-header"
        />

        <Container className="relative flex flex-col items-center gap-6 px-10 text-center">
          <TextReveal
            as="h1"
            lines={caseStudyIndexContent.headingLines}
            settings={sectionTextRevealDynamic}
            lineStagger={sectionTextRevealDynamic.lineStagger}
            className="flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
          {/* Two authored lines rather than a wrapped paragraph, so the break
              falls where the design puts it and not where the column ends. */}
          <p className="text-ink-dynamic max-w-[52ch] font-body text-body-md">
            {caseStudyIndexContent.subheadingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Container>
      </section>

      <section data-bg="green" className="bg-bg pb-20 tablet:pb-30">
        <Container>
          {/* 10 between cards on a phone, per the owner — the same rhythm the
              home page's three sit in. */}
          <div className="flex flex-col gap-2.5 tablet:gap-5">
            {studies.map((study) => (
              <CaseStudyCard
                key={study.slug}
                study={study}
                // The rectangles are the panel's own colour, so a card's hover
                // reads as that card's tint arriving over the artwork rather
                // than a second, louder shade laid on top.
                style={
                  {
                    "--mh-case-shape": `var(--color-case-${study.tone})`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
