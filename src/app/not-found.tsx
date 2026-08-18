import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { PatternField } from "@/components/motion/PatternField";
import { Button } from "@/components/ui/Button";
import { notFoundContent } from "@/content/not-found";

/**
 * 404.
 *
 * At the root rather than inside the (site) group, because this is what Next
 * serves for any URL the app does not have — including ones that never reach a
 * group. It still wears the site's chrome: someone who mistyped a URL is a
 * visitor, and should get the header and a way back rather than a bare page.
 *
 * The figure is set to the width of the page rather than to a size, so it
 * shrinks with the viewport and reads the same on a phone as on a desktop.
 */

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** The band's own geometry: the owner's 78, three rows of 26. */
const BAND = "-left-1.5 -right-1.5 h-[78px]";

export default function NotFound() {
  return (
    <SiteChrome>
      {/* Dark the whole way down, so the header wears the page's own surface
          rather than the light strip it falls back to. Declared, not inferred:
          the header is fixed in the root layout and is neither this page's
          ancestor nor its sibling in any order CSS can walk. */}
      <PageSurface value="dark" />

      <section
        data-bg="green"
        // `overflow-hidden` because the bands are wider than the page by design
        // — they run past each edge so neither ends on a visible seam.
        className="relative flex h-screen min-h-[34rem] flex-col items-center justify-center gap-14 overflow-hidden bg-bg pt-header text-fg h-[100dvh]"
      >
        {/* Below desktop the pattern frames the page instead of crossing it: a
            band under the header and another on the floor, with the figure
            clear between them. The overlap is a desktop effect — at these
            widths the figure is a third of the screen's height and bars across
            it would cover most of what there is to look at.

            The two take different seeds, so the floor is not the ceiling
            repeated. `bottom` is a different arrangement of the same rules,
            which is the point: one field, two faces. */}
        <div className="contents desktop:hidden">
          <PatternField
            side="top"
            orientation="horizontal"
            tracks={3}
            thickness={26}
            className={`top-header ${BAND}`}
          />
          <PatternField
            side="bottom"
            orientation="horizontal"
            tracks={3}
            thickness={26}
            className={`bottom-0 ${BAND}`}
          />
        </div>

        <div className="relative w-full">
          {/* Geist, like every figure on the site — see config/fonts.ts, which
              is where that rule lives.

              Sized by the viewport rather than to a scale: three characters of
              a known face have a width that is a fixed multiple of their size,
              so one value fills the page at every width and the figure shrinks
              with the device instead of stepping between breakpoints.

              `0.72` rather than `leading-none`: digits fill about seven tenths
              of their em box, so even a line-height of 1 wraps them in a third
              of a screen of air — enough at this size to push the button off
              the bottom of a viewport-tall section. Trimming it is also what
              lets the bands be positioned against the numerals rather than
              against the space around them. */}
          <h1 className="w-full text-center font-ui text-[47vw] leading-[0.72] font-normal">
            {notFoundContent.code}
          </h1>

          {/* Desktop only, and the one place on the site where the pattern is
              in front of something rather than behind it. That is the whole
              effect — the bars cross the numerals and give them depth. */}
          <div className="hidden desktop:contents">
            <PatternField
              side="top"
              orientation="horizontal"
              tracks={3}
              thickness={26}
              className={`top-[3%] ${BAND}`}
            />
            <PatternField
              side="bottom"
              orientation="horizontal"
              tracks={3}
              thickness={26}
              className={`top-[73%] ${BAND}`}
            />
          </div>
        </div>

        <Container className="relative flex flex-col items-center gap-10 text-center">
          <p className="max-w-[62ch] font-body text-body-md text-fg">
            {notFoundContent.body}
          </p>

          {/* The site's button width: 267 from tablet up, full width on a
              phone, the same pair the hero's two take. */}
          <Button
            href={notFoundContent.cta.href}
            withArrow
            className="w-full tablet:w-[267px]"
          >
            {notFoundContent.cta.label}
          </Button>
        </Container>
      </section>
    </SiteChrome>
  );
}
