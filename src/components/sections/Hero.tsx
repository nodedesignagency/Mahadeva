import { TextReveal } from "@/components/motion/TextReveal";
import { PatternField } from "@/components/motion/PatternField";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { heroTextReveal } from "@/config/animation";
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
    <section
      // `100dvh` tracks mobile browser chrome as it hides and shows; the
      // `h-screen` fallback covers browsers without dynamic viewport units.
      className="relative flex h-screen min-h-[40rem] items-center justify-center overflow-hidden h-[100dvh]"
    >
      {/* Decorative background. Sits behind the content and ignores pointer events. */}
      <div className="hidden tablet:contents">
        <PatternField side="left" orientation="vertical" className="left-[3.5%]" />
        <PatternField side="right" orientation="vertical" className="right-[3.5%]" />
      </div>
      <div className="contents tablet:hidden">
        <PatternField side="top" orientation="horizontal" className="top-0" />
        <PatternField side="bottom" orientation="horizontal" className="bottom-0" />
      </div>

      <Container className="relative z-10 flex flex-col items-center text-center">
        <TextReveal
          as="h1"
          lines={content.headingLines}
          mobileLines={content.headingLinesMobile}
          settings={heroTextReveal}
          className="flex flex-col items-center gap-[--space-heading-line] text-display-xl leading-[--leading-display] tracking-[--tracking-display] font-normal"
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
    </section>
  );
}
