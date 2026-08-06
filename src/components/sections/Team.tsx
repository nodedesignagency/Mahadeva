"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealBeige } from "@/config/animation";
import type { teamContent } from "@/content/about";
import { cn } from "@/lib/cn";

/**
 * Meet The Team — four portraits on a rail, with arrows over it.
 *
 * The rail is a scroll container rather than a translated track, which is what
 * lets the same markup show four across on a desktop, two on a tablet and one
 * on a phone without any of those counts being written down in JS. An arrow
 * scrolls by exactly one card, measured from the card itself at the moment it
 * is pressed — nothing is measured during render, so the server and the client
 * agree and the row is correct on the first frame.
 *
 * The ends are read back off the scroll position, so the arrows go dead at
 * each end the way the testimonial ones do rather than wrapping.
 *
 * A client component: it holds where the rail has been scrolled to.
 */

type TeamProps = {
  content: typeof teamContent;
};

/** Column gap of the rail, px — half of one advance's arithmetic. */
const GAP = 20;

export function Team({ content }: TeamProps) {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** One card plus its gap, from the rail's first child. */
  function step() {
    const card = rail.current?.firstElementChild;
    return card instanceof HTMLElement ? card.offsetWidth + GAP : 0;
  }

  function scrollBy(direction: 1 | -1) {
    rail.current?.scrollBy({ left: direction * step(), behavior: "smooth" });
  }

  /**
   * A rail scrolled to its end lands a fraction short of the arithmetic on
   * fractional widths, so the last pixel is forgiven — without it the right
   * arrow stays live at the end of a row that cannot move.
   */
  function onScroll() {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }

  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light tablet:py-25">
      <Container>
        <div className="flex flex-col gap-8 tablet:flex-row tablet:items-center tablet:justify-between">
          <TextReveal
            as="h2"
            lines={content.headingLines}
            settings={sectionTextRevealBeige}
            className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />

          <div className="flex shrink-0 gap-2">
            {[
              {
                label: content.controls.previous,
                Icon: ArrowLeft,
                to: -1 as const,
                off: atStart,
              },
              {
                label: content.controls.next,
                Icon: ArrowRight,
                to: 1 as const,
                off: atEnd,
              },
            ].map(({ label, Icon, to, off }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                disabled={off}
                onClick={() => scrollBy(to)}
                // The site's arrow button: a fixed dark square with a light
                // arrow, the same one the testimonials carry, so the two rows
                // are driven by visibly the same control.
                className="flex size-11 items-center justify-center rounded-[4px] bg-(--mh-ink-border) text-fg transition-[filter] duration-(--duration-hover) ease-(--ease-out) hover:brightness-125 disabled:pointer-events-none"
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-5 transition-opacity duration-(--duration-hover) ease-(--ease-out)",
                    off && "opacity-40",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* Outside the container so the rail can run to the window's edge as it
          scrolls, with the container's own gutter as its leading inset. */}
      <Container className="mt-15">
        <ul
          ref={rail}
          onScroll={onScroll}
          className="mh-rail flex snap-x snap-mandatory overflow-x-auto"
          style={{ gap: `${GAP}px` }}
        >
          {content.members.map((member) => (
            <li
              key={member.name}
              className="relative flex w-[78%] shrink-0 snap-start flex-col justify-end overflow-clip bg-team-panel tablet:w-[calc((100%-20px)/2)] desktop:w-[calc((100%-60px)/4)]"
            >
              {/* The portrait's box. A cut-out stands on the panel's own
                  fill, so the slot is the panel until the photographs land
                  rather than a grey rectangle over it. */}
              <div className="aspect-[440/545] w-full" />

              {/* The name sits over the foot of the picture, so it needs its
                  own ground: a scrim from the bottom edge rather than a bar,
                  which would cut the portrait off at a hard line. */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-6 pt-15">
                <p className="font-body text-body-lg text-fg">{member.name}</p>
                <p className="mt-1 font-body text-body-sm text-fg/70">
                  {member.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
