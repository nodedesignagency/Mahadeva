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
  tools: [
    { name: "Claude Code", tone: "rose" },
    { name: "OpenAI", tone: "green" },
    { name: "Airtable", tone: "magenta" },
    { name: "Zapier", tone: "peach" },
    { name: "Make", tone: "blue" },
    { name: "Python", tone: "lavender" },
  ],
} as const;

/** Which pastel a tech stack tile is filled with. */
export type ToolTone = (typeof techStackContent.tools)[number]["tone"];

/**
 * Pricing — "Flexible Plans for Every Growth Stage".
 *
 * Copy is verbatim from the owner's Framer cards, which differ from the Figma
 * draft: Launch is $199 not $299, Scale $299 not $699 and lists five items,
 * and the enterprise column order starts Security compliance second-column.
 */
export const pricingContent = {
  headingLines: ["Flexible Plans for Every", "Growth Stage"],
  subheading:
    "Mahadeva helps ambitious teams build intelligent automation systems that improve efficiency and unlock measurable growth.",
  billing: { monthly: "Billed Monthly", yearly: "Billed Yearly" },
  plans: [
    {
      name: "Launch",
      tone: "sky",
      icon: "launch",
      /** ⚠️ Yearly is ten months of the monthly rate — a placeholder
       * convention until the owner supplies the real figure. */
      price: { monthly: 199, yearly: 1990, period: "/month" },
      body: "Automation solutions designed to help early-stage teams streamline workflows, reduce manual effort, and improve execution speed.",
      cta: { label: "Choose Launch", href: "/contact" },
      includesTitle: "Launch includes:",
      includes: [
        "AI workflow audit",
        "Core automation setup",
        "Tool integration support",
        "Single workflow system",
        "Performance dashboard",
      ],
    },
    {
      name: "Scale",
      tone: "lavender",
      icon: "scale",
      price: { monthly: 299, yearly: 2990, period: "/month" },
      body: "Advanced automation systems designed to improve team efficiency, accelerate growth, and support business operations.",
      cta: { label: "Choose Scale", href: "/contact" },
      includesTitle: "Scale includes:",
      includes: [
        "Multiple workflows",
        "Custom AI agents",
        "Full integrations",
        "Optimization cycles",
        "Priority support",
      ],
    },
  ],
  enterprise: {
    name: "Enterprise",
    tone: "peach",
    icon: "enterprise",
    title: "Custom Quote",
    body: "Fully customized automation infrastructure built to support complex operations and long-term scalable business transformation.",
    cta: { label: "Request a Quote", href: "/contact" },
    includesTitle: "Enterprise includes:",
    /** Two columns, read down each: exactly the owner's order. */
    includes: [
      ["Strategy workshops", "Unlimited workflows", "Advanced AI systems", "Custom automations", "Enterprise integrations"],
      ["Security compliance", "Dedicated team support", "Performance optimization", "Reporting dashboards", "Long-term scaling roadmap"],
    ],
  },
} as const;

/** Which tint a plan's header strip and border are drawn in. */
export type PlanTone = (typeof pricingContent.plans)[number]["tone"] | "peach";

/** Keys the plan cards use to pick their header icon. */
export type PlanIcon = "launch" | "scale" | "enterprise";

/**
 * FAQ — "Answers to Your Questions".
 *
 * ⚠️ Only the first answer is visible in the owner's screenshot; the other
 * seven are stand-ins to be replaced with the real copy.
 */
export const faqContent = {
  headingLines: ["Answers to Your", "Questions"],
  subheading:
    "Find clear answers about how our AI systems work and how they help teams grow faster together.",
  items: [
    {
      question: "What industries do you specialize in?",
      answer:
        "We work with SaaS, ecommerce, agencies, finance, and fast-growing digital-first businesses globally.",
    },
    {
      question: "Are solutions customized for each client?",
      answer:
        "Yes — every system is designed around your workflows, tools, and growth goals rather than from a fixed template.",
    },
    {
      question: "Do we need an internal tech team?",
      answer:
        "No. We handle the build, integration, and maintenance; your team only needs to use the systems we deliver.",
    },
    {
      question: "How long does setup usually take?",
      answer:
        "Most launches go live within two to four weeks, depending on the number of workflows and integrations involved.",
    },
    {
      question: "Can you integrate with our current tools?",
      answer:
        "Yes — we connect with the platforms you already use, from CRMs and support desks to internal databases.",
    },
    {
      question: "What happens after launch?",
      answer:
        "We monitor performance, refine the automations, and keep optimizing so results improve over time.",
    },
    {
      question: "Is this only for large companies?",
      answer:
        "Not at all — our plans are built to scale from early-stage teams up to enterprise operations.",
    },
    {
      question: "How do we get started?",
      answer:
        "Book a strategy call and we will map your workflows, identify the highest-impact automations, and propose a plan.",
    },
  ],
  cta: {
    title: "Still need clarity?",
    body: "Book a strategy call.",
    href: "/contact",
  },
} as const;
