/**
 * Sanity connection details.
 *
 * Deliberately not throwing when they are missing. A freshly cloned copy has no
 * project yet, and the site must still build and run — it falls back to the
 * demo content in src/content/case-studies.ts. Throwing here would mean a buyer
 * cannot see what they bought until they have finished setting up a CMS.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * The blog's own dataset, in the same project.
 *
 * Separate because the two are written on different rhythms — a post weekly, a
 * case study a few times a year — and keeping them apart means either can be
 * exported or restored without touching the other. Both sit inside the free
 * tier's two.
 */
export const blogDataset = process.env.NEXT_PUBLIC_SANITY_BLOG_DATASET ?? "blog";

/** Pinned: `next-sanity` warns when a client floats on whatever is current. */
export const apiVersion = "2024-10-01";

/** Whether a real project is configured, and so whether to query at all. */
export const hasSanity = Boolean(projectId);
