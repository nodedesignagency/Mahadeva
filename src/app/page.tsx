import { Hero } from "@/components/sections/Hero";
import { heroContent } from "@/content/home";

/**
 * Home page.
 *
 * Sections are added one at a time, in the order of the original template:
 * Hero -> About -> Features -> Case Studies -> Stats -> Tech Stack ->
 * Testimonials -> Before/After -> Pricing -> FAQ -> CTA.
 */
export default function HomePage() {
  return <Hero content={heroContent} />;
}
