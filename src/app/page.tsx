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
      <Hero content={heroContent} />
      <About content={aboutContent} />
      <Features content={featuresContent} />
    </>
  );
}
