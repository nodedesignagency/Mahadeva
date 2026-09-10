/**
 * Whether a link leaves the site.
 *
 * One rule, because two places need the same answer and they were about to
 * disagree: the button primitive, which gives an outbound link its own tab,
 * and the FAQ's strategy-call card, which is a whole card wrapped in an anchor
 * rather than a button and so cannot ask the button.
 *
 * `http(s)` only. `mailto:` and `tel:` also leave the page, but they hand off
 * to another application rather than opening a document — a tab opened for
 * them is a blank one left behind after the mail client takes over.
 */
export function leavesSite(href: string): boolean {
  return /^https?:/i.test(href);
}
