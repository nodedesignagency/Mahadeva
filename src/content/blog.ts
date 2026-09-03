/**
 * Blog content.
 *
 * The types below are the contract: `sanity/schema/post.ts` declares the same
 * fields and `src/lib/blog.ts` projects onto them, so a post reads the same
 * whether it came from the CMS or from the JSON beside this file.
 *
 * The posts live in their own Sanity dataset, `blog`, apart from the case
 * studies in `production`. Not because a dataset can only hold one kind of
 * thing — it holds as many as you like — but because the two are written on
 * different rhythms, and keeping them apart means either can be exported or
 * restored without touching the other.
 */

import demoPosts from "./blog.json";

/**
 * The categories and the tones live in `blogTerms.ts`, which the Studio schema
 * reads too, and are passed straight through here so that everything on the
 * site can keep asking this file for them.
 */
export { blogCategories, postTones } from "./blogTerms";
export type { BlogCategory, PostTone } from "./blogTerms";

// Imported as well as passed on, because `Post` below is typed against them.
import type { BlogCategory, PostTone } from "./blogTerms";

/** A titled block of a post. The whole body is a run of these. */
type PostSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type Post = {
  slug: string;
  title: string;
  summary: string;
  category: BlogCategory;
  tone: PostTone;
  /**
   * Two dates, and both are needed. `published` is machine-readable and goes
   * in the `datetime` attribute; `date` is how the design writes it. Deriving
   * one from the other would mean choosing a locale at render time, and the
   * server and the client do not always agree on that.
   */
  published: string;
  date: string;
  author: { name: string; avatar?: { url: string; alt: string } };
  body: readonly PostSection[];
  /** Sanity-shaped, and absent until the pictures land. */
  image?: { url: string; alt: string };
};

export const blogIndexContent = {
  headingLines: ["All Blogs"],

  filters: {
    /** Names the chip row for anything reading it rather than looking at it. */
    label: "Filter by category",
    /** The resting chip: no category chosen rather than a category called All. */
    all: "All",
    search: { label: "Search posts", placeholder: "Search…" },
  },

  empty: "No posts match those filters.",
  /** Announced with each card, which is one link carrying a heading. */
  readLabel: "Read",
  /** Stands in each card's frame until the photograph lands. */
  imagePending: "Photograph to come",
} as const;

/**
 * A post's own page.
 *
 * Everything here is shared by all of them — the two labels and the heading
 * over the recommendations. What differs is on the post itself.
 */
export const postDetailContent = {
  authorLabel: "Author",

  more: {
    headingLines: ["Keep Reading Further"],
    /** How many other posts to show under one. */
    count: 3,
  },
} as const;

/**
 * The demo posts themselves live in JSON beside this file.
 *
 * Not a style choice: `scripts/seed-sanity.mjs` runs on bare node and has to
 * read the same records to push them into a buyer's blog dataset. Data it can
 * parse without a TypeScript compiler means the seeded documents and the
 * pre-setup demo are the same words by construction, and cannot drift apart.
 */
export const posts = demoPosts as readonly Post[];
