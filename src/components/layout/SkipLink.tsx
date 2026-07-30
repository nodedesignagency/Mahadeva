/**
 * Keyboard skip link. Visually hidden until focused, then pinned to the top of
 * the viewport. Targets the `#main` landmark in the root layout.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-fg"
    >
      Skip to main content
    </a>
  );
}
