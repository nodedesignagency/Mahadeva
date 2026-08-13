/**
 * The surface a page holds, declared by the page itself.
 *
 * The header is fixed in the root layout, above every page, and has to wear
 * the surface of whichever one is under it. It used to work that out from the
 * route — a map of pathname to surface inside the component — which was wrong
 * in two ways. A route rename silently reverted a page to white, and anywhere
 * the app renders without its real path, the preview bundles included, every
 * page claimed the default: the dark index and the beige pricing page both
 * published with a white strip.
 *
 * So the page says what it is, and the strip reads it. `globals.css` selects
 * on `body:has([data-page-surface="…"])`, which is why this renders a marker
 * rather than passing a prop: the header is not this page's ancestor or its
 * sibling in any order CSS can walk, but it is in the same document.
 *
 * `hidden` because it is a declaration and not content — it occupies nothing
 * and is invisible to assistive tech, and `:has()` matches it regardless.
 *
 *  - `dark`  — dark the whole way down, so the strip never flips.
 *  - `hero`  — dark over the opening, light past the scroll threshold. The
 *              home page: an intro on the dark surface, then white and beige
 *              wrappers under it.
 *  - `beige` — the light strip in the page's own beige, so the header reads as
 *              the top of the surface rather than a white band laid over it.
 *
 * A page that declares nothing gets the light strip on white.
 */

type PageSurfaceProps = {
  value: "dark" | "hero" | "beige";
};

export function PageSurface({ value }: PageSurfaceProps) {
  return <div hidden data-page-surface={value} />;
}
