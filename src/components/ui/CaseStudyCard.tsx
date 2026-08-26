import Link from "next/link";
import type { CSSProperties } from "react";
import { caseHover } from "@/config/animation";
import type { CaseStat, CaseStudy, CaseTone } from "@/content/case-studies";
import { cn } from "@/lib/cn";
import { hoverRectBox, hoverRectFrom } from "@/lib/hoverRect";

/**
 * One case study.
 *
 * Two halves with distinct jobs. The left panel is the argument — mark, year,
 * headline, summary, and the four figures — and holds no decoration. The right
 * half is the picture, and it is also where the hover blocks live, so the
 * motion happens against the artwork rather than across the reading matter.
 *
 * On a phone they stack, panel first: the numbers are the point, and a product
 * screenshot at that width is barely legible anyway.
 *
 * A server component. The hover is CSS, so nothing here ships as JavaScript.
 */

/** Fills come from theme.css; the card never names a colour itself. */
const tones: Record<CaseTone, string> = {
  sky: "bg-case-sky",
  lavender: "bg-case-lavender",
  peach: "bg-case-peach",
  mint: "bg-case-mint",
  periwinkle: "bg-case-periwinkle",
};

/**
 * One figure. Both halves are Geist Light — the label as well as the value,
 * which is the one place on the card where the body face gives way entirely.
 */
function Stat({ stat }: { stat: CaseStat }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="font-ui text-body-sm font-light text-fg-on-light/70">
        {stat.label}
      </dt>
      <dd className="font-ui text-heading-lg font-light text-fg-on-light">
        {stat.value}
      </dd>
    </div>
  );
}

type CaseStudyCardProps = {
  study: CaseStudy;
  className?: string;
  /** Carries `--mh-case-shape`, the tint the hover blocks are drawn in. */
  style?: CSSProperties;
};

export function CaseStudyCard({ study, className, style }: CaseStudyCardProps) {
  // Down the columns, not across: each column carries one rule down its left
  // edge, so the pairs that share a rule have to be siblings.
  const columns = [
    [study.stats[0], study.stats[2]],
    [study.stats[1], study.stats[3]],
  ];

  return (
    <article
      style={style}
      className={cn("group relative overflow-clip bg-bg-white", className)}
    >
      {/* The whole card is one link. It carries the accessible name, and the
          heading inside stays plain text so a screen reader announces one link
          rather than two. */}
      <Link
        href={`/case-study/${study.slug}`}
        className="absolute inset-0 z-20"
        aria-label={`${study.title} — ${study.client}`}
      />

      <div className="grid lg:grid-cols-2">
        {/* `justify-between` is what separates the two groups: everything that
            introduces the study sits at the top, the figures sit at the foot,
            and the gap between them absorbs whatever the artwork's height
            leaves over. */}
        <div
          className={cn(
            "flex flex-col justify-between gap-16 p-7",
            tones[study.tone],
          )}
        >
          <div className="flex flex-col gap-7">
            <div className="flex items-start justify-between gap-4">
              {study.logo?.url ? (
                // Fitted inside 138x32 rather than filling it: client marks are
                // every shape, and `contain` keeps each one whole and aligned
                // to the same left edge.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={study.logo.url}
                  alt={study.logo.alt}
                  className="h-8 w-[138px] object-contain object-left"
                />
              ) : (
                <p className="flex h-8 items-center font-display text-heading-md text-fg-on-light">
                  {study.client}
                </p>
              )}

              <span className="border border-fg-on-light/20 px-2 py-1 font-ui text-[1rem] font-light text-fg-on-light">
                {study.year}
              </span>
            </div>

            {/* `text-wrap` overrides the `balance` the base stylesheet puts on
                every heading. Balancing evens the lines out by pulling words
                down early, which is exactly what stops the title reaching the
                panel's edge. */}
            <h3 className="font-display text-heading-lg text-wrap text-fg-on-light">
              {study.title}
            </h3>

            <p className="font-body text-body-md text-fg-on-light/80">
              {study.summary}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-5">
            {columns.map((column, i) => (
              <div
                key={i}
                className="flex flex-col gap-10 border-l border-fg-on-light/15 pl-4"
              >
                {column.map((stat) => (
                  <Stat key={stat.label} stat={stat} />
                ))}
              </div>
            ))}
          </dl>
        </div>

        {/* The artwork half, and the whole of the hover.

            Stacked under the panel on a phone, where it takes the owner's flat
            424: the square the frame's proportion gives would be most of a
            screen on its own.

            From `lg` the proportion is a floor rather than a lock — see the
            spacer below. Held as a lock it set this half's height from its own
            width, and the panel beside it does not shrink at the same rate:
            past about 1280 the text wraps to more lines than the artwork
            loses, so the row grew taller than the artwork and left a band of
            the card's own fill under it. 70px of it at 1024, widening as the
            window narrows. Stretching is also what the grid would have done on
            its own; `aspect-ratio` on an auto height is what stopped it. */}
        <div
          className="relative h-[424px] overflow-clip bg-bg-light lg:h-auto"
          style={
            {
              "--mh-case-duration": `${caseHover.duration}ms`,
              "--mh-case-scale": caseHover.imageScale,
            } as CSSProperties
          }
        >
          {/* The Framer frame's proportion, 560:552, and the only thing here
              still in normal flow. It gives the half a height to be when the
              panel beside it is shorter — which is what it always had — and
              gets stretched past when the panel is taller, which is what it
              never did. The artwork and the rectangles are laid over it. */}
          <div aria-hidden="true" className="hidden lg:block lg:aspect-[560/552]" />

          {study.image?.url ? (
            // Not next/image: the URL is already sized and format-negotiated by
            // Sanity's pipeline, so routing it through the optimiser would be a
            // second transform of an image that has had one.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={study.image.url}
              alt={study.image.alt}
              // Centred. Anchored to the top left, anything wider than the
              // box lost its right-hand side — and a product screenshot is
              // wider than this box every time, so the part an editor cared
              // about was the part being cut. Centre is also what the hotspot
              // falls back to, so the two agree when none is set.
              className="mh-case-cover absolute inset-0 size-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="mh-case-cover absolute inset-0 flex size-full items-center justify-center p-7">
              <p className="font-body text-body-sm text-fg-on-light/40">
                Screenshot to come
              </p>
            </div>
          )}

          {/* Decorative, and confined to this half — the rectangles belong to
              the artwork, not to the reading matter beside it. Above the link
              surface so nothing clips them. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30"
          >
            {caseHover.rects.map((rect, i) => (
              <span
                key={i}
                className="mh-case-block"
                style={
                  {
                    ...hoverRectBox(rect),
                    "--mh-case-from": hoverRectFrom(rect),
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
