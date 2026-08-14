import { Container } from "@/components/layout/Container";
import { ContactForm } from "@/components/sections/ContactForm";
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

export function ContactPanel({ content }: ContactPanelProps) {
  return (
    <section data-bg="dark" className="bg-bg pb-20 tablet:pb-30">
      <Container>
        <div className="flex flex-col overflow-clip bg-bg-white desktop:flex-row">
          {/* The quote half. */}
          <div className="relative flex flex-col justify-between gap-10 bg-contact-panel p-8 tablet:p-12 desktop:w-1/2">
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

              {/* Marks the logos as a footnote to the quote rather than a
                  second block of content. */}
              <ul className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-fg-on-light/15 pt-8">
                {content.logos.map((logo, i) => (
                  <li
                    key={`${logo.name}-${i}`}
                    // Names until the marks land, at the weight a logo sits at
                    // in a row like this — the same stand-in the trust strip
                    // uses, so the two are replaced the same way.
                    className="font-ui text-body-sm font-light text-fg-on-light/45"
                  >
                    {logo.name}
                  </li>
                ))}
              </ul>
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
