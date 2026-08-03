import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { ToolTone, techStackContent } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Tech stack — the checkerboard of tool marks.
 *
 * Six square tiles on a four-column grid, filling alternating cells so the
 * white of the page reads as part of the pattern rather than as gaps between
 * boxes. The tiles are edge to edge: what looks like spacing between them is
 * the empty cells.
 *
 * A server component — nothing here moves.
 */

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<ToolTone, string> = {
  rose: "bg-tool-rose",
  green: "bg-tool-green",
  magenta: "bg-tool-magenta",
  peach: "bg-tool-peach",
  blue: "bg-tool-blue",
  lavender: "bg-tool-lavender",
};

/**
 * Which cell each tile takes from the tablet breakpoint up: two per row,
 * shifting one column across on every other row.
 *
 * Written out rather than computed because Tailwind reads class names from the
 * source — a `col-start-${n}` built at runtime produces no CSS at all. Below
 * this breakpoint the classes do not apply and the tiles flow into two
 * columns, filling every cell, since a checkerboard two wide is a staircase
 * three screens tall.
 */
const placements = [
  "tablet:col-start-1 tablet:row-start-1",
  "tablet:col-start-3 tablet:row-start-1",
  "tablet:col-start-2 tablet:row-start-2",
  "tablet:col-start-4 tablet:row-start-2",
  "tablet:col-start-1 tablet:row-start-3",
  "tablet:col-start-3 tablet:row-start-3",
];

type TechStackProps = {
  content: typeof techStackContent;
};

export function TechStack({ content }: TechStackProps) {
  return (
    <section data-bg="white" className="py-20 text-fg-on-light">
      <Container className="px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextReveal}
          lineStagger={sectionTextReveal.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        <ul className="mt-15 grid grid-cols-2 tablet:grid-cols-4">
          {content.tools.map((tool, i) => (
            <li
              key={tool.name}
              className={cn(
                "flex aspect-square items-center justify-center p-8",
                tones[tool.tone],
                placements[i],
              )}
            >
              {/* Placeholder until the marks land. The name is the tile's only
                  content either way, so swapping in an image changes what is
                  drawn here and nothing about the layout. */}
              <span className="text-center font-ui text-body-md font-light text-fg-on-light/50">
                {tool.name}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
