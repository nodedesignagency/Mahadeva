/**
 * Push the demo content into a buyer's freshly created Sanity datasets.
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
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split(
    "\n",
  )) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local — the values may be in the environment already.
}

/**
 * Which of the two to write. Both by default, or one by name:
 *
 *   npm run seed            both
 *   npm run seed -- blog    the posts only
 *
 * Worth having because seeding is `createOrReplace` against fixed IDs, which
 * is what makes a rerun safe after a mistake — and also what would put the
 * demo case studies back over a set someone has since edited. Adding the blog
 * to a project that has been live for a while should not cost them that.
 */
const target = process.argv[2];
if (target && target !== "blog" && target !== "production") {
  console.error(`\nUnknown target "${target}". Use "blog", "production", or nothing for both.\n`);
  process.exit(1);
}
const wants = (which) => !target || target === which;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const blogDataset = process.env.NEXT_PUBLIC_SANITY_BLOG_DATASET ?? "blog";
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
const read = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));
const studies = read("src/content/case-studies.json");
const posts = read("src/content/blog.json");

const clientFor = (name) =>
  createClient({
    projectId,
    dataset: name,
    token,
    apiVersion: "2024-10-01",
    useCdn: false,
  });

if (wants("production")) {
  console.log(`Seeding ${studies.length} case studies into ${projectId}/${dataset}…`);
}

const transaction = clientFor(dataset).transaction();

studies.forEach((study, index) => {
  // A deterministic ID means running this twice updates rather than duplicates,
  // so a buyer who reruns it after a mistake does not end up with six cards.
  transaction.createOrReplace({
    _id: `caseStudy-${study.slug}`,
    _type: "caseStudy",
    title: study.title,
    titleLines: study.titleLines,
    titleLinesMobile: study.titleLinesMobile,
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
    // The detail page's fields. Optional in the schema, so a study seeded
    // without them still opens — the page draws what it has.
    timeline: study.timeline,
    services: study.services,
    liveUrl: study.liveUrl,
    challenge: study.challenge,
    solution: study.solution,
    order: index,
  });
});

/**
 * The posts, into their own dataset.
 *
 * A second transaction on a second client rather than one on both: a
 * transaction belongs to a dataset, and these are two. It also means a buyer
 * who has created only one of the two datasets gets the half that can be
 * written and a clear message about the other, rather than neither.
 */
if (wants("blog")) {
  console.log(`Seeding ${posts.length} posts into ${projectId}/${blogDataset}…`);
}

const blogTransaction = clientFor(blogDataset).transaction();

posts.forEach((post) => {
  blogTransaction.createOrReplace({
    _id: `post-${post.slug}`,
    _type: "post",
    title: post.title,
    slug: { _type: "slug", current: post.slug },
    summary: post.summary,
    category: post.category,
    tone: post.tone,
    published: post.published,
    date: post.date,
    author: { name: post.author.name },
    body: post.body.map((section, i) => ({
      _type: "section",
      _key: `section-${i}`,
      heading: section.heading,
      paragraphs: section.paragraphs,
    })),
  });
});

/** Which dataset a failure was about, so the advice can name the right one. */
async function commit(transaction, name, what) {
  try {
    await transaction.commit();
    return true;
  } catch (error) {
    console.error(`\nSeeding ${what} into ${name} failed:`, error.message);
    console.error(
      "\nIf this says the dataset does not exist, create it first:\n" +
        `  npx sanity dataset create ${name}\n`,
    );
    return false;
  }
}

const seeded = [
  wants("production") && (await commit(transaction, dataset, "case studies")),
  wants("blog") && (await commit(blogTransaction, blogDataset, "posts")),
].filter((ran) => ran !== false);

if (seeded.some((ok) => !ok)) process.exit(1);

console.log(
  "\nDone. Open /studio to edit them.\n\n" +
    "Pictures are not seeded — upload them in the Studio, one screenshot per\n" +
    "case study and one cover per post.\n",
);
