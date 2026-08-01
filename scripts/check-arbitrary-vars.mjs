#!/usr/bin/env node
/**
 * Guards against `prop-[--token]` — Tailwind v4's bracket syntax requires a
 * complete CSS value, so a bare custom-property name silently compiles to an
 * invalid declaration and the browser drops it. The fix is the var()-shorthand
 * form, `prop-(--token)`.
 *
 * This class of bug is invisible to every other check in this project: tsc
 * doesn't parse Tailwind classes, and grepping rendered HTML only confirms the
 * class name is present, not that it resolves to anything once parsed. It
 * shipped silently across the whole codebase for exactly that reason. Run as
 * part of `npm run lint`.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// git pathspec has no brace expansion — "*.{ts,tsx,css}" matches literally and
// silently returns nothing, which is exactly the kind of "looks fine, does
// nothing" failure this script exists to catch elsewhere. List each extension.
const files = execSync(
  'git ls-files "src/**/*.ts" "src/**/*.tsx" "src/**/*.css"',
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);

const pattern = /-\[(--[a-zA-Z0-9-]+)\]/g;
let failures = 0;

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const match of line.matchAll(pattern)) {
      failures += 1;
      console.error(
        `${file}:${i + 1}: bare custom property in brackets — ` +
          `\`${match[0]}\` compiles to an invalid CSS value. ` +
          `Use \`-(${match[1]})\` instead.`,
      );
    }
  });
}

if (failures > 0) {
  console.error(`\n${failures} arbitrary-value violation(s) found.`);
  process.exit(1);
}
