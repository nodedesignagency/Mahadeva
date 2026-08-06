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
import { Scramble } from "@/components/motion/Scramble";
import { missionCards } from "@/config/animation";
import type { MissionTone, missionContent } from "@/content/about";

/**
 * Our Mission — one card, three variants, stepped through by scroll.
 *
 * The section is tall and the frame inside it is pinned, which is what buys
 * the sequence its scroll: the card sits in the middle of the screen while the
 * page travels past, on the owner's schedule — a long hold on the first card,
 * a stretch where nothing happens, then a shorter beat for each card after it.
 * The section's own height is derived from that schedule, so the pin ends
 * exactly when the last card is done.
 *
 * The mask belongs to the arrival and to nothing else: the card opens from its
 * centreline as the section comes up, a clip parting to the card's edges, and
 * stays open from there. A step is then a change of words and fill inside a
 * card that never moves.
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

  /**
   * Where each card takes over, as a share of the pinned travel.
   *
   * Derived from the schedule rather than written down: the first card's hold
   * and the spacer both pass before anything changes, and every card after
   * that gets one `step`. Changing a number in the config retimes the sequence
   * and nothing here needs touching.
   */
  const travel =
    missionCards.first + missionCards.spacer + missionCards.step * last;
  const starts = content.cards
    .slice(1)
    .map(
      (_, i) =>
        (missionCards.first + missionCards.spacer + missionCards.step * i) /
        travel,
    );

  // The variant is state, not a transform: swapping the words is a render.
  useMotionValueEvent(held, "change", (value) => {
    const index = starts.filter((start) => value >= start).length;
    setShown((current) => (current === index ? current : index));
  });

  /**
   * How open the card is, 0 to 1 — a function of the arrival and nothing else.
   * Once the section is up the card is open, and it stays open for the whole
   * pin however many times its contents change.
   */
  const open = useTransform(approach, (arriving) =>
    Math.min(1, arriving / missionCards.entrance),
  );

  /**
   * The mask, as an inset from the left and right edges. At 0 open it is a
   * closed seam on the card's vertical centreline; at 1 it is the whole card.
   *
   * `clip-path` rather than a gradient mask: the edge is hard in the original,
   * and this is the one property that expresses "from the middle outwards"
   * without a second element to slide.
   */
  const clipPath = useTransform(
    open,
    (value) => `inset(0 ${(1 - value) * 50}%)`,
  );

  const card = content.cards[shown];

  return (
    <section
      ref={section}
      data-bg="white"
      data-bg-keep=""
      className="relative z-10 bg-bg-white text-fg-on-light"
      // One viewport for the pinned frame itself, plus the whole schedule.
      style={{ height: `${100 + travel}vh` }}
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
            {/* The fill is a layer rather than the card's own background, so
                it can cross to the next variant's colour on its own timing
                while the pattern and the words sit over it. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 transition-colors ${tones[card.tone]}`}
              style={{ transitionDuration: `${missionCards.swap}ms` }}
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

            {/* Keyed on the variant, so React replaces the block rather than
                editing it in place: the new words arrive together instead of
                each paragraph changing under the reader's eye, and a screen
                reader is told the heading changed rather than silently
                re-reading the old one.

                The `h2` is the page's second heading — the hero above carries
                its only `h1`. */}
            <motion.div
              key={card.heading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: missionCards.swap / 1000 }}
              className="relative flex flex-col gap-5"
            >
              {/* Scrambled, like every label the site swaps under the reader.
                  It is what tells them the card changed: the fill and the
                  paragraphs cross over quietly, and the heading resolving
                  letter by letter is the signal that something did. Replays on
                  each step because the keyed block above remounts it. */}
              <Scramble
                as="h2"
                text={card.heading}
                className="text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
              />

              <div className="flex flex-col gap-6 font-body text-body-md text-fg-on-light">
                {card.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
