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
  /**
   * The title broken into the lines the detail page sets it on.
   *
   * Every heading on this site is authored line by line, and the reveal
   * depends on it: a line's bar is one box, sized to that line's text, so a
   * heading left to wrap gets a single bar as wide as the column with the gap
   * between its rows hidden underneath. Absent, the page falls back to the
   * whole title and copes — but the breaks are a design decision, not the
   * column's to make.
   */
  titleLines?: string[];
  /**
   * The same title broken for a phone, where the desktop break runs past the
   * column and wraps — which puts the bar back to the column's width for the
   * line that wrapped. The hero does the same thing for the same reason.
   */
  titleLinesMobile?: string[];
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

  /**
   * Everything below is the detail page's, and every field of it is optional:
   * a study that has only been written as a card still renders one, with the
   * page showing what it has. The card fields above are the shared part.
   */
  /** How long the work ran, as the meta row states it: "3 Months". */
  timeline?: string;
  /** Read as a dot-separated run under one heading, not as a list. */
  services?: string[];
  /** The finished site. Absent when there is nothing public to point at. */
  liveUrl?: string;
  /** The brief, in paragraphs. */
  challenge?: string[];
  /** What was built, in paragraphs. */
  solution?: string[];
  /** The grid below the prose. */
  gallery?: { url: string; alt: string }[];
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

/**
 * The detail page's fixed words — the labels, not the content.
 *
 * The braces are the site's heading style, the same ones the footer's column
 * titles carry. They are part of the label rather than something the component
 * adds, so a translation can drop them.
 */
export const caseStudyDetailContent = {
  meta: {
    client: "Client",
    timeline: "Timeline",
    services: "Services",
  },
  livePreview: "Live Preview",
  challenge: "{The Challenge}",
  solution: "{The Solution}",
  results: "{The Results}",
  /** The two studies at the foot of every case study page. */
  more: {
    headingLines: ["Explore More Work"],
    /** Two authored lines, so the break falls where the design puts it. */
    subheadingLines: [
      "Browse additional work focused on strategy, automation, and scalable",
      "design built to improve clarity and performance.",
    ],
    cta: { label: "More Case Studies", href: "/case-study" },
    /** How many to show. Two fit the row the cards are drawn for. */
    count: 2,
  },
  /** Stands in for a picture that has not been supplied yet. */
  imagePending: "Screenshot to come",
} as const;
