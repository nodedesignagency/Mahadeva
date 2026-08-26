/**
 * Locks the machinery that moves a reader from one page to the next.
 *
 * Everything listed below is working and has been verified working. It is also
 * the part of this codebase that has broken the most, always as a side effect
 * of a change aimed at something else, and always in a way no type, no lint
 * and no build noticed: the wipe covering the screen and never lifting, the
 * preloader arriving with no join, a route that fetches its payload and simply
 * stops. Each cost a day and shipped to a reader first.
 *
 * So it does not get edited casually. This hashes those files and fails the
 * build when one of them changes. It is not a correctness check — it makes no
 * claim about whether the new version is better — it is a stop, so that
 * touching this needs a decision instead of happening by accident.
 *
 *   npm run lint            fails if any of it changed
 *   npm run bless-navigation  re-records the hashes, and refuses unless the
 *                             artifact's 26 routes all still open
 *
 * That second command is the whole point of the first. Changing this is
 * allowed; changing it without opening every page afterwards is not.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.join(import.meta.dirname, "..");
const LOCKFILE = path.join(root, "scripts", "navigation.lock.json");

/**
 * Whole files, because in each of these the navigation is the file's job and
 * there is no part of it that is incidental.
 */
const FILES = [
  // The wipe: the click handler, the state machine, and the rescue.
  "src/components/motion/PageTransition.tsx",
  // The preloader, and its handover with the wipe.
  "src/components/motion/Preloader.tsx",
  // Mount order. The wipe has to be above the sheet, and both above the page.
  "src/components/layout/SiteChrome.tsx",
  // The bundle's router: the fetch shim, the frozen address, and the chunk
  // lists it strips. /pricing hung for days on the last of those.
  "scripts/build-artifact.mjs",
  // The checks themselves, so a failing one cannot be quietly softened.
  "scripts/check-artifact-routes.mjs",
  "scripts/check-transitions.mjs",
  "scripts/check-pages.mjs",
];

/**
 * Named regions, for files that carry a great deal besides. Only the numbers
 * the transition runs on are locked; the rest of `animation.ts` is ordinary
 * work and stays editable.
 */
const REGIONS = [
  ["src/config/animation.ts", "pageWipe", /export const pageWipe = \{[\s\S]*?\n\} as const;/],
  ["src/config/animation.ts", "preloader", /export const preloader = \{[\s\S]*?\n\} as const;/],
];

const digest = (text) => crypto.createHash("sha256").update(text, "utf8").digest("hex").slice(0, 32);

function current() {
  const out = {};
  for (const rel of FILES) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) throw new Error(`navigation lock: ${rel} is missing`);
    out[rel] = digest(fs.readFileSync(file, "utf8"));
  }
  for (const [rel, name, pattern] of REGIONS) {
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    const found = text.match(pattern);
    if (!found) throw new Error(`navigation lock: could not find ${name} in ${rel}`);
    out[`${rel}#${name}`] = digest(found[0]);
  }
  return out;
}

const bless = process.argv.includes("--bless");
const now = current();

if (bless) {
  /* Re-recording the hashes is only allowed once the bundle has been rebuilt
     and every route in it opened. Otherwise this becomes a way to make the
     stop go away, which is worse than not having it. */
  console.log("  Re-checking every route in the artifact before blessing…\n");
  try {
    execFileSync(process.execPath, [path.join(root, "scripts", "check-artifact-routes.mjs")], {
      stdio: "inherit",
    });
  } catch {
    console.error(
      "\n  Refusing to bless: the artifact's routes do not all open.\n" +
        "  Run `npm run artifact`, fix what it reports, then try again.\n",
    );
    process.exit(1);
  }
  fs.writeFileSync(LOCKFILE, JSON.stringify(now, null, 2) + "\n");
  console.log("\n  Navigation lock re-recorded. Commit scripts/navigation.lock.json.\n");
  process.exit(0);
}

if (!fs.existsSync(LOCKFILE)) {
  console.error(
    "\n  Navigation lock: scripts/navigation.lock.json is missing.\n" +
      "  Run `npm run bless-navigation` to record it.\n",
  );
  process.exit(1);
}

const recorded = JSON.parse(fs.readFileSync(LOCKFILE, "utf8"));
const changed = Object.keys(now).filter((k) => recorded[k] !== now[k]);
const added = Object.keys(now).filter((k) => !(k in recorded));
const removed = Object.keys(recorded).filter((k) => !(k in now));

if (changed.length || added.length || removed.length) {
  console.error("\n  Navigation lock: the page-to-page machinery has been changed.\n");
  for (const k of changed) console.error(`  - ${k}`);
  for (const k of added) console.error(`  - ${k} (newly locked)`);
  for (const k of removed) console.error(`  - ${k} (no longer present)`);
  console.error(
    "\n  This is the part that moves a reader between pages, and it is working.\n" +
      "  It has broken more often than anything else here, every time as a side\n" +
      "  effect of a change meant for something else, and every time invisibly:\n" +
      "  the types were fine, the build was green, and a page would not open.\n" +
      "\n" +
      "  If the change was accidental, put it back: `git checkout -- <file>`.\n" +
      "\n" +
      "  If it was deliberate, prove it still works and record it:\n" +
      "      npm run artifact          # rebuilds and opens all 26 routes\n" +
      "      npm run bless-navigation  # re-records the lock\n" +
      "\n" +
      "  See AGENTS.md, \"Do not touch what moves the reader between pages\".\n",
  );
  process.exit(1);
}

console.log(`  Navigation lock: ${Object.keys(now).length} files and regions unchanged.`);
