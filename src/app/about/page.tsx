import { PageSurface } from "@/components/layout/PageSurface";
import { AboutHero } from "@/components/sections/AboutHero";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { InsideAgency } from "@/components/sections/InsideAgency";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { buildMetadata } from "@/config/seo";
import {
  aboutHeroContent,
  howWeWorkContent,
  insideAgencyContent,
  missionContent,
  teamContent,
} from "@/content/about";

export const metadata = buildMetadata({
  title: "About",
  description: aboutHeroContent.subheading,
  path: "/about",
});

/**
 * About page.
 *
 * Opens the way the home page does, and for the same reason: the hero and the
 * section under it share one scroll stack, so both stick to the top and the
 * second rides up over the first instead of pushing it off. The stack's height
 * is what decides how long each is held.
 *
 * `hero` as the surface: dark over the opening, light from the moment the
 * reader is past it.
 */
export default function AboutPage() {
  return (
    <>
      <PageSurface value="hero" />

      <div data-scroll-stack>
        <AboutHero content={aboutHeroContent} />
        <Mission content={missionContent} />
      </div>
      <InsideAgency content={insideAgencyContent} />
      <HowWeWork content={howWeWorkContent} />
      <Team content={teamContent} />
    </>
  );
}
