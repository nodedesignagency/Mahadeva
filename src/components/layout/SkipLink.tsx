/**
 * Keyboard skip link. Visually hidden until focused, then pinned to the top of
 * the viewport. Targets the `#main` landmark in the root layout.
 *
 * `data-instant` keeps the smooth in-page scroll off this one, and that is an
 * accessibility requirement rather than a preference. Following a link to a
 * fragment does two things: it scrolls, and it moves the point the next Tab
 * starts from. Only the browser's own handling does the second, so anything
 * that intercepts the click and animates the scroll itself would leave a
 * keyboard reader exactly where they were — which is the one thing this link
 * exists to prevent. See SmoothScroll.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      data-instant=""
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-fg"
    >
      Skip to main content
    </a>
  );
}
