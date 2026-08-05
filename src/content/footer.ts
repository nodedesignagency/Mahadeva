/**
 * Footer copy.
 *
 * The original pairs the closing call to action and the footer as one block,
 * so they are one component and one content file. Links come from
 * `config/navigation`, which stays the single source for routes.
 *
 * Labels carry their braces as written — `{EMAIL}` is the original's styling
 * for a column heading, not a template placeholder.
 */

export const footerContent = {
  cta: {
    /** One entry per visual line, as elsewhere: the break is a decision. */
    headingLines: ["Ready to Build Your AI", "Growth Engine?"],
    /** The break moves on a phone, where the first line no longer fits. */
    headingLinesMobile: ["Ready to Build Your", "AI Growth Engine?"],
    action: {
      label: "Get Free Consultation",
      /** The phone drops the verb; the button is the whole width there. */
      labelShort: "Free Consultation",
      href: "/contact",
    },
  },

  contact: [
    { label: "{Email}", value: "info@mahadeva.com", href: "mailto:info@mahadeva.com" },
    { label: "{Phone}", value: "+1 (960) 258 8964", href: "tel:+19602588964" },
  ],

  copyright: "@2026 Mahadeva. All Rights Reserved.",
  credits: { label: "Made by:", people: ["Breeje", "Shubham", "Anas"] },

  /** The oversized wordmark the page closes on. */
  wordmark: "Mahadeva",
} as const;
