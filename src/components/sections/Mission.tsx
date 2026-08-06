import type { CSSProperties } from "react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { missionContent } from "@/content/about";

/**
 * Our Mission — the white wrapper directly below the About hero.
 *
 * The page's second section is the one that rides up over the pinned opening,
 * the same handover the home page makes, so it carries the same two things:
 * `sticky`, which is what puts it over the hero rather than under it, and its
 * own fill, since a transparent panel would show the hero through it for the
 * whole climb.
 *
 * One pale panel holding the statement, with blocks stood along its left and
 * right edges. They straddle the edge rather than sitting inside it — the
 * panel reads as something laid over the pattern the hero was made of, which
 * is the point of the device wherever it appears on the site.
 */

type MissionProps = {
  content: typeof missionContent;
};

/**
 * The blocks, as shares of the panel so the arrangement holds at any width.
 *
 * Anchored per side and shifted half their own width outwards, which is what
 * `-2.6%` is: half of `5.2%`, measured — like every percentage here — against
 * the panel, since that is the box they are positioned in.
 *
 * Written out one by one rather than generated from a pattern: the set is
 * asymmetric on purpose, and a rule that produced it would be longer than the
 * six lines it replaced.
 */
const blocks = [
  { tint: "blue", w: "5.2%", h: "8%", left: "-2.6%", top: 0 },
  { tint: "blue", w: "5.2%", h: "8%", right: "-2.6%", top: 0 },
  { tint: "lavender", w: "4.4%", h: "16%", left: "-2.2%", top: "33%" },
  { tint: "lavender", w: "4.4%", h: "4.5%", right: "-2.2%", top: "32%" },
  { tint: "green", w: "5.2%", h: "24%", left: "-2.6%", bottom: 0 },
  { tint: "green", w: "5.2%", h: "24%", right: "-2.6%", bottom: 0 },
] as const;

export function Mission({ content }: MissionProps) {
  return (
    <section
      data-bg="white"
      data-bg-keep=""
      className="sticky top-0 z-10 bg-bg-white py-20 text-fg-on-light tablet:py-30"
    >
      <Container>
        {/* `relative` for the blocks, and no clipping: half of each one is
            outside this box and would simply be cut off. */}
        <div className="relative bg-mission-panel px-8 py-15 tablet:px-20 tablet:py-25">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {blocks.map((block, i) => {
              const { tint, ...box } = block;
              return (
                <span
                  key={i}
                  className="absolute"
                  style={
                    {
                      ...box,
                      backgroundColor: `var(--color-mission-shape-${tint})`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>

          {/* An `h2`: the hero above carries the page's only `h1`, and a
              second would leave the document with two competing tops. */}
          <TextReveal
            as="h2"
            lines={content.headingLines}
            settings={sectionTextReveal}
            className="relative flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />

          <div className="relative mt-10 flex max-w-[62ch] flex-col gap-6 font-body text-body-md text-fg-on-light">
            {content.bodyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
