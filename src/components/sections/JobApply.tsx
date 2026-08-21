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
          {/* 40 on every side, against the form's 20 — the quote is a block of
              reading matter and wants the room; the fields want the width. */}
          <div className="relative flex flex-col justify-between gap-10 bg-contact-panel p-10 desktop:w-1/2">
            {/* The mark is the panel's decoration, not a character anyone
                should hear read out — the quotation itself is already marked
                up as one. Set rather than drawn: four bars of my own read as
                organ pipes, where the typeface's own glyph is the shape the
                design is actually showing.

                `leading-none` puts the glyph's ink near the top of its own
                box, which is what lets it sit this close to the panel's corner
                — pulled any higher it is simply cut off by the panel's clip. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 left-6 select-none font-display text-[9rem] leading-none text-contact-mark tablet:top-2 tablet:left-8 tablet:text-[12rem]"
            >
              &ldquo;
            </span>

            {/* The same measure as the description opposite it, and now the
                same token rather than a literal that happens to match. */}
            <blockquote className="relative pt-10 font-body text-body-lg leading-(--leading-prose) text-fg-on-light tablet:pt-14">
              {`"${content.apply.quote.body}"`}
            </blockquote>

            <figcaption className="relative flex items-center gap-4">
              {/* The portrait's slot at its real size, so the row's rhythm is
                  right before the photograph arrives. */}
              <span
                aria-hidden="true"
                className="block size-12 shrink-0 bg-placeholder"
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
