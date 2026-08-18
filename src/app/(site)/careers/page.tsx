import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { ListingCard } from "@/components/ui/ListingCard";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { careerIndexContent, careers } from "@/content/careers";

export const metadata = buildMetadata({
  title: "Careers",
  description: careerIndexContent.subheadingLines.join(" "),
  path: "/careers",
});

/**
 * The openings.
 *
 * Built to the case study index's shape, because it is the site's other
 * entrance and this is the same kind of page: a dark opening with the pattern
 * band across the top of it, then a column of cards.
 *
 * One surface from the header down, so nothing pins — see the handover rule in
 * AGENTS.md. A page that holds one colour top to bottom has nothing to hand
 * over.
 */
export default function CareersPage() {
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
        <PatternField
          side="top"
          orientation="horizontal"
          thickness={26}
          className="top-header"
        />

        <Container className="relative flex flex-col items-center gap-6 px-10 text-center">
          <TextReveal
            as="h1"
            lines={careerIndexContent.headingLines}
            mobileLines={careerIndexContent.headingLinesMobile}
            settings={sectionTextRevealDynamic}
            lineStagger={sectionTextRevealDynamic.lineStagger}
            className="flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
          {/* Two authored lines rather than a wrapped paragraph, so the break
              falls where the design puts it and not where the column ends. */}
          <p className="text-ink-dynamic max-w-[62ch] font-body text-body-md">
            {careerIndexContent.subheadingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Container>
      </section>

      <section data-bg="green" className="bg-bg pb-20 tablet:pb-30">
        <Container>
          <div className="flex flex-col gap-2.5 tablet:gap-5">
            {careers.length === 0 ? (
              <p className="text-ink-dynamic font-body text-body-md">
                {careerIndexContent.empty}
              </p>
            ) : (
              careers.map((role) => (
                <ListingCard
                  key={role.slug}
                  href={`/careers/${role.slug}`}
                  eyebrow={role.department}
                  title={role.role}
                  summary={role.summary}
                  tone={role.tone}
                  meta={[
                    { label: "Location", value: role.location },
                    { label: "Type", value: role.type },
                  ]}
                />
              ))
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
