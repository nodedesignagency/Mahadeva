import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Features } from "@/components/sections/Features";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Trust } from "@/components/sections/Trust";
import { TechStack } from "@/components/sections/TechStack";
import { Testimonials } from "@/components/sections/Testimonials";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import {
  aboutContent,
  beforeAfterContent,
  faqContent,
  featuresContent,
  heroContent,
  techStackContent,
  testimonialsContent,
  trustContent,
} from "@/content/home";
import { pricingContent } from "@/content/pricing";
import { caseStudiesContent } from "@/content/case-studies";
import { getCaseStudies } from "@/lib/case-studies";

/**
 * Home page.
 *
 * Sections are added one at a time, in the order of the original template:
 * Hero -> About -> Features -> Case Studies -> Stats -> Tech Stack ->
 * Testimonials -> Before/After -> Pricing -> FAQ -> CTA.
 */
export default async function HomePage() {
  const studies = await getCaseStudies();

  return (
    <>
      {/* Hero and About share one stack: both stick to the top, so About rides
          up over the pinned hero rather than pushing it off. The stack's height
          is what decides how long each stays pinned. */}
      <div data-scroll-stack>
        <Hero content={heroContent} />
        <About content={aboutContent} />
      </div>
      <Features content={featuresContent} />
      <CaseStudies content={caseStudiesContent} studies={studies} />
      <Trust content={trustContent} />
      <TechStack content={techStackContent} />
      <Testimonials content={testimonialsContent} />
      <BeforeAfter content={beforeAfterContent} />
      <Pricing content={pricingContent} />
      <Faq content={faqContent} />
    </>
  );
}
