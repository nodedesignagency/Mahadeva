import { TextReveal } from "@/components/motion/TextReveal";
import { PatternField } from "@/components/motion/PatternField";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { heroParallax, heroTextReveal } from "@/config/animation";
import type { heroContent } from "@/content/home";

/**
 * Hero section.
 *
 * Full-viewport height with the content centred on both axes, and the animated
 * bar pattern framing it.
 *
 * The pattern reorients at the mobile breakpoint: side columns on tablet and
 * up, a band across the top and bottom below that. Both sets are in the markup
 * and CSS picks one, rather than measuring the viewport in JS — a width read
 * during render would differ between server and client and break hydration.
 *
 * This is a server component: the children that need the client declare it
 * themselves, so nothing else here ships to the browser.
 */

type HeroProps = {
  content: typeof heroContent;
};

export function Hero({ content }: HeroProps) {
  return (
    // The hero paints its own dark fill and opts out of the fill takeover, so
    // the changing layer behind it can already be white — the owner's Framer
    // setup: the Changing Background component's first variant is White, and
    // the intro covers it with its own surfaces. The first change anyone sees
    // is therefore white turning green at the case studies, "starting from
    // the 4th section". Its data-bg is that White base, not its own colour.
    <section
      data-bg="white"
      data-bg-keep=""
      // `100dvh` tracks mobile browser chrome as it hides and shows; the
      // `h-screen` fallback covers browsers without dynamic viewport units.
      className="sticky top-0 flex h-screen bg-bg min-h-[40rem] items-center justify-center overflow-hidden h-[100dvh]"
    >
      {/* Decorative background. Sits behind the content and ignores pointer events. */}
      {/* Each side field is 20% of the viewport, as in the original, so its
          columns narrow with the screen and leave the centred content its own
          room. At a fixed width they held their size and crept inward on a
          smaller laptop.

          Both start below the header rather than running the full height: the
          header is opaque, so a full-height field is simply cut off at its
          edge, and a bar caught halfway reads as clipped rather than placed.
          `top-*` alone would drop `inset-y-0` wholesale in the class merge and
          take `bottom` with it, so both edges are stated. */}
      <div className="hidden tablet:contents">
        <PatternField
          side="left"
          orientation="vertical"
          className="top-header bottom-0 left-[3.5%] w-[20%]"
        />
        <PatternField
          side="right"
          orientation="vertical"
          className="top-header bottom-0 right-[3.5%] w-[20%]"
        />
      </div>
      <div className="contents tablet:hidden">
        <PatternField
          side="top"
          orientation="horizontal"
          className="top-header"
        />
        <PatternField
          side="bottom"
          orientation="horizontal"
          className="bottom-0"
        />
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
        <Container className="flex flex-col items-center text-center">
          <TextReveal
            as="h1"
            lines={content.headingLines}
            mobileLines={content.headingLinesMobile}
            settings={heroTextReveal}
            className="flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />

          <p className="mt-6 max-w-[52ch] font-body text-body-md text-fg">
            {content.subheading}
          </p>

          {/* Fixed 267px from tablet up, full width on mobile. */}
          <div className="mt-10 flex w-full flex-col items-stretch gap-4 tablet:w-auto tablet:flex-row tablet:items-center tablet:justify-center">
            <Button
              href={content.primaryCta.href}
              withArrow
              className="w-full tablet:w-[267px]"
            >
              {content.primaryCta.label}
            </Button>
            <Button
              href={content.secondaryCta.href}
              variant="secondary"
              withArrow
              className="w-full tablet:w-[267px]"
            >
              {content.secondaryCta.label}
            </Button>
          </div>
        </Container>
      </Parallax>
    </section>
  );
}
