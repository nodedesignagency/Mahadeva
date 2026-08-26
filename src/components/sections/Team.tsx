"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import teamDaniel from "@public/uploads/images/team-1.avif";
import teamEmma from "@public/uploads/images/team-3.avif";
import teamJames from "@public/uploads/images/team-4.avif";
import teamSarah from "@public/uploads/images/team-2.avif";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import {
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/ui/BrandIcons";
import { sectionTextRevealBeige, teamCard } from "@/config/animation";
import type { TeamPhoto, teamContent } from "@/content/about";
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
              className="relative w-[78%] shrink-0 snap-start overflow-clip tablet:w-[calc((100%-20px)/2)] desktop:w-[calc((100%-60px)/4)]"
            >
              <TeamCard member={member} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** The three windows the portrait is cut into, left to right. */
const STRIPS = ["left", "center", "right"] as const;

/** The portrait a member names. Content says which; this says what it is. */
const portraits: Record<TeamPhoto, StaticImageData> = {
  daniel: teamDaniel,
  sarah: teamSarah,
  emma: teamEmma,
  james: teamJames,
};


/**
 * One portrait, and the bio it lifts to show.
 *
 * The picture is three standing strips over a dark panel. Each strip is a
 * window onto the same photograph at its own constraint, so at rest they read
 * as one image and the seams are invisible; on hover each lifts a full card
 * height, one after another, and the panel is uncovered behind them. Leaving
 * runs the same move right to left, so the picture closes the way it opened.
 *
 * The only thing that does not simply reverse is the name, which waits out the
 * strips' whole return before coming back — racing them home was what read as
 * cheap.
 *
 * The strips are `aria-hidden` and the whole card is one focusable link:
 * hovering three decorative panes is not a thing to announce, and a keyboard
 * reaching the card should get the person, not the effect.
 */
function TeamCard({
  member,
}: {
  member: (typeof teamContent.members)[number];
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const portrait = portraits[member.photo];

  const socials = [
    { label: "X", href: member.links.x, Icon: XIcon },
    { label: "Instagram", href: member.links.instagram, Icon: InstagramIcon },
    { label: "LinkedIn", href: member.links.linkedin, Icon: LinkedInIcon },
  ];

  return (
    <div
      className="relative isolate size-full bg-bg text-fg"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {/* The back of the card. Always in the document and always beneath the
          strips, so what the picture uncovers is already there rather than
          something that has to arrive as it goes. */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <p className="font-body text-body-md leading-[1.5] text-fg">
          {member.bio}
        </p>

        <ul className="flex gap-4">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${member.name} on ${label}`}
                className="block text-fg transition-opacity duration-(--duration-hover) ease-(--ease-out) hover:opacity-60"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* The picture, and the card's only source of height: the panel behind
          it is absolute and cannot set one. The ratio belongs here rather than
          on a strip — on a third-width strip it resolves against that third
          and the card comes out a third of its height. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative flex aspect-[280/344] w-full"
      >
        {STRIPS.map((strip, i) => (
          <div
            key={strip}
            className="relative h-full w-1/3 shrink-0 overflow-clip bg-team-panel transition-transform ease-(--ease-out)"
            style={{
              transform: open && !reduced ? "translateY(-100%)" : undefined,
              transitionDuration: `${teamCard.slide}ms`,
              // Left leaves first on the way out and last on the way back, so
              // the picture closes in the order it opened rather than all
              // three landing together.
              transitionDelay: `${(open ? i : STRIPS.length - 1 - i) * teamCard.stagger}ms`,
            }}
          >
            {/* The window, and the whole reason the seams do not show: the
                photograph is laid at the *card's* width inside every strip and
                shifted left by the strips before it, so the three are looking
                at one picture through three holes. A third of the picture
                scaled to fit each strip would be three squeezed copies of it,
                and the moment a strip lifted it would be obvious.

                `left` is a percentage of the strip, which is why it steps by
                100 rather than by a third. */}
            <div
              className="absolute inset-y-0 w-[300%]"
              style={{ left: `-${i * 100}%` }}
            >
              <Image
                src={portrait}
                alt=""
                fill
                sizes="(max-width: 810px) 78vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        ))}
      </div>

      {/* The name, over the foot of the picture. It belongs to Default and to
          nothing else — the owner's first hover state already has none — so it
          goes the moment the card is entered and does not come back until the
          last strip has landed. That wait is the whole point of the chain: it
          returns a beat after the picture has settled instead of snapping in
          the moment the pointer leaves.

          It fades rather than travelling: a block this short translated by its
          own height lands in the middle of the bio it was getting out of the
          way of. The scrim is a gradient rather than a bar so the portrait is
          not cut off at a hard line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-6 pt-15 transition-opacity ease-(--ease-out)"
        style={{
          opacity: open && !reduced ? 0 : 1,
          transitionDuration: `${open ? teamCard.name.out : teamCard.name.in}ms`,
          // Nothing on the way out, so it clears the picture immediately; the
          // strips' whole return on the way back, so it arrives once they have
          // landed rather than racing them home.
          transitionDelay: `${open ? 0 : teamCard.name.back}ms`,
        }}
      >
        <p className="font-body text-body-lg text-fg">{member.name}</p>
        <p className="mt-1 font-body text-body-sm text-fg/70">{member.role}</p>
      </div>

      {/* One link over the whole card, under nothing: the card is a person,
          and this is what a pointer and a keyboard both land on. The name is
          repeated here for anything reading the link rather than the card. */}
      <a href="#" className="absolute inset-0 z-10">
        <span className="sr-only">{`${member.name}, ${member.role}`}</span>
      </a>
    </div>
  );
}
