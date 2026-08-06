/**
 * Case study content.
 *
 * These are the demo entries. They are also the shape the CMS returns — the
 * types below are the contract, and `src/lib/case-studies.ts` produces the same
 * objects whether they came from Sanity or from this file.
 *
 * Keeping them here is not a placeholder that gets deleted later. It is what
 * the site renders before anyone has connected a CMS, which is the state every
 * buyer sees on first run, and what the seed script imports into their dataset.
 */

import demoCaseStudies from "./case-studies.json";

/** Panel fills, matching the `--color-case-*` tokens in theme.css. */
export type CaseTone = "sky" | "lavender" | "peach" | "mint" | "periwinkle";

export type CaseStat = {
  label: string;
  value: string;
};

export type CaseStudy = {
  /** Stable key, and the URL segment under /case-study. */
  slug: string;
  client: string;
  /** Shown in the chip at the top right of the panel. */
  year: string;
  title: string;
  summary: string;
  /**
   * Exactly four, laid out 2x2. Fewer would leave a hole in the grid, more
   * would push the panel taller than the artwork beside it.
   */
  stats: [CaseStat, CaseStat, CaseStat, CaseStat];
  tone: CaseTone;
  /**
   * Client mark, drawn at 138x32 and fitted inside that box. Absent until the
   * file exists, in which case the card sets the client's name instead.
   */
  logo?: { url: string; alt: string };
  /**
   * Product screenshot. Absent until the picture exists — the card reserves
   * the space rather than collapsing, so a missing image is obvious.
   */
  image?: { url: string; alt: string };
};

export const caseStudiesContent = {
  eyebrow: "Case Studies",
  headingLines: ["Latest works"],
  subheading:
    "See how AI automation transformed performance and accelerated growth across industries.",
  cta: { label: "More Case Studies", href: "/case-study" },
} as const;

/**
 * The index page's own opening. The home section keeps its own heading — one
 * is "the latest three", the other is the whole shelf, and they should not
 * read as the same line twice.
 */
export const caseStudyIndexContent = {
  headingLines: ["Our Works"],
  subheadingLines: [
    "See how we helped companies turn AI into practical systems",
    "that deliver measurable business impact.",
  ],
} as const;

/**
 * The demo entries themselves live in JSON beside this file.
 *
 * Not a style choice: `scripts/seed-sanity.mjs` runs on bare node and has to
 * read the same records to push them into a buyer's dataset. Data it can parse
 * without a TypeScript compiler means the seeded documents and the pre-setup
 * demo are the same words by construction, and cannot drift apart.
 */
export const caseStudies = demoCaseStudies as CaseStudy[];
