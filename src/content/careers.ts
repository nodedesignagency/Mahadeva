/**
 * Careers content.
 *
 * The same arrangement as every other page's content file: the words live
 * here, the pages render them. Roles are a plain list rather than a CMS
 * collection — unlike case studies, which the buyer edits in the Studio,
 * openings are edited by whoever is hiring and change a few times a year.
 *
 * `tone` names a panel fill from the `--color-case-*` set in theme.css. The
 * cards reuse those rather than introducing a second pastel scale, because
 * they are the site's panel colours and not the case study's.
 */

import type { CaseTone } from "./case-studies";

export type Career = {
  /** Stable key, and the URL segment under /careers. */
  slug: string;
  role: string;
  /**
   * The role broken into the lines the detail page sets it on. Every heading
   * on this site is authored line by line — a line's reveal bar is one box
   * sized to that line, so a heading left to wrap gets a single bar as wide as
   * the column.
   */
  roleLines?: string[];
  department: string;
  location: string;
  /** Full-time, contract, and so on. */
  type: string;
  /** Shown as written; not a date to be formatted. */
  posted: string;
  summary: string;
  tone: CaseTone;
  about: string[];
  responsibilities: string[];
  requirements: string[];
};

export const careers: Career[] = [
  {
    slug: "senior-ai-engineer",
    role: "Senior AI Engineer",
    roleLines: ["Senior AI", "Engineer"],
    department: "Engineering",
    location: "Remote — Europe",
    type: "Full-time",
    posted: "March 2026",
    tone: "sky",
    summary:
      "Design and ship the agent systems our clients run their operations on, from first prototype to the thing that holds up in production.",
    about: [
      "You will own automation systems end to end: the retrieval, the tool use, the evaluation harness, and the parts that decide when a model should not be trusted to answer at all.",
      "Most of the work is judgement rather than novelty. Our clients do not need a research result, they need a system that behaves the same way on a Tuesday afternoon as it did in the demo.",
    ],
    responsibilities: [
      "Build and ship agent systems against real client workflows",
      "Write the evaluations that decide whether a change is an improvement",
      "Take a prototype through to something on call can support",
      "Set the technical direction on engagements with two or three engineers",
    ],
    requirements: [
      "Five or more years building production software, some of it with LLMs",
      "Comfortable owning a system rather than a ticket",
      "Able to explain a tradeoff to someone who does not write code",
      "Python and TypeScript, or the confidence to pick the second one up",
    ],
  },
  {
    slug: "automation-solutions-consultant",
    role: "Automation Solutions Consultant",
    roleLines: ["Automation Solutions", "Consultant"],
    department: "Delivery",
    location: "Remote — Global",
    type: "Full-time",
    posted: "March 2026",
    tone: "lavender",
    summary:
      "Sit between what a client says they want and what would actually move their numbers, and be the person who tells them which is which.",
    about: [
      "You will run discovery, map the processes worth automating, and write the case that decides what gets built. The engineering happens next to you, not after you throw something over a wall.",
      "The job is mostly listening, then arithmetic. A process that costs forty hours a month is worth more than the one everybody complains about.",
    ],
    responsibilities: [
      "Run discovery sessions with operations and finance teams",
      "Size the opportunity before anyone writes a line of code",
      "Translate a workflow into something an engineer can build against",
      "Stay on through delivery and prove the number you promised",
    ],
    requirements: [
      "Three or more years in consulting, solutions or operations",
      "Fluent enough in automation to know what is cheap and what is not",
      "Writes clearly — most of the deliverable is a document",
      "Happy to be the one who says a project is not worth doing",
    ],
  },
  {
    slug: "product-designer",
    role: "Product Designer",
    roleLines: ["Product", "Designer"],
    department: "Design",
    location: "Remote — Europe",
    type: "Full-time",
    posted: "February 2026",
    tone: "peach",
    summary:
      "Give automation an interface people trust: the states, the failures, and the moments where a person needs to take the wheel back.",
    about: [
      "AI products fail at the edges, and the edges are design work. What the system shows while it is thinking, how it admits uncertainty, and how somebody overrides it are the parts that decide whether it gets used twice.",
      "You will work across our client products and on this site and brand.",
    ],
    responsibilities: [
      "Design end-to-end flows for agent and automation products",
      "Own the states nobody demos: empty, slow, wrong, and refused",
      "Build and keep the design system the engineering team works from",
      "Sit in on user sessions rather than reading a summary of them",
    ],
    requirements: [
      "A portfolio of shipped product work, not concepts",
      "Strong systems thinking and typographic judgement",
      "Comfortable designing against a live codebase",
      "Figma, and enough CSS to know what you are asking for",
    ],
  },
];

export const careerIndexContent = {
  headingLines: ["Build the Systems", "Behind the Work"],
  headingLinesMobile: ["Build the", "Systems Behind", "the Work"],
  subheadingLines: [
    "We are a small team that ships automation people actually keep using.",
    "If that is the work you want to be doing, these are the openings.",
  ],
  /** Shown in place of the list when nothing is open. */
  empty: "No openings right now — but we always read a good introduction.",
} as const;

export const careerDetailContent = {
  meta: {
    department: "{Team}",
    location: "{Location}",
    type: "{Type}",
    posted: "{Posted}",
  },
  about: "About the role",
  responsibilities: "What you will do",
  requirements: "What you will bring",
  cta: {
    heading: "Think this is you?",
    body: "Send us your work and a note about what you would want to build here.",
    label: "Apply for this role",
    href: "/contact",
  },
  more: {
    heading: "Other openings",
    /** How many other roles to show at the foot of a role. */
    count: 2,
  },
} as const;
