import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealBeige } from "@/config/animation";
import type { StepTone, hiringProcessContent } from "@/content/careers";

/**
 * Know what to expect — the four stages of the hiring process, two by two.
 *
 * Each step is a rule, a numbered square with the stage's name beside it, and
 * the line that explains it underneath. The rules are the layout: they are
 * what separates four entries that have no cards, and they run across the top
 * of each cell rather than between the rows so the last pair is closed off the
 * same way the first is.
 *
 * Beige, so the heading takes the peach leading bar — pale green on beige is
 * two neighbouring near-whites and the first of the two bars all but
 * disappears.
 *
 * A server component; only the heading moves.
 */

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<StepTone, string> = {
  blue: "bg-principle-blue",
  green: "bg-principle-green",
  magenta: "bg-principle-magenta",
  peach: "bg-principle-peach",
};

type HiringProcessProps = {
  content: typeof hiringProcessContent;
};

export function HiringProcess({ content }: HiringProcessProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light tablet:py-25">
      <Container>
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          lineStagger={sectionTextRevealBeige.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        <ol className="mt-15 grid grid-cols-1 gap-x-16 gap-y-12 tablet:grid-cols-2">
          {content.steps.map((step, i) => (
            <li key={step.title} className="border-t border-border-on-light pt-8">
              <div className="flex items-center gap-4">
                {/* Geist, like every other figure on the site, and padded to
                    two digits from the index — a number written down in
                    content is a number that goes stale the first time the
                    steps are reordered. */}
                <span
                  aria-hidden="true"
                  className={`flex size-11 items-center justify-center font-ui text-body-md text-fg-on-light ${tones[step.tone]}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="font-body text-heading-md leading-(--leading-heading)">
                  {step.title}
                </h3>
              </div>

              <p className="mt-6 max-w-[44ch] font-body text-body-md text-fg-on-light-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
