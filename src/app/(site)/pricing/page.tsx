import { buildMetadata } from "@/config/seo";
import { PageSurface } from "@/components/layout/PageSurface";
import { Compare } from "@/components/sections/Compare";
import { Faq } from "@/components/sections/Faq";
import { Impact } from "@/components/sections/Impact";
import { Pricing } from "@/components/sections/Pricing";
import { faqContent } from "@/content/faq";
import { compareContent, impactContent, pricingContent } from "@/content/pricing";

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
 * its `hero` variant. Impact, the comparison table and the FAQ follow. Every
 * one of them is beige, so the page holds that surface from the header down
 * to the closing panel.
 *
 * The FAQ is the home page's, reading the same list: one set of answers,
 * wherever the section appears.
 */
export default function PricingPage() {
  return (
    <>
      <PageSurface value="beige" />
      <Pricing content={pricingContent} variant="hero" />
      <Impact content={impactContent} />
      <Compare content={compareContent} />
      <Faq content={faqContent} />
    </>
  );
}
