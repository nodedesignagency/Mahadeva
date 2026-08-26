/**
 * Every page declares its surface, checked on what it actually renders.
 *
 * The header is fixed in the root layout, above every page, and has to wear
 * the surface of whichever page is under it. It cannot work that out for
 * itself — it is neither a page's ancestor nor its sibling in any order CSS
 * can walk — so each page says what it is with `<PageSurface value="…" />`
 * and `globals.css` selects on `body:has([data-page-surface="…"])`.
 *
 * A page that forgets gets the light strip on white, which over a dark page is
 * a white band across the top of it. Nothing crashes and no build notices; it
 * is simply wrong until somebody looks.
 *
 * This reads the built HTML rather than the source on purpose. A page is free
 * to declare its surface through whatever it renders — the 404 and both legal
 * pages do it inside the view component they share, which is right, and a
 * check that grepped `page.tsx` would call all three broken. What matters is
 * that the marker is in the document.
 *
 * Run by `npm run artifact`, after the build, so a new page cannot ship
 * without one.
 */

import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const APP = path.join(root, ".next", "server", "app");
const VALUES = ["dark", "hero", "beige", "light"];

if (!fs.existsSync(APP)) {
  console.error("\n  Page surface check: no build found. Run `next build` first.\n");
  process.exit(1);
}

/* Not pages of the site: Next's own error documents, the Studio, and the
   token scratch route. See "The Studio is not a page of the site". */
const skip = (rel) =>
  rel.startsWith("_") ||
  rel.startsWith("studio") ||
  rel.startsWith(path.join("dev", "")) ||
  rel === "index.html" && false;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const failures = [];
let checked = 0;

for (const file of walk(APP)) {
  const rel = path.relative(APP, file);
  if (skip(rel)) continue;

  const html = fs.readFileSync(file, "utf8");
  const found = [...html.matchAll(/data-page-surface="([a-z]*)"/g)].map((m) => m[1]);
  const route = "/" + rel.replace(/\.html$/, "").replace(/^index$/, "");
  checked++;

  if (!found.length) {
    failures.push(
      `${route}\n` +
        "      renders no page surface. Without one the fixed header takes the\n" +
        "      light strip on white, which over a dark page is a white band\n" +
        "      across the top of it.",
    );
    continue;
  }
  const bad = found.filter((v) => !VALUES.includes(v));
  if (bad.length) {
    failures.push(`${route}\n      declares ${bad.map((v) => `"${v}"`).join(", ")}, which is not one of ${VALUES.join(", ")}.`);
  }
  if (new Set(found).size > 1) {
    failures.push(`${route}\n      declares more than one surface (${[...new Set(found)].join(", ")}). The strip can only wear one.`);
  }
}

if (failures.length) {
  console.error("\n  Page surface check failed:\n");
  for (const f of failures) console.error("  - " + f + "\n");
  console.error(
    "  Which value to use is in AGENTS.md, under \"Every page declares its\n" +
      "  surface\": dark for a page dark the whole way down, hero for a dark\n" +
      "  opening with light under it, beige where the page's own beige runs to\n" +
      "  the top, light for white throughout.\n",
  );
  process.exit(1);
}

console.log(`  Page surface check: ${checked} pages, every one declares its surface.`);
