import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { PricingPlans } from "@/components/sections/PricingPlans";
import { sectionTextRevealBeige } from "@/config/animation";
import type { pricingContent } from "@/content/pricing";
import { cn } from "@/lib/cn";

/**
 * Pricing — "Flexible Plans for Every Growth Stage".
 *
 * A beige section, so its headings take the peach leading bar rather than the
 * pale green one, which on this surface is barely a bar at all.
 *
 * The same block serves two places: a section partway down the home page, and
 * the pricing page's opening. Only two things differ between them, and both
 * follow from being first on a page rather than ninth — the heading is that
 * page's `h1`, and the section clears the fixed header itself. Everything
 * else, the plans included, is one component reading one content object, so a
 * rate cannot be current in one place and stale in the other.
 *
 * Heading and pitch are server-rendered; the cards below carry the billing
 * period as state and declare their own client boundary.
 */

type PricingProps = {
  content: typeof pricingContent;
  /**
   * `hero` opens a page: the heading becomes the `h1` and the section adds the
   * header's own height to its top padding, since the header is fixed and
   * would otherwise sit over the first line of it.
   */
  variant?: "section" | "hero";
};

export function Pricing({ content, variant = "section" }: PricingProps) {
  const hero = variant === "hero";

  return (
    <section
      data-bg="beige"
      className={cn(
        "bg-bg-light py-20 text-fg-on-light",
        hero && "pt-[calc(var(--header-height)+5rem)]",
      )}
    >
      <Container className="px-10">
        <TextReveal
          as={hero ? "h1" : "h2"}
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          lineStagger={sectionTextRevealBeige.lineStagger}
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
