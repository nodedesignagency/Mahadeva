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
 *
 * `value` is a number, not a string: it is the end of a count-up, so the
 * component needs to be able to do arithmetic on it.
 */
export const trustContent = {
  headingLines: ["Why Top Companies Trust Us"],
  /** The owner tightens the heading on a phone rather than wrapping it. */
  headingLinesMobile: ["Why We\u2019re Trusted"],
  subheading:
    "We design AI solutions that automate work, improve performance, and drive business impact.",
  stats: [
    {
      label: "Launch Success",
      prefix: "",
      value: 98,
      unit: "%",
      body: "Solutions successfully adopted by teams to deliver consistent performance and measurable outcomes at scale.",
      tone: "peach",
    },
    {
      label: "Average ROI",
      prefix: "",
      value: 17,
      unit: "x",
      body: "Systems designed to increase revenue efficiency, optimize operations, and create scalable business growth.",
      tone: "green",
    },
    {
      label: "Faster Operations",
      prefix: "",
      value: 49,
      unit: "h",
      body: "Hours saved every month through automation, helping teams reduce manual work and focus on high-impact tasks.",
      tone: "blue",
    },
    {
      label: "Revenue Impact",
      prefix: "$",
      value: 25,
      unit: "m",
      body: "Automation built to increase revenue, reduce friction, and drive measurable business growth across teams.",
      tone: "magenta",
    },
  ],
  /**
   * The strip's caption, broken where the owner's file breaks it rather than
   * where the measure happens to run out. Two lines at every width: it sits
   * beside a marquee whose height it sets, and a third line on a narrow
   * laptop pushed the row out of true.
   */
  logosCaptionLines: [
    "Trusted by leading companies in",
    "tech, finance and e-commerce.",
  ],
  /**
   * Client marks. `mark` names the file and the strip imports it, from the one
   * set both this row and the contact page's row draw on.
   *
   * Five, where the row once listed eight names: five is what the owner
   * supplied, and the strip renders the list twice to close the loop, so ten
   * marks go past and the row is no thinner for it. `name` is what a screen
   * reader gets, since a mark in a marquee says nothing on its own.
   */
  logos: [
    { name: "Logoipsum", mark: "logoipsum" },
    { name: "Logoipsum Brand Standard", mark: "brandStandard" },
    { name: "Lojo Ipsum", mark: "lojoIpsum" },
    { name: "Loqo", mark: "loqo" },
    { name: "Ipsum Logo", mark: "ipsumLogo" },
  ],
} as const;

/** Which pastel a statistic panel is filled with. */
export type TrustTone = (typeof trustContent.stats)[number]["tone"];

/**
 * Tech stack — "Our Automation Tools & Technology Stack".
 *
 * Six tools laid out as a checkerboard. Order is the layout: the section fills
 * alternating cells in sequence, so moving an entry here moves its tile.
 *
 * Names confirmed against the owner's mobile strip: the starburst is the
 * Claude Code mark and the cube is Airtable's.
 */
export const techStackContent = {
  headingLines: ["Our Automation Tools &", "Technology Stack"],
  /**
   * `mark` keys the artwork, which the section imports — the same split the
   * feature cards use, so this file stays free of imports and the build can
   * hash and serve the files it can see.
   *
   * LangChain takes the slot the mobile strip labelled Make — that is the mark
   * the owner supplied, and the name follows the artwork.
   */
  tools: [
    { name: "Claude Code", tone: "rose", mark: "claude" },
    { name: "OpenAI", tone: "green", mark: "chatgpt" },
    { name: "Airtable", tone: "magenta", mark: "airtable" },
    { name: "Zapier", tone: "peach", mark: "zapier" },
    { name: "LangChain", tone: "blue", mark: "langchain" },
    { name: "Python", tone: "lavender", mark: "python" },
  ],
} as const;

/** Which pastel a tech stack tile is filled with. */
export type ToolTone = (typeof techStackContent.tools)[number]["tone"];

/** Keys the tiles use to pick their mark. */
export type ToolMark = (typeof techStackContent.tools)[number]["mark"];

/**
 * Testimonials — the quote carousel.
 *
 * One card at a time with the next peeking past the right gutter, advanced by
 * the pair of arrows beside the heading.
 *
 * `portrait` names a file in `public/uploads/images`; the cut-out sits on the
 * card's own fill. Until the photographs land the column is left empty rather
 * than filled with a stand-in — a grey box beside a testimonial reads as a
 * broken image, where empty space reads as a wide quote.
 *
 * ⚠️ The third quote is written to the same brief as the two the owner
 * supplied, and is a placeholder until the real one arrives.
 *
 * `photo` names the cut-out beside the quote; the section imports it. The
 * three the owner supplied are unlabelled, so they are paired with the names
 * in the order they arrived — swap two values here to re-pair them.
 */
export const testimonialsContent = {
  headingLines: ["Testimonials"],
  subheading:
    "Results from teams using intelligent automation to improve performance and unlock measurable growth across daily operations.",
  /** Labels for the two arrows. Never shown — they are the buttons' names. */
  controls: { previous: "Previous testimonial", next: "Next testimonial" },
  items: [
    {
      quote:
        "This system saved our team hours every week and made our workflows faster, clearer, and much easier to manage.",
      name: "Ryan Mitchell",
      photo: "ryan",
      role: "CEO @ Growth SaaS",
      tone: "blue",
    },
    {
      quote:
        "This tool saved me hours every week — and made me sound like I actually know what I’m doing.",
      name: "James Cooper",
      photo: "james",
      role: "CEO @ Ragnarok AI",
      tone: "green",
    },
    {
      quote:
        "We replaced three manual handoffs with one system, and the work simply arrives finished now.",
      name: "Priya Raman",
      photo: "priya",
      role: "COO @ Northwind Labs",
      tone: "yellow",
    },
  ],
} as const;

/** Which pastel a testimonial card is filled with. */
export type TestimonialTone = (typeof testimonialsContent.items)[number]["tone"];

/** Which cut-out stands beside a quote. */
export type TestimonialPhoto = (typeof testimonialsContent.items)[number]["photo"];

/**
 * Before vs After.
 *
 * Two pinned panels: the three words, which split apart and fade as the page
 * moves under them, and then the pair of cards that slides up over them.
 */
export const beforeAfterContent = {
  /** Each word transforms on its own, so they are stored apart. */
  headingBefore: "Before",
  headingJoin: "vs",
  headingAfter: "After",
  columns: [
    {
      title: "Before working with us",
      body: "Growth slows when teams rely on manual processes and disconnected systems.",
      tone: "dark",
      items: [
        {
          title: "Slow Execution Cycles",
          body: "Projects move slowly due to manual approvals and unclear workflows.",
        },
        {
          title: "Operational Overload",
          body: "Teams spend too much time on repetitive tasks instead of strategy.",
        },
        {
          title: "Unclear Performance",
          body: "Lack of automation leads to inconsistent output and missed opportunities.",
        },
      ],
    },
    {
      title: "After working with us",
      body: "Automation brings clarity, speed, and scalable systems across every workflow.",
      tone: "light",
      items: [
        {
          title: "Accelerated Delivery",
          body: "Workflows move faster with automation supporting execution.",
        },
        {
          title: "Operational Clarity",
          body: "Teams focus on meaningful work instead of repetitive tasks.",
        },
        {
          title: "Scalable Systems",
          body: "Processes become reliable and built for long-term growth.",
        },
      ],
    },
  ],
} as const;

/** Which side of the comparison a column is. */
export type CompareTone = (typeof beforeAfterContent.columns)[number]["tone"];
