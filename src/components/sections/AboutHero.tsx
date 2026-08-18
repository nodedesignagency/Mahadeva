import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { heroParallax, sectionTextRevealDark } from "@/config/animation";
import type { aboutHeroContent } from "@/content/about";

/**
 * The About page's opening.
 *
 * The same entrance as the home page — pinned for a viewport while the section
 * below rides up over it, the content drifting as the stack travels — with two
 * differences the owner's page makes: the pattern is a single band under the
 * header rather than a field down both sides, and the heading and its
 * paragraph sit low and apart rather than centred.
 *
 * A server component. The pattern, the reveal and the drift each declare the
 * client for themselves, so nothing else here ships to the browser.
 */

type AboutHeroProps = {
  content: typeof aboutHeroContent;
};

export function AboutHero({ content }: AboutHeroProps) {
  return (
    // `white` with the fill kept, as on the home page: the changing layer
    // behind this is already the surface the *next* section wears, and the
    // hero simply covers it with its own dark fill until it is scrolled past.
    // Without `data-bg-keep` the takeover would repaint the page dark and the
    // handover to white would then have to be undone.
    <section
      data-bg="white"
      data-bg-keep=""
      // 65% of the viewport, not the home page's full screen: this opening
      // carries a heading and a line of copy rather than a heading, a
      // paragraph and two buttons, and at full height it read as a mostly
      // empty screen. `65dvh` tracks mobile browser chrome as it hides and
      // shows; the `vh` before it is the fallback for browsers without the
      // dynamic unit. The floor is what keeps the band, the heading and the
      // paragraph from crowding on a short window.
      className="sticky top-0 flex h-[65vh] min-h-[28rem] items-end overflow-hidden bg-bg pb-20 h-[65dvh] tablet:pb-25"
    >
      {/* Below the header rather than behind it: the header is opaque, so a
          band that started at the top of the section would have its first row
          cut in half by it. */}
      <PatternField side="top" orientation="horizontal" className="top-header" />

      {/* The section is pinned, so the drift tracks the stack around it —
          keyed to this section it would freeze for exactly the stretch it is
          held at the top, which is when it should be moving. */}
      <Parallax
        drift={heroParallax.drift}
        trackSelector="[data-scroll-stack]"
        range="top"
        className="relative z-10 w-full"
      >
        <Container className="flex flex-col gap-8 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-15">
          <TextReveal
            as="h1"
            lines={content.headingLines}
            mobileLines={content.headingLinesMobile}
            settings={sectionTextRevealDark}
            lineStagger={sectionTextRevealDark.lineStagger}
            className="flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />

          {/* Set against the last line of the heading rather than its top: the
              two are a pair on one baseline in the owner's layout, and aligning
              to the top would hang the paragraph beside the first line with the
              second running out from under it. */}
          <p className="max-w-[46ch] font-body text-body-md text-fg tablet:w-2/5 tablet:shrink-0">
            {content.subheading}
          </p>
        </Container>
      </Parallax>
    </section>
  );
}
