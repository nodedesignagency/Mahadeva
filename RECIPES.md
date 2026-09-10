# Recipes

How to make the changes you are actually going to want to make. Each one is
self-contained; work through it top to bottom and it is done.

Two files carry most of it: **`src/content/`** for words, **`src/styles/theme.css`**
for the look.

---

## Contents

**Branding** · [Rename the site](#rename-the-site) · [Change the brand colour](#change-the-brand-colour) · [Change a font](#change-a-font) · [Swap the logo](#swap-the-logo) · [Change the favicon and share card](#change-the-favicon-and-share-card)

**Content** · [Rewrite a page's copy](#rewrite-a-pages-copy) · [Change the menu](#change-the-menu) · [Change the footer](#change-the-footer) · [Add a job opening](#add-a-job-opening) · [Add a case study or post](#add-a-case-study-or-post) · [Replace an image](#replace-an-image) · [Re-colour a card](#re-colour-a-card)

**Structure** · [Add a page](#add-a-page) · [Add a section](#add-a-section) · [Remove a section](#remove-a-section) · [Reorder sections](#reorder-sections)

**Going live** · [Remove the Buy Template badge](#remove-the-buy-template-badge) · [Set the site URL](#set-the-site-url) · [Deploy](#deploy) · [Pre-launch checklist](#pre-launch-checklist)

**When something breaks** · [Troubleshooting](#troubleshooting)

---

# Branding

## Rename the site

`src/config/site.config.ts` — one file, and it feeds the page titles, the share
card, the JSON-LD and the sitemap.

```ts
export const siteConfig = {
  name: "Mahadeva",          // ← your name
  shortName: "Mahadeva",
  tagline: "AI & automation, built for teams that ship",
  description: "…",          // ← the default meta description
  contact: { email: "hello@example.com", phone: "", location: "" },
  twitterHandle: "",
};
```

Then search the content files for the old name, which appears inside actual
sentences and cannot be templated out:

```
grep -rn "Mahadeva" src/content/
```

You will find it in the careers headings, the impact figures, the footer
wordmark and the copyright line.

## Change the brand colour

Full walkthrough in [DESIGN.md](DESIGN.md#rebranding). The short version:

1. `--mh-green` in `src/styles/theme.css` is the accent.
2. Its family (`--mh-green-200` down to `--mh-green-25`) feeds the preloader,
   the CTA panel and the footer labels — retint those to match.
3. `--mh-ink` is the dark surface, `--mh-beige` the light one.
4. Check the page wipe (`--color-wipe-1/2/3`) — it is on screen alone for half
   a second during every navigation.

## Change a font

`src/config/fonts.ts` is the only place a family is named.

```ts
import { Almarai, Geist } from "next/font/google";

const displayFont = Almarai({           // ← headings and body
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-family",    // ← keep this name
  weight: ["300", "400", "700"],
});

const uiFont = Geist({                  // ← buttons, labels, all numbers
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui-family",         // ← keep this name
  weight: ["300", "400", "500"],
});
```

Swap the import and the call. **Keep the `variable` names** — the entire theme
reads them. Check the weights your new face actually ships; asking for a weight
that does not exist gets you a synthesised one.

Then look at the site, because a different face at the same size is a different
size. `--text-display-xl` and the heading clamps in `theme.css` are the knobs.

## Swap the logo

Two files in `public/uploads/logos/`:

| File | Shown on |
| --- | --- |
| `mahadeva-black.png` | Light headers |
| `mahadeva-white.png` | Dark headers |

You need both — the header crossfades between them as the surface flips.
Replace them at the same names and nothing else changes. Use different names and
update the two imports at the top of `src/components/layout/Header.tsx`.

The footer's oversized wordmark is **text**, not an image:
`footerContent.wordmark` in `src/content/footer.ts`.

## Change the favicon and share card

- **Favicon** — replace `src/app/favicon.ico`. Next.js requires it at exactly
  that path; it is the one asset that does not live in `public/uploads`.
- **Share card** — generated at build time by
  `src/app/opengraph-image.tsx` from your site name and tagline. Edit that file
  to change the design, or delete it and drop a static `opengraph-image.png` in
  `src/app/` instead.

---

# Content

## Rewrite a page's copy

Find the page in [CONTENT.md](CONTENT.md), open the file it names, edit the
strings. That is the whole job — no component needs touching.

The one rule: **`headingLines` is an array, one entry per visual line, and the
count matters.** The heading reveal animates line by line and the design expects
the break where it is.

```ts
headingLines:       ["Custom AI Solutions to", "Increase Revenue"],
headingLinesMobile: ["Custom AI Solutions", "to Increase Revenue"],
```

If a heading has a `Mobile` variant, change both.

## Change the menu

`src/config/navigation.ts`:

```ts
export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/case-study" },
  // …
];

export const navCta: NavItem = { label: "Contact Us", href: "/contact" };
```

`mainNav` is the header and drives the mobile overlay too. Five items is what
the design is spaced for; six still fits on a desktop, seven starts to crowd the
CTA.

`footerNav` in the same file is the footer's three link columns. The braces in
the titles (`"{Navigation}"`) are deliberate — they are part of the design's
label style, not a templating syntax.

## Change the footer

Split between two files:

| What | Where |
| --- | --- |
| The three link columns | `src/config/navigation.ts` → `footerNav` |
| The CTA panel above it | `src/content/footer.ts` → `footerContent.cta` |
| Email and phone | `src/content/footer.ts` → `footerContent.contact` |
| Copyright line | `src/content/footer.ts` → `footerContent.copyright` |
| **"Made by" credits** | `src/content/footer.ts` → `footerContent.credits` |
| The oversized wordmark | `src/content/footer.ts` → `footerContent.wordmark` |

The credits name the three people who built the template. Change or remove them
when the site becomes yours.

The CTA panel is site-wide — it appears above the footer on every page, so
editing it changes it everywhere.

## Add a job opening

`src/content/careers.ts`, in `openingsContent.roles`. Copy an existing entry and
change it. It needs a unique `slug`; the detail page at `/careers/<slug>` exists
the moment the entry does, and it is in the sitemap on the next build.

Openings are **not** in the CMS despite having detail pages.

## Add a case study or post

These *are* in the CMS. Open `/studio`, pick the workspace, create the document,
publish. It appears on the index and — for case studies — on the home page's
three, in the same build.

Without Sanity connected you are looking at the demo entries in
`src/content/case-studies.json` and `src/content/blog.json`. You can edit those
JSON files directly if you would rather never connect a CMS; the shape is the
same and the site cannot tell the difference. Connecting one is
[SETUP.md](SETUP.md).

For posts, a new **category** goes in `src/content/blogTerms.ts` and nowhere
else — the Studio dropdown and the filter chips are both built from that list.

## Replace an image

Drop the file into `public/uploads/images/` (or `icons/`, or `logos/`) and
update the import wherever it is used:

```tsx
import portrait from "@public/uploads/images/faq-portrait.avif";
```

Imports rather than paths, so a typo fails the build instead of showing a
visitor a broken image. Formats and sizes:
[public/uploads/README.md](public/uploads/README.md).

Lowercase, hyphens, no spaces — the filename ends up in the URL.

## Re-colour a card

The tint is content. Find the entry in `src/content/` and change its `tone`:

```ts
{ title: "Atlas Logistics", tone: "sky" }   // → "lavender", "peach", "mint", …
```

Valid tones are typed per family, so a wrong one is a compile error rather than
a blank card. The tokens behind them are in
[DESIGN.md](DESIGN.md#the-tint-families).

---

# Structure

## Add a page

Four steps, and the third is the one everybody forgets.

**1. Create `src/app/(site)/services/page.tsx`:**

```tsx
import { PageSurface } from "@/components/layout/PageSurface";
import { Section } from "@/components/layout/Section";
import { buildMetadata } from "@/config/seo";

export const metadata = buildMetadata({
  title: "Services",
  description: "What we do and how we do it.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      {/* MUST be the first element. See step 3. */}
      <PageSurface value="dark" />

      <Section spacing="lg" className="bg-bg text-fg" data-bg="green">
        <h1 className="font-display text-display-xl">Services</h1>
      </Section>
    </>
  );
}
```

Being inside `(site)` is what gives it the header, footer, smooth scroll,
background transition and page wipe. A page outside that group gets none of
them.

**2. Give every section a `data-bg`** — `white`, `green` or `beige`, and
remember `green` is the dark one. This drives the background crossfade.

**3. Declare the surface.** `<PageSurface value="…" />` as the first element.
This is not optional and it is not inferred: `npm run artifact` runs
`check-pages.mjs`, which walks the built HTML and fails if a page has no valid
declaration. Pick from [DESIGN.md](DESIGN.md#1-pagesurface--what-colour-the-header-wears).

**4. Add it to the two lists that are hand-kept:**

```ts
// src/config/navigation.ts — if it belongs in the menu
export const mainNav = [ …, { label: "Services", href: "/services" } ];

// src/app/sitemap.ts — the `fixed` array
{ url: `${base}/services`, changeFrequency: "monthly", priority: 0.8 },
```

Dynamic routes (studies, posts, roles) generate their own sitemap entries.
Static pages do not.

Then `npm run artifact`, which opens every route in the bundle and will tell you
if the new one does not arrive.

## Add a section

Sections are one file each in `src/components/sections/`, and they follow a
consistent shape:

```tsx
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealBeige } from "@/config/animation";
import type { myContent } from "@/content/home";

type MyProps = { content: typeof myContent };

export function MySection({ content }: MyProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light">
      <Container className="grid gap-12 desktop:grid-cols-2">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          lineStagger={sectionTextRevealBeige.lineStagger}
          className="text-display-lg leading-(--leading-display) tracking-(--tracking-display)"
        />
        <p className="font-body text-body-md">{content.subheading}</p>
      </Container>
    </section>
  );
}
```

Four things to get right:

| | |
| --- | --- |
| **`data-bg`** matches the fill | Or the background crossfades to the wrong colour |
| **The reveal variant** matches the fill | Or the heading is *invisible*, not dim — see below |
| Copy comes in as `content` | Never typed into the component |
| Width comes from `Container` | Sections must not add their own horizontal padding |

Then add the content export to the matching `src/content/*.ts` and render the
section in the page.

**Picking the reveal variant** — this is the one that bites:

| The section's fill | Use |
| --- | --- |
| Crossfades with the page | `sectionTextRevealDynamic` |
| Keeps a dark fill (`data-bg-keep`) | `sectionTextRevealDark` |
| Keeps a light fill | `sectionTextReveal` |
| Beige | `sectionTextRevealBeige` |

## Remove a section

Delete the line from the page's `page.tsx`. That is genuinely all — sections
carry their own spacing from the `--space-section-*` tokens, so the rhythm
closes up on its own with no margins left dangling.

Two things to check afterwards:

- **The surface still alternates sensibly.** If you removed the only white
  section between two dark ones, the page is now dark throughout and its
  `PageSurface` may want to change from `hero` to `dark`.
- **Nothing pinned lost its partner.** If the section you removed was the white
  one riding over a pinned dark opening, the pin now has nothing to hand over
  to — see [AGENTS.md](AGENTS.md#a-dark-opening-pins-when--and-only-when--white-follows-it).

The component file can stay where it is; an unused section costs nothing in the
bundle and you may want it back.

## Reorder sections

Move the lines in `page.tsx`. Spacing is token-driven, so nothing needs
adjusting.

The one constraint: a `<div data-scroll-stack>` wrapper is a pinned pair — the
dark opening and the light section that rides over it. Move one out of the
wrapper and the effect breaks. On the home page that is `Hero` + `About`.

---

# Going live

## Remove the Buy Template badge

`src/config/site.config.ts`:

```ts
template: {
  show: false,        // ← this
  …
},
```

The floating badge in the bottom-right corner disappears everywhere.

## Set the site URL

```
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

No trailing slash. This drives the canonical URLs, the sitemap and the share
card. **Unset, all three say `mahadeva.example.com`** — which is fine locally
and is not fine live.

## Deploy

Anywhere that runs Next.js 16. Vercel is one click:

1. Push the repo to GitHub.
2. Import it at vercel.com — the framework is detected, no build settings to
   change.
3. Add your environment variables in **Settings → Environment Variables**:
   `NEXT_PUBLIC_SITE_URL`, and if you connected them,
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and the two form endpoints.
4. Deploy.

If you connected Sanity, add your live domain to its CORS list or the Studio
will load and then fail every request:

```
npx sanity cors add https://your-domain.com --credentials
```

## Pre-launch checklist

```
□ NEXT_PUBLIC_SITE_URL set to the real domain
□ site.config.ts — name, tagline, description, contact email
□ template.show set to false
□ Footer credits changed or removed
□ Footer email and phone are real
□ Legal pages rewritten — they ship as placeholders
□ Logos replaced (both black and white)
□ Favicon replaced
□ Form endpoints set, and a test message actually received
□ Sanity CORS includes the live domain
□ npm run lint passes
□ npm run artifact passes — opens every route
□ Checked on a phone, and in a short browser window as well as a tall one
```

That last one is not padding. A dark section's ownership of the viewport
depends on the window height, and a heading can be perfectly visible on your
screen and invisible on someone else's.

---

# Troubleshooting

## The header is white on a dark page

The page is missing `<PageSurface value="dark" />`, or it is not the first
element. A page that declares nothing gets the light strip.

## A heading is completely missing

Not dim — *absent*. The reveal settled into the same colour as the ground under
it. The section's fill and its reveal variant disagree; see the table in
[Add a section](#add-a-section).

Check both a short window and a tall one, because whether it happens depends on
the viewport height.

## A Tailwind class does nothing at all

Three causes, in order of likelihood:

1. **The token is not in `@theme inline`.** A `--color-*` must be declared
   twice — once in the semantic block, once in the re-export block at the
   bottom of `theme.css`. Tailwind generates a utility only for what is in
   `@theme`, and an unknown class compiles to nothing with no warning.
2. **The class was assembled from a variable** — `` `top-[${x}]` ``. Tailwind
   scans source text, so a class that only exists at runtime is invisible to
   it. Write both halves out, or use a `style` prop.
3. **Square brackets where parentheses belong.** `prop-[--token]` compiles to an
   invalid declaration; it is `prop-(--token)`. `npm run lint` fails on this.

## The background is the wrong colour

`data-bg` takes `white`, `green` or `beige` **only**, and `green` is the dark
surface. Anything else — including `"dark"` — is ignored silently.

## The build fails on a guard

```
npm run lint  →  check-navigation-lock.mjs failed
```

You changed a file that moves the reader between pages. If you did not mean to:

```
git checkout -- <file>
```

If you did mean to, prove it still works and re-record the lock:

```
npm run artifact          # opens all 26 routes in the bundle
npm run bless-navigation
```

`bless-navigation` refuses to record while any route fails to open. **Do not
edit a guard to agree with you** — each one exists because something shipped
broken once. See [AGENTS.md](AGENTS.md#do-not-touch-what-moves-the-reader-between-pages).

## A page works locally but hangs in the artifact bundle

A known and specific failure, documented at length in
[AGENTS.md](AGENTS.md#a-route-can-be-alive-on-the-site-and-dead-in-the-bundle).
Suspect what the route's payload asks the module loader for, not what the page
renders — stripping the page's content will not change it.

## The Studio loads then fails every request

Sanity CORS. The error does not mention CORS, which is why this is the most
common setup mistake:

```
npx sanity cors add http://localhost:3000 --credentials
```

## A form submits but nothing arrives

No endpoint is set. Unset, the form validates, shows its sent state and throws
the message away — fine for looking around, not fine live. Set
`NEXT_PUBLIC_CONTACT_ENDPOINT` and `NEXT_PUBLIC_CAREERS_ENDPOINT`; see
[SETUP.md](SETUP.md#making-the-forms-work).
