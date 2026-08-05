import { buildMetadata } from "@/config/seo";
import { Impact } from "@/components/sections/Impact";
import { Pricing } from "@/components/sections/Pricing";
import { impactContent, pricingContent } from "@/content/pricing";

export const metadata = buildMetadata({
  title: "Pricing",
  description: pricingContent.subheading,
  path: "/pricing",
});

/**
 * Pricing page.
 *
 * The plans open the page rather than sitting inside it, so the pricing
 * section itself is the hero — the same component the home page renders, in
 * its `hero` variant. Impact follows. Both are beige, which is the surface
 * the page holds throughout so far.
 */
export default function PricingPage() {
  return (
    <>
      <Pricing content={pricingContent} variant="hero" />
      <Impact content={impactContent} />
    </>
  );
}
