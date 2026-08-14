import { Container } from "@/components/layout/Container";
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
 * shrinks with the viewport and the page reads the same on a phone as on a
 * desktop. Two bands of the pattern are then laid *over* it — the one place on
 * the site where they are in front of something rather than behind it, which is
 * what gives the numerals their depth.
 */

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Where each band sits, as a share of the figure's own height, and how tall it
 * is — the owner's 78, three rows of 26.
 *
 * Measured against the figure and not the section: the section is a viewport
 * tall and the figure is sized by width, so the two only agree at one window
 * size. Tied to the numerals, the bands cross them in the same place on every
 * screen, which is the whole point of the effect.
 */
const BANDS = [
  { side: "top", className: "top-[3%]" },
  { side: "bottom", className: "top-[73%]" },
] as const;

export default function NotFound() {
  return (
    <SiteChrome>
      <section
        data-bg="dark"
        // `overflow-hidden` because the bands are wider than the page by design
        // — they run 6px past each edge so neither ends on a visible seam.
        // The gap is the figure's only separation from the copy below it: with
        // the line box trimmed to the numerals there is no leading left to do
        // that job, and the paragraph sat against their feet.
        className="relative flex h-screen min-h-[34rem] flex-col items-center justify-center gap-14 overflow-hidden bg-bg pt-header text-fg h-[100dvh]"
      >
        <div className="relative w-full">
          {/* Sized by the viewport, not by a scale: the figure is three
              characters of a known face, so its width is a fixed multiple of
              its size and `57.5vw` is what fills the page's width at every
              size the site has.

              `0.72` rather than `leading-none`: digits fill about seven tenths
              of their em box, so even a line-height of 1 wraps them in a third
              of a screen of air — enough, at this size, to push the button off
              the bottom of a viewport-tall section. This makes the box the
              figure, which is also what lets the bands below be positioned
              against the numerals rather than against the space around
              them. */}
          <h1 className="w-full text-center font-display text-[57.5vw] leading-[0.72] font-normal tracking-(--tracking-display)">
            {notFoundContent.code}
          </h1>

          {BANDS.map((band) => (
            <PatternField
              key={band.side}
              side={band.side}
              orientation="horizontal"
              tracks={3}
              thickness={26}
              // Past both edges, so a band never resolves into a bar that
              // happens to stop exactly at the window's edge. Offsets are
              // written out rather than interpolated: a class assembled from a
              // variable is invisible to Tailwind and compiles to nothing.
              className={`-left-1.5 -right-1.5 h-[78px] ${band.className}`}
            />
          ))}
        </div>

        <Container className="relative flex flex-col items-center gap-10 text-center">
          <p className="max-w-[62ch] font-body text-body-md text-fg">
            {notFoundContent.body}
          </p>

          <Button href={notFoundContent.cta.href} withArrow>
            {notFoundContent.cta.label}
          </Button>
        </Container>
      </section>
    </SiteChrome>
  );
}
