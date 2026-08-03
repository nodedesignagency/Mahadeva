import Link from "next/link";
import type { CSSProperties } from "react";
import { caseHover } from "@/config/animation";
import type { CaseStat, CaseStudy, CaseTone } from "@/content/case-studies";
import { cn } from "@/lib/cn";

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
};

/**
 * Where each hover block starts: parked one full step outside the side it
 * hugs, so it enters travelling inward. Delivered as a custom property because
 * an inline `translate` would outrank the hover rule that clears it.
 */
const departures: Record<string, string> = {
  left: "-101% 0",
  right: "101% 0",
  top: "0 -101%",
  bottom: "0 101%",
};

function blockPosition(block: (typeof caseHover.blocks)[number]): CSSProperties {
  const size = { width: `${block.w}%`, height: `${block.h}%` };
  switch (block.edge) {
    case "left":
      return { ...size, left: 0, top: `${block.y}%` };
    case "right":
      return { ...size, right: 0, top: `${block.y}%` };
    case "top":
      return { ...size, top: 0, left: `${block.x}%` };
    default:
      return { ...size, bottom: 0, left: `${block.x}%` };
  }
}

/**
 * One figure. The value is Geist — every number on the site is, whatever the
 * surrounding copy is set in — and the label is the body face above it.
 */
function Stat({ stat }: { stat: CaseStat }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="font-body text-body-sm text-fg-on-light/70">{stat.label}</dt>
      <dd className="font-ui text-heading-lg font-normal text-fg-on-light">{stat.value}</dd>
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
        <div className={cn("flex flex-col justify-between gap-16 p-7", tones[study.tone])}>
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

            <p className="font-body text-body-md leading-[1.5] text-fg-on-light/80">
              {study.summary}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-5">
            {columns.map((column, i) => (
              <div key={i} className="flex flex-col gap-10 border-l border-fg-on-light/15 pl-6">
                {column.map((stat) => (
                  <Stat key={stat.label} stat={stat} />
                ))}
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-h-[18rem] overflow-clip bg-bg-light">
          {study.image?.url ? (
            // Not next/image: the URL is already sized and format-negotiated by
            // Sanity's pipeline, so routing it through the optimiser would be a
            // second transform of an image that has had one.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={study.image.url}
              alt={study.image.alt}
              className="size-full object-cover object-left-top"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-7">
              <p className="font-body text-body-sm text-fg-on-light/40">Screenshot to come</p>
            </div>
          )}

          {/* Decorative, and confined to this half — the blocks belong to the
              artwork, not to the reading matter beside it. Above the link
              surface so nothing clips them. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
            {caseHover.blocks.map((block, i) => (
              <span
                key={i}
                className="mh-case-block"
                style={
                  {
                    ...blockPosition(block),
                    "--mh-case-from": departures[block.edge],
                    "--mh-case-duration": `${caseHover.duration}ms`,
                    "--mh-case-delay-in": `${block.delay}ms`,
                    "--mh-case-delay-out": `${caseHover.exitDelay}ms`,
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
