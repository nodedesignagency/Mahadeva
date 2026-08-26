import Image from "next/image";
import type { StaticImageData } from "next/image";
import markCosts from "@public/uploads/logos/impact-operational-costs.png";
import markHours from "@public/uploads/logos/impact-hours-saved-monthly.png";
import markRevenue from "@public/uploads/logos/impact-revenue-efficiency.png";
import markSuccess from "@public/uploads/logos/impact-project-success.png";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { StatCounter } from "@/components/ui/StatCounter";
import { sectionTextRevealBeige } from "@/config/animation";
import type { ImpactMark, impactContent } from "@/content/pricing";

/**
 * Impact — the proof band under the plans.
 *
 * A statement, then four figures in a row, each one credited to the client it
 * came from. The rules are the layout: every column carries its own left hand
 * rule and the figures hang off it, so the row reads as four measures of the
 * same thing rather than four cards.
 *
 * Beige, so the heading takes the peach leading bar.
 *
 * A server component — the counting figures declare their own client
 * boundary, the same ones the trust stats use, so a figure climbs to its
 * value once when the row is scrolled to.
 */

/** The client's mark. Content says which; this says what it is. */
const marks: Record<ImpactMark, StaticImageData> = {
  success: markSuccess,
  revenue: markRevenue,
  costs: markCosts,
  hours: markHours,
};

type ImpactProps = {
  content: typeof impactContent;
};

export function Impact({ content }: ImpactProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light">
      <Container className="px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          lineStagger={sectionTextRevealBeige.lineStagger}
          className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        {/* Four across on desktop, two-by-two on a tablet, a stack below it —
            the project's own breakpoints throughout. Mixing them with
            Tailwind's defaults here put `sm:grid-cols-2` after the four-up in
            the cascade, and the row silently stayed two wide on a desktop.

            From a tablet up a measure is a column: the mark at the top, the
            figure at the foot with its label under it, and a rule down the
            whole cell. A floor on the cell rather than a gap between the two
            keeps the four figures on one line however tall a client's mark
            turns out to be.

            On a phone it turns on its side, which is what stops four stacked
            measures running the section to three screens: the label moves
            alongside the figure and sits on its baseline. Its *last* baseline
            — a label long enough to wrap would otherwise hang its second line
            below the figure while its first sat level with it. The rule goes
            with it, marking that line rather than the whole entry. */}
        <ul className="mt-15 grid grid-cols-1 gap-x-6 gap-y-10 tablet:grid-cols-2 desktop:grid-cols-4">
          {content.stats.map((stat) => (
            <li
              key={stat.label}
              className="flex flex-col tablet:min-h-[200px] tablet:justify-between tablet:border-l tablet:border-border-on-light tablet:ps-6"
            >
              {/* The client's mark, at the slot's drawn size.

                  The transparent rule is not decoration: it is the same 1px
                  the figure's own rule takes below, so the two line up on a
                  phone instead of sitting a hair apart.

                  `contain` and left-aligned: the four marks are different
                  widths, and stretching each to the slot would set them at
                  four different weights. The name is carried by the
                  screen-reader line below rather than by an alt, so the mark
                  itself stays decorative. */}
              <span
                aria-hidden="true"
                className="block h-7 w-[150px] border-l border-transparent bg-clip-content ps-6 tablet:border-0 tablet:bg-clip-border tablet:ps-0"
              >
                <Image
                  src={marks[stat.mark]}
                  alt=""
                  className="h-full w-auto max-w-full object-contain object-left"
                />
              </span>
              <span className="sr-only">{stat.client}</span>

              <div className="mt-6 flex items-baseline-last gap-5 border-l border-border-on-light ps-6 tablet:mt-0 tablet:block tablet:border-0 tablet:ps-0">
                <StatCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  unit={stat.unit}
                  size="compact"
                />
                <p className="text-ink-dynamic font-body text-body-md tablet:mt-4">
                  {stat.label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
