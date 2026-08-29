"use client";

import { useState } from "react";

/**
 * FAQ accordion. One item open at a time, the first by default, as in the
 * original.
 *
 * The open animation is the CSS grid-rows trick: each answer sits in a grid
 * whose single row eases between 0fr and 1fr, which animates to the content's
 * own height with no measuring. The global reduced-motion backstop collapses
 * the transition.
 *
 * Real buttons with aria-expanded/aria-controls — the original's Framer
 * accordion is divs, which a keyboard cannot reach.
 *
 * The mark is two hairlines rather than a plus glyph and a minus glyph. Swapped
 * glyphs cannot animate — the item opened and the mark simply became something
 * else in the same frame, which is the one part of the row that did not move.
 * Drawn as two bars, only one has to turn: the upright quarter-turns onto the
 * one already lying flat, and a plus becomes a minus by moving rather than by
 * being replaced. It turns on the panel's own clock, so the mark and the answer
 * are one gesture.
 */

type AccordionProps = {
  items: ReadonlyArray<{ question: string; answer: string }>;
};

export function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState(0);

  return (
    <ul>
      {items.map((item, i) => {
        const isOpen = i === open;
        return (
          <li key={item.question} className="border-b border-border-on-light first:border-t">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                // Toggling the open item closes it; -1 means all closed.
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-7 text-left"
              >
                <span className="font-display text-heading-lg text-fg-on-light">
                  {item.question}
                </span>
                {/* 1 by 17, the owner's measurements. A hairline, not the
                    1.5 stroke the icon font drew — at this length that read as
                    a bar rather than as a rule.

                    Each bar is centred by its own flex box and carries nothing
                    but a rotation, so the turn is a single property and has no
                    centring translate to compose with. */}
                <span aria-hidden="true" className="relative block size-6 shrink-0">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-[17px] w-px rotate-90 rounded-full bg-fg-on-light" />
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="h-[17px] w-px rounded-full bg-fg-on-light transition-transform duration-(--duration-base) ease-(--ease-in-out)"
                      style={{ transform: `rotate(${isOpen ? 90 : 0}deg)` }}
                    />
                  </span>
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              className="grid transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-in-out)"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-[60ch] pb-7 font-body text-body-md text-fg-on-light">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
