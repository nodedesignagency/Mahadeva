"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

import { Container } from "@/components/layout/Container";
import { PatternField } from "@/components/motion/PatternField";
import { Scramble } from "@/components/motion/Scramble";
import { missionCards } from "@/config/animation";
import type { MissionTone, missionContent } from "@/content/about";
import { easings } from "@/lib/motion";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

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
 * The mask belongs to the arrival and to nothing else. It is a variant, not a
 * scrubbed value: the card is shut until any part of the section shows, then
 * it parts horizontally from its centreline on its own clock and stays open
 * for good. A step is then a change of words and fill inside a card that never
 * moves, and the heading's scramble is what tells the reader it happened.
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
   * The opening move is a state change, not a scroll position.
   *
   * `amount` is a sliver — the card opens the moment any part of the section
   * shows, and `once` keeps it open for good. Driven by the scroll instead,
   * the card sat part-open at whatever position the page loaded at, which is
   * the wrong reading of the original: there the mask is a variant, and a
   * variant either is or is not.
   */
  const inView = useInView(section, { once: true, amount: 0.01 });

  /**
   * Off for the server's markup and the first client render, so the two agree
   * — and so the card is simply present, open, for anyone without JS. The
   * layout effect closes it before the browser has painted, so arming it costs
   * no flash of an open card.
   */
  const [armed, setArmed] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  const shut = armed && !inView;

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
            // A seam on the card's vertical centreline when shut, the whole
            // card when open. `clip-path` rather than a gradient mask: the
            // edge is hard in the original, and this is the one property that
            // says "from the middle outwards" without a second element to
            // slide.
            //
            // `initial={false}` so the first paint takes the value straight
            // rather than animating to it — the closing above is meant to be
            // instant, and only the opening is a move anyone sees.
            initial={false}
            animate={{ clipPath: shut ? "inset(0 50%)" : "inset(0 0%)" }}
            transition={
              shut
                ? { duration: 0 }
                : { ...missionCards.open, ease: easings.reveal }
            }
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
                rest of the site uses, one track wide.

                Tablet and up only. On a phone the card is nearly the width of
                the screen and the columns would be eating the text's margin to
                run an animation nobody is looking at, which is why the owner's
                mobile variant drops them. */}
            <div className="hidden tablet:contents">
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
            </div>

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
              // The owner's 20 between every block, heading included.
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
                tick={missionCards.scramble.tick}
                className="text-display-md leading-(--leading-display) tracking-(--tracking-display) font-normal"
              />

              {/* Tighter than the site's 1.75 body leading, and deliberately
                  so: the card is a fixed 576 tall with 60 above and below, and
                  three paragraphs of this length at the page's own leading run
                  past the foot and are clipped by the card's own overflow —
                  which is what took the bottom padding away. At 1.5 the
                  longest variant sits inside its 456 with room to spare. */}
              <div className="flex flex-col gap-5 font-body text-body-md leading-[1.5] text-fg-on-light">
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
