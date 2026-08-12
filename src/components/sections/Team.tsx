"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import {
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/ui/BrandIcons";
import { sectionTextRevealBeige, teamCard } from "@/config/animation";
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

/**
 * The card's variants, and where each strip stands in them.
 *
 * `-100` is a strip lifted clear of the card. The staircase is not a stagger
 * applied to one move: it is six states the card walks through, one strip
 * changing at each, which is how the owner's file draws it. Entering runs
 * down the first four; leaving runs Hover 3 → Back 1 → Back 2 → Default,
 * putting the strips back in the reverse of the order they left.
 */
const PHASES = {
  default: [0, 0, 0],
  hover1: [-100, 0, 0],
  hover2: [-100, -100, 0],
  hover3: [-100, -100, -100],
  back1: [-100, -100, 0],
  back2: [-100, 0, 0],
} as const;

type Phase = keyof typeof PHASES;

/**
 * One portrait, and the bio it lifts to show.
 *
 * The picture is three standing strips over a dark panel. Each strip is a
 * window onto the same photograph at its own constraint, so at rest they read
 * as one image and the seams are invisible; on hover each lifts a full card
 * height, one variant at a time, and the panel is uncovered behind them.
 *
 * The chain is the owner's, delay for delay. Entering is quick — 0.2s to the
 * second strip, 0.06s to the third — and leaving is slow: 0.2s before the
 * first comes back, then 0.6s, then the name. Every travel is their spring,
 * 0.4s with a little bounce, so the strips settle rather than stopping dead.
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
  const [phase, setPhase] = useState<Phase>("default");
  const reduced = useReducedMotion() ?? false;

  /**
   * The pending steps of whichever chain is running. Cleared before either
   * chain starts, so a pointer that leaves mid-entrance does not have the
   * rest of the entrance land on top of the exit — which is the `Mouse Enter →
   * Reset` on every one of the owner's variants.
   */
  const timers = useRef<number[]>([]);
  const stop = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => stop, []);

  /** Walk a chain of [phase, delay-after-the-previous-step] pairs. */
  function run(steps: [Phase, number][]) {
    stop();
    let at = 0;
    for (const [next, delay] of steps) {
      at += delay;
      if (at === 0) {
        setPhase(next);
        continue;
      }
      timers.current.push(window.setTimeout(() => setPhase(next), at));
    }
  }

  const enter = () =>
    run([
      ["hover1", 0],
      ["hover2", teamCard.enter.hover2],
      ["hover3", teamCard.enter.hover3],
    ]);

  const leave = () =>
    run([
      ["back1", teamCard.leave.back1],
      ["back2", teamCard.leave.back2],
      ["default", teamCard.leave.settled],
    ]);

  const socials = [
    { label: "X", href: member.links.x, Icon: XIcon },
    { label: "Instagram", href: member.links.instagram, Icon: InstagramIcon },
    { label: "LinkedIn", href: member.links.linkedin, Icon: LinkedInIcon },
  ];

  return (
    <div
      className="relative isolate size-full bg-bg text-fg"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
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
          <motion.div
            key={strip}
            className="h-full w-1/3 shrink-0 bg-team-panel"
            animate={{ y: `${reduced ? 0 : PHASES[phase][i]}%` }}
            transition={teamCard.spring}
          />
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
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-6 pt-15"
        animate={{ opacity: phase === "default" ? 1 : 0 }}
        transition={teamCard.spring}
      >
        <p className="font-body text-body-lg text-fg">{member.name}</p>
        <p className="mt-1 font-body text-body-sm text-fg/70">{member.role}</p>
      </motion.div>

      {/* One link over the whole card, under nothing: the card is a person,
          and this is what a pointer and a keyboard both land on. The name is
          repeated here for anything reading the link rather than the card. */}
      <a href="#" className="absolute inset-0 z-10">
        <span className="sr-only">{`${member.name}, ${member.role}`}</span>
      </a>
    </div>
  );
}
