import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";

/**
 * robots.txt.
 *
 * Everything is open except the routes that are not the site: the CMS and the
 * palette sheet a developer reads. `/404` is listed with them for the same
 * reason it is kept out of the sitemap — the footer links to it to show the
 * design, and it is not a page anyone should arrive at from a search. It
 * already answers with a 404 status, so this is belt and braces rather than
 * the only thing keeping it out.
 *
 * `Disallow` is a request not to crawl, not a lock — it keeps these out of
 * search results, and the Studio has its own sign-in for the part that
 * matters.
 *
 * The sitemap is named here as well as served, because that is how a crawler
 * that was not submitted the URL finds it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/studio/", "/dev/", "/404"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
