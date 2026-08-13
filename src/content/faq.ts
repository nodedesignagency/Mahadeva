/**
 * FAQ content.
 *
 * One list, every page. The section appears on the home page and on pricing
 * and reads this object in both, so the answers cannot say one thing in one
 * place and something else in another — editing them here changes them
 * everywhere the section is used.
 */

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
