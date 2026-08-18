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

/** A titled block of a post. The whole body is a run of these. */
export type PostSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type Post = {
  slug: string;
  title: string;
  /**
   * The title broken into the lines the post page sets it on.
   *
   * The reveal is why this exists rather than letting the column wrap it. A
   * line's bar is one box sized to that line, so authored breaks give each
   * line a bar the width of its own words; a title left to wrap is one block,
   * and every row gets a bar as wide as the longest — bare colour running past
   * the end of the short line. The case studies carry the same field for the
   * same reason.
   *
   * Optional: a post that arrives without breaks still renders, falling back
   * to the wrapped block.
   */
  titleLines?: readonly string[];
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

export const posts: readonly Post[] = [
  {
    slug: "how-ai-is-changing-everyday-workflows",
    title: "How AI Is Changing Everyday Workflows",
    titleLines: ["How AI Is Changing", "Everyday Workflows"],
    summary:
      "AI-driven lead scoring boosted conversions by 40% for a growing business.",
    category: "AI Automation",
    tone: "sky",
    published: "2026-01-02",
    date: "Jan 2, 2026",
    author: { name: "Alex Morgan" },
    body: [
      {
        heading: "Smarter Decision Support",
        paragraphs: [
          "AI workflows can analyze information, uncover patterns, and surface insights teams might otherwise miss. Instead of relying on manual review, they help make decision-making faster, clearer, and more reliable.",
        ],
      },
      {
        heading: "Faster Execution Across Teams",
        paragraphs: [
          "Traditional automation often handled only small repetitive tasks. AI-driven workflows go further by understanding context, coordinating across tools, and helping teams move work forward with less friction.",
        ],
      },
      {
        heading: "Automation Beyond Simple Tasks",
        paragraphs: [
          "Rather than only supporting isolated actions, AI workflows can manage more connected operational processes. This allows businesses to automate work that feels more meaningful, adaptive, and scalable.",
        ],
      },
      {
        heading: "A Shift Toward Operational Efficiency",
        paragraphs: [
          "As AI becomes part of everyday operations, teams spend less time managing repetitive processes and more time focusing on higher-value work. The result is a more efficient and sustainable way of working.",
        ],
      },
    ],
  },
  {
    slug: "building-better-processes-with-automation",
    title: "Building Better Processes With Automation",
    titleLines: ["Building Better Processes", "With Automation"],
    summary:
      "See how automation improves operations and supports business growth.",
    category: "Growth Strategy",
    tone: "lavender",
    published: "2025-12-11",
    date: "Dec 11, 2025",
    author: { name: "Priya Raman" },
    body: [
      {
        heading: "Start With The Process, Not The Tool",
        paragraphs: [
          "The fastest way to automate the wrong thing is to begin with software. A process written down honestly — every step, every wait, every handover — usually shows its own answer before any tool is chosen.",
        ],
      },
      {
        heading: "Automate The Middle, Not The Edges",
        paragraphs: [
          "The first and last steps of a process are where judgement lives. The middle is where the copying, the chasing and the re-keying sit, and that is the part a system can take on without anyone losing control of the outcome.",
        ],
      },
      {
        heading: "Measure What You Removed",
        paragraphs: [
          "An automation that nobody can point at a number for is difficult to defend and impossible to improve. Count the steps taken out and the hours given back, and the case for the next one makes itself.",
        ],
      },
    ],
  },
  {
    slug: "what-automation-looks-like-in-practice",
    title: "What Automation Looks Like in Practice",
    titleLines: ["What Automation Looks", "Like in Practice"],
    summary: "A practical look at how real teams use automation every day.",
    category: "Marketing AI",
    tone: "rose",
    published: "2025-11-27",
    date: "Nov 27, 2025",
    author: { name: "Daniel Carter" },
    body: [
      {
        heading: "It Is Mostly Unglamorous",
        paragraphs: [
          "The systems that earn their keep are rarely the ones worth demonstrating. A brief routed to the right person, a report built without anyone opening a spreadsheet, a reminder that arrives before the deadline rather than after it.",
        ],
      },
      {
        heading: "The Team Has To Be Able To See It",
        paragraphs: [
          "Automation that runs where nobody can watch becomes something people work around. Every system we build shows its own working: what it did, when, and what it decided to leave alone.",
        ],
      },
      {
        heading: "Reversible By Default",
        paragraphs: [
          "Anything that acts on a customer, a record or a budget should be undoable by the person responsible for it. That single rule is what turns automation from a risk into an assistant.",
        ],
      },
    ],
  },
  {
    slug: "turning-pipeline-admin-into-pipeline-time",
    title: "Turning Pipeline Admin Into Pipeline Time",
    titleLines: ["Turning Pipeline Admin", "Into Pipeline Time"],
    summary:
      "What a sales team stopped doing by hand, and what it bought them back.",
    category: "Sales Automation",
    tone: "mint",
    published: "2025-11-06",
    date: "Nov 6, 2025",
    author: { name: "Alex Morgan" },
    body: [
      {
        heading: "Where The Hours Actually Went",
        paragraphs: [
          "Nobody on the team thought they spent much time on admin. A fortnight of honest logging said otherwise: notes, enrichment, follow-up scheduling and CRM hygiene were taking most of a day a week each.",
        ],
      },
      {
        heading: "What We Took Off Them",
        paragraphs: [
          "Call notes drafted from the transcript for the rep to correct. Enrichment pulled once and reused. Follow-ups scheduled from the outcome of the call rather than from memory. None of it decided anything; all of it removed typing.",
        ],
      },
      {
        heading: "What Changed",
        paragraphs: [
          "The hours went back into conversations, which is the only part of the job that was ever going to move the number. Pipeline quality improved before pipeline volume did.",
        ],
      },
    ],
  },
  {
    slug: "the-handover-problem-nobody-measures",
    title: "The Handover Problem Nobody Measures",
    titleLines: ["The Handover Problem", "Nobody Measures"],
    summary:
      "Most delay sits between steps, not inside them. Here is how to see it.",
    category: "Operations",
    tone: "peach",
    published: "2025-10-15",
    date: "Oct 15, 2025",
    author: { name: "Priya Raman" },
    body: [
      {
        heading: "Steps Are Fast, Queues Are Slow",
        paragraphs: [
          "Ask how long a step takes and you will get the working time. Measure the same step end to end and it is often ten times longer, because almost all of it was spent waiting for someone to pick it up.",
        ],
      },
      {
        heading: "Make The Waiting Visible",
        paragraphs: [
          "Timestamp the handovers, not the work. A queue that nobody can see is a queue nobody will fix, and the chart that shows it is usually more persuasive than any argument about tooling.",
        ],
      },
      {
        heading: "Then Automate The Handover",
        paragraphs: [
          "Once the waiting is visible, the fix is rarely a faster step — it is a handover that happens without being asked for. That is the cheapest automation most teams have available to them.",
        ],
      },
    ],
  },
  {
    slug: "writing-briefs-a-model-can-actually-use",
    title: "Writing Briefs A Model Can Actually Use",
    titleLines: ["Writing Briefs A Model", "Can Actually Use"],
    summary:
      "Better output is usually a better brief. A short guide for marketing teams.",
    category: "Marketing AI",
    tone: "magenta",
    published: "2025-09-30",
    date: "Sep 30, 2025",
    author: { name: "Daniel Carter" },
    body: [
      {
        heading: "Say Who It Is For",
        paragraphs: [
          "Most disappointing output is a brief that never named its reader. Audience, and what that audience already knows, does more for the result than any instruction about tone.",
        ],
      },
      {
        heading: "Show One Example Of Right",
        paragraphs: [
          "A single piece of work you were happy with is worth more than a paragraph describing the style you want. Give the example, then say what about it you want kept.",
        ],
      },
      {
        heading: "State What Would Make It Wrong",
        paragraphs: [
          "Constraints are easier to check than aspirations. Length, claims you cannot make, words the brand does not use — these turn a review into a checklist rather than a matter of taste.",
        ],
      },
    ],
  },
];
