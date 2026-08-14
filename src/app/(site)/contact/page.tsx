import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { ContactPanel } from "@/components/sections/ContactPanel";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { contactContent } from "@/content/contact";

export const metadata = buildMetadata({
  title: "Contact",
  description: contactContent.quote.body,
  path: "/contact",
});

/**
 * Contact.
 *
 * The site's other entrance, the same one the case study index makes: the page
 * opens on its own dark surface with the pattern band across the top, rather
 * than on a white or beige wrapper. Dark the whole way down, so the header
 * never flips.
 *
 * One heading and one panel. There is nothing else on this page on purpose —
 * a reader who has arrived here has already decided, and everything else would
 * be something to scroll past on the way to the form.
 */
export default function ContactPage() {
  return (
    <>
      <PageSurface value="dark" />

      {/* `overflow-hidden` so the band's cells cannot widen the page as they
          animate, and the top offset clears the fixed header — the field runs
          from under it rather than behind it, which would cut its first row in
          half. */}
      <section
        data-bg="green"
        className="relative overflow-hidden bg-bg pt-[calc(var(--header-height)+10rem)] pb-15 text-fg"
      >
        <PatternField
          side="top"
          orientation="horizontal"
          thickness={26}
          className="top-header"
        />

        <Container className="relative flex flex-col items-center text-center">
          <TextReveal
            as="h1"
            lines={contactContent.headingLines}
            settings={sectionTextRevealDynamic}
            lineStagger={sectionTextRevealDynamic.lineStagger}
            className="flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
        </Container>
      </section>

      <ContactPanel content={contactContent} />
    </>
  );
}
