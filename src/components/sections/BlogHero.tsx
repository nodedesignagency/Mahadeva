import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { heroParallax, sectionTextRevealDark } from "@/config/animation";
import type { blogIndexContent } from "@/content/blog";

/**
 * The blog index's opening.
 *
 * A dark band carrying one word, centred, with the list riding up over it —
 * the same shape as a role's page and the legal documents. There is nothing
 * else in it, so it is short: an index gets to the posts quickly.
 *
 * `sectionTextRevealDark` and not the live token. This section keeps its own
 * dark fill, so there is no crossfade for the heading to resolve against, and
 * the dynamic token would follow the white list underneath it and paint the
 * title dark on dark. That failure depends on the window's height, so it would
 * look right here and be invisible on a taller screen.
 *
 * A server component. The pattern, the reveal and the drift each declare the
 * client for themselves.
 */

type BlogHeroProps = {
  content: typeof blogIndexContent;
};

export function BlogHero({ content }: BlogHeroProps) {
  return (
    // Its own fill, kept: this is a hard edge between dark and white, and
    // crossfading it drags a wash of green across the top of the list.
    <section
      data-bg="green"
      data-bg-keep=""
      className="sticky top-0 overflow-hidden bg-bg pt-[calc(var(--header-height)+18rem)] pb-30 text-fg"
    >
      {/* Below the header rather than behind it: the header is opaque, so a
          band that started at the top of the section would have its first row
          cut in half by it. */}
      <PatternField
        side="top"
        orientation="horizontal"
        thickness={26}
        className="top-header"
      />

      {/* Pinned, so the drift tracks the stack around it — keyed to this
          section it would freeze for exactly the stretch it is held at the
          top, which is when it should be moving. */}
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
            settings={sectionTextRevealDark}
            className="flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
        </Container>
      </Parallax>
    </section>
  );
}
