import Link from "next/link";
import type { CSSProperties } from "react";
import { caseHover } from "@/config/animation";
import type { CaseStudy, CaseTone } from "@/content/case-studies";
import { cn } from "@/lib/cn";

/**
 * One case study.
 *
 * Two halves: a tinted panel carrying the words and the numbers, and the
 * product shot beside it. On a phone they stack, panel first — the stats are
 * the argument the card is making, and a screenshot at phone width is barely
 * legible anyway.
 *
 * A server component. The hover is CSS, so nothing here reaches the browser as
 * JavaScript.
 */

/** Fills come from theme.css; the card never names a colour itself. */
const tones: Record<CaseTone, string> = {
  sky: "bg-case-sky",
  lavender: "bg-case-lavender",
  peach: "bg-case-peach",
};

/**
 * Where each hover block starts, per edge: parked one full step outside the
 * side it hugs, so it enters travelling inward.
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

type CaseStudyCardProps = {
  study: CaseStudy;
  className?: string;
  /** Carries `--mh-case-shape`, the tint the hover blocks are drawn in. */
  style?: CSSProperties;
};

export function CaseStudyCard({ study, className, style }: CaseStudyCardProps) {
  return (
    <article
      style={style}
      className={cn("group relative overflow-clip bg-bg-white", className)}
    >
      {/* The whole card is one link. It sits above the content but below the
          hover blocks, and carries the accessible name — the inner heading is
          left as plain text so a screen reader announces one link, not two. */}
      <Link
        href={`/case-study/${study.slug}`}
        className="absolute inset-0 z-20"
        aria-label={`${study.title} — ${study.client}`}
      />

      <div className="grid lg:grid-cols-2">
        <div className={cn("flex flex-col p-10", tones[study.tone])}>
          <div className="flex items-start justify-between gap-4">
            <p className="font-display text-heading-md text-fg-on-light">{study.client}</p>
            <span className="border border-fg-on-light/20 px-2 py-1 font-body text-body-sm text-fg-on-light">
              {study.year}
            </span>
          </div>

          <h3 className="mt-8 max-w-[20ch] font-display text-heading-lg text-fg-on-light">
            {study.title}
          </h3>

          <p className="mt-6 max-w-[46ch] font-body text-body-md text-fg-on-light/80">
            {study.summary}
          </p>

          {/* Pushed to the foot so the numbers line up across a row of cards
              whose titles wrap to different depths. */}
          <dl className="mt-auto grid grid-cols-2 gap-x-8 gap-y-8 pt-16">
            {study.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "flex flex-col gap-2",
                  // Rules between the columns and rows, not around the grid.
                  i % 2 === 1 && "border-l border-fg-on-light/15 pl-8",
                  i > 1 && "border-t border-fg-on-light/15 pt-8",
                )}
              >
                <dt className="font-body text-body-sm text-fg-on-light/70">{stat.label}</dt>
                <dd className="font-display text-heading-lg text-fg-on-light">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-h-[18rem] bg-bg-light">
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
            <div className="flex size-full items-center justify-center p-10">
              <p className="font-body text-body-sm text-fg-on-light/40">
                Screenshot to come
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative, and above everything including the link surface so the
          blocks are not clipped behind the artwork. */}
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
    </article>
  );
}
