/**
 * The blog's two closed vocabularies, and the single place either is written.
 *
 * Their own file because both the site and the Studio need them, and the
 * Studio should not have to import `blog.ts` to learn what a category is —
 * that file carries the demo posts, and pulling it into `sanity/schema/post.ts`
 * would put all of them in the editor's bundle.
 *
 * Everything downstream derives from these: the schema builds its two
 * dropdowns from them, the filter row is rendered from them, and a post's
 * fields are typed against them. Adding a category is one edit here, and a
 * value the Studio offers can no longer be one the site filters to nothing.
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

/**
 * The card's fill. One per post, cycling through the palette's pastels.
 *
 * A list rather than a bare union, because the Studio needs the values at
 * runtime to build its radio group. The type still comes from the list, so the
 * two cannot disagree.
 */
export const postTones = [
  "sky",
  "lavender",
  "rose",
  "mint",
  "peach",
  "magenta",
] as const;

export type PostTone = (typeof postTones)[number];
