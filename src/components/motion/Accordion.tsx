"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

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
        const Icon = isOpen ? Minus : Plus;
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
                <Icon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-fg-on-light"
                  strokeWidth={1.5}
                />
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
