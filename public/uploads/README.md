# Uploads

Drop artwork here and it is in the project. Nothing else is needed from you —
tell me what each file is for and I will wire it in.

## How to upload

On GitHub, open this folder and use **Add file → Upload files**. Drag as many
as you like, then **Commit changes** — pick the branch you were given rather
than `main` if you are asked.

## Where things go

| Folder | What belongs in it |
| --- | --- |
| `logos/` | Client marks for the strip under "Why Top Companies Trust Us" |
| `icons/` | Interface icons — arrows, ticks, crosses, anything small and flat |
| `images/` | Everything else — photography, screenshots, illustration |

## What to send

- **Logos**: SVG if you have it. Failing that, PNG on a transparent background,
  at least 280px wide. One mark per file, trimmed so there is no built-in
  padding — the strip supplies its own spacing.
- **Icons**: SVG, and monochrome if the icon is meant to take the colour of the
  text beside it — I can then paint it from the theme, so it turns dark on the
  light sections and light on the dark ones by itself. A coloured PNG can only
  ever be the one colour it was exported at.
- **Photography and screenshots**: JPG or PNG, at least twice the size it will
  appear on screen. Don't compress them first; the build does that, and it
  cannot recover detail already thrown away.
- **Names**: lowercase, hyphens, no spaces — `acme-corp.svg`, not
  `Acme Corp (final v2).svg`. The name ends up in the URL.

Anything already in a Figma file can come straight from its export panel; the
defaults there are fine.

## What happens next

Files stay where you put them. This is the one home for artwork in the project
— nothing moves out of here once it is in use, so a file you uploaded is at the
path you uploaded it to, for good.

Being in `public/` they are also served as-is, at `/uploads/logos/acme.svg` and
so on, which is what a favicon or an OG image needs. But a file used on a page
is *imported* rather than linked, through the `@public/` alias:

```tsx
import acme from "@public/uploads/logos/acme.svg";
```

That hands it to the build, which sizes it, converts it, and hashes the
filename for caching, and it means a typo in the path fails the build instead
of showing a broken image to a visitor.

The one exception is the favicon, which Next.js requires at
`src/app/favicon.ico` and serves from there.
