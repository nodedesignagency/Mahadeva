import Image from "next/image";

import ornamentLeft from "@public/uploads/icons/badge-ornament-left.svg";
import ornamentRight from "@public/uploads/icons/badge-ornament-right.svg";
import mark from "@public/uploads/images/hero-mahadeva.png";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/motion/Parallax";
import { TextReveal } from "@/components/motion/TextReveal";
import { markParallax, sectionTextReveal } from "@/config/animation";
import type { aboutContent } from "@/content/home";

/**
 * About — the white wrapper directly below the hero.
 *
 * A kicker flanked by two ornaments, one long statement, and the 3D mark. On
 * desktop the mark hangs below the block rather than sitting inside it, so the
 * section stays `relative` and whatever follows must not clip it.
 *
 * The statement is an `h2`, not an `h1`: the hero above already carries the
 * page's only `h1`, and a second would leave the document with two competing
 * top-level headings.
 */

type AboutProps = {
  content: typeof aboutContent;
};

export function About({ content }: AboutProps) {
  return (
    // `sticky` makes this its own stacking context, so the mark's z-index
    // cannot lift it out on its own. The layer goes on the section: above the
    // hero it slides over, and above whatever follows, so the mark stays on top
    // of the next section's heading wherever the two overlap.
    //
    // It also keeps its own fill, unlike the sections below it: pinned over the
    // hero, a transparent panel would show the hero through it the whole time
    // it is riding up. It still declares the surface, so the page background is
    // already white by the time it takes over.
    <section
      data-bg="white"
      data-bg-keep=""
      // The bottom padding is the room the mark climbs through. It tracks the
      // mark's own breakpoints, not the layout's: at 640 the mark grows from
      // 200 to 260 wide and its climb grows with it, so the section has to give
      // the heading below it that much more clearance or the two cross.
      // `px-5` on a phone, `px-10` from tablet up.
      //
      // 40 a side is the desktop inset, and on a phone it was costing the
      // statement 80px of the little width there is — the site's own gutter is
      // 20 at that size, so this section was holding its words in a column
      // narrower than every other section's. The statement is eight authored
      // lines, each its own reveal block, and a line that does not fit wraps
      // inside its own block: the bars then run across two visual lines and
      // the line-by-line reveal is gone. Measured at 360, six of the eight
      // were wrapping.
      className="sticky top-0 z-10 bg-bg-white px-0 pt-20 pb-25 text-fg-on-light tablet:px-10 sm:pb-34 lg:pb-30"
    >
      {/* A viewport tall on desktop, where the statement is the whole screen
          and the mark hangs out of the section rather than sitting in it.
          Below that it takes the height it needs: a forced 100vh holds the
          section open past its content, and centring splits the difference
          above and below, which is most of the empty stretch that used to sit
          between the mark and the heading underneath. */}
      {/* The Container's own gutter is the inset here, and `px-0` used to be on
          this line trying to cancel it. It never did: `px-gutter` is a custom
          spacing key, the class merge does not recognise it as a padding-x
          rule, and so both survived with the gutter winning. The section was
          therefore paying its inset twice — its own 40 a side plus the
          gutter's 21 — and on a 360px phone that left the statement a 278px
          column for lines that need 298. Six of eight wrapped, and a wrapped
          line takes its reveal bars across two visual rows.

          So the doubling is gone rather than papered over: nothing here adds
          horizontal padding below tablet, and the gutter is the measure, which
          is what it is for. Above tablet the section keeps its own 40 and the
          desktop inset is what it always was. */}
        <Container className="relative flex flex-col items-center justify-center gap-10 lg:min-h-screen">
        <p className="flex items-center justify-center gap-2 text-body-md">
          <Image src={ornamentLeft} alt="" aria-hidden className="h-8 w-auto" />
          {content.eyebrow}
          <Image
            src={ornamentRight}
            alt=""
            aria-hidden
            className="h-8 w-auto"
          />
        </p>

        <TextReveal
          as="h2"
          lines={content.bodyLines}
          mobileLines={content.bodyLinesMobile}
          settings={sectionTextReveal}
          lineStagger={sectionTextReveal.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        {/* Decorative: the statement above already names the brand.
         *
         * A zero-height anchor, and the `-mt-10` cancels the column gap that
         * precedes it, so `top` is measured from the last line of the statement
         * and nothing here occupies a row of its own.
         *
         * That is what lets the drift run at full strength on every screen. Out
         * of the flow the climb costs no layout; in the column it is also the
         * size of the hole left under the mark, and the section ends up
         * carrying a growing empty stretch between the statement and the
         * heading below it. Anchoring to the statement rather than to the
         * column's box keeps the mark the same distance under the text whatever
         * height the section takes. */}
        <div className="relative -mt-10 w-full">
          <Parallax
            drift={markParallax.drift}
            // 40 under the statement where the mark sits in the body of the
            // section, 220 on desktop where it hangs out of the bottom of it.
            //
            // Positioning lives on this wrapper so the parallax has something
            // of its own to transform. Tailwind centres it with the `translate`
            // property while the drift writes `transform`; the two compose
            // rather than overwrite, so the mark stays centred as it climbs.
            className="absolute top-10 left-1/2 z-20 -translate-x-1/2 lg:top-55"
          >
            <Image
              src={mark}
              alt=""
              aria-hidden
              priority
              sizes="(min-width: 1024px) 376px, (min-width: 640px) 260px, 200px"
              className="h-auto w-[200px] object-cover sm:w-[260px] lg:h-[467px] lg:w-[376px]"
            />
          </Parallax>
        </div>
      </Container>
    </section>
  );
}
