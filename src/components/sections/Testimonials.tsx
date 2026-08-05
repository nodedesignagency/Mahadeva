"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealDynamic, testimonialCarousel } from "@/config/animation";
import type { TestimonialTone, testimonialsContent } from "@/content/home";
import { hoverRectBox, hoverRectFrom } from "@/lib/hoverRect";
import { viewport } from "@/lib/motion";

/**
 * Testimonials — one quote card at a time, the next peeking past the gutter.
 *
 * The track is a row of full-width cards inside the container, so advancing is
 * one translate of a card's width plus the gap, and the card that follows
 * spills into the right margin exactly as the original does. The section
 * clips; the container does not.
 *
 * A card carries the two states from the owner's file: bare, and with the
 * rectangles in. The second plays when the card takes the centre — the first
 * as the section is scrolled to, each later one as an arrow brings it across —
 * which is why the trigger here is state rather than `:hover`.
 *
 * A client component: it holds which card is showing.
 */

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<TestimonialTone, string> = {
  blue: "bg-quote-blue",
  green: "bg-quote-green",
  yellow: "bg-quote-yellow",
};

/** Gap between cards in the track, px — part of how far one advance travels. */
const GAP = 20;

type TestimonialsProps = {
  content: typeof testimonialsContent;
};

export function Testimonials({ content }: TestimonialsProps) {
  const [shown, setShown] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track, viewport);

  const last = content.items.length - 1;

  return (
    <section data-bg="green" className="overflow-hidden bg-bg py-20 tablet:py-30">
      <Container>
        <div className="flex flex-col gap-8 tablet:flex-row tablet:items-end tablet:justify-between">
          <div>
            <TextReveal
              as="h2"
              lines={content.headingLines}
              settings={sectionTextRevealDynamic}
              className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
            />
            <p className="text-ink-dynamic-muted mt-6 max-w-[46ch] font-body text-body-md">
              {content.subheading}
            </p>
          </div>

          {/* Disabled at the ends rather than wrapping: the original's left
              arrow is visibly dead on the first card. `disabled` states it to
              a screen reader as well as to the eye. */}
          <div className="flex shrink-0 gap-2">
            {[
              { label: content.controls.previous, Icon: ArrowLeft, to: shown - 1, off: shown === 0 },
              { label: content.controls.next, Icon: ArrowRight, to: shown + 1, off: shown === last },
            ].map(({ label, Icon, to, off }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                disabled={off}
                onClick={() => setShown(to)}
                className="flex size-11 items-center justify-center rounded-[4px] bg-fg/10 text-fg transition-[background-color,opacity] duration-(--duration-hover) ease-(--ease-out) hover:bg-fg/20 disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon aria-hidden="true" className="size-5" />
              </button>
            ))}
          </div>
        </div>
      </Container>

      <Container className="mt-15">
        <div
          ref={track}
          className="flex transition-transform ease-(--ease-case-hover)"
          style={{
            gap: `${GAP}px`,
            transitionDuration: `${testimonialCarousel.slide}ms`,
            // The card is the full width of the container, so one advance is
            // that width plus the gap — expressed against the track's own
            // width, which is what a percentage translate resolves against.
            transform: `translateX(calc(${-shown * 100}% - ${shown * GAP}px))`,
          }}
        >
          {content.items.map((item, i) => (
            <article
              key={item.name}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${content.items.length}`}
              style={
                {
                  "--mh-quote-shape": `var(--color-quote-shape-${item.tone})`,
                  "--mh-quote-duration": `${testimonialCarousel.reveal}ms`,
                  "--mh-quote-delay": `${testimonialCarousel.revealDelay}ms`,
                } as CSSProperties
              }
              className={cardClass(item.tone)}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {testimonialCarousel.rects.map((rect, r) => (
                  <span
                    key={r}
                    className="mh-quote-block"
                    // The card plays its rectangles once it is both the one
                    // showing and on screen — an arrow pressed above the fold
                    // should not spend the effect where nobody is looking.
                    data-in={inView && i === shown}
                    style={
                      {
                        ...hoverRectBox(rect),
                        "--mh-quote-from": hoverRectFrom(rect),
                      } as CSSProperties
                    }
                  />
                ))}
              </div>

              {/* 40/60, per the owner. The portrait is a cut-out standing on
                  the card's own fill, so the column has no frame of its own —
                  and while the photographs are outstanding it is simply
                  empty, which reads as a wide quote rather than as a fault. */}
              <div className="relative hidden w-2/5 shrink-0 tablet:block" />

              <div className="relative flex w-full flex-col justify-between gap-10 p-10 tablet:w-3/5">
                {/* The owner's L breakpoint: 48px, -0.05em, 1.2 line. Tighter
                    tracking than any heading on the site, hence its own
                    token rather than the display one. */}
                <blockquote className="font-body text-quote leading-[1.2] tracking-(--tracking-quote) text-fg-on-light">
                  {`“${item.quote}”`}
                </blockquote>

                <figcaption className="text-right font-body text-quote-by text-fg-on-light">
                  {`— ${item.name}, ${item.role}`}
                </figcaption>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * The card's box. 1120x516 in the file, held as a ratio so it keeps its
 * proportion as the container narrows; below tablet the portrait column is
 * dropped and the card takes whatever height the quote needs.
 */
function cardClass(tone: TestimonialTone) {
  return [
    "relative flex w-full shrink-0 overflow-clip",
    "tablet:aspect-[1120/516]",
    tones[tone],
  ].join(" ");
}
