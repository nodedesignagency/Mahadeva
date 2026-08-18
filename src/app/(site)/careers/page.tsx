import { PageSurface } from "@/components/layout/PageSurface";
import { CareersHero } from "@/components/sections/CareersHero";
import { GrowWithUs } from "@/components/sections/GrowWithUs";
import { HiringProcess } from "@/components/sections/HiringProcess";
import { Openings } from "@/components/sections/Openings";
import { WhyJoin } from "@/components/sections/WhyJoin";
import { buildMetadata } from "@/config/seo";
import {
  careersHeroContent,
  growWithUsContent,
  hiringProcessContent,
  openingsContent,
  whyJoinContent,
} from "@/content/careers";

export const metadata = buildMetadata({
  title: "Careers",
  description: growWithUsContent.subheading,
  path: "/careers",
});

/**
 * Careers page.
 *
 * Opens the way the home and about pages do, and for the same reason: a dark
 * opening with white underneath it is a handover, so the hero and the section
 * below share one scroll stack — the hero sticks and the frames ride up over
 * it rather than pushing it off. The stack's height is what decides how long
 * each is held.
 *
 * `hero` as the surface: the strip is dark over the opening and flips to light
 * the moment the reader is past it.
 *
 * The page then holds white for two sections and beige for two, so the
 * openings list and the process under it read as one panel rather than as two
 * sections that happen to be adjacent.
 *
 * Not a CMS page — see src/content/careers.ts.
 */
export default function CareersPage() {
  return (
    <>
      <PageSurface value="hero" />

      <div data-scroll-stack>
        <CareersHero content={careersHeroContent} />
        <GrowWithUs content={growWithUsContent} />
      </div>
      <WhyJoin content={whyJoinContent} />
      <Openings content={openingsContent} />
      <HiringProcess content={hiringProcessContent} />
    </>
  );
}
