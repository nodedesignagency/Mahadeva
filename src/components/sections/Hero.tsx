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
 * bar pattern running down each edge behind it.
 *
 * This is a server component: the two children that need the client
 * (`TextReveal`, `PatternField`) declare it themselves, so nothing else here
 * ships to the browser.
 */

type HeroProps = {
  content: typeof heroContent;
};

export function Hero({ content }: HeroProps) {
  return (
    <section
      // `100dvh` tracks mobile browser chrome as it hides and shows; the `h-screen`
      // fallback covers browsers without dynamic viewport units.
      className="relative flex h-screen min-h-[40rem] items-center justify-center overflow-hidden h-[100dvh]"
    >
      {/* Decorative background. Sits behind content and ignores pointer events. */}
      <PatternField side="left" className="left-[3.5%]" />
      <PatternField side="right" className="right-[3.5%]" />

      <Container className="relative z-10 flex flex-col items-center text-center">
        <TextReveal
          as="h1"
          lines={content.headingLines}
          settings={heroTextReveal}
          className="flex flex-col items-center text-display-xl leading-[--leading-display] tracking-[--tracking-display] font-normal"
        />

        <p className="mt-6 max-w-[46ch] font-body text-body-lg text-fg-muted">
          {content.subheading}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href={content.primaryCta.href} size="lg" withArrow>
            {content.primaryCta.label}
          </Button>
          <Button href={content.secondaryCta.href} size="lg" variant="secondary" withArrow>
            {content.secondaryCta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
