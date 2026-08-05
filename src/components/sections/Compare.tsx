import { Check, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { sectionTextRevealBeige } from "@/config/animation";
import type { PlanTone, compareContent } from "@/content/pricing";
import { cn } from "@/lib/cn";

/**
 * Plan comparison — "Find The Right Plan".
 *
 * A real table: three plans across, features down, grouped into bands. Screen
 * readers get the relationships for free from `scope`, which is the whole
 * reason this is not a grid of divs — a cell reading "Advanced" means nothing
 * without the row and column it sits in.
 *
 * The column heads pin under the site header, so the plan a column belongs to
 * is still on screen twenty rows down. Two details make that work:
 *
 *  1. `sticky` goes on the cells, not on `<thead>`. Support for sticking the
 *     section element is newer than support for sticking its cells, and the
 *     cells are what carry the fill anyway.
 *  2. `border-separate`, not `border-collapse`. Collapsed borders belong to
 *     the table rather than to any cell, so they stay behind while the cell
 *     they were drawn on travels — the head arrives at the top of the screen
 *     stripped of its own edges.
 *
 * Below the desktop breakpoint four columns and three buttons do not fit, so
 * the table keeps its width and scrolls sideways in its own box. Vertical
 * pinning is off there — an element cannot stick to the viewport from inside a
 * scroll container — and the row labels pin to the left edge instead, which is
 * the axis that is actually moving. One breakpoint governs both: wherever the
 * table can scroll sideways the labels pin, wherever it cannot the head does.
 *
 * A server component — nothing here holds state.
 */

/** The head fills, the same tints the plan cards use. */
const tones: Record<PlanTone, string> = {
  sky: "bg-plan-sky",
  lavender: "bg-plan-lavender",
  peach: "bg-plan-peach",
};

type CompareProps = {
  content: typeof compareContent;
};

/** Shared by every body cell: the hairline above it and its padding. */
const cell = "border-t border-border-on-light px-4 py-4 desktop:px-6";

export function Compare({ content }: CompareProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light">
      <Container className="px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          lineStagger={sectionTextRevealBeige.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />
        <p className="text-ink-dynamic mx-auto mt-6 max-w-[46ch] text-center font-body text-body-md leading-[1.5]">
          {content.subheading}
        </p>

        {/* The scroller keeps the container's gutter outside itself rather
            than repeating it as padding. Inside a padded scroll box, `left-0`
            is the padding edge, so the pinned label column would sit a gutter
            in from the box's own edge and the row it belongs to would slide
            through the gap beside it. */}
        <div className="mt-15 max-desktop:overflow-x-auto">
          {/* `table-fixed`, so the columns take the widths declared on the
              head rather than whatever their longest cell asks for. Left to
              size itself, the three buttons alone push the table past its
              container and the last column is cut off at a tablet. */}
          <table className="w-full table-fixed border-separate border-spacing-0 text-left max-desktop:min-w-[820px]">
            <caption className="sr-only">
              Features included in each plan
            </caption>

            <thead>
              <tr>
                {/* The corner. Empty by design, and named only for screen
                    readers, which would otherwise announce a blank column
                    head before every row label. */}
                <th
                  scope="col"
                  className="w-[26%] bg-bg-white align-top desktop:sticky desktop:top-header desktop:z-20"
                >
                  <span className="sr-only">Feature</span>
                </th>

                {content.plans.map((plan) => (
                  <th
                    key={plan.name}
                    scope="col"
                    className={cn(
                      "w-[24.66%] p-4 align-top font-normal desktop:sticky desktop:top-header desktop:z-20 desktop:p-6",
                      tones[plan.tone],
                    )}
                  >
                    <p className="font-body text-heading-md">{plan.name}</p>
                    <p className="mt-2 font-body text-body-sm leading-[1.5]">
                      {plan.body}
                    </p>
                    <Button
                      href={plan.cta.href}
                      variant="compare"
                      withArrow
                      className="mt-6 w-full"
                    >
                      {plan.cta.label}
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>

            {content.groups.map((group, g) => (
              <tbody key={group.title}>
                <tr>
                  {/* A band across the whole width. `colgroup` scope is the
                      honest one: it heads the rows under it, not a column. */}
                  <th
                    scope="colgroup"
                    colSpan={content.plans.length + 1}
                    className="border-t border-border-on-light bg-compare-band px-6 py-4 text-left font-body text-heading-sm font-normal"
                  >
                    {group.title}
                  </th>
                </tr>

                {group.rows.map((row, r) => {
                  // The table draws its rules above each row, so the last one
                  // in the last group closes the bottom edge itself.
                  const foot =
                    g === content.groups.length - 1 &&
                    r === group.rows.length - 1 &&
                    "border-b";

                  return (
                    <tr key={row.label}>
                      <th
                        scope="row"
                        className={cn(
                          cell,
                          foot,
                          // Pinned to the left edge only where the table
                          // scrolls sideways, with a rule of its own: it is a
                          // column boundary there, not the table's edge.
                          "bg-bg-white font-body text-body-md font-normal max-desktop:sticky max-desktop:left-0 max-desktop:border-r",
                        )}
                      >
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={content.plans[i].name}
                          className={cn(
                            cell,
                            foot,
                            "border-l bg-bg-white text-center font-body text-body-md",
                          )}
                        >
                          {typeof value === "string" ? (
                            value
                          ) : value ? (
                            <>
                              <Check
                                aria-hidden="true"
                                className="mx-auto size-5"
                              />
                              <span className="sr-only">Included</span>
                            </>
                          ) : (
                            <>
                              <X
                                aria-hidden="true"
                                className="mx-auto size-5 text-fg-label"
                              />
                              <span className="sr-only">Not included</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </Container>
    </section>
  );
}
