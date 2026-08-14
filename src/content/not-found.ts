/**
 * 404 page content.
 *
 * Its own file for the same reason every other page has one: the words on a
 * page are content, and the one page nobody plans to read is the one most
 * likely to be reworded later.
 */

export const notFoundContent = {
  /** The figure itself, set at the width of the page. */
  code: "404",
  body: "The page you're looking for might have moved or no longer exists, but you can explore other sections to discover helpful insights and resources.",
  cta: { label: "Go home", href: "/" },
} as const;
