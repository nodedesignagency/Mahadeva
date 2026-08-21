"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import cross from "@public/uploads/icons/cross-circled-white.png";
import tick from "@public/uploads/icons/tick-circled-ink.png";
import { beforeAfter } from "@/config/animation";
import type { CompareTone, beforeAfterContent } from "@/content/home";
import { cn } from "@/lib/cn";
import { hoverRectBox, hoverRectFrom } from "@/lib/hoverRect";

/**
 * Before vs After.
 *
 * Two panels pinned in one section, the second sliding up over the first — the
 * same construction as the hero and the statement above it. The first holds
 * the three words; the second, the pair of cards.
 *
 * The words are scroll-transformed while they are pinned: the outer two part
 * to either side and all three fade out, so they are gone by the time the
 * cards have covered them. The range is the cards panel's approach — from it
 * entering the viewport to it reaching the top — which is precisely the
 * distance the words spend pinned, so the two are locked together without
 * either being measured.
 *
 * A client component: it reads scroll position.
 */

/**
 * Each column's surface. Fills come from theme.css.
 *
 * The dark one is opaque, not a tint of white: the words are pinned behind
 * these cards and a translucent panel let "vs" read straight through it.
 */
const surfaces: Record<CompareTone, string> = {
  dark: "border border-fg/10 bg-bg-raised text-fg",
  light: "bg-quote-green text-fg-on-light",
};

/**
 * And the mark each item carries. The owner's exports draw their own ring, so
 * these replace the bordered circle that used to hold a bare tick rather than
 * sitting inside it — nesting one in the other gives two concentric rings.
 *
 * One is white and one is ink, which is the whole reason there are two files:
 * the columns never swap surfaces, so each mark only ever has to be the one
 * colour it was exported at.
 */
const marks: Record<CompareTone, StaticImageData> = {
  dark: cross,
  light: tick,
};

/**
 * Whether the two panels are pinned, which is where the whole effect lives.
 *
 * A phone gets the section laid out plainly — 200vh of pinning to read two
 * cards is a lot of scrolling on a small screen, and the original does not do
 * it there. Assumed true before the first paint, which costs nothing: at the
 * top of the section the transforms are at rest anyway.
 */
function usePinned() {
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 810px)");
    const read = () => setPinned(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  return pinned;
}

type BeforeAfterProps = {
  content: typeof beforeAfterContent;
};

export function BeforeAfter({ content }: BeforeAfterProps) {
  const cards = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const pinned = usePinned();

  // Zero when the cards panel is a viewport away, one when it has arrived.
  const { scrollYProgress } = useScroll({
    target: cards,
    offset: ["start end", "start start"],
  });

  const spread = reduced ? 0 : beforeAfter.spread;
  const before = useTransform(scrollYProgress, [0, 1], [0, -spread]);
  const after = useTransform(scrollYProgress, [0, 1], [0, spread]);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section data-bg="green" className="relative bg-bg max-tablet:py-20">
      <div className="flex items-center justify-center overflow-hidden max-tablet:pb-14 tablet:sticky tablet:top-0 tablet:h-screen">
        {/* Explicitly white, not the dynamic ink: this text is only ever on
            the dark ground, and the ink token turns dark as the light section
            below starts winning the handover — which stranded the words in
            near-black against the green. */}
        <p className="flex w-full items-center justify-center gap-2.5 text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal text-fg">
          <motion.span
            style={pinned ? { x: before, opacity: fade } : undefined}
          >
            {content.headingBefore}
          </motion.span>
          <motion.span style={pinned ? { opacity: fade } : undefined}>
            {content.headingJoin}
          </motion.span>
          <motion.span style={pinned ? { x: after, opacity: fade } : undefined}>
            {content.headingAfter}
          </motion.span>
        </p>
      </div>

      {/* No fill of its own. A panel that paints the surface cuts the words in
          half along its own top edge as it rides up; the words are meant to
          leave by fading, and they are gone by the time this has arrived.
          Section fills are cleared to transparent once the background
          machinery runs, so an inner fill is also the one thing on the page
          that would not fade with the rest. */}
      <div
        ref={cards}
        className="z-10 flex items-center tablet:sticky tablet:top-0 tablet:min-h-screen tablet:py-20"
      >
        {/* A fixed 812 for the pair, not a share of the screen. The words
            travel outward past the cards, and a proportional width kept
            growing into the space they need — at which point they cross. */}
        <div className="mx-auto w-full px-gutter desktop:w-[812px] desktop:px-0">
          <div className="grid gap-5 desktop:grid-cols-2">
            {content.columns.map((column) => (
              <div
                key={column.title}
                style={
                  {
                    "--mh-quote-shape": "var(--color-quote-shape-green)",
                    "--mh-quote-duration": `${beforeAfter.reveal}ms`,
                    "--mh-quote-delay": `${beforeAfter.revealDelay}ms`,
                  } as CSSProperties
                }
                className={cn(
                  "relative overflow-clip p-8",
                  surfaces[column.tone],
                )}
              >
                {/* Only the light column carries them, as in the original. */}
                {column.tone === "light" ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                  >
                    {beforeAfter.rects.map((rect, r) => (
                      <ScrollBlock
                        key={r}
                        rect={rect}
                        progress={scrollYProgress}
                        // Nothing is pinned on a phone, so there is no arrival
                        // to time these to: they are simply in place.
                        settled={!pinned}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="relative flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <h3 className="font-body text-heading-lg">
                      {column.title}
                    </h3>
                    <p
                      className={cn(
                        "max-w-[42ch] font-body text-body-md",
                        column.tone === "dark"
                          ? "text-fg-muted"
                          : "text-fg-on-light/70",
                      )}
                    >
                      {column.body}
                    </p>
                  </div>

                  <hr
                    className={cn(
                      "border-0 border-t",
                      column.tone === "dark"
                        ? "border-fg/10"
                        : "border-fg-on-light/15",
                    )}
                  />

                  <ul className="flex flex-col gap-7">
                    {column.items.map((item) => (
                      <li key={item.title} className="flex items-start gap-4">
                        <Image
                          src={marks[column.tone]}
                          alt=""
                          aria-hidden
                          sizes="40px"
                          className="size-10 shrink-0"
                        />

                        <div className="flex flex-col gap-1.5">
                          <p className="font-body text-heading-md">
                            {item.title}
                          </p>
                          <p
                            className={cn(
                              "font-body text-body-md",
                              column.tone === "dark"
                                ? "text-fg-muted"
                                : "text-fg-on-light/70",
                            )}
                          >
                            {item.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One rectangle, brought home once the cards have arrived.
 *
 * The trigger is the same progress that moves the words: `data-in` flips as
 * the panel reaches the top, so the blocks arrive with the cards rather than
 * on a timer of their own.
 */
function ScrollBlock({
  rect,
  progress,
  settled,
}: {
  rect: (typeof beforeAfter.rects)[number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  /** Skip the arrival and sit where it lands. */
  settled: boolean;
}) {
  const arrived = useTransform(progress, (value) => value > 0.75);

  return (
    <motion.span
      className="mh-quote-block"
      // A motion value cannot be read during render, so the attribute is
      // driven rather than computed — the same value the words are on.
      data-in={settled || arrived.get()}
      ref={(node) => {
        if (!node || settled) return;
        return arrived.on("change", (value) => {
          node.dataset.in = String(value);
        });
      }}
      style={
        {
          ...hoverRectBox(rect),
          "--mh-quote-from": hoverRectFrom(rect),
        } as CSSProperties
      }
    />
  );
}
