"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import testimonialJames from "@public/uploads/images/testimonial-2.png";
import testimonialPriya from "@public/uploads/images/testimonial-3.png";
import testimonialRyan from "@public/uploads/images/testimonial-1.png";
import { CarouselArrowLeft, CarouselArrowRight } from "@/components/ui/SiteIcons";
import { useInView } from "motion/react";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import {
  sectionTextRevealDynamic,
  testimonialCarousel,
} from "@/config/animation";
import type {
  TestimonialPhoto,
  TestimonialTone,
  testimonialsContent,
} from "@/content/home";
import { cn } from "@/lib/cn";
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

/** The cut-out a quote names. Content says which; this says what it is. */
const portraits: Record<TestimonialPhoto, StaticImageData> = {
  ryan: testimonialRyan,
  james: testimonialJames,
  priya: testimonialPriya,
};

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
    <section
      data-bg="green"
      className="overflow-hidden bg-bg py-20 tablet:py-30"
    >
      <Container>
        <div className="flex flex-col gap-8 tablet:flex-row tablet:items-end tablet:justify-between">
          <div>
            <TextReveal
              as="h2"
              lines={content.headingLines}
              settings={sectionTextRevealDynamic}
              className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
            />
            {/* Bound to the dynamic ink, not to white. The page crossfades to
                the light surface while this section is still on screen — the
                handover is pulled toward a dark section's own edges — so text
                fixed to white goes invisible exactly there. Full strength
                rather than the muted step, per the original, and set wide
                enough for two long lines. */}
            <p className="text-ink-dynamic mt-6 max-w-[68ch] font-body text-body-lg">
              {content.subheading}
            </p>
          </div>

          {/* Disabled at the ends rather than wrapping: the original's left
              arrow is visibly dead on the first card. `disabled` states it to
              a screen reader as well as to the eye. */}
          <div className="flex shrink-0 gap-2">
            {[
              {
                label: content.controls.previous,
                Icon: CarouselArrowLeft,
                to: shown - 1,
                off: shown === 0,
              },
              {
                label: content.controls.next,
                Icon: CarouselArrowRight,
                to: shown + 1,
                off: shown === last,
              },
            ].map(({ label, Icon, to, off }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                disabled={off}
                onClick={() => setShown(to)}
                // A fixed dark button with a light arrow, as in the original,
                // rather than anything derived from the surface: white-on-ink
                // when the page is dark, and still a solid dark button once
                // the page has crossfaded to white under it. An alpha of the
                // ink would have gone pale and taken the arrow with it.
                className="flex size-11 items-center justify-center rounded-[4px] bg-(--mh-ink-border) text-fg transition-[filter] duration-(--duration-hover) ease-(--ease-out) hover:brightness-125 disabled:pointer-events-none"
              >
                {/* The arrow dims at the end of the row, not the button under
                    it — the square holds its weight either way. */}
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
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
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

              {/* The portrait: a 40% column beside the quote from tablet up,
                  and a 300px band under it on a phone — which is why it is
                  ordered last there and first above. It is a cut-out standing
                  on the card's own fill, so it has no frame of its own.

                  `contain` and not `cover`: the file is a person cut out of
                  their background, and cropping one to fill a column takes the
                  top of their head off. Anchored to the bottom so they stand
                  on the card's floor rather than floating in the middle of it.

                  Decorative: the caption below names them, and an alt here
                  would have a screen reader say it twice. */}
              <div className="relative order-last h-[300px] w-full shrink-0 tablet:order-first tablet:h-auto tablet:w-2/5">
                <Image
                  src={portraits[item.photo]}
                  alt=""
                  fill
                  sizes="(max-width: 810px) 100vw, 40vw"
                  className="object-contain object-bottom"
                />
              </div>

              <div className="relative flex w-full flex-col justify-between gap-10 p-10 tablet:w-3/5">
                {/* The owner's L breakpoint: 48px, -0.05em, 1.2 line. Tighter
                    tracking than any heading on the site, hence its own
                    token rather than the display one. */}
                <blockquote className="font-body text-quote leading-[1.2] tracking-(--tracking-quote) text-fg-on-light">
                  {`“${item.quote}”`}
                </blockquote>

                <figcaption className="font-body text-quote-by text-fg-on-light tablet:text-right">
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
 * proportion as the container narrows; on a phone it stacks — quote over
 * portrait — and takes whatever height the two need.
 */
function cardClass(tone: TestimonialTone) {
  return [
    "relative flex w-full shrink-0 flex-col overflow-clip tablet:flex-row",
    "tablet:aspect-[1120/516]",
    tones[tone],
  ].join(" ");
}
