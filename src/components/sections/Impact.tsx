import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { StatCounter } from "@/components/ui/StatCounter";
import { sectionTextRevealBeige } from "@/config/animation";
import type { impactContent } from "@/content/pricing";

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

            The rule sits on the left of every cell at every width: it is what
            separates one measure from the next across the row, and what marks
            where each begins down the stack.

            A floor on the cell rather than a gap between the mark and the
            figure, so the four hang off the same line however tall a client's
            mark turns out to be. */}
        <ul className="mt-15 grid grid-cols-1 gap-x-6 gap-y-10 tablet:grid-cols-2 desktop:grid-cols-4">
          {content.stats.map((stat) => (
            <li
              key={stat.label}
              className="flex min-h-[280px] flex-col justify-between border-l border-border-on-light pl-6"
            >
              {/* The client's mark. A placeholder at the slot's real size
                  until the files land, so the row's rhythm is already right
                  when they arrive and the artwork is a drop-in. */}
              <span
                aria-hidden="true"
                className="block h-7 w-[150px] bg-placeholder"
              />
              <span className="sr-only">{stat.client}</span>

              <div>
                <StatCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  unit={stat.unit}
                  size="compact"
                />
                <p className="text-ink-dynamic mt-4 font-body text-body-md leading-[1.5]">
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
