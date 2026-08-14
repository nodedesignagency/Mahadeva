import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { heroParallax, sectionTextRevealDark } from "@/config/animation";
import type { jobDetailContent } from "@/content/careers";

/**
 * A role page's opening.
 *
 * The legal documents' shape rather than the careers index's: a dark band
 * carrying a label and the title, centred, with the description riding up over
 * it. It is short because there is nothing else in it — a role's page gets to
 * the facts quickly, and a full screen holding two lines is a screen the
 * reader has to scroll past to start reading.
 *
 * `sectionTextRevealDark` and not the live token. This section keeps its own
 * dark fill, so there is no crossfade for the heading to resolve against, and
 * the dynamic token would follow the white description underneath it and paint
 * the title dark on dark. That failure depends on the window's height, so it
 * would look fine here and be invisible on a taller screen.
 *
 * A server component. The pattern, the reveal and the drift each declare the
 * client for themselves.
 */

type JobHeroProps = {
  content: typeof jobDetailContent;
  title: string;
};

export function JobHero({ content, title }: JobHeroProps) {
  return (
    // Its own fill, kept: this is a hard edge between dark and white, and
    // crossfading it drags a wash of green across the top of the reading
    // matter — neither the design nor readable.
    <section
      data-bg="green"
      data-bg-keep=""
      // The band sits the title low rather than centring it in a screen it
      // does not fill: the label and one line of title are all it carries, and
      // a full viewport holding two lines is a screen the reader scrolls past
      // before they can start reading.
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
          <p className="eyebrow font-ui">{content.eyebrow}</p>

          {/* `wraps` because the title is the role's name and nobody writes
              line breaks into it: the bars become a band per row, so a long
              title keeps the gutter between its rows instead of one bar
              covering both. */}
          <TextReveal
            as="h1"
            wraps
            lines={[title]}
            settings={sectionTextRevealDark}
            className="mt-6 flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-[calc(1em+var(--space-heading-line))] tracking-(--tracking-display) font-normal"
          />
        </Container>
      </Parallax>
    </section>
  );
}
