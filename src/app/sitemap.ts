import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";
import { getCaseStudies } from "@/lib/case-studies";
import { getPosts, postHref } from "@/lib/blog";
import { getRoles, roleHref } from "@/lib/careers";

/**
 * The sitemap, built from the same helpers the pages are.
 *
 * Every route a reader can reach, and nothing else. It is generated rather
 * than written down for the reason `check-artifact-routes` enumerates instead
 * of being told: a post published in the Studio tomorrow is in tomorrow's
 * sitemap without anyone remembering to add it, and a hand-kept list is the
 * kind that quietly stops matching the site.
 *
 * ── What is deliberately left out ──────────────────────────────────────────
 *
 * `/studio` is the CMS, `/dev/tokens` is a palette sheet for whoever is
 * building, and `/404` is the error design shown from the footer as a demo —
 * a real 404 is served by `not-found`, and neither wants to be a search
 * result. `robots.ts` says the same thing in the other direction.
 *
 * ── Priority and frequency ─────────────────────────────────────────────────
 *
 * Google ignores both, and has said so. They are here because other crawlers
 * still read them and they cost nothing, ordered the way the site itself is:
 * the home page, then what a visitor is being sent to, then the archives.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/case-study`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blogs`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/careers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/legal-pages/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal-pages/terms-of-services`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [studies, posts] = await Promise.all([getCaseStudies(), getPosts()]);

  return [
    ...fixed.map((entry) => ({ ...entry, lastModified: now })),
    ...studies.map((study) => ({
      url: `${base}/case-study/${study.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${base}${postHref(post.slug)}`,
      // A post's own date, where it has one — the one place on the site
      // where a real modification time is known rather than guessed.
      // `published`, not `date`: the first is machine-readable and the second
      // is how the design writes it out for a reader.
      lastModified: post.published ? new Date(post.published) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getRoles().map((role) => ({
      url: `${base}${roleHref(role.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
