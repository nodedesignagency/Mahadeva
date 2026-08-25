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

  /* And the other half of that handover: the sweep has to run in full. The
     preloader's sheet is up behind the cards, so the sweep is what uncovers
     it — cut it short and the preloader appears from nowhere again, which is
     the same complaint by another route. */
  const cutsTheSweepShort =
    /pathname\s*===\s*["']\/["'][\s\S]{0,200}delete\s+document\.documentElement\.dataset\.wipe/.test(
      src,
    );
  if (cutsTheSweepShort) {
    failures.push(
      "PageTransition drops the wipe cards instead of sweeping them on arrival home.\n" +
        "    The sweep is what uncovers the preloader's sheet. Without it the wipe\n" +
        "    only half plays and the preloader arrives unannounced.",
    );
  }
}

/**
 * 2. The wipe sits above the preloader's sheet.
 *
 * The sheet goes up while the cards are still covering, so whichever of the
 * two is on top decides whether the sweep is seen at all. Under the sheet it
 * happens out of sight and the wipe reads as playing half way before the
 * preloader takes over — which is exactly how it was reported, twice, and it
 * is invisible to every other check because both animations are running
 * correctly. Only the order is wrong.
 */
{
  const wipe = read("src/components/motion/PageTransition.tsx").match(/z-\[(\d+)\]/);
  const sheet = read("src/components/motion/Preloader.tsx").match(/z-\[(\d+)\]/);
  if (!wipe || !sheet) {
    failures.push(
      "Could not find the z-index on the wipe or the preloader's sheet.\n" +
        "    Their order is load-bearing — see the note in PageTransition.",
    );
  } else if (Number(wipe[1]) <= Number(sheet[1])) {
    failures.push(
      `The wipe (z-${wipe[1]}) is not above the preloader's sheet (z-${sheet[1]}).\n` +
        "    The sheet is up before the cards sweep, so underneath it the sweep\n" +
        "    is never seen: the wipe plays half and the preloader appears to\n" +
        "    interrupt it. The cards have to sweep off the sheet, not under it.",
    );
  }
}

/**
 * 3. The artifact keeps the wipe.
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
