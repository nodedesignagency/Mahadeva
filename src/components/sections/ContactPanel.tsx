import Image from "next/image";
import type { CSSProperties } from "react";

import { clientMarks, MARK_HEIGHT } from "@/components/ui/clientMarks";
import { Container } from "@/components/layout/Container";
import { ContactForm } from "@/components/sections/ContactForm";
import { featureMarquee } from "@/config/animation";
import type { contactContent } from "@/content/contact";

/**
 * The contact panel — one object in two halves.
 *
 * A quote on the blue left, the form on the white right, side by side from
 * desktop and stacked below it. The reassurance comes first in the source and
 * so first on a phone, which is the right order: someone deciding whether to
 * write to a stranger reads why before they fill anything in.
 *
 * A server component. Only the form needs the client, and it declares that
 * itself.
 */

type ContactPanelProps = {
  content: typeof contactContent;
};

/**
 * The logo row's geometry, in px. Fixed rather than measured: the travel has to
 * equal one copy's width exactly or the loop shows a seam, and a slot that
 * sizes to its contents cannot be known at render.
 */
const LOGO_SLOT = 110;
const LOGO_GAP = 32;

export function ContactPanel({ content }: ContactPanelProps) {
  const cycle = content.logos.length * (LOGO_SLOT + LOGO_GAP);
  // The same rate the trust strip runs at, so the site has one marquee speed
  // rather than two that nearly match.
  const duration = Math.round((cycle / featureMarquee.speed) * 1000);

  const logos = (
    <ul className="flex items-center" style={{ gap: `${LOGO_GAP}px`, paddingRight: `${LOGO_GAP}px` }}>
      {content.logos.map((logo, i) => (
        <li
          key={`${logo.name}-${i}`}
          // The same five the trust strip carries, at the same drawn height, so
          // the two rows read as one row in two places rather than two that
          // nearly match — which is the reason they already share a speed.
          className={`flex shrink-0 items-center justify-center ${MARK_HEIGHT}`}
          style={{ width: `${LOGO_SLOT}px` }}
        >
          <Image
            src={clientMarks[logo.mark]}
            alt={logo.name}
            className="h-full w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section data-bg="green" className="bg-bg pb-20 tablet:pb-30">
      <Container>
        <div className="flex flex-col overflow-clip bg-bg-white desktop:flex-row">
          {/* The quote half. */}
          {/* 40 on every side, against the form's 20 — the quote is a block of
              reading matter and wants the room; the fields want the width. */}
          <div className="relative flex flex-col justify-between gap-10 bg-contact-panel p-10 desktop:w-1/2">
            {/* The mark is the panel's decoration, not a character anyone
                should hear read out — the quotation itself is already marked
                up as one. Set rather than drawn: four bars of my own read as
                organ pipes, where the typeface's own glyph is the shape the
                design is actually showing.

                `leading-none` puts the glyph's ink near the top of its own box,
                which is what lets it sit this close to the panel's corner —
                pulled any higher it is simply cut off by the panel's clip. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 left-6 select-none font-display text-[9rem] leading-none text-contact-mark tablet:top-2 tablet:left-8 tablet:text-[12rem]"
            >
              &ldquo;
            </span>

            <blockquote className="relative pt-10 font-body text-body-lg leading-[1.6] text-fg-on-light tablet:pt-14">
              {`"${content.quote.body}"`}
            </blockquote>

            <div className="relative flex flex-col gap-10">
              <figcaption className="flex items-center gap-4">
                {/* The portrait's slot at its real size, so the row's rhythm
                    is right before the photograph arrives. */}
                <span
                  aria-hidden="true"
                  className="block size-12 shrink-0 bg-placeholder"
                />
                <span className="flex flex-col">
                  <span className="font-body text-body-md text-fg-on-light">
                    {content.quote.name}
                  </span>
                  <span className="font-body text-body-sm text-fg-on-light-muted">
                    {content.quote.role}
                  </span>
                </span>
              </figcaption>

              {/* The rule marks the logos as a footnote to the quote rather
                  than a second block of content.

                  The row travels right to left, and never stops — so it is
                  clipped by a frame narrower than itself and holds two copies
                  of the set, sliding by exactly one. The moment it loops, the
                  second copy is where the first began and the seam cannot be
                  seen. Distance and duration are derived from the logo count,
                  so adding a mark changes how long a lap takes and never how
                  fast it travels. */}
              <div className="border-t border-fg-on-light/15 pt-8">
                <div className="mh-marquee-frame no-scrollbar overflow-hidden">
                  <div
                    className="mh-marquee flex w-max items-center"
                    style={
                      {
                        "--mh-marquee-cycle": `${cycle}px`,
                        "--mh-marquee-duration": `${duration}ms`,
                      } as CSSProperties
                    }
                  >
                    {logos}
                    {/* The second copy is what makes the loop seamless. Same
                        marks, so it is hidden from assistive tech. */}
                    <div aria-hidden="true" className="contents">
                      {logos}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The form half. */}
          <div className="desktop:w-1/2">
            <ContactForm content={content.form} />
          </div>
        </div>
      </Container>
    </section>
  );
}
