import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Features } from "@/components/sections/Features";
import { aboutContent, featuresContent, heroContent } from "@/content/home";

/**
 * Home page.
 *
 * Sections are added one at a time, in the order of the original template:
 * Hero -> About -> Features -> Case Studies -> Stats -> Tech Stack ->
 * Testimonials -> Before/After -> Pricing -> FAQ -> CTA.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero and About share one stack: both stick to the top, so About rides
          up over the pinned hero rather than pushing it off. The stack's height
          is what decides how long each stays pinned. */}
      <div>
        <Hero content={heroContent} />
        <About content={aboutContent} />
      </div>
      <Features content={featuresContent} />
    </>
  );
}
