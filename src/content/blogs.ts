/**
 * Blog content.
 *
 * Demo articles, in the shape the pages render. As with careers, this is a
 * plain list rather than a CMS collection — the Studio holds the case studies,
 * which are the thing the buyer maintains.
 *
 * `body` is authored as blocks rather than one string: a heading and the
 * paragraphs under it. That is what lets the detail page set the rhythm of an
 * article rather than dumping prose into a column.
 */

import type { CaseTone } from "./case-studies";

export type ArticleBlock = {
  /** Optional: the opening block runs straight into the piece. */
  heading?: string;
  paragraphs: string[];
};

export type Article = {
  /** Stable key, and the URL segment under /blogs. */
  slug: string;
  title: string;
  /** Authored line breaks for the detail page's heading. */
  titleLines?: string[];
  titleLinesMobile?: string[];
  category: string;
  /** Shown as written; not a date to be formatted. */
  date: string;
  /** The figure is set in Geist, like every number on the site. */
  readTime: string;
  author: string;
  excerpt: string;
  tone: CaseTone;
  body: ArticleBlock[];
};

export const articles: Article[] = [
  {
    slug: "automation-that-survives-contact-with-a-team",
    title: "Automation That Survives Contact With a Team",
    titleLines: ["Automation That Survives", "Contact With a Team"],
    titleLinesMobile: ["Automation That", "Survives Contact", "With a Team"],
    category: "Operations",
    date: "March 2026",
    readTime: "6 min",
    author: "Breeje",
    tone: "mint",
    excerpt:
      "Most automation projects do not fail technically. They fail on the second Tuesday, when the person it was built for goes back to the spreadsheet.",
    body: [
      {
        paragraphs: [
          "The demo always works. That is the problem with demos — they are run by the person who built the thing, on the data the thing was built against, at a moment when everyone is paying attention.",
          "What decides whether an automation survives is what happens the second Tuesday, when the person it was built for is busy, the input is shaped slightly differently, and going back to the spreadsheet takes four minutes.",
        ],
      },
      {
        heading: "Build for the bad input first",
        paragraphs: [
          "Every workflow we have automated has a long tail of inputs nobody mentioned in discovery: the invoice with two purchase orders on it, the address with the unit number in the wrong field, the customer who replies to a receipt with a support question.",
          "If the system's answer to those is to guess confidently, it will be switched off. If its answer is to route them to a person with the reason attached, it earns another week.",
        ],
      },
      {
        heading: "Measure the thing you promised",
        paragraphs: [
          "Ask what number this was supposed to move before you build, then instrument that number and nothing else at first. Hours returned to the team is usually the honest one, and it is the one the person paying remembers.",
          "A dashboard of model metrics is not a substitute. Nobody approves next quarter's budget because precision went up two points.",
        ],
      },
    ],
  },
  {
    slug: "when-not-to-use-an-agent",
    title: "When Not to Use an Agent",
    titleLines: ["When Not to", "Use an Agent"],
    category: "Engineering",
    date: "February 2026",
    readTime: "5 min",
    author: "Shubham",
    tone: "periwinkle",
    excerpt:
      "Agents are the right shape for a narrow class of problems. Most of what gets built as an agent would be better, cheaper and more reliable as a script.",
    body: [
      {
        paragraphs: [
          "An agent earns its complexity when the path through a task genuinely cannot be known in advance. That is rarer than the current enthusiasm suggests.",
        ],
      },
      {
        heading: "The test we use",
        paragraphs: [
          "If you can draw the flowchart, build the flowchart. A deterministic pipeline with a model at two or three decision points is easier to test, cheaper to run, and far easier to explain when it goes wrong.",
          "Reach for an agent when the branching is genuinely open — research across sources you cannot enumerate, or a support conversation where the next step depends on an answer you have not had yet.",
        ],
      },
      {
        heading: "What it costs when you get it wrong",
        paragraphs: [
          "An unnecessary agent turns a bug you could reproduce into a behaviour you have to characterise. That is the real bill, and it arrives months later.",
        ],
      },
    ],
  },
  {
    slug: "the-first-workflow-worth-automating",
    title: "The First Workflow Worth Automating",
    titleLines: ["The First Workflow", "Worth Automating"],
    category: "Strategy",
    date: "January 2026",
    readTime: "4 min",
    author: "Anas",
    tone: "sky",
    excerpt:
      "It is almost never the one people complain about most. Here is the arithmetic we run before recommending anything.",
    body: [
      {
        paragraphs: [
          "Every team has a process everyone hates. It is rarely the one worth automating first, because loudness and cost are not the same measurement.",
        ],
      },
      {
        heading: "Three numbers, in this order",
        paragraphs: [
          "How many hours a month does it consume across everyone who touches it. How stable is its shape — could you describe it the same way twice. And what breaks downstream when it is done badly.",
          "The first workflow to automate is the one that scores well on all three, which is usually something quiet and clerical that nobody has thought about in years.",
        ],
      },
    ],
  },
];

export const blogIndexContent = {
  headingLines: ["Notes From the", "Work Itself"],
  headingLinesMobile: ["Notes From", "the Work Itself"],
  subheadingLines: [
    "What we have learned building automation that teams keep using,",
    "written up while it is still fresh enough to be useful.",
  ],
  empty: "Nothing published yet — the first pieces are being written.",
} as const;

export const blogDetailContent = {
  meta: {
    author: "{Written by}",
    date: "{Published}",
    readTime: "{Read}",
  },
  cta: {
    heading: "Want this applied to your own operation?",
    body: "We will look at your workflows and tell you which ones are worth automating.",
    label: "Get free consultation",
    href: "/contact",
  },
  more: {
    heading: "More reading",
    count: 2,
  },
} as const;
