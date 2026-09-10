# The design system

Every colour, size, duration and easing curve on this site is a token in
**`src/styles/theme.css`**. No component hardcodes any of them. That is the
whole reason a rebrand here is an afternoon rather than a fortnight: change the
assignment in one file and it propagates everywhere the role appears.

This document is what those tokens are, how they are wired, and how to change
them without breaking anything.

---

## The three layers

`theme.css` is one file with three blocks, and the order matters.

```
┌─ 1. RAW PALETTE ────────── :root { --mh-green: #8cffa7; … }
│     58 literal values. Hex codes live here and nowhere else.
│
├─ 2. SEMANTIC ───────────── :root { --color-accent: var(--mh-green); … }
│     Roles, not colours. Components only ever reference these.
│
└─ 3. @theme inline ──────── @theme inline { --color-accent: var(--color-accent); }
      Re-export. This is what makes `bg-accent` a real Tailwind class.
```

**Layer 1** holds the literal values — `--mh-green`, `--mh-ink`, `--mh-beige`
and the fifty-odd pastels. If you are changing what a colour *is*, you change
it here.

**Layer 2** assigns those to jobs — `--color-accent`, `--color-bg`,
`--color-fg`, `--color-card-blue`. If you are changing what something is *used
for*, you change it here. A component asking for `bg-accent` gets whatever
`--color-accent` currently points at, which is why swapping a brand colour does
not require touching a single component.

**Layer 3** is the part that surprises people, and it has its own section
below.

---

## Adding a colour

> **A `--color-*` token must be declared twice: once in the semantic block, and
> again in the `@theme inline` block at the bottom of the file.**

Tailwind v4 generates a utility only for what is in `@theme`. A class it has
never heard of does not warn, does not error, and does not fall back — it
compiles to nothing, and you get an element with no fill. Three panels shipped
invisible this way before the rule was written down.

So both of these, every time:

```css
/* 1. In the semantic block */
:root {
  --color-my-panel: var(--mh-lavender-50);
}

/* 2. In @theme inline at the bottom */
@theme inline {
  --color-my-panel: var(--color-my-panel);
}
```

Now `bg-my-panel`, `text-my-panel` and `border-my-panel` exist.

### Checking it survived

Do not trust `grep '\.bg-my-panel{'`. Tailwind groups selectors that share a
declaration (`.bg-x,.bg-x\/70{…}`) and the build emits several stylesheets, so
a naive grep against the first file reports a working utility as missing.

```
rm -rf .next && npm run build
grep -rho '\.bg-my-panel[,{]' $(find .next -name '*.css' -path '*static*')
```

Better still, read it off the element in a browser. `getComputedStyle(el)
.backgroundColor` cannot be fooled by how the CSS was written.

One caveat when you do: `BackgroundTransition` sets `backgroundColor =
"transparent"` on every `[data-bg]` section it manages, so those *should*
compute as transparent — the body's crossfade is showing through. That is
correct, not a bug.

---

## Colour

### The three surfaces

The site only ever sits on one of three grounds. Everything else is a card or a
panel *on* one of them.

| Surface | Token | Value | Where |
| --- | --- | --- | --- |
| Dark | `--color-bg` | `#0e1e1d` | Heroes, case studies, contact, footer |
| White | `--color-bg-white` | `#ffffff` | The wrappers under a dark opening |
| Beige | `--color-bg-light` | `#f6f4f0` | Pricing, about, and most light sections |

The dark one is a very desaturated green, not black, and the entire pastel
palette is tuned against it. This is why the codebase calls the dark surface
**"green"** — see `data-bg` below, where that naming becomes load-bearing.

### The accent

| Token | Value | Drives |
| --- | --- | --- |
| `--mh-green` | `#8cffa7` | `--color-accent`, `--color-focus`, `--color-wipe-1` |

This is the button hover sweep, the focus ring, the nav link hover on the dark
surface, and the first of the three cards that wipe the screen between pages.

### The tint families

Most of the palette is pastels, organised into families where a card's fill and
its hover state are one step apart. The pattern repeats everywhere:

| Family | Prefix | Depth |
| --- | --- | --- |
| Feature cards | `--color-card-*` | 10% tints — six across a dark field |
| Stat panels | `--color-stat-*` | 50 tints — four large blocks on white |
| Tech stack tiles | `--color-tool-*` | 50 tints, with `--color-tool-shape-*` one step deeper for hover |
| Blog cards | `--color-post-*` | 25 tints — small heads over photographs |
| Case study panels | `--color-case-*` | 100–150 tints — one wide panel per card |
| Pricing plans | `--color-plan-*` | 150 tints — the header strip, which is also the border |
| Mission cards | `--color-mission-*` | 10 tints — palest on the site, prose sits on them |
| Principles | `--color-principle-*` | Full strength — 64px squares, not fields behind text |

The depth is deliberate in each case and the reasoning is in the comments beside
each group. The short version: **the more text sits on a fill, the paler it
is.**

Which tint a given card gets is chosen **in content, not in the component**.
A case study carries `tone: "sky"`, a blog post carries `tone: "mint"`, and the
component resolves `--color-case-sky` from it. So re-tinting a card is a content
edit — see [CONTENT.md](CONTENT.md).

### Ink

| Token | On | Notes |
| --- | --- | --- |
| `--color-fg` | dark surfaces | White |
| `--color-fg-on-light` | white and beige | The dark ink |
| `--color-fg-on-light-muted` | white and beige | `--mh-slate`, a step back |
| `--color-fg-dynamic` | the changing-background zone | Written by JS — see below |

Note that `--color-fg-muted` and `--color-fg-subtle` are both **plain white**,
not dimmed. That is a deliberate correction: this site does not dim white text,
because a step down in opacity reads as a step down in importance that none of
the copy has. They keep their names so components need not change.

---

## Rebranding

The most common change, in the order that works.

### 1. The accent

In the raw palette block:

```css
--mh-green: #8cffa7;   /* ← your brand colour */
```

Then look at the rest of the green family, because five other things are built
from it and will now clash:

| Token | Used by |
| --- | --- |
| `--mh-green-200` | the preloader sheet, stat hover blocks |
| `--mh-green-150` | a case study panel tint, a principle mark |
| `--mh-green-100` | the closing CTA panel, the footer's column labels |
| `--mh-green-75` | the facts card on a job page |
| `--mh-green-50` | a feature card, a mission card |

Give each a tint of your new colour at roughly the same lightness. The numbers
in the names are the guide: `-50` is the palest, `-200` the strongest.

### 2. The dark surface

```css
--mh-ink: #0e1e1d;
```

If you change this, change `--mh-ink-raised`, `--mh-ink-elevated` and
`--mh-ink-border` with it — they are the same hue at four steps of lightness
and are used for raised panels, the secondary button and borders.

Also update the `themeColor` in `src/app/layout.tsx`, which is currently
`#08080b` and colours the browser chrome on mobile.

### 3. The beige

```css
--mh-beige: #f6f4f0;
```

One value, used by every light wrapper. Two derived tokens
(`--color-compare-band`, `--color-compare-cell`) `color-mix()` against it and
will follow automatically.

### 4. Check the contrast

The one thing that is easy to get wrong. `--mh-grey-mid` was moved from
`#808080` to `#707070` precisely because it failed AA on both the beige and
white at the sizes it carries. If you shift the beige or introduce new tints,
re-measure anything set on them — the pricing column heads, the billing toggle's
unselected side and the buy-template label all use that grey.

### 5. Do not forget the wipe

```css
--color-wipe-1: var(--mh-green);
--color-wipe-2: var(--mh-blue);
--color-wipe-3: var(--mh-peach);
--color-preloader: var(--mh-green-200);
```

These three cards are the only thing on screen for half a second during a
navigation. If they are still the old brand's colours, that half second is the
one moment your site looks like somebody else's.

---

## Typography

Two families, and which is which is **not a matter of taste**.

| Family | Token | Tailwind | Carries |
| --- | --- | --- | --- |
| **Almarai** | `--font-display`, `--font-body` | `font-display`, `font-body` | Headings and body copy |
| **Geist** | `--font-ui` | `font-ui` | Buttons, labels, navigation, **and every number on the site** |

A figure set in Almarai is a bug. Prices, statistics, dates, counters, salary
figures — all Geist, at whatever weight and size the context calls for.

Note that `--font-display` and `--font-body` both resolve to the *same* loaded
family. Almarai carries both roles in this design. They stay as two tokens so
that splitting them later is a one-line change.

`src/config/fonts.ts` is the only place a family is named. To swap one:

```ts
import { Almarai, Geist } from "next/font/google";
//     ^^^^^^^ change this, and the call below
```

Keep the `variable` names (`--font-display-family`, `--font-ui-family`) — the
whole theme reads them.

### The scale

Sizes interpolate with `clamp()` between the original's fixed per-breakpoint
values, solved so they land exactly on the design's numbers at 810px and
1200px rather than drifting past them.

| Token | Mobile → Desktop | Used by |
| --- | --- | --- |
| `--text-display-xl` | 36 → 48 → 60 | Hero h1, the about statement |
| `--text-display-lg` | 32 → 40 → 48 | Every other section heading |
| `--text-display-md` | 28 → 32 → 40 | Sub-section headings |
| `--text-quote` | 24 → 48 | Testimonial quotes |
| `--text-heading-lg` | 24 → 28 | Card headings |
| `--text-heading-md` | 20 → 22 | Small headings |
| `--text-heading-sm` | 18 | Flat |
| `--text-body-lg` | 18 | Flat |
| `--text-body-md` | 16 | Flat — the base |
| `--text-body-sm` | 14 | Flat |
| `--text-label` | 12 | Flat — eyebrows, labels |

And the figures, which are flat at every breakpoint because a phone shows one
panel at a time and the number has all the room it needs:

| Token | Size | Used by |
| --- | --- | --- |
| `--text-stat` | 100 | The trust panels' figures |
| `--text-stat-sm` | 56 | The pricing page's figures |
| `--text-stat-affix` | 50 | The prefix and unit either side |
| `--text-stat-unit` | 36 | A case study's result unit |
| `--text-meta` | 22 | A case study's meta row |
| `--text-fact` | 20 | A job page's facts card |

### Line height and tracking

| Token | Value | For |
| --- | --- | --- |
| `--leading-display` | 1 | Display headings |
| `--leading-heading` | 1.15 | All other headings |
| `--leading-body` | 1.75 | Body copy — marketing prose, spaced to be scanned |
| `--leading-card` | 1.75 | Card body copy |
| `--leading-prose` | 1.6 | Long-form: a job description, a testimonial beside a form |
| `--tracking-display` | -0.02em | Display headings |
| `--tracking-label` | 0.08em | Eyebrows and labels |
| `--tracking-quote` | -0.05em | The testimonial quote, tighter than any heading |

**No component sets its own line height.** That rule exists because one
paragraph carrying a literal is exactly how the paragraph beside it drifts a
step tighter, which is what happened here before `--leading-body` was made the
single decision.

---

## Spacing, layout and radii

| Token | Value | For |
| --- | --- | --- |
| `--container-max` | 75rem (1200px) | The standard column, matching the desktop breakpoint |
| `--container-max-wide` | 90rem | Full-bleed sections |
| `--container-gutter` | `clamp(1.25rem, 0.75rem + 2.5vw, 3.75rem)` | Side padding, 20 → 60px |
| `--header-height` | 5rem (80px) | Every hero's top padding derives from this |
| `--space-section-sm` | 48 → 80px | Tight sections |
| `--space-section-md` | 72 → 120px | The standard section rhythm |
| `--space-section-lg` | 96 → 160px | Openings and closings |

| Radius | Value | For |
| --- | --- | --- |
| `--radius-button` | 4px | Buttons — and form fields, which take the same |
| `--radius-input` | 4px | Fields |
| `--radius-icon` | 2px | The button's inset icon box |
| `--radius-sm` | 8px | Small blocks |
| `--radius-card` | 20px | Cards and panels |
| `--radius-lg` | 32px | Large panels |
| `--radius-pill` | 999px | Chips and toggles |

### Button widths

**267px from tablet up, full width on a phone** — `w-full tablet:w-[267px]`.
This is the site's call-to-action width and every page's primary button uses it.
It is a house rule, not a suggestion; a button at a different width reads as a
different button.

### Breakpoints

Three, matching the original exactly:

| Name | Range | Tailwind prefix |
| --- | --- | --- |
| mobile | ≤ 809.98px | *(none — the base)* |
| tablet | 810 – 1199.98px | `tablet:` |
| desktop | ≥ 1200px | `desktop:` |

These are **not** Tailwind's defaults. There is no `sm:`, `md:` or `lg:` here.

---

## Motion

The numbers behind every animation live in **`src/config/animation.ts`**, and
the curves in the motion block of `theme.css`. Both are heavily commented with
where each value came from.

| Curve | Value | For |
| --- | --- | --- |
| `--ease-reveal` | `cubic-bezier(0.7, 0, 0.3, 1)` | The per-word heading reveal |
| `--ease-in-out-soft` | `cubic-bezier(0.44, 0, 0.56, 1)` | Nav hover, arrow swap, photo fan |
| `--ease-nav-flip` | `cubic-bezier(0.8, 0, 0.2, 1)` | The header's scroll flip |
| `--ease-wipe` | `cubic-bezier(0.76, 0, 0.24, 1)` | The page wipe |
| `--ease-preload` | `cubic-bezier(0.3, 0, 0.7, 1)` | The preloader tiles |
| `--ease-button-spring` | a `linear()` ramp | The button hover sweep |

Two of these are `linear()` ramps rather than beziers, and that is deliberate:
`--ease-button-spring` is an overdamped physical spring whose two exponentials
differ in rate by a factor of 31, and `--ease-preload-word` is a spring with
genuine overshoot. Neither shape has a four-point bezier equivalent. If you
change their durations the ramp stretches in time, which is still the same
spring — only a change to the *shape* needs the stops regenerated.

> **`src/config/animation.ts` is partly locked.** The `pageWipe` and
> `preloader` blocks are hashed by `check-navigation-lock.mjs` and the build
> fails if they change. That is a stop, not a judgement — see
> [AGENTS.md](AGENTS.md#do-not-touch-what-moves-the-reader-between-pages).

### Reduced motion

Honoured throughout, in `globals.css` under
`@media (prefers-reduced-motion: reduce)`. The preloader decides *before the
body paints* whether to run at all, so a reader who asked for less motion never
sees the sheet flash.

---

## The surface system

The hardest part of this design to hold in your head, and the source of most
"my heading disappeared" bugs. Three separate mechanisms, easily confused.

### 1. `PageSurface` — what colour the header wears

Every page renders this as its first element:

```tsx
<PageSurface value="dark" />
```

| Value | Meaning | Pages |
| --- | --- | --- |
| `dark` | Dark from the header down; the strip never flips | Case studies, contact, 404 |
| `hero` | Dark opening, light below; flips once past the fold | Home, about, careers, blogs, legal pages |
| `beige` | The page's own beige runs to the top | Pricing |
| `light` | White throughout | Blog posts |

It renders a hidden marker, and `globals.css` styles the header from
`body:has([data-page-surface="…"])`. The header is fixed in the layout and is
neither the page's ancestor nor its sibling in any order CSS can walk, so this
is how it finds out.

A page that declares nothing gets the light strip on white — which is why a
dark page that forgets it comes out with a white header. `check-pages.mjs`
enforces exactly one valid declaration per page, reading the **built HTML**
rather than the source.

### 2. `data-bg` — what colour the page background crossfades to

Set on a section. Three values only:

```
white  ·  green  ·  beige
```

**`green` is the dark surface.** Anything else is ignored silently.

`BackgroundTransition.tsx` watches every `[data-bg]` section, works out which
one owns the most visible pixels, and crossfades `document.body` to it. This is
a different thing from `PageSurface` and not a substitute — one drives the
header, the other drives the background behind the page. Both are usually
needed.

`data-bg-keep` opts a section out: it paints its own fill and never crossfades.
A pinned section needs this, or you see straight through it.

### 3. The heading reveal — which ink it settles into

Headings animate in behind two sweeping bars and settle into a colour. **Which
colour depends on whether the section crossfades**, and getting it wrong makes
a heading *absent, not dim* — it reveals into the same colour as the ground
beneath it.

| The section's fill | Use |
| --- | --- |
| Crossfades with the page | `sectionTextRevealDynamic` |
| Keeps a dark fill (`data-bg-keep`) | `sectionTextRevealDark` |
| Keeps a light fill | `sectionTextReveal` |
| Beige | `sectionTextRevealBeige` |

`sectionTextRevealDynamic` resolves into `--color-fg-dynamic`, which follows
whichever section currently owns the viewport. Correct for a crossfading
section, wrong for one that paints itself.

> **Worse: whether it breaks depends on the window height.** A dark section's
> pixels count at two thirds in the ownership contest, so a dark block with a
> taller light section under it loses as soon as the window is tall enough. It
> will look fine on your screen and be invisible on someone else's. **Check a
> short window and a tall one.**

---

## Seeing the tokens

There is a scratch route at **`/dev/tokens`** that renders swatches and the type
scale on one page. It is `noindex` and excluded from the sitemap.

It was written early, against an earlier draft of the token names, and several
of the swatches it asks for no longer exist — `bg-subtle`, `accent-2`,
`accent-3` and `display-2xl` were all renamed or removed, so those tiles render
empty. Treat it as a scratch pad rather than a reference, and delete the route
if you would rather not ship it:

```
rm -rf src/app/\(site\)/dev
```

The reference is this document and `theme.css` itself.

---

## Before you change a dimension

> **Verify in a browser, not by arithmetic.**

Chromium is available and the project builds to a real server. When a change is
dimensional — a fixed box, a hover sequence, a font that has to fill a width —
build it, serve it and measure the rendered result. Reasoning about line heights
has been wrong in this codebase more than once.

```
npm run build && npx next start
```
