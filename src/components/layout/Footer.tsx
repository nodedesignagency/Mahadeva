import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CtaPanel } from "@/components/layout/CtaPanel";
import { PatternField } from "@/components/motion/PatternField";
import { Scramble } from "@/components/motion/Scramble";
import { Button } from "@/components/ui/Button";
import { footerNav } from "@/config/navigation";
import { footerContent } from "@/content/footer";

/**
 * The closing call to action and the footer, which the original treats as one
 * block — the green panel is the last thing said and the footer is the ground
 * it stands on, so they share a component and a content file.
 *
 * A server component: nothing here moves on its own.
 */

/**
 * Every column heading. Almarai, in the scramble's settled green — the
 * component's own colour, not the muted white the rest of the column uses.
 */
const LABEL = "font-body text-body-sm uppercase text-footer-label";

/** Height of the two pattern rows the page closes on, in px. */
const BAR = 26;

export function Footer() {
  return (
    // The two custom properties are what `.mh-nav-link` mixes between, so
    // every link here hovers exactly as the header's do. This ground is
    // always dark, so it takes the header's dark pair.
    <footer className="bg-bg text-fg [--mh-nav-accent:var(--color-accent)] [--mh-nav-ink:var(--color-fg)]">
      {/* 160 between the panel and the columns, per the owner. */}
      <Container className="pt-20 pb-40">
        <CtaPanel className="relative flex flex-col justify-between gap-10 bg-cta p-10 text-fg-on-light tablet:flex-row tablet:items-center tablet:p-16">
          <h2 className="flex flex-col text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal">
            {footerContent.cta.headingLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>

          <Button
            href={footerContent.cta.action.href}
            variant="plan"
            withArrow
            className="shrink-0"
          >
            {footerContent.cta.action.label}
          </Button>
        </CtaPanel>
      </Container>

      <Container className="pb-14">
        <div className="grid gap-12 tablet:grid-cols-2 desktop:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-8">
            {footerContent.contact.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <Scramble text={item.label} className={LABEL} />
                {/* Geist 28 regular, unlike the links beside it, which are
                    Almarai — the owner sets the two contact lines apart.

                    `self-start` matters: as a flex item this would otherwise
                    stretch to the column's width, and the hover rule is drawn
                    across the link's box, not its text. */}
                <a
                  href={item.href}
                  className="mh-nav-link self-start font-ui text-[1.75rem] font-normal"
                >
                  {item.value}
                </a>
              </div>
            ))}
          </div>

          {footerNav.map((group) => (
            <nav
              key={group.title}
              className="flex flex-col gap-5"
              aria-label={group.title}
            >
              <Scramble text={group.title} className={LABEL} />
              {/* 16 between links, against the 20 that separates them from
                  the heading — enough that the hover rule under one clears
                  the link below it. */}
              <ul className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <li key={item.label} className="w-fit">
                    <Link
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                      className="mh-nav-link font-body text-body-md"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      {/* Ruled above and below, per the original. */}
      <div className="border-y border-fg/10">
        <Container className="flex flex-col gap-4 py-6 tablet:flex-row tablet:items-center tablet:justify-between">
          {/* Geist Light 16 on the left, Almarai 18 on the right — the two
              sides of this bar are set in different faces. */}
          <p className="font-ui text-body-md font-light text-fg-muted">
            {footerContent.copyright}
          </p>

          <p className="flex flex-wrap items-center gap-3 font-body text-body-lg">
            <span className="text-fg-muted">{footerContent.credits.label}</span>

            {/* The names and the dots between them share one 8px rhythm, so
                they are one row rather than a name-plus-dot per person. */}
            <span className="flex flex-wrap items-center gap-2">
              {footerContent.credits.people.map((person, i) => (
                <span key={person} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden="true">•</span> : null}
                  {person}
                </span>
              ))}
            </span>
          </p>
        </Container>
      </div>

      {/* The closing wordmark, only just visible, with a single row of the
          site's pattern above and below it. The bottom row is the last thing
          on the page — there is no padding under it.

          Decorative throughout: the site's name is already the header's link.

          Sized in `cqw` against the container rather than `vw` against the
          screen, so the word fills the same measure the rest of the page is
          set to and stops growing where that measure does. */}
      <Container aria-hidden="true" className="pt-10">
        {/* The rows are anchored to this box rather than the Container, whose
            own box includes the page's gutters — they belong to the measure,
            not to the margin. `overflow-hidden` is what makes the foot of this
            box the foot of the page: at this size the glyphs stand outside
            their line box, and the document would otherwise carry on for
            another 40px below the last row. */}
        <div className="relative overflow-hidden">
          <PatternField
            side="footerTop"
            orientation="horizontal"
            tracks={1}
            thickness={BAR}
            className="top-0"
          />

          {/* The word is inset 40 either side; the rows are not, and run the
              full measure. Its own `@container` is what keeps the size honest
              — `cqw` then resolves against the padded width the word actually
              has, rather than the block's, so it fills its box at every
              screen instead of only at the width the number was picked for.

              Vertical padding of exactly one bar: the word meets each row and
              neither crosses it. */}
          <div
            className="@container px-10"
            style={{ paddingTop: BAR, paddingBottom: BAR }}
          >
            <p className="w-full text-center font-body text-[22.6cqw] leading-[0.86] font-normal tracking-(--tracking-display) text-fg/[0.06]">
              {footerContent.wordmark}
            </p>
          </div>

          <PatternField
            side="footerBottom"
            orientation="horizontal"
            tracks={1}
            thickness={BAR}
            className="bottom-0"
          />
        </div>
      </Container>
    </footer>
  );
}
