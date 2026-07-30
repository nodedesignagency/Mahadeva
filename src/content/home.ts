/**
 * Home page content.
 *
 * All copy is verbatim from the original template. Components take this as
 * typed props and contain no literal strings — editing the site's words never
 * means opening a component.
 */

export type CtaLink = {
  label: string;
  href: string;
};

export const heroContent = {
  /**
   * Rendered as the page's single <h1>, one reveal block per line.
   *
   * Line breaks are explicit rather than left to text wrapping: each line is a
   * separate reveal block with its own sweeping bars, so where the break falls
   * is a design decision, not a side effect of the container width.
   */
  headingLines: ["Custom AI Solutions to", "Increase Revenue"],
  subheading:
    "We build intelligent systems that automate decisions, boost productivity, and drive scalable growth for modern teams.",
  primaryCta: { label: "Get Free Consultation", href: "/contact" } satisfies CtaLink,
  secondaryCta: { label: "Explore Our Work", href: "/case-study" } satisfies CtaLink,
} as const;

export const aboutContent = {
  eyebrow: "AI First Agency",
  body: "Mahadeva helps ambitious brands transform AI into practical systems that automate work, boost efficiency, and drive measurable growth across teams.",
} as const;
