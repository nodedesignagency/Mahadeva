/**
 * Metadata helpers.
 *
 * Every route builds its metadata through `buildMetadata` so titles, canonical
 * URLs and Open Graph tags stay consistent and nothing is forgotten per page.
 */

import type { Metadata } from "next";
import { siteConfig } from "./site.config";

/**
 * The site's own share card — the one `app/opengraph-image.tsx` draws.
 *
 * Named here, with its size and its words, because a page cannot simply
 * inherit it. Metadata files apply to the segment they sit in, but a page that
 * returns an `openGraph` of its own *replaces* the one above it rather than
 * adding to it — so every route with its own title, which is every route, drops
 * the card unless it names it again. Handing back the bare URL is not enough
 * either: without the type and the dimensions beside it a platform has to
 * fetch and measure the image before it will show anything.
 *
 * `opengraph-image.tsx` takes its `size` and `alt` from here, so the numbers a
 * reader is promised and the numbers actually drawn cannot drift apart.
 */
export const ogCard = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
} as const;

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    ...(siteConfig.twitterHandle ? { creator: siteConfig.twitterHandle } : {}),
  },
  robots: { index: true, follow: true },
};

type BuildMetadataArgs = {
  title: string;
  description?: string;
  /** Route path beginning with a slash, used for the canonical URL. */
  path: string;
  /**
   * A picture of this page in particular — a post's cover, a case study's.
   * Left out, the page falls through to the site's drawn card, which is what
   * `app/opengraph-image.tsx` is: naming it here instead would hand every
   * platform a bare URL with no type or dimensions beside it.
   */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  type = "website",
  publishedTime,
}: BuildMetadataArgs): Metadata {
  const url = `${siteConfig.url}${path}`;
  // This page's own picture where it has one, the site's card where it does
  // not. Always set, never inherited: see `ogCard`.
  const images = image ? [{ url: image }] : [ogCard];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

/** Organization JSON-LD, injected once in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
  };
}
