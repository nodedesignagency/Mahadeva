/**
 * Pricing page content.
 *
 * The plans live here rather than in `home.ts` because two pages render them:
 * the home page's pricing section and this page's hero are the same component
 * reading the same object, so a rate can never be right in one place and stale
 * in the other.
 */

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
 * Impact — the band under the plans.
 *
 * Four figures, each credited to the client it came from. The counting figures
 * are split into prefix / value / unit the way the trust stats are, so the
 * number is a number the counter can climb to rather than a string: "-45%" is
 * a minus, forty-five and a percent sign.
 *
 * ⚠️ Client names are placeholders: the owner's four marks are logoipsum
 * stand-ins, so `client` labels every slot the same. `mark` names the file and
 * the section imports it — content that held the artwork itself could not be
 * moved to a CMS.
 */
export const impactContent = {
  headingLines: ["Mahadeva speeds up", "teams with automation."],
  stats: [
    {
      client: "Logoipsum",
      mark: "success",
      prefix: "",
      value: 98,
      unit: "%",
      label: "Project Success",
    },
    {
      client: "Logoipsum",
      mark: "revenue",
      prefix: "",
      value: 10,
      unit: "x",
      label: "Revenue Efficiency",
    },
    {
      client: "Logoipsum",
      mark: "costs",
      prefix: "-",
      value: 45,
      unit: "%",
      label: "Operational Costs",
    },
    {
      client: "Logoipsum",
      mark: "hours",
      prefix: "",
      value: 300,
      unit: "+",
      label: "Hours Saved Monthly",
    },
  ],
} as const;

/** Which client mark heads an impact figure. */
export type ImpactMark = (typeof impactContent.stats)[number]["mark"];

/**
 * Plan comparison — "Find The Right Plan".
 *
 * Three plans against the same list of features, in three groups. A cell is
 * either a phrase or a yes/no: `true` and `false` render as the tick and the
 * cross, so the table never spells "Included" in one row and draws a tick for
 * the same meaning in the next.
 *
 * The blurbs are the comparison's own — shorter than the cards' copy above,
 * since here they sit in a column head rather than a card.
 *
 * ⚠️ Read from the owner's reference shot. The plan names and tints match the
 * cards; the feature list is this table's alone.
 */
export const compareContent = {
  headingLines: ["Find The Right Plan"],
  subheading:
    "Compare features, automation capacity, and support levels to pick what fits your growth stage.",
  plans: [
    {
      name: "Launch",
      tone: "sky",
      body: "Simple automation workflows built for growing teams.",
      cta: { label: "Get Started", href: "/contact" },
    },
    {
      name: "Scale",
      tone: "lavender",
      body: "Advanced automation designed to accelerate team growth.",
      cta: { label: "Get Started", href: "/contact" },
    },
    {
      name: "Enterprise",
      tone: "peach",
      body: "Custom AI infrastructure built for enterprise scale.",
      cta: { label: "Get Started", href: "/contact" },
    },
  ],
  /** Values are in plan order: Launch, Scale, Enterprise. */
  groups: [
    {
      title: "General",
      rows: [
        {
          label: "Automation Projects",
          values: ["1 Active System", "Up to 5 Systems", "Unlimited Systems"],
        },
        {
          label: "Monthly Runs",
          values: ["Up to 2,000", "Up to 75,000", "Unlimited"],
        },
        {
          label: "Connected Tools",
          values: ["Core Integrations", "Advanced Stack", "Custom Ecosystem"],
        },
        {
          label: "Support Access",
          values: ["Email Support", "Priority Support", "Dedicated Success Team"],
        },
      ],
    },
    {
      title: "Automation Capabilities",
      rows: [
        { label: "Visual Workflow Builder", values: [true, true, true] },
        { label: "Event Triggers", values: ["Basic", "Advanced", "Advanced"] },
        { label: "Context Memory", values: [false, true, true] },
        { label: "Performance Insights", values: [false, "Included", "Included"] },
      ],
    },
    {
      title: "Security & Access",
      rows: [
        {
          label: "Activity Tracking",
          values: ["Only Once", "Basic Logs", "Full Audit Logs"],
        },
        { label: "SSO / Identity Login", values: [false, true, true] },
        { label: "Private Infrastructure", values: [false, false, true] },
        { label: "Custom Compliance", values: [false, false, true] },
      ],
    },
  ],
} as const;

/** A cell: a phrase, or the tick and cross a yes/no draws. */
export type CompareValue = (typeof compareContent.groups)[number]["rows"][number]["values"][number];
