import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { Parallax } from "@/components/motion/Parallax";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { heroParallax, sectionTextRevealDark } from "@/config/animation";
import type { LegalDocument as Document } from "@/content/legal";

/**
 * A legal document — privacy policy, terms, and anything of that shape later.
 *
 * One component for both, because they are the same page with different words:
 * a dark opening carrying the title and a line of context, then the document
 * itself on white. Two page files that merely pass content is what keeps them
 * from drifting apart the first time one is edited.
 *
 * `hero` as the surface: the opening is dark and everything under it is white,
 * so the header's strip flips once as the reader passes the title.
 *
 * Both halves keep their own fill. The site's habit is to let the page's
 * background crossfade between sections, but a document is a dark block with
 * white under it and a hard edge between — crossfading that edge drags a wash
 * of green across the top of the reading matter, which is neither the design
 * nor readable.
 *
 * Headings inside the document are plain rather than revealed. The title gets
 * the site's entrance; eight more of them down a page nobody came here to
 * enjoy would be noise.
 */

type LegalDocumentProps = {
  content: Document;
};

export function LegalDocument({ content }: LegalDocumentProps) {
  return (
    <>
      <PageSurface value="hero" />

      {/* The site's handover, as the home and about pages make it: the opening
          pins and the document rides up over it.

          Only the opening is `sticky`. A document is taller than the viewport,
          and a sticky element taller than its container pins its own top and
          stops its content scrolling — the page would simply freeze. It rides
          over on `relative z-10` and its own opaque fill instead, which is all
          the effect actually needs.

          `overflow-hidden` so the band's cells cannot widen the page as they
          animate, and the top offset clears the fixed header — the field runs
          from under it rather than behind it, which would cut its first row
          in half. */}
      <div data-scroll-stack>
        <section
          data-bg="green"
          data-bg-keep=""
          className="sticky top-0 overflow-hidden bg-bg pt-[calc(var(--header-height)+13rem)] pb-15 text-fg"
        >
          <PatternField
            side="top"
            orientation="horizontal"
            thickness={26}
            className="top-header"
          />

          {/* Pinned, so the drift has to track the stack around it — keyed to
              this section it would freeze for exactly the stretch it is held
              at the top, which is when it should be moving. */}
          <Parallax
            drift={heroParallax.drift}
            trackSelector="[data-scroll-stack]"
            range="top"
            className="relative"
          >
            <Container className="flex flex-col items-start gap-6">
              <TextReveal
                as="h1"
                lines={content.titleLines}
                // Fixed white, not the live token: this section keeps its own dark
                // fill, so it never crossfades and the live ink would resolve to the
                // document's dark ink the moment the window is tall enough for the
                // white half to win the viewport.
                settings={sectionTextRevealDark}
                lineStagger={sectionTextRevealDark.lineStagger}
                className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
              />

              <p className="max-w-[86ch] font-body text-body-md leading-[1.6] text-fg">
                {content.intro}
              </p>
            </Container>
          </Parallax>
        </section>

        <section
          data-bg="white"
          data-bg-keep=""
          className="relative z-10 bg-bg-white py-20 text-fg-on-light tablet:py-25"
        >
          <Container>
            {/* An ordered run of headings and paragraphs, not cards. The rhythm
              between sections is what separates them — a document reads as one
              thing, and boxing each part would break it into eight. */}
            <div className="flex flex-col gap-15">
              {content.sections.map((section) => (
                <section key={section.heading} className="flex flex-col gap-5">
                  <h2 className="text-display-md leading-(--leading-display) tracking-(--tracking-display) font-normal">
                    {section.heading}
                  </h2>
                  <p className="max-w-[92ch] font-body text-body-md leading-[1.6]">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
