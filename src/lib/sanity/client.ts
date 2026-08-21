import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { Image as SanityImage } from "sanity";
import { apiVersion, blogDataset, dataset, hasSanity, projectId } from "./env";

/**
 * Read-only clients, one per dataset.
 *
 * `useCdn` is on: this reads published documents on a marketing site, where the
 * CDN's staleness is measured in seconds and the traffic saving is the point.
 * Draft previews would need a token and `useCdn: false`, which is a separate
 * concern this site does not have yet.
 *
 * Null when no project is configured, so callers must decide what to do without
 * one rather than discovering it as a runtime error.
 */
const read = (name: string) =>
  hasSanity
    ? createClient({ projectId, dataset: name, apiVersion, useCdn: true })
    : null;

/** The case studies, and anything else the site grows in `production`. */
export const sanityClient = read(dataset);

/** The blog, which lives in its own dataset. */
export const blogClient = read(blogDataset);

/**
 * An asset URL is per dataset — the dataset name is in the path — so each
 * client needs its own builder. One builder for both would send every blog
 * picture to `production`, where it does not exist, and the images would 404
 * with nothing wrong in the code that asked for them.
 */
const builderFor = (client: SanityClient | null) =>
  client ? imageUrlBuilder(client) : null;

const builder = builderFor(sanityClient);
const blogBuilder = builderFor(blogClient);

function resolve(
  from: ReturnType<typeof imageUrlBuilder> | null,
  source: SanityImage,
  width: number,
  crop: boolean,
): string | null {
  if (!from) return null;
  const image = from.image(source).width(width).auto("format");
  return (crop ? image.fit("crop") : image.fit("max")).url();
}

/**
 * Turn an image reference into a URL at a given width.
 *
 * Goes through the asset pipeline rather than serving the original: editors
 * upload whatever came out of their screenshot tool, and this is what stops a
 * 4MB PNG reaching the page.
 *
 * `crop` honours the hotspot the editor set in the Studio, so a screenshot is
 * trimmed to their intent rather than to its centre. Logos pass `false` — they
 * are fitted whole into their box, and cropping one would cut the mark.
 */
export function imageUrl(
  source: SanityImage,
  width: number,
  crop = true,
): string | null {
  return resolve(builder, source, width, crop);
}

/** The same, for assets that live in the blog dataset. */
export function blogImageUrl(
  source: SanityImage,
  width: number,
  crop = true,
): string | null {
  return resolve(blogBuilder, source, width, crop);
}
