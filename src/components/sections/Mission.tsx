"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { Container } from "@/components/layout/Container";
import { PatternField } from "@/components/motion/PatternField";
import { missionCards } from "@/config/animation";
import type { MissionTone, missionContent } from "@/content/about";

/**
 * Our Mission — one card, three variants, stepped through by scroll.
 *
 * The section is tall and the frame inside it is pinned, which is what buys
 * the sequence its scroll: the card sits in the middle of the screen while the
 * page travels past, and each variant is given `missionCards.hold` viewports
 * of that travel. The section's own height is derived from that number, so the
 * pin ends exactly when the third card is done.
 *
 * The card opens from its centreline rather than fading: a mask parts, the two
 * halves running to the card's edges. That plays once as the section arrives,
 * and again at each step — shut on the boundary, where the words and the fill
 * are swapped out of sight, then open on the other side of it.
 *
 * This is also the section that rides up over the pinned hero, so it keeps its
 * own fill: transparent, it would show the hero through it for the whole
 * climb.
 *
 * A client component: it holds which variant is showing.
 */

type MissionProps = {
  content: typeof missionContent;
};

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<MissionTone, string> = {
  blue: "bg-mission-blue",
  green: "bg-mission-green",
  lavender: "bg-mission-lavender",
};

export function Mission({ content }: MissionProps) {
  const section = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion() ?? false;

  const last = content.cards.length - 1;

  /**
   * Two readings of the same section, because the card's two jobs begin at
   * different moments.
   *
   * The approach runs from the section's top reaching the bottom of the
   * viewport to it reaching the top — the stretch during which the card is
   * arriving, and the only one in which the opening move can play.
   */
  const { scrollYProgress: approach } = useScroll({
    target: section,
    offset: ["start end", "start start"],
  });

  /** The pin: from the card taking the screen to the section giving it up. */
  const { scrollYProgress: held } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });

  /** Where the sequence is, in cards: 0 through the count. */
  const position = useTransform(held, [0, 1], [0, content.cards.length]);

  // The variant is state, not a transform: swapping the words is a render.
  // Read off the same value the mask is driven by, and changed at the
  // boundary — which is exactly where the mask is shut, so the swap happens
  // out of sight.
  useMotionValueEvent(position, "change", (value) => {
    const index = Math.min(last, Math.max(0, Math.floor(value)));
    setShown((current) => (current === index ? current : index));
  });

  /**
   * How open the card is, 0 to 1.
   *
   * Two things close it, and the smaller wins: the approach, which has it shut
   * until the section is arriving, and the distance to the nearest step, which
   * shuts it again at each boundary. Written as a plain function of the two
   * rather than a keyframe list, since the boundaries are wherever the card
   * count puts them.
   */
  const open = useTransform<number, number>(
    [approach, position],
    ([arriving, at]: number[]) => {
      const entering = Math.min(1, arriving / missionCards.entrance);

      // Distance to the nearest step, in cards. The ends are not steps: the
      // card is already open when the pin starts and stays open when it ends.
      let toStep = 1;
      for (let step = 1; step <= last; step += 1) {
        toStep = Math.min(toStep, Math.abs(at - step));
      }
      const stepping = Math.min(1, toStep / missionCards.swap);

      return Math.min(entering, stepping);
    },
  );

  /**
   * The mask, as an inset from the top and bottom edges. At 0 open it is a
   * closed seam on the centreline; at 1 it is the whole card.
   *
   * `clip-path` rather than a gradient mask: the edge is hard in the original,
   * and this is the one property that expresses "from the middle outwards"
   * without a second element to slide.
   */
  const clipPath = useTransform(open, (value) => `inset(${(1 - value) * 50}% 0)`);

  const card = content.cards[shown];

  return (
    <section
      ref={section}
      data-bg="white"
      data-bg-keep=""
      className="relative z-10 bg-bg-white text-fg-on-light"
      // One viewport for the pin itself plus the scroll each variant is given.
      style={{ height: `${100 + content.cards.length * missionCards.hold}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden h-[100dvh]">
        <Container className="flex justify-center">
          <motion.div
            // 548x576 in the owner's file, held exactly from tablet up. On a
            // phone the width is whatever the gutter leaves and the height is
            // whatever the words need — at a fixed 548 the card would be wider
            // than the screen, and at a fixed 576 the longest variant would be
            // cut off by its own `overflow`.
            className="relative w-full max-w-[548px] overflow-hidden px-8 py-10 tablet:h-[576px] tablet:px-[72px] tablet:py-[60px]"
            style={reduced ? undefined : { clipPath }}
          >
            {/* The fill is a layer rather than the card's own background, so a
                variant's colour can cross to the next while the card is shut
                without the mask having to be re-applied to anything. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 transition-colors duration-(--duration-hover) ${tones[card.tone]}`}
            />

            {/* A single column of cells down each edge, flush inside it — the
                two Pattern Animations the card is built around. Same field the
                rest of the site uses, one track wide. */}
            <PatternField
              side="left"
              orientation="vertical"
              tracks={1}
              thickness={24}
              className="left-0 w-6"
            />
            <PatternField
              side="right"
              orientation="vertical"
              tracks={1}
              thickness={24}
              className="right-0 w-6"
            />

            {/* An `h2`: the hero above carries the page's only `h1`. Keyed on
                the variant so a screen reader is told the heading changed
                rather than silently re-reading the old one. */}
            <div key={card.heading} className="relative flex flex-col gap-5">
              <h2 className="text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal">
                {card.heading}
              </h2>

              <div className="flex flex-col gap-6 font-body text-body-md text-fg-on-light">
                {card.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
