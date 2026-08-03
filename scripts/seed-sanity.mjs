/**
 * Push the demo case studies into a freshly created Sanity dataset.
 *
 * The schema travels as code, so a new project already has the right fields.
 * The documents do not — they live in whichever project created them — which is
 * what this fixes. Without it a buyer's first run shows the design with nothing
 * in it.
 *
 * Reads the same content file the site falls back to, so the seeded documents
 * and the pre-setup demo are the same words by construction and cannot drift.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=... SANITY_WRITE_TOKEN=... npm run seed
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Read .env.local by hand rather than adding a dependency for six lines. Only
// KEY=value, which is all this file ever holds.
try {
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local — the values may be in the environment already.
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "\nMissing configuration.\n\n" +
      "  NEXT_PUBLIC_SANITY_PROJECT_ID  the project ID from sanity.io/manage\n" +
      "  SANITY_WRITE_TOKEN             a token with Editor permissions\n\n" +
      "Both go in .env.local. See SETUP.md, step 5.\n",
  );
  process.exit(1);
}

// The same records the site falls back to before a CMS exists, so what gets
// seeded and what a fresh clone shows are the same words.
const studies = JSON.parse(
  readFileSync(join(root, "src/content/case-studies.json"), "utf8"),
);

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

console.log(`Seeding ${studies.length} case studies into ${projectId}/${dataset}…`);

const transaction = client.transaction();

studies.forEach((study, index) => {
  // A deterministic ID means running this twice updates rather than duplicates,
  // so a buyer who reruns it after a mistake does not end up with six cards.
  transaction.createOrReplace({
    _id: `caseStudy-${study.slug}`,
    _type: "caseStudy",
    title: study.title,
    slug: { _type: "slug", current: study.slug },
    client: study.client,
    year: study.year,
    summary: study.summary,
    stats: study.stats.map((stat, i) => ({
      _type: "stat",
      _key: `stat-${i}`,
      label: stat.label,
      value: stat.value,
    })),
    tone: study.tone,
    order: index,
  });
});

try {
  await transaction.commit();
  console.log(
    "\nDone. Open /studio to edit them.\n\n" +
      "Screenshots are not seeded — upload one per case study in the Studio.\n",
  );
} catch (error) {
  console.error("\nSeeding failed:", error.message);
  console.error(
    "\nIf this says the dataset does not exist, create it first:\n" +
      "  npx sanity dataset create production\n",
  );
  process.exit(1);
}
