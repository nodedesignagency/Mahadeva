import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import airtable from "@/assets/logos/airtable.avif";
import chatgpt from "@/assets/logos/chatgpt.avif";
import claude from "@/assets/logos/claude.avif";
import langchain from "@/assets/logos/langchain.avif";
import python from "@/assets/logos/python.avif";
import zapier from "@/assets/logos/zapier.avif";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealDynamic, toolHover } from "@/config/animation";
import type { ToolMark, ToolTone, techStackContent } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Tech stack — the checkerboard of tool marks.
 *
 * Six square tiles on a four-column grid, filling alternating cells so the
 * white of the page reads as part of the pattern rather than as gaps between
 * boxes. The tiles are edge to edge: what looks like spacing between them is
 * the empty cells.
 *
 * A server component. The hover is CSS, so nothing here ships as JavaScript.
 */

/**
 * One cell of the hover checkerboard, laid out where it lands and translated
 * out to where it waits — the same model as the other two hovers, in tenths of
 * the tile rather than pixels so a cell stays square at every breakpoint.
 *
 * Which edge a cell leaves by is decided by which half it sits in, and how far
 * by how deep into that half it is: the second row has to clear the first as
 * well as itself, or it would sit exposed at the tile's edge while at rest.
 */
function cellStyle([row, column]: readonly [number, number]): CSSProperties {
  const size = 100 / toolHover.grid;
  const fromTop = row < toolHover.grid / 2;
  const rows = fromTop ? row + 1 : toolHover.grid - row;

  return {
    width: `${size}%`,
    height: `${size}%`,
    left: `${column * size}%`,
    top: `${row * size}%`,
    "--mh-tool-from": `0 ${fromTop ? "-" : ""}${rows * 100}%`,
  } as CSSProperties;
}

/**
 * Tool key to mark. Imported rather than served from `public`: the build then
 * hashes each file and knows its size, which is also what lets the standalone
 * preview bundle carry the artwork with it.
 */
const marks: Record<ToolMark, StaticImageData> = {
  claude,
  chatgpt,
  airtable,
  zapier,
  langchain,
  python,
};

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
              style={
                {
                  "--mh-tool-shape": `var(--color-tool-shape-${tool.tone})`,
                  "--mh-tool-duration": `${toolHover.duration}ms`,
                  "--mh-tool-rest-scale": toolHover.markRestScale,
                } as CSSProperties
              }
              className={cn(
                "group relative flex aspect-square w-[280px] shrink-0 items-center justify-center overflow-clip p-8 tablet:w-[390px] desktop:w-auto",
                tones[tool.tone],
                placements[i],
              )}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {toolHover.cells.map((cell, c) => (
                  <span key={c} className="mh-tool-block" style={cellStyle(cell)} />
                ))}
              </div>

              <div className="relative flex flex-col items-center gap-6">
                {/* The box is a fixed 56 and the mark scales inside it, so the
                    name below does not move as the mark settles. */}
                <div className="flex size-14 items-center justify-center">
                  <Image
                    src={marks[tool.mark]}
                    alt=""
                    className="mh-tool-mark size-14 object-contain"
                  />
                </div>

                {/* The name rides in the pill the original puts under each
                    mark. Present at rest and merely transparent, so it is
                    read out either way and the tile's layout never shifts. */}
                <span className="mh-tool-label bg-bg-white/70 px-3 py-1 text-center font-ui text-body-sm font-light tracking-(--tracking-label) uppercase text-fg-on-light">
                  {tool.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
    </section>
  );
}
