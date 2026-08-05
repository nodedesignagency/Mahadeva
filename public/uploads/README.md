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

Files here are served as-is. Once one is actually used on the page I move it to
`src/assets/`, where the build sizes it, converts it, and hashes the filename
for caching — so don't be surprised when a file you uploaded moves. If a file
is only ever referenced by a fixed URL (a favicon, an OG image, something a
third party fetches), it stays here.
