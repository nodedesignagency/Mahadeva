<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# House rules

Standing decisions for this project. They are here because each one has already
been got wrong at least once, and none of them is guessable from the code in
front of you.

## Work on `main`

Every change lands on `main`. Not a feature branch, not a branch named after
the session — `main`, committed and pushed there.

The owner runs the site from one clone and updates it with one line:

```
cd ~/Documents/Mahadeva && git pull origin main && npm install && npm run dev
```

Work parked on a branch is work they cannot see. Where a branch is genuinely
wanted they will say so, and it is merged back to `main` as soon as it is
done rather than left standing.

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

## A dark opening pins when — and only when — white follows it

The site's handover, and the owner's design style. What triggers it is the
**change of surface**, not the dark opening on its own:

| Page | Shape | Stack? |
| --- | --- | --- |
| Home, about | dark green opening → white | **yes** |
| Privacy, terms | dark green opening → white | **yes** |
| Contact | dark green opening → dark green | no |
| Case studies, case study, pricing | one surface throughout | no |

A page that holds one colour from top to bottom has nothing to hand over, and
pinning its opening is motion for its own sake. Do not add it there.

Where it does apply: wrap both sections in `<div data-scroll-stack>`, make the
opening `sticky top-0`, and give what follows `relative z-10` and its own opaque
fill. Anything pinned that carries a `Parallax` must track
`[data-scroll-stack]` rather than its own section — keyed to a pinned element
the drift freezes for exactly the stretch it should be moving.

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

## The wipe and the preloader are one handover, in this order

Broken four times in a day, three different ways, each of which looked like a
different bug and none of which any check caught. `npm run lint` now runs
`scripts/check-transitions.mjs`, which fails the build on all three — and on a
fourth, below, that never once showed on the site. **If it fails, fix the code.
Do not edit the guard to agree with you.**

Going to the home page from anywhere inside the site, the sequence is:

```
cards cross in  →  screen covered  →  cards sweep off  →  preloader sheet  →  home
                                          ↑
                             this is what uncovers the sheet
```

Three things make that work, and each has been removed at least once by
someone reasoning about it sensibly and being wrong:

**The wipe runs to the home page.** It was once skipped there, on the entirely
reasonable ground that the preloader covers the screen anyway. It does — but it
is the *second half* of a handover, not a replacement for one. Skip the wipe
and the link appears to do nothing, then a green sheet arrives from nowhere,
where every other link on the site has a join.

**The sweep runs in full.** Dropping the cards on arrival instead of sweeping
them looks like the tidier thing — the preloader is about to cover everything,
so why animate them off? Because the sweep is the join. Cut it and the wipe
plays half and the preloader still arrives unannounced, which is the same
complaint by another route.

**The wipe sits above the sheet.** `PageTransition` is `z-[10000]` and
`Preloader` is `z-[9999]`, and that order is load-bearing. The sheet goes up
the moment the home page mounts, which is *while the cards are still
covering* — so underneath it the sweep happens out of sight. Both animations
run correctly, in the right order, and the reader sees the wipe stop half way.
This one cost the longest to find because every trace of `data-wipe` came back
correct; only the layering was wrong.

That last one is the general lesson, and it is worth more than the specific
fix: **a transition bug is not proved absent by the state being right.** Read
the pixels. `page.screenshot()` in a loop and the centre row of each frame told
the truth in one run, after a day of state traces that were all green.

## The artifact is how the motion gets looked at

`npm run artifact` bundles every route into one file for preview. It is
tempting, when a navigation stalls in the artifact viewer and paints the screen
one flat colour, to hide `.mh-wipe` in the bundle and call the symptom cured.
That removes the animation from the only place anyone looks at it. The guard
fails on it.

If the artifact is misbehaving, the fault is almost never the bundle: it has
been reproduced in a plain file, behind a host-style path prefix with a
`<base href>`, and inside a sandboxed frame where `sessionStorage` throws, and
every route opened in all three. Check the viewer, or check the real site with
`npm run build && npx next start`, before changing anything the site renders.

### In the artifact the address is not the route

Almost never the bundle — but once, it was the site, and only the artifact
could show it. Worth reading before the next stuck screen sends someone into
`build-artifact.mjs`.

The bundle freezes the address at whatever path the host serves the file from,
and does it on purpose: one file with no server behind it, so a router that
writes `/about` into the address sends the next reload somewhere nothing can
answer for. The cost is that `location.pathname` is `/_f/<id>/` on every route.

Anything on the site that asks the address where it is therefore gets a wrong
answer in the artifact, and gets it silently. The wipe's guard against running
for a link to the page already open was `url.pathname === location.pathname`,
which is the same string on the site and never matches in the artifact — so
those links covered the screen with no arrival coming to open it, and it sat on
one flat colour for the full 2.5s of `pageWipe.rescue`. Three of six
navigations, measured: every current-page link, which is the header logo on
home and the nav item for whatever page you are on.

**Ask the router, not the address** — `usePathname()` is right in both places.
The rescue is what makes this survivable rather than fatal, and that is the
only reason it read as a slow page rather than a broken one. Do not treat it as
a licence to leave a cover without a way out.

## Do not touch what moves the reader between pages

It works. It is also the part of this codebase that has broken the most, and
every single time it was a side effect of a change aimed at something else —
never a change to the transition itself. The wipe covering the screen and never
lifting; the preloader arriving with no join; a route that fetches its payload
and silently stops. Each cost a day, and each reached a reader before anyone
here noticed.

So `npm run lint` runs `scripts/check-navigation-lock.mjs`, which hashes the
following and **fails the build if any of it changes**:

| Locked | Why |
| --- | --- |
| `motion/PageTransition.tsx` | the click handler, the state machine, the rescue |
| `motion/Preloader.tsx` | the sheet, and its handover with the wipe |
| `layout/SiteChrome.tsx` | mount order — the wipe above the sheet, both above the page |
| `scripts/build-artifact.mjs` | the bundle's router: fetch shim, frozen address, chunk-list strip |
| `pageWipe` and `preloader` in `config/animation.ts` | the numbers the sequence runs on |
| `check-transitions`, `check-artifact-routes`, `check-pages` | so a failing guard cannot be quietly softened |

It is not a correctness check. It makes no claim that your new version is
worse — it is a stop, so that touching this takes a decision instead of
happening by accident.

**If the build fails on it and you did not mean to change that file**, put it
back: `git checkout -- <file>`.

**If you did mean to**, prove it still works and record it:

```
npm run artifact          # rebuilds and opens all 26 routes in the bundle
npm run bless-navigation  # re-records the lock, refusing unless that passed
```

`bless-navigation` will not record anything while a route fails to open. That
refusal is the point: changing this is allowed, changing it without opening
every page afterwards is not.

## A new page is covered without anyone remembering to cover it

Both checks that matter enumerate what they check rather than being told:

- `scripts/check-artifact-routes.mjs` reads the route list **out of the built
  bundle**, so a page added today is opened by the next build. Ones not linked
  from the home page — every blog post, job opening and case study — are
  reached through their index, the same two hops a reader makes. A route it
  cannot reach at all is a failure, not a silence.
- `scripts/check-pages.mjs` walks the **built HTML** and requires each page to
  carry exactly one valid `data-page-surface`. It reads the output rather than
  `page.tsx` on purpose: the 404 and both legal pages declare their surface
  inside the view component they share, which is correct, and a check that
  grepped the page file would call all three broken.

So neither needs a list kept up to date, and neither can be satisfied by a page
that merely compiles.

## A route can be alive on the site and dead in the bundle

`npm run artifact` ends with `scripts/check-artifact-routes.mjs`, which opens
every route in the built bundle — behind a host-style path prefix, inside a
sandboxed frame, with the wipe running — and fails the build if one does not
arrive. **If it fails, the bundle is broken for a reader. Do not publish it and
do not weaken the check.**

It exists because `/pricing` was exactly that, and nothing else could have
caught it. Under `npm run build && npx next start` the page rendered and
navigated perfectly. In the bundle the router fetched its payload and stopped:
no console error, no failed request, no rejected promise, no chunk in flight.
What the reader saw was the wipe closing over the screen and sitting there for
the full 2.5s of `pageWipe.rescue`, then the page they started on.

### Payloads must not carry chunk lists

The cause, and the reason it hit one page and not the others.

Every RSC payload declares its client modules as `I[<id>,[…chunks…],"Name"]`.
React reads that list and asks its loader for any chunk it does not already
consider loaded. On a server that is a fetch. Here `/_next` is walled off — see
the fetch shim — so nothing answers, and the promise React is waiting on never
settles. It suspends for ever without throwing, which is why every trace came
back clean: nothing failed, something simply never finished.

Every chunk is inlined into the file and has run long before a reader can click
anything, so those lists are not merely redundant here — they are the only
thing in the payload that can hang a navigation. `build-artifact.mjs` empties
them, after `needed` is computed, because that set is derived from these very
lists and emptying them first would inline nothing. The modules then resolve
straight out of the registry the inlined chunks already filled.

`/pricing` was the page it happened to only because it was the only route whose
modules named two chunks no earlier route had already caused to be recorded as
loaded. Nothing about the page was wrong. That is worth remembering: removing
its sections, its images and its content one at a time changed nothing, and a
page stripped to a single heading failed just the same. **When one route hangs
in the bundle and the same page is fine on the site, suspect what the payload
asks the loader for, not what the page renders.**

The shell's own flight data is deliberately left alone. It is parsed while the
document is still streaming, when "already loaded" is not yet true of
everything.

### Reproducing one of these

- **Use the viewer's conditions, not a plain file.** Host-style path prefix, a
  `<base href>`, a sandboxed frame. `check-artifact-routes.mjs` sets all three
  up and is the fastest harness to borrow.
- **`window.__mhRoute` is the truth about where the router is.** The address is
  frozen at the host's path on purpose, so `location.pathname` cannot answer
  it.
- **Serve one route's payload under another's navigation to split payload from
  route.** If the payload fails wherever it is served, it is the payload; if a
  relabelled working payload enters the route fine, the route is not the
  problem. That one experiment turned a day of guessing into a bisect.

## Content lives in Sanity, assets live in `public/uploads`

Two datasets in one project: `production` for case studies, `blog` for posts.
Datasets are databases, not CMSes — one holds as many document types as you
like, and the split here is because the two are written on different rhythms,
not because it was forced. The Studio opens on `production`; the blog is at
`/studio/blog` or under **Workspaces**. There is no picker at `/studio`, Sanity
redirects an unknown studio path to the first workspace in config order.

The categories and tones a post can take are declared once, in
`src/content/blogTerms.ts`, and the Studio dropdowns are built from it. Do not
list them again in the schema: a category the Studio offers and the filter row
does not is a post no chip ever shows.

Every image, icon and logo is under `public/uploads/{icons,logos,images}` —
`src/assets` no longer exists. They are still *imported* rather than linked,
through the `@public/` alias, because that is what hands them to the build and
makes a wrong path a compile error instead of a broken image someone finds
later. `src/app/favicon.ico` is the one exception and has to stay where it is.

Two icons are inline components in `src/components/ui/SiteIcons.tsx` rather
than files, because an `<img>` paints an SVG in the colour it was exported at.
Anything that has to follow the surface it sits on belongs there.
