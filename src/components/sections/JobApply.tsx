import Image from "next/image";
import contactQuoteMark from "@public/uploads/images/contact-quote-mark.avif";
import quotePortrait from "@public/uploads/images/careers-quote-portrait.avif";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { ApplyForm } from "@/components/sections/ApplyForm";
import { sectionTextReveal } from "@/config/animation";
import type { jobDetailContent } from "@/content/careers";

/**
 * Apply for this job — one object in two halves.
 *
 * Visibly the contact panel again, and deliberately: a quote on the blue left,
 * the form on the white right, side by side from desktop and stacked below it.
 * The reassurance comes first in the source and so first on a phone, which is
 * the right order — someone deciding whether to apply reads why before they
 * fill anything in.
 *
 * Not the same component, though. The contact panel carries a logo marquee
 * under its quote and collects an enquiry; this collects an application and
 * has no marquee. Sharing them would mean a component with two content shapes
 * and a flag, which is how one page's change quietly breaks the other.
 *
 * The section keeps its own fill and so its heading takes the fixed light ink:
 * white, with the white description above it and the dark call-to-action panel
 * below, there is no crossfade for the live token to resolve against.
 *
 * A server component. Only the form needs the client, and it says so itself.
 */

type JobApplyProps = {
  content: typeof jobDetailContent;
  /** Which posting this is, so the application says what it is for. */
  role: string;
};

export function JobApply({ content, role }: JobApplyProps) {
  return (
    <section
      id={content.applyId}
      data-bg="white"
      data-bg-keep=""
      className="relative z-10 bg-bg-white pb-20 text-fg-on-light tablet:pb-25"
    >
      <Container>
        <TextReveal
          as="h2"
          lines={content.apply.headingLines}
          settings={sectionTextReveal}
          // 48 at desktop, which is what `display-lg` resolves to — the size
          // every other section heading on the site is set at.
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        <div className="mt-15 flex flex-col overflow-clip border border-border-on-light desktop:flex-row">
          {/* The quote half. */}
          {/* 40 on every side from the tablet up, against the form's 20 — the
              quote is a block of reading matter and wants the room; the fields
              want the width. 32 on a phone, which is the contact panel's own
              phone inset: the mark is placed against the panel's corner rather
              than against the type, so a wider gutter there leaves it stranded
              out to the left of the line it belongs to.

              Not that panel's `pr-5`, though. The short right gutter there is
              for the logo rail to reach the edge, and this panel has no rail —
              taking it would be copying a fix for a problem that is not here. */}
          <div className="relative flex flex-col justify-between gap-10 bg-contact-panel p-8 desktop:w-1/2 tablet:p-10">
            {/* The owner's mark, the same drawing and the same placement the
                contact panel uses — one mark on the site, not a drawn one here
                and the typeface's there. Set as a glyph this was four bars
                that read as organ pipes, sat wholly inside the panel with the
                quote starting well below it.

                Decorative: the quotation is already marked up as one and a
                screen reader should not hear it twice.

                Big, and the quote's first line runs over its foot rather than
                starting underneath it. That is the point of the size: one that
                clears the type reads as a small ornament above the quote, and
                this one reads as the corner the quote is set into.

                Pulled above the panel's top edge so the tops of the commas are
                cut off by it. Whole, the mark reads as a sticker laid on the
                corner; cut, it reads as something the panel is a window onto.
                The clip belongs to the wrapper, and this half's top is the
                wrapper's top, so the cut lands on the edge — a pixel inside
                it here, where the wrapper also carries a border. */}
            <Image
              src={contactQuoteMark}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-[22px] left-6 w-[86px] select-none tablet:-top-[30px] tablet:left-8 tablet:w-[115px]"
            />

            {/* The same measure as the description opposite it, and the same
                token rather than a literal that happens to match.

                No top padding: the type starts at the panel's own inset and
                the mark comes down over it. `relative` keeps it above the
                mark. */}
            <blockquote className="relative font-body text-body-lg leading-(--leading-prose) text-fg-on-light">
              {`"${content.apply.quote.body}"`}
            </blockquote>

            <figcaption className="relative flex items-center gap-4">
              {/* 48 square, and the photograph is covered into it rather than
                  the box being cut to the photograph: the upload is 825x1024
                  and the row's rhythm is set by the slot, not by what lands in
                  it.

                  Decorative — the name and the role are set beside it, so an
                  empty alt keeps the same person from being announced twice. */}
              <Image
                src={quotePortrait}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 object-cover object-center"
              />
              <span className="flex flex-col">
                <span className="font-body text-body-md text-fg-on-light">
                  {content.apply.quote.name}
                </span>
                <span className="font-body text-body-sm text-fg-on-light-muted">
                  {content.apply.quote.role}
                </span>
              </span>
            </figcaption>
          </div>

          {/* The form half. */}
          <div className="desktop:w-1/2">
            <ApplyForm content={content.apply.form} role={role} />
          </div>
        </div>
      </Container>
    </section>
  );
}
