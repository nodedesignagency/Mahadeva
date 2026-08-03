import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { Image as SanityImage } from "sanity";
import { apiVersion, dataset, hasSanity, projectId } from "./env";

/**
 * Read-only client.
 *
 * `useCdn` is on: this reads published documents on a marketing site, where the
 * CDN's staleness is measured in seconds and the traffic saving is the point.
 * Draft previews would need a token and `useCdn: false`, which is a separate
 * concern this site does not have yet.
 *
 * Null when no project is configured, so callers must decide what to do without
 * one rather than discovering it as a runtime error.
 */
export const sanityClient = hasSanity
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

/**
 * Turn an image reference into a URL at a given width.
 *
 * Goes through the asset pipeline rather than serving the original: editors
 * upload whatever came out of their screenshot tool, and this is what stops a
 * 4MB PNG reaching the page. `fit: "crop"` honours the hotspot the editor set
 * in the Studio, so cropping follows their intent instead of the centre.
 */
export function imageUrl(source: SanityImage, width: number): string | null {
  if (!builder) return null;
  return builder.image(source).width(width).fit("crop").auto("format").url();
}
