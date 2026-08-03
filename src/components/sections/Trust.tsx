import type { CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { featureMarquee, sectionTextRevealDynamic } from "@/config/animation";
import type { TrustTone, trustContent } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Trust section — "Why Top Companies Trust Us".
 *
 * Four statistics that descend across the row: each panel starts lower than
 * the one before it and they all finish on the same line, so the block reads
 * as a staircase rather than four equal boxes. Below them, a marquee of client
 * marks.
 *
 * A server component. The marquee is CSS and the heading declares its own
 * client boundary.
 */

/** Fills come from theme.css; the section never names a colour itself. */
const tones: Record<TrustTone, string> = {
  peach: "bg-stat-peach",
  green: "bg-stat-green",
  blue: "bg-stat-blue",
  magenta: "bg-stat-magenta",
};

/** How much lower each panel starts than the one to its left. */
const STEP = 32;

/**
 * Logo strip geometry, in px. The travel is derived from these rather than
 * measured, so the markup is identical on the server and the client and the
 * row is already moving on the first frame.
 */
const LOGO_SLOT = 140;
const LOGO_GAP = 40;

type TrustProps = {
  content: typeof trustContent;
};

export function Trust({ content }: TrustProps) {
  const cycle = content.logos.length * (LOGO_SLOT + LOGO_GAP);
  const duration = Math.round((cycle / featureMarquee.speed) * 1000);

  const logos = content.logos.map((logo, i) => (
    <li
      key={`${logo.name}-${i}`}
      className="flex h-4 w-[140px] shrink-0 items-center justify-center"
    >
      {/* Placeholder until the files land: the name at the mark's height, so
          the row's rhythm and spacing are already right when they arrive. */}
      <span className="text-ink-dynamic truncate font-ui text-body-sm font-light opacity-35">
        {logo.name}
      </span>
    </li>
  ));

  return (
    <section data-bg="white" className="bg-bg-white py-20 text-fg-on-light">
      <Container className="px-10">
        <div className="flex flex-col gap-8 tablet:flex-row tablet:items-start tablet:justify-between">
          <TextReveal
            as="h2"
            lines={content.headingLines}
            mobileLines={content.headingLinesMobile}
            settings={sectionTextRevealDynamic}
            className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
          <p className="text-ink-dynamic max-w-[42ch] font-body text-body-md leading-[1.5] tablet:pt-2">
            {content.subheading}
          </p>
        </div>

        {/* `items-stretch` is what aligns the feet: every cell is as tall as
            the tallest, and the descending top margin eats into each panel from
            above rather than pushing it down the page. */}
        <ul className="mt-15 grid gap-0 tablet:grid-cols-2 desktop:grid-cols-4">
          {content.stats.map((stat, i) => (
            <li key={stat.label} style={{ marginTop: i * STEP }}>
              <div className={cn("flex h-full flex-col p-6", tones[stat.tone])}>
                <p className="eyebrow text-fg-on-light">{stat.label}</p>

                {/* Figure and unit are separate elements at separate sizes,
                    baseline-aligned so the small unit sits on the big
                    number's foot rather than floating beside its middle. */}
                <p className="mt-6 flex items-baseline font-ui font-light text-fg-on-light">
                  {stat.prefix ? (
                    <span className="text-display-md">{stat.prefix}</span>
                  ) : null}
                  <span className="text-stat leading-none">{stat.value}</span>
                  <span className="text-display-md uppercase">{stat.unit}</span>
                </p>

                {/* Pushed to the foot, which is the line all four share. */}
                <p className="mt-auto pt-16 font-body text-body-sm leading-[1.5] text-fg-on-light">
                  {stat.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-15 flex flex-col gap-8 tablet:flex-row tablet:items-center tablet:gap-16">
          <p className="text-ink-dynamic max-w-[24ch] shrink-0 font-body text-body-sm leading-[1.5]">
            {content.logosCaption}
          </p>

          <div className="mh-marquee-frame no-scrollbar min-w-0 flex-1 overflow-hidden">
            <div
              className="mh-marquee flex w-max items-center"
              style={
                {
                  "--mh-marquee-cycle": `${cycle}px`,
                  "--mh-marquee-duration": `${duration}ms`,
                } as CSSProperties
              }
            >
              <ul className="flex items-center gap-10 pr-10">{logos}</ul>
              {/* The second copy exists to make the loop seamless. Same marks,
                  so it is hidden from assistive tech. */}
              <ul aria-hidden="true" className="flex items-center gap-10 pr-10">
                {logos}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
