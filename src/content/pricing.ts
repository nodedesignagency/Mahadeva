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
 * ⚠️ Client names are placeholders — the owner's reference shows four logo
 * marks, and the files have not landed yet. `client` is what will label each
 * slot when they do.
 */
export const impactContent = {
  headingLines: ["Mahadeva speeds up", "teams with automation."],
  stats: [
    { client: "Logoipsum", prefix: "", value: 98, unit: "%", label: "Project Success" },
    { client: "Logoipsum", prefix: "", value: 10, unit: "x", label: "Revenue Efficiency" },
    { client: "Logoipsum", prefix: "-", value: 45, unit: "%", label: "Operational Costs" },
    { client: "Logoipsum", prefix: "", value: 300, unit: "+", label: "Hours Saved Monthly" },
  ],
} as const;
