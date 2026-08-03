import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealDynamic } from "@/config/animation";
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
 * Which cell each tile takes on desktop: two per row, shifting one column
 * across on every other row.
 *
 * Written out rather than computed because Tailwind reads class names from the
 * source — a `col-start-${n}` built at runtime produces no CSS at all. Below
 * desktop the classes do not apply and the tiles form the draggable strip.
 */
const placements = [
  "desktop:col-start-1 desktop:row-start-1",
  "desktop:col-start-3 desktop:row-start-1",
  "desktop:col-start-2 desktop:row-start-2",
  "desktop:col-start-4 desktop:row-start-2",
  "desktop:col-start-1 desktop:row-start-3",
  "desktop:col-start-3 desktop:row-start-3",
];

type TechStackProps = {
  content: typeof techStackContent;
};

export function TechStack({ content }: TechStackProps) {
  return (
    <section data-bg="white" className="bg-bg-white py-20 text-fg-on-light">
      <Container className="px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealDynamic}
          lineStagger={sectionTextRevealDynamic.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />
      </Container>

      {/* Below desktop the checkerboard becomes a strip the reader drags:
          40px off the left edge, 10px between tiles, bleeding off the right —
          which is why it sits outside the Container and rebuilds the
          container's width for the desktop grid itself. Native horizontal
          scroll IS the drag on a touch screen, with the bar hidden. */}
      <ul className="no-scrollbar mt-15 flex gap-2.5 overflow-x-auto pr-10 pl-10 desktop:mx-auto desktop:grid desktop:w-full desktop:max-w-[75rem] desktop:grid-cols-4 desktop:gap-0 desktop:overflow-visible">
          {content.tools.map((tool, i) => (
            <li
              key={tool.name}
              className={cn(
                "flex aspect-square w-[280px] shrink-0 items-center justify-center p-8 tablet:w-[390px] desktop:w-auto",
                tones[tool.tone],
                placements[i],
              )}
            >
              {/* The name rides in the pill the original puts under each mark.
                  Until the mark files land it is the tile's only content, so
                  swapping in an image adds a drawing and changes no layout. */}
              <span className="bg-bg-white/70 px-3 py-1 text-center font-ui text-body-sm font-light tracking-(--tracking-label) uppercase text-fg-on-light">
                {tool.name}
              </span>
            </li>
          ))}
        </ul>
    </section>
  );
}
