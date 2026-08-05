import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { footerNav } from "@/config/navigation";
import { footerContent } from "@/content/footer";
import { cn } from "@/lib/cn";

/**
 * The closing call to action and the footer, which the original treats as one
 * block — the green panel is the last thing said and the footer is the ground
 * it stands on, so they share a component and a content file.
 *
 * A server component: nothing here moves on its own.
 */

/**
 * The pixel fringe around the panel, on a 32px grid measured from the corner
 * each cell belongs to.
 *
 * `light` squares stand outside the panel and read as it breaking up; `dark`
 * ones are cut into it. The pattern is a first pass at the original's, close
 * in weight and rhythm but not yet cell for cell.
 */
const FRINGE_CELL = 32;

const fringe = [
  // Along the head.
  { corner: "top-left", c: 1, r: -1, tone: "light" },
  { corner: "top-left", c: 1, r: 0, tone: "dark" },
  { corner: "top-left", c: 0, r: -1, tone: "dark" },
  { corner: "top-right", c: 1, r: -1, tone: "light" },
  { corner: "top-right", c: 0, r: 0, tone: "dark" },
  // And the foot, which the original breaks up more.
  { corner: "bottom-left", c: 1, r: -1, tone: "light" },
  { corner: "bottom-left", c: 2, r: -1, tone: "light" },
  { corner: "bottom-left", c: 4, r: 0, tone: "dark" },
  { corner: "bottom-left", c: 4, r: -1, tone: "light" },
  { corner: "bottom-left", c: 5, r: -2, tone: "light" },
  { corner: "bottom-right", c: 2, r: 0, tone: "dark" },
  { corner: "bottom-right", c: 3, r: -1, tone: "light" },
] as const;

/** The coloured bars either side of the wordmark. */
const bars = [
  { left: "0%", width: "23%", tone: "bg-quote-blue" },
  { left: "31%", width: "16%", tone: "bg-quote-yellow" },
  { left: "70%", width: "5%", tone: "bg-stat-green" },
] as const;

/**
 * `c` counts cells along the edge from the corner. `r` counts across it: 0 is
 * the panel's own first row, and negatives step outside it. The layer paints
 * over the panel, which is what lets a dark cell read as a bite taken out of
 * it rather than a square lost behind it.
 */
function FringeCell({ cell }: { cell: (typeof fringe)[number] }) {
  const offset = (n: number) => `${n * FRINGE_CELL}px`;
  const [side, edge] = cell.corner.split("-") as ["top" | "bottom", "left" | "right"];

  return (
    <span
      aria-hidden="true"
      className={cn("absolute hidden desktop:block", cell.tone === "light" ? "bg-cta" : "bg-bg")}
      style={{
        width: FRINGE_CELL,
        height: FRINGE_CELL,
        [edge]: offset(cell.c),
        [side]: offset(cell.r),
      }}
    />
  );
}

export function Footer() {
  return (
    <footer className="bg-bg text-fg">
      <Container className="pt-20 pb-16">
        <div className="relative">
          <div className="relative flex flex-col justify-between gap-10 bg-cta p-10 text-fg-on-light tablet:flex-row tablet:items-center tablet:p-16">
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
          </div>

          {/* After the panel, so the dark cells cut into it. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {fringe.map((cell, i) => (
              <FringeCell key={i} cell={cell} />
            ))}
          </div>
        </div>
      </Container>

      <Container className="pb-14">
        <div className="grid gap-12 tablet:grid-cols-2 desktop:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-8">
            {footerContent.contact.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <p className="font-body text-body-sm uppercase text-fg-muted">{item.label}</p>
                <a
                  href={item.href}
                  className="font-body text-heading-md transition-colors duration-(--duration-hover) ease-(--ease-out) hover:text-fg-muted"
                >
                  {item.value}
                </a>
              </div>
            ))}
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} className="flex flex-col gap-5" aria-label={group.title}>
              <p className="font-body text-body-sm uppercase text-fg-muted">{group.title}</p>
              <ul className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                      className="font-body text-body-md transition-colors duration-(--duration-hover) ease-(--ease-out) hover:text-fg-muted"
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

      <div className="border-t border-fg/10">
        <Container className="flex flex-col gap-4 py-6 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="font-body text-body-sm text-fg-muted">{footerContent.copyright}</p>

          <p className="flex flex-wrap items-center gap-2 font-body text-body-sm text-fg-muted">
            {footerContent.credits.label}
            {footerContent.credits.people.map((person, i) => (
              <span key={person} className="flex items-center gap-2 text-fg">
                {i > 0 ? <span aria-hidden="true" className="text-fg-muted">•</span> : null}
                {person}
              </span>
            ))}
          </p>
        </Container>
      </div>

      {/* The closing wordmark: set to the page's width and only just visible,
          with the coloured bars the original runs above it. Decorative — the
          site's name is already the header's link. */}
      <div aria-hidden="true" className="relative overflow-hidden">
        <div className="relative h-6">
          {bars.map((bar) => (
            <span
              key={bar.tone}
              className={cn("absolute top-0 h-full", bar.tone)}
              style={{ left: bar.left, width: bar.width }}
            />
          ))}
        </div>

        <p className="-mt-2 w-full text-center font-body leading-[0.8] font-normal tracking-(--tracking-display) text-fg/[0.06] text-[19vw]">
          {footerContent.wordmark}
        </p>
      </div>
    </footer>
  );
}
