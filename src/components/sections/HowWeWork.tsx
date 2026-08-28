import Image from "next/image";
import type { StaticImageData } from "next/image";
import continuousGrowth from "@public/uploads/icons/continuous-growth.png";
import humanFirst from "@public/uploads/icons/human-first.png";
import realImpact from "@public/uploads/icons/real-impact.png";
import reliableDelivery from "@public/uploads/icons/reliable-delivery.png";
import scalableThinking from "@public/uploads/icons/scalable-thinking.png";
import smartExecution from "@public/uploads/icons/smart-execution.png";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealBeige } from "@/config/animation";
import type {
  howWeWorkContent,
  PrincipleMark,
  PrincipleTone,
} from "@/content/about";

/**
 * How We Work — the six principles, three across.
 *
 * Each is a tinted square carrying a drawing, a title and a line of copy.
 * There is no card: the entries sit straight on the beige, which is what keeps
 * six of them from reading as a wall of boxes.
 *
 * A server component. Nothing here moves except the heading, which brings its
 * own client boundary.
 */

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<PrincipleTone, string> = {
  blue: "bg-principle-blue",
  peach: "bg-principle-peach",
  lavender: "bg-principle-lavender",
  rose: "bg-principle-rose",
  green: "bg-principle-green",
  magenta: "bg-principle-magenta",
};

/**
 * The drawing a principle names. Content says which; this says what it is.
 *
 * The owner's own marks, which replaced a set of stand-ins from an icon
 * library. They are drawn in ink on nothing, and the tinted square behind them
 * is always one of six light pastels — so unlike the marks in `SiteIcons`,
 * these never have to follow a surface and a file is the right form for them.
 */
const marks: Record<PrincipleMark, StaticImageData> = {
  people: humanFirst,
  bolt: smartExecution,
  trend: realImpact,
  layers: scalableThinking,
  shield: reliableDelivery,
  loop: continuousGrowth,
};

type HowWeWorkProps = {
  content: typeof howWeWorkContent;
};

export function HowWeWork({ content }: HowWeWorkProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light tablet:py-25">
      <Container>
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        {/* Three across from desktop, two on a tablet, one on a phone. The row
            gap is much larger than the column gap on purpose: with six entries
            and no cards, it is the space between rows that groups them. */}
        <ul className="mt-15 grid grid-cols-1 gap-x-10 gap-y-15 tablet:grid-cols-2 desktop:grid-cols-3">
          {content.principles.map((principle) => {
            const mark = marks[principle.mark];

            return (
              <li key={principle.title} className="flex flex-col items-start">
                <span
                  aria-hidden="true"
                  className={`flex size-10 items-center justify-center ${tones[principle.tone]}`}
                >
                  {/* Ink on the tint, not the tint's own darker step: the
                      drawing is the readable part of the mark and the square
                      behind it is what carries the colour.

                      Decorative — the title beside it says the same thing, so
                      an empty alt keeps it from being read out twice. */}
                  <Image src={mark} alt="" width={24} height={24} className="size-6" />
                </span>

                <h3 className="mt-6 font-body text-heading-sm leading-(--leading-heading)">
                  {principle.title}
                </h3>
                <p className="mt-4 max-w-[36ch] font-body text-body-md text-fg-on-light-muted">
                  {principle.body}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
