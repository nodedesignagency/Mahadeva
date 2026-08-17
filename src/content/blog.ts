/**
 * Blog content.
 *
 * Structure first, Sanity second. The shape below is what a post document will
 * project to — `slug`, `title`, `summary`, `category`, `tone`, and an optional
 * `image` — so moving to the CMS is a change to `src/lib/blog.ts` and to
 * nothing that renders.
 *
 * This is the second of Sanity's two free datasets, and the one it is being
 * spent on: a blog is written to weekly, where a case study or a job opening
 * changes a handful of times a year and is happier as a commit.
 */

/**
 * The filter row, in the order it is shown.
 *
 * Declared rather than derived from the posts. The openings list derives its
 * filters, and that is right there — the facts come from the roles. Here the
 * order is the design's and does not follow the order posts happen to be
 * written in, so it is stated once and a post's `category` is typed against
 * it: a typo, or a category the row never offers, is then a build error rather
 * than a filter that quietly matches nothing.
 */
export const blogCategories = [
  "Growth Strategy",
  "AI Automation",
  "Marketing AI",
  "Sales Automation",
  "Operations",
] as const;

export type BlogCategory = (typeof blogCategories)[number];

/** The card's fill. One per post, cycling through the palette's pastels. */
export type PostTone =
  | "sky"
  | "lavender"
  | "rose"
  | "mint"
  | "peach"
  | "magenta";

export type Post = {
  slug: string;
  title: string;
  summary: string;
  category: BlogCategory;
  tone: PostTone;
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

export const posts: readonly Post[] = [
  {
    slug: "how-ai-is-changing-everyday-workflows",
    title: "How AI Is Changing Everyday Workflows",
    summary:
      "AI-driven lead scoring boosted conversions by 40% for a growing business.",
    category: "AI Automation",
    tone: "sky",
  },
  {
    slug: "building-better-processes-with-automation",
    title: "Building Better Processes With Automation",
    summary:
      "See how automation improves operations and supports business growth.",
    category: "Growth Strategy",
    tone: "lavender",
  },
  {
    slug: "what-automation-looks-like-in-practice",
    title: "What Automation Looks Like in Practice",
    summary: "A practical look at how real teams use automation every day.",
    category: "Marketing AI",
    tone: "rose",
  },
  {
    slug: "turning-pipeline-admin-into-pipeline-time",
    title: "Turning Pipeline Admin Into Pipeline Time",
    summary:
      "What a sales team stopped doing by hand, and what it bought them back.",
    category: "Sales Automation",
    tone: "mint",
  },
  {
    slug: "the-handover-problem-nobody-measures",
    title: "The Handover Problem Nobody Measures",
    summary:
      "Most delay sits between steps, not inside them. Here is how to see it.",
    category: "Operations",
    tone: "peach",
  },
  {
    slug: "writing-briefs-a-model-can-actually-use",
    title: "Writing Briefs A Model Can Actually Use",
    summary:
      "Better output is usually a better brief. A short guide for marketing teams.",
    category: "Marketing AI",
    tone: "magenta",
  },
];
