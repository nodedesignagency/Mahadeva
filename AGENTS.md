<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# House rules

Standing decisions for this project. They are here because each one has already
been got wrong at least once, and none of them is guessable from the code in
front of you.

## Every page declares its surface

The header is fixed in the root layout, above every page, and has to wear the
surface of whichever page is under it. It cannot work that out for itself — it
is neither a page's ancestor nor its sibling in any order CSS can walk — so
**every page renders `<PageSurface value="…" />` as its first element.** A page
that declares nothing gets the light strip on white, which is why a dark page
that forgets it comes out with a white header.

| Value | Use it when | Pages |
| --- | --- | --- |
| `dark` | The page is dark from the header down and the strip never flips. | Case studies, contact, 404 |
| `hero` | A dark opening with light wrappers under it — the strip flips once, past the fold. | Home, about |
| `beige` | The page's own beige runs to the top, so the strip reads as the top of the surface rather than a white band over it. | Pricing |

Setting `data-bg` on a section is a different thing and not a substitute: that
drives the changing background *behind* the page. Both are usually needed.

## Fonts

Two families, and which is which is not a matter of taste:

- **Almarai** — `font-display`, `font-body`. Headings and body copy.
- **Geist** — `font-ui`. Buttons, labels, navigation, **and every number on the
  site**, at whatever weight and size the context calls for. A figure set in
  Almarai is a bug.

`src/config/fonts.ts` is the only place a family is named.

## Colour tokens are declared twice

A `--color-*` token has to be **declared** in the semantic block of
`src/styles/theme.css` *and* **re-exported** through the `@theme inline` block
at the bottom of that file. Tailwind generates a utility only for what is in
`@theme`, and a class it has never heard of compiles to nothing at all — no
error, no warning, just an element with no fill. Three panels shipped invisible
this way.

After adding one, check it survived:

```
rm -rf .next && npm run build
grep -c '\.bg-your-token{' $(find .next -name '*.css' -path '*static*' | head -1)
```

## Tailwind class names must be whole

`prop-[--token]` compiles to an invalid declaration — use `prop-(--token)`.
`npm run lint` runs `scripts/check-arbitrary-vars.mjs`, which fails the build on
the first form.

A class assembled from a variable (`` `top-[${x}]` ``) is invisible to
Tailwind's scanner and produces nothing. Write both halves out, or put the value
in a `style` prop.

## Button widths

267px from tablet up, full width on a phone — `w-full tablet:w-[267px]`. This is
the site's call-to-action width and every page's primary button uses it.

## The Studio is not a page of the site

`/studio` sits outside the `(site)` route group on purpose, so it inherits none
of the chrome: no fixed header over its toolbar, no call-to-action panel under
its form, and no Lenis intercepting the wheel — smooth scroll fights every
scrollable panel the Studio has. Anything that should wrap the site goes in
`src/components/layout/SiteChrome.tsx`, not the root layout.

## Verify in a browser, not by arithmetic

Chromium is available and the project builds to a real server. When a change is
dimensional — a fixed box, a hover sequence, a font that has to fill a width —
build it, serve it, and measure the rendered result. Reasoning about line
heights has been wrong here more than once.
