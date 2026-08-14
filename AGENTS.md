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

## `data-bg` takes three values, and "dark" is not one of them

`white`, `green`, `beige` — the set in `BackgroundTransition.tsx`, and
**`green` is the dark surface.** The whole palette is built on that green, so
it is the page's colour rather than a section's. Anything else is ignored
silently.

This matters beyond the background: `sectionTextRevealDynamic` resolves its
settled colour from `--color-fg-dynamic`, which is whatever the current surface
implies. A dark section wrongly marked `white` gets dark ink, and its heading
reveals into a colour it cannot be read in — a heading that is simply not there
with nothing in the console.

## A dark opening pins, and what follows rides over it

This is the site's handover and the owner's design style, not a home-page
flourish. Any page shaped as a dark opening with content under it gets it: wrap
both in `<div data-scroll-stack>`, make the opening `sticky top-0`, and give
what follows `relative z-10` and its own opaque fill. Anything pinned that
carries a `Parallax` must track `[data-scroll-stack]` rather than its own
section — keyed to a pinned element the drift freezes for exactly the stretch
it should be moving.

**Only the opening is sticky.** A section taller than the viewport cannot be:
`sticky` pins its top and its own content then stops scrolling, which freezes
the page. What rides over needs no stickiness at all — being later in the
document, positioned, and opaque is the whole effect.

## A section that paints itself needs fixed ink

`sectionTextRevealDynamic` resolves into `--color-fg-dynamic`, which follows
whichever section currently owns the viewport. That is correct only for a
heading on a section that crossfades with the page. A section carrying
`data-bg-keep` paints its own fill and never crossfades, so it must use a fixed
`afterColor` instead:

| Section's own fill | Reveal to use |
| --- | --- |
| Crossfades with the page | `sectionTextRevealDynamic` |
| Keeps a dark fill | `sectionTextRevealDark` |
| Keeps a light fill | `sectionTextReveal` |
| Beige | `sectionTextRevealBeige` |

Get it wrong and the heading is **absent, not dim** — it reveals into the same
colour as the ground it sits on. Worse, whether it happens depends on the
window height: a dark section's pixels count at two thirds in the ownership
contest, so a dark block with a taller light section under it loses as soon as
the window is tall enough. It will look fine on your screen and be invisible on
someone else's. Check a short window *and* a tall one.

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

After adding one, check it survived — and check it properly. Tailwind groups
selectors that share a declaration (`.bg-x,.bg-x\/70{…}`) and the build emits
several stylesheets, so a naive `grep '\.bg-x{'` against the first file reports
a working utility as missing:

```
rm -rf .next && npm run build
grep -rho '\.bg-your-token[,{]' $(find .next -name '*.css' -path '*static*')
```

Better still, read it off the element in a browser — `getComputedStyle(el)
.backgroundColor` cannot be fooled by how the CSS was written.

One caveat when you do: `BackgroundTransition` sets
`section.style.backgroundColor = "transparent"` on every `[data-bg]` section it
manages, so those *should* compute as transparent and let the body's crossfade
show through. `data-bg-keep` opts a section out, which is what a pinned section
needs — it has to carry its own fill or you see straight through it to whatever
it is riding over.

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
