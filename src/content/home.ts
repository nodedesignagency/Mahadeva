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

  /**
   * The break moves on mobile, where the wider first line no longer fits. Given
   * explicitly rather than left to wrapping, for the same reason as above: each
   * line is its own reveal block, so where it breaks is a design decision.
   */
  headingLinesMobile: ["Custom AI Solutions", "to Increase Revenue"],
  subheading:
    "We build intelligent systems that automate decisions, boost productivity, and drive scalable growth for modern teams.",
  primaryCta: { label: "Get Free Consultation", href: "/contact" } satisfies CtaLink,
  secondaryCta: { label: "Explore Our Work", href: "/case-study" } satisfies CtaLink,
} as const;

export const aboutContent = {
  eyebrow: "AI First Agency",
  body: "Mahadeva helps ambitious brands transform AI into practical systems that automate work, boost efficiency, and drive measurable growth across teams.",
} as const;

/**
 * The feature strip.
 *
 * The original repeats "Revenue Optimization" and "Workflow Automation" at the
 * two ends so the row reads as a continuing band rather than a closed set of
 * four — the duplicates are the design, not an oversight. Order is the reading
 * order, so the repeats sit at the edges where they bleed out of frame.
 */
export const featuresContent = {
  heading: "Everything You Need to Scale With AI",
  cards: [
    {
      title: "Revenue Optimization",
      body: "Use AI systems designed to increase conversions and overall productivity.",
      image: "revenue",
    },
    {
      title: "Revenue Optimization",
      body: "Use AI systems designed to increase conversions and overall productivity.",
      image: "revenue",
    },
    {
      title: "Custom AI Agents",
      body: "Create tailored AI agents built around your workflows and team productivity.",
      image: "agents",
    },
    {
      title: "Data Intelligence",
      body: "Turn operational data into insights that improve decisions and business automation.",
      image: "data",
    },
    {
      title: "Workflow Automation",
      body: "Automate repetitive workflows to save time and improve daily productivity.",
      image: "workflow",
    },
    {
      title: "Workflow Automation",
      body: "Automate repetitive workflows to save time and improve daily productivity.",
      image: "workflow",
    },
  ],
} as const;

/** Keys the feature cards use to pick their artwork. */
export type FeatureImage = (typeof featuresContent.cards)[number]["image"];
