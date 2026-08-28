import Image from "next/image";
import contactQuoteMark from "@public/uploads/images/contact-quote-mark.avif";
import contactPortrait from "@public/uploads/images/contact-portrait.avif";
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
          {/* 40 on every side from the tablet up, against the form's 20 — the
              quote is a block of reading matter and wants the room; the fields
              want the width.

              On a phone it is 32 at the head, foot and left, and 20 at the
              right: the logo rail runs off that edge, and the shorter gutter
              is what lets a mark reach it rather than stopping short.

              Longhands on both sides of the breakpoint. Tailwind orders the
              `p-*` shorthand and the per-side longhands by property rather
              than by the order they are written, so mixing the two across a
              breakpoint is a race that cannot be read off the class list. */}
          <div className="relative flex flex-col justify-between gap-10 bg-contact-panel pt-8 pr-5 pb-8 pl-8 desktop:w-1/2 tablet:pt-10 tablet:pr-10 tablet:pb-10 tablet:pl-10">
            {/* The owner's mark, and no longer the typeface's — it is its own
                drawing, so it is a file. Decorative: the quotation is already
                marked up as one and a screen reader should not hear it twice.

                Big, and the quote's first line runs over its foot rather than
                starting underneath it. That is the point of the size: one that
                clears the type reads as a small ornament above the quote, and
                this one reads as the corner the quote is set into.

                Pulled above the panel's top edge so the tops of the commas
                are cut off by it, which is the owner's drawing of it: whole,
                the mark reads as a sticker laid on the corner; cut, it reads
                as something the panel is a window onto. About three tenths of
                its height goes. The clip belongs to the panel wrapper, not to
                this half — the half has the padding and no overflow of its
                own — and the half's top is the panel's top, so the cut lands
                exactly on the edge.

                ⚠️ It arrived filled in `--mh-blue-200`, which is the panel's
                own colour and would have been invisible on it, so the shape is
                the owner's and the fill is `--color-contact-mark`. If the
                panel is meant to be the lighter blue instead, change that and
                re-fill this from the original rather than nudging both. */}
            <Image
              src={contactQuoteMark}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-[22px] left-6 w-[86px] select-none tablet:-top-[30px] tablet:left-8 tablet:w-[115px]"
            />

            {/* No top padding: the type starts at the panel's own inset and the
                mark comes down over it. `relative` keeps it above the mark. */}
            <blockquote className="relative font-body text-body-lg leading-[1.6] text-fg-on-light">
              {`"${content.quote.body}"`}
            </blockquote>

            <div className="relative flex flex-col gap-10">
              <figcaption className="flex items-center gap-4">
                {/* The portrait. Decorative: the name and the role sit right
                    beside it, and an alt here would have a screen reader say
                    them twice.

                    The file is already cropped square to head and shoulders —
                    it arrived as a 3300x4096 standing shot, which at 48px
                    would have been a person too small to recognise — so
                    `cover` has nothing left to decide. */}
                <span
                  aria-hidden="true"
                  className="relative block size-12 shrink-0 overflow-clip bg-placeholder"
                >
                  <Image
                    src={contactPortrait}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
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
