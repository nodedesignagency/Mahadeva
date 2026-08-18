import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { heroParallax, sectionTextRevealDark } from "@/config/animation";
import type { careersHeroContent } from "@/content/careers";

/**
 * The Careers page's opening.
 *
 * The home page's entrance — a full screen, pinned while the section below
 * rides up over it, the content drifting as the stack travels — with the
 * owner's two changes for this page: the content is ranged left rather than
 * centred, and the pattern is a single field down the right, where the
 * heading's column leaves room for it.
 *
 * A server component. The pattern, the reveal and the drift each declare the
 * client for themselves, so nothing else here ships to the browser.
 */

type CareersHeroProps = {
  content: typeof careersHeroContent;
};

export function CareersHero({ content }: CareersHeroProps) {
  return (
    // `white` with the fill kept, exactly as the home hero: the changing layer
    // behind this is already the surface the *next* section wears, and the
    // hero simply covers it with its own dark fill until it is scrolled past.
    // Without `data-bg-keep` the takeover would repaint the page dark and the
    // handover to white would then have to be undone.
    <section
      data-bg="white"
      data-bg-keep=""
      // `100dvh` tracks mobile browser chrome as it hides and shows; the
      // `h-screen` fallback covers browsers without dynamic viewport units.
      className="sticky top-0 flex h-screen min-h-[40rem] items-center overflow-hidden bg-bg h-[100dvh]"
    >
      {/* One field rather than the home page's two: the content is ranged
          left, so the right half is the only side with room, and a matching
          field on the left would sit under the heading.

          It starts below the header rather than running the full height — the
          header is opaque, so a full-height field is simply cut off at its
          edge and a bar caught halfway reads as clipped rather than placed.
          `top-*` alone would drop `inset-y-0` wholesale in the class merge and
          take `bottom` with it, so both edges are stated. */}
      <div className="hidden tablet:contents">
        <PatternField
          side="right"
          orientation="vertical"
          className="top-header bottom-0 right-[3.5%] w-[26%]"
        />
      </div>

      {/* Below the tablet breakpoint the arrangement turns ninety degrees, as
          it does on the home page: a narrow screen has no column to spare
          beside a left-ranged heading. */}
      <div className="contents tablet:hidden">
        <PatternField side="top" orientation="horizontal" className="top-header" />
        <PatternField side="bottom" orientation="horizontal" className="bottom-0" />
      </div>

      {/* The section is pinned, so the drift tracks the stack around it —
          keyed to the hero itself it would freeze for the whole time it is
          held at the top, which is precisely when it should be moving. */}
      <Parallax
        drift={heroParallax.drift}
        trackSelector="[data-scroll-stack]"
        range="top"
        className="relative z-10 w-full"
      >
        <Container className="flex flex-col items-start">
          {/* Not the site's `eyebrow` utility: that is uppercase, tracked out
              and 12px, and this line is set as body copy in the design.
              `green-soft` is the palette's DCFFE4 — the same pale green the
              footer's column labels settle into, which is already exposed as a
              token rather than being a fourth name for one colour. */}
          <p className="font-body text-body-md text-green-soft">{content.eyebrow}</p>

          <TextReveal
            as="h1"
            lines={content.headingLines}
            mobileLines={content.headingLinesMobile}
            settings={sectionTextRevealDark}
            lineStagger={sectionTextRevealDark.lineStagger}
            className="mt-6 flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />

          {/* Fixed 267px from tablet up, full width on mobile — the site's
              call-to-action width. */}
          <Button
            href={content.cta.href}
            withArrow
            className="mt-10 w-full tablet:w-[267px]"
          >
            {content.cta.label}
          </Button>
        </Container>
      </Parallax>
    </section>
  );
}
