/**
 * Guards the two transition regressions that have actually happened.
 *
 * Both were invisible to every other check: the types were fine, the build was
 * green, the lint passed, and the site rendered. Each was found by a reader
 * watching the screen and reporting it, twice, days apart. That is the case a
 * test exists for.
 *
 * Run by `npm run lint`, so it fails the build rather than the page.
 */

import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const failures = [];

/**
 * 1. The wipe runs to the home page.
 *
 * It was once skipped there, on the reasoning that the preloader covers the
 * screen anyway. What the reader sees instead is a link that does nothing and
 * then a preloader from nowhere — no handover at all, where every other link
 * on the site has one. The wipe covers, the preloader takes the covered screen
 * and does the uncovering; that is the sequence, and it needs both halves.
 */
{
  const src = read("src/components/motion/PageTransition.tsx");
  const skips = /if\s*\(\s*url\.pathname\s*===\s*["']\/["']\s*\)\s*return/.test(src);
  if (skips) {
    failures.push(
      "PageTransition skips the wipe for the home page.\n" +
        "    Going home then jumps straight to the preloader with no transition,\n" +
        "    which is what it looked like before and was reported as broken.\n" +
        "    The handover is: wipe covers -> preloader uncovers. Keep both.",
    );
  }

  /* And the other half of that handover. Arriving home, the cards are dropped
     under the preloader's sheet rather than swept off over it — sweeping is
     what made the sequence read as stopping half way. */
  const dropsUnderSheet =
    /pathname\s*===\s*["']\/["']/.test(src) &&
    /delete\s+document\.documentElement\.dataset\.wipe/.test(src);
  if (!dropsUnderSheet) {
    failures.push(
      "PageTransition no longer drops the wipe cards on arrival at the home page.\n" +
        "    They will sweep off over the preloader's sheet, which reads as the\n" +
        "    transition stopping half way and something else taking over.",
    );
  }
}

/**
 * 2. The artifact keeps the wipe.
 *
 * The bundler once hid `.mh-wipe` to stop a stalled navigation painting the
 * screen one flat colour. It cured the symptom by removing the animation from
 * the preview, which is the thing the preview exists to show.
 */
{
  const src = read("scripts/build-artifact.mjs");
  if (/\.mh-wipe\s*\{[^}]*display\s*:\s*none/.test(src)) {
    failures.push(
      "build-artifact.mjs hides the page wipe.\n" +
        "    The artifact is how the site's motion gets looked at; a preview\n" +
        "    without the transition is not a preview of this site.",
    );
  }
}

if (failures.length) {
  console.error("\n  Transition guard failed:\n");
  for (const f of failures) console.error("  - " + f + "\n");
  process.exit(1);
}
