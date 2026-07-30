/**
 * Metadata helpers.
 *
 * Every route builds its metadata through `buildMetadata` so titles, canonical
 * URLs and Open Graph tags stay consistent and nothing is forgotten per page.
 */

import type { Metadata } from "next";
import { siteConfig } from "./site.config";

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
  /** Absolute or root-relative image path; falls back to the generated OG. */
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
  const images = [{ url: image ?? siteConfig.ogImage }];

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
    twitter: { card: "summary_large_image", title, description, images },
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
