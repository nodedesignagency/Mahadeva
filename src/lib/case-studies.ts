import { groq } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { caseStudies as demoCaseStudies, type CaseStudy } from "@/content/case-studies";
import { imageUrl, sanityClient } from "./sanity/client";

/**
 * The one place the rest of the app asks for case studies.
 *
 * Components never learn whether the data came from a CMS. That is the whole
 * point of the split: the section below renders `CaseStudy[]`, and where those
 * objects were assembled is this file's business.
 *
 * Field names in the projection match the type exactly, so this is a shape
 * change and not a translation.
 */

const CASE_STUDIES = groq`
  *[_type == "caseStudy" && defined(slug.current)] | order(order asc, year desc) {
    "slug": slug.current,
    client,
    year,
    title,
    summary,
    stats[]{ label, value },
    tone,
    logo,
    image
  }
`;

/** Width of the artwork half at the largest layout, doubled for 2x screens. */
const IMAGE_WIDTH = 1120;

/** The logo box is 138 wide; ask for twice that so it stays crisp. */
const LOGO_WIDTH = 276;

type SanityAsset = SanityImage & { alt?: string };

type SanityCaseStudy = Omit<CaseStudy, "image" | "logo"> & {
  logo?: SanityAsset;
  image?: SanityAsset;
};

function resolve(asset: SanityAsset, width: number, crop: boolean) {
  return { url: imageUrl(asset, width, crop) ?? "", alt: asset.alt ?? "" };
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  // No project configured yet — a fresh clone, before setup. The demo entries
  // are the same shape, so the page is fully rendered rather than empty.
  if (!sanityClient) return demoCaseStudies;

  try {
    const documents = await sanityClient.fetch<SanityCaseStudy[]>(
      CASE_STUDIES,
      {},
      // Published content on a marketing page: cache it, and let a webhook or a
      // redeploy be what changes it, rather than paying for a query per visit.
      { next: { revalidate: 60, tags: ["caseStudy"] } },
    );

    if (documents.length === 0) return demoCaseStudies;

    return documents.map((doc) => ({
      ...doc,
      // `contain`, not `cover`, so the logo must not be cropped to its box.
      logo: doc.logo ? resolve(doc.logo, LOGO_WIDTH, false) : undefined,
      image: doc.image ? resolve(doc.image, IMAGE_WIDTH, true) : undefined,
    }));
  } catch (error) {
    // A misconfigured project ID or a CORS rule that was never added should not
    // take the page down. Log it where the operator will see it and serve the
    // demo content, which is the same failure the pre-setup state already has.
    console.error("[case-studies] Sanity query failed, using demo content.", error);
    return demoCaseStudies;
  }
}
