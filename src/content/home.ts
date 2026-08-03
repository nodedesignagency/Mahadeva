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

  /**
   * One entry per visual line, as in the hero and for the same reason: each
   * line is its own reveal block with its own bars, so where the statement
   * breaks is a design decision rather than a side effect of the container
   * width. Breaks follow the owner's desktop layout.
   *
   * Joined with spaces these read as the original sentence, which is what
   * reaches assistive tech.
   */
  bodyLines: [
    "Mahadeva helps ambitious brands",
    "transform AI into practical systems",
    "that automate work, boost efficiency,",
    "and drive measurable growth",
    "across teams.",
  ],

  /**
   * The desktop breaks are far too wide for a phone, so the statement is
   * re-broken rather than left to wrap — a wrapped block would put one bar
   * across two visual lines and lose the line-by-line reveal entirely.
   */
  bodyLinesMobile: [
    "Mahadeva helps",
    "ambitious brands",
    "transform AI into",
    "practical systems",
    "that automate work,",
    "boost efficiency, and",
    "drive measurable",
    "growth across teams.",
  ],
} as const;

/**
 * The feature strip — six cards travelling left on a continuous marquee.
 *
 * The set is listed once here. The row renders it twice so the loop has
 * somewhere to hand off to, which is a rendering concern rather than content.
 */
export const featuresContent = {
  /** Broken after "to", matching the owner's desktop layout. */
  headingLines: ["Everything You Need to", "Scale With AI"],

  /**
   * Six cards, each with its own pastel. Order is the reading order and the
   * order they pass through the marquee.
   *
   * `image` names the artwork rather than importing it — content stays plain
   * data with no bundler imports, and a card whose art has not landed yet is
   * simply a key the artwork map does not answer, which the card renders as a
   * placeholder instead of failing.
   */
  cards: [
    {
      title: "Custom AI Agents",
      body: "Create tailored AI agents built around your workflows and team productivity goals.",
      image: "agents",
      tone: "blue",
    },
    {
      title: "Data Intelligence",
      body: "Turn operational data into insights that improve decisions and business automation.",
      image: "data",
      tone: "magenta",
    },
    {
      title: "Workflow Automation",
      body: "Automate repetitive workflows to save time and improve daily team productivity.",
      image: "workflow",
      tone: "green",
    },
    {
      title: "Smart Integrations",
      body: "Connect AI seamlessly with your tools to streamline team workflows and productivity.",
      image: "integrations",
      tone: "rose",
    },
    {
      title: "Continuous Improvement",
      body: "Deploy AI that learns over time to improve operational efficiency and productivity.",
      image: "improvement",
      tone: "lavender",
    },
    {
      title: "Revenue Optimization",
      body: "Use AI systems designed to increase conversions and overall business productivity.",
      image: "revenue",
      tone: "peach",
    },
  ],
} as const;

/** Keys the feature cards use to pick their artwork. */
export type FeatureImage = (typeof featuresContent.cards)[number]["image"];

/** Which pastel a card is filled with. */
export type FeatureTone = (typeof featuresContent.cards)[number]["tone"];

/**
 * Trust section — "Why Top Companies Trust Us".
 *
 * Four statistics, then a strip of client marks. Each statistic splits its
 * figure from its unit because the two are set at different sizes: 98 large
 * with a small %, $ small with a large 25 and a small M. Storing "98%" as one
 * string would make that a parsing problem in the component.
 */
export const trustContent = {
  headingLines: ["Why Top Companies Trust Us"],
  subheading:
    "We design AI solutions that automate work, improve performance, and drive business impact.",
  stats: [
    {
      label: "Launch Success",
      prefix: "",
      value: "98",
      unit: "%",
      body: "Solutions successfully adopted by teams to deliver consistent performance and measurable outcomes at scale.",
      tone: "peach",
    },
    {
      label: "Average ROI",
      prefix: "",
      value: "17",
      unit: "x",
      body: "Systems designed to increase revenue efficiency, optimize operations, and create scalable business growth.",
      tone: "green",
    },
    {
      label: "Faster Operations",
      prefix: "",
      value: "49",
      unit: "h",
      body: "Hours saved every month through automation, helping teams reduce manual work and focus on high-impact tasks.",
      tone: "blue",
    },
    {
      label: "Revenue Impact",
      prefix: "$",
      value: "25",
      unit: "m",
      body: "Automation built to increase revenue, reduce friction, and drive measurable business growth across teams.",
      tone: "magenta",
    },
  ],
  logosCaption: "Trusted by leading companies in tech, finance and e-commerce.",
  /**
   * Client marks. `src` is absent until the files land, and the strip draws a
   * named placeholder at the right height in the meantime, so the row's rhythm
   * is correct before the artwork exists.
   */
  logos: [
    { name: "Logoipsum" },
    { name: "Lumin" },
    { name: "Looo" },
    { name: "Logoipsum Brand Standard" },
    { name: "Ipsum" },
    { name: "Logoipsum Mark" },
    { name: "Lumin Type" },
    { name: "Looo Wide" },
  ],
} as const;

/** Which pastel a statistic panel is filled with. */
export type TrustTone = (typeof trustContent.stats)[number]["tone"];
