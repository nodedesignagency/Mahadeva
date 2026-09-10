# Mahadeva

An AI and automation agency website. Thirteen page types, a CMS for the case
studies and the blog, and the motion design carried over intact from the
original — the page wipe, the preloader, the per-word heading reveals and the
background that changes colour as you scroll.

Built on Next.js 16 (App Router), React 19, Tailwind v4 and Sanity.

---

## Run it

```
npm install
npm run dev
```

Open <http://localhost:3000>. **Nothing else is required** — no account, no API
key, no `.env` file. The site ships with demo case studies, demo blog posts and
demo job openings built in, so what you see on the first run is the finished
design with real content in it.

Needs Node 20.9 or newer, which is Next.js 16's floor.

Connect the CMS when you want to edit that content yourself, and add a form
endpoint when you want the contact form to actually send. Both are in
[SETUP.md](SETUP.md) and both are optional until you go live.

---

## What you get

| Route | What it is |
| --- | --- |
| `/` | Home — hero, about, features, case studies, stats, tech stack, testimonials, before/after, pricing, FAQ |
| `/about` | Mission, principles, the agency, the team |
| `/case-study` | Index of every published study |
| `/case-study/[slug]` | One study — challenge, solution, results, gallery |
| `/pricing` | Plans, impact figures, a comparison table, FAQ |
| `/careers` | Openings, benefits, hiring process |
| `/careers/[slug]` | One role, with an application form |
| `/blogs` | Post index, filterable by category and tone |
| `/blogs/[slug]` | One post |
| `/contact` | The contact form |
| `/legal-pages/privacy-policy` | Privacy policy |
| `/legal-pages/terms-of-services` | Terms |
| `/404` | The not-found page, also reachable as a real route so you can look at it |
| `/studio` | The CMS, served from inside the site |

Plus `sitemap.xml`, `robots.txt` and a generated share card, all of which read
your site URL from one place.

---

## Making it yours

In the order that gets you a site you recognise fastest. Each step stands
alone — stop wherever you like and everything still works.

| # | What | Where | Doc |
| --- | --- | --- | --- |
| 1 | Name, URL, contact email | `src/config/site.config.ts` | [RECIPES](RECIPES.md#rename-the-site) |
| 2 | Every word on every page | `src/content/*.ts` | [CONTENT](CONTENT.md) |
| 3 | Brand colour, fonts | `src/styles/theme.css`, `src/config/fonts.ts` | [DESIGN](DESIGN.md#rebranding) |
| 4 | Logos, photography, icons | `public/uploads/` | [uploads README](public/uploads/README.md) |
| 5 | Menu and footer links | `src/config/navigation.ts`, `src/content/footer.ts` | [RECIPES](RECIPES.md#change-the-menu) |
| 6 | Make the forms send | `.env.local` | [SETUP](SETUP.md#making-the-forms-work) |
| 7 | Connect the CMS | `.env.local` + Sanity | [SETUP](SETUP.md) |
| 8 | Remove the "Buy Template" badge | `src/config/site.config.ts` → `template.show: false` | [RECIPES](RECIPES.md#remove-the-buy-template-badge) |

---

## Where everything is

```
src/
  app/
    layout.tsx           the document — fonts and metadata, nothing else
    (site)/              every page a visitor sees; wears the site's chrome
    studio/              the CMS, deliberately outside (site)
    sitemap.ts robots.ts opengraph-image.tsx
  components/
    layout/              header, footer, container, page surface, chrome
    sections/            one file per section of the site — Hero, Pricing, Team…
    ui/                  buttons, cards, fields, icons, typography
    motion/              the wipe, preloader, reveals, parallax, scramble
  content/               EVERY WORD on the site that isn't in the CMS
  config/                site name, navigation, fonts, SEO, animation numbers
  styles/theme.css       EVERY COLOUR, SIZE, DURATION AND CURVE
  lib/                   data fetching, helpers
public/uploads/          every image, icon and logo
sanity/schema/           the CMS fields
scripts/                 the build guards — see AGENTS.md
```

Two files carry almost everything you will want to change: **`src/content/`**
for the words and **`src/styles/theme.css`** for the look. No component
hardcodes a colour, a size, a duration or a curve.

---

## The documentation

| File | Answers |
| --- | --- |
| **README.md** | You are here. What this is and where to start. |
| **[CONTENT.md](CONTENT.md)** | "Where does *that* sentence come from?" Every page mapped to the file that produces it. |
| **[DESIGN.md](DESIGN.md)** | The design system — colour, type, spacing, motion — and how to rebrand without breaking it. |
| **[RECIPES.md](RECIPES.md)** | How to do the twenty things you will actually want to do. Add a page, remove a section, change a font. |
| **[SETUP.md](SETUP.md)** | Connecting Sanity, and making the two forms send. |
| **[AGENTS.md](AGENTS.md)** | The rules of the codebase. Read before changing code; an AI agent reads it automatically. |
| **[public/uploads/README.md](public/uploads/README.md)** | Where artwork goes and what format it should be in. |

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint **plus three guards** that fail the build on the mistakes this codebase has actually made |
| `npm run artifact` | Bundle every route into one HTML file, then open all of them to prove they work |
| `npm run seed` | Copy the demo content into your own Sanity project (once, during setup) |
| `npm run bless-navigation` | Re-record the navigation lock after a deliberate change to the page transition |

`npm run lint` is not just a linter here. It runs
`check-arbitrary-vars`, `check-transitions` and `check-navigation-lock`, which
between them catch a class of bug that is invisible in the browser until a
visitor hits it. **If one fails, fix the code rather than the guard** — each
exists because something shipped broken once.

---

## Three things that will bite you

The full list is in [AGENTS.md](AGENTS.md). These are the three that catch
everyone.

**1. Every page must declare its surface.** The header is fixed above every
page and cannot work out what colour to be. So each page renders
`<PageSurface value="dark|hero|beige|light" />` as its first element. Forget it
on a dark page and you get a white header over it.

**2. A new colour has to be declared twice.** Once in the semantic block of
`theme.css`, then again in the `@theme inline` block at the bottom. Tailwind
only generates a utility for what is in `@theme`, and a class it has never
heard of compiles to *nothing at all* — no error, no warning, an element with
no fill. See [DESIGN.md](DESIGN.md#adding-a-colour).

**3. `data-bg` takes `white`, `green` or `beige` — and `green` is the dark
one.** The whole palette is built on that green. Anything else is ignored
silently.

---

## Working with an AI agent

This project is set up for it. `CLAUDE.md` points at `AGENTS.md`, so Claude
Code — and any agent that reads either convention — picks up the house rules
the moment it opens the folder. Between `AGENTS.md`, `CONTENT.md`, `DESIGN.md`
and `RECIPES.md` an agent has the map, the rules and the recipes without you
having to explain the codebase first.

Things that work well as a single instruction:

> Change the brand colour from green to indigo. Read DESIGN.md first.

> Rewrite the home page hero and about copy for a fintech consultancy.
> The words are in src/content/home.ts.

> Add a Services page with three sections, following the pattern in RECIPES.md.

The one thing to tell it, if it starts somewhere unexpected: **the words are in
`src/content/`, the look is in `src/styles/theme.css`.** Almost every request
lands in one of those two.
