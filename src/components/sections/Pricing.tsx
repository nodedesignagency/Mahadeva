import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { PricingPlans } from "@/components/sections/PricingPlans";
import { sectionTextRevealDynamic } from "@/config/animation";
import type { pricingContent } from "@/content/home";

/**
 * Pricing — "Flexible Plans for Every Growth Stage".
 *
 * The first beige section, so it is the section that finally exercises the
 * background transition's third variant.
 *
 * Heading and pitch are server-rendered; the cards below carry the billing
 * period as state and declare their own client boundary.
 */

type PricingProps = {
  content: typeof pricingContent;
};

export function Pricing({ content }: PricingProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light">
      <Container className="px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealDynamic}
          lineStagger={sectionTextRevealDynamic.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />
        <p className="text-ink-dynamic mx-auto mt-6 max-w-[56ch] text-center font-body text-body-md leading-[1.5]">
          {content.subheading}
        </p>

        <PricingPlans content={content} />
      </Container>
    </section>
  );
}
