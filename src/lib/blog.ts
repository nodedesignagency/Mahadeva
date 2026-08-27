import { groq } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { posts as demoPosts, type Post } from "@/content/blog";
import { blogClient, blogImageUrl } from "./sanity/client";

/**
 * The one place the rest of the app asks for posts.
 *
 * Components never learn where a post came from. That is the whole point of
 * the split: the index renders `Post[]`, and whether those objects came out of
 * the CMS or out of `src/content/blog.ts` is this file's business.
 *
 * Reads the `blog` dataset rather than `production`, which is where the posts
 * live — see `blogDataset` in ./sanity/env.
 */

const POSTS = groq`
  *[_type == "post" && defined(slug.current)] | order(published desc) {
    "slug": slug.current,
    title,
    summary,
    category,
    tone,
    published,
    date,
    author{ name },
    body[]{ heading, paragraphs },
    image
  }
`;

/**
 * One width, and it is the larger of the two places a cover is drawn.
 *
 * The post page draws it 564 wide — 1128 on a 2x screen — where a card on the
 * index is a third of the 1200 container. `getPost` filters the same list the
 * index rendered rather than querying again, so both read the same URL and it
 * has to satisfy the bigger of them. Sizing it for the card would leave the
 * post page stretching a 780 image across 1128.
 */
const IMAGE_WIDTH = 1128;

type SanityAsset = SanityImage & { alt?: string };

/**
 * Only the cover and the written date differ from `Post`. The author is a name
 * and comes back as one, so it passes through the spread below untouched.
 */
type SanityPost = Omit<Post, "image" | "date"> & {
  date?: string;
  image?: SanityAsset;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Write a date out the way the design does, e.g. "Jan 2, 2026".
 *
 * Spelled out here rather than through `toLocaleDateString`, which reads a
 * locale the server and the browser do not always agree on and depends on
 * whatever ICU data the runtime shipped with. A post that says "2 Jan 2026" on
 * one render and "Jan 2, 2026" on the next is a hydration mismatch, and the
 * date is a design decision anyway rather than the reader's regional setting.
 *
 * An editor who wants it said differently fills in the `date` field, and this
 * is not consulted.
 */
function writeDate(published: string): string {
  const [year, month, day] = published.split("-").map(Number);
  const name = MONTHS[month - 1];
  return name ? `${name} ${day}, ${year}` : published;
}

function resolve(asset: SanityAsset, width: number) {
  return { url: blogImageUrl(asset, width) ?? "", alt: asset.alt ?? "" };
}

/** Turn one document's image references into URLs, and fill in the written date. */
function shape(doc: SanityPost): Post {
  return {
    ...doc,
    date: doc.date || writeDate(doc.published),
    image: doc.image ? resolve(doc.image, IMAGE_WIDTH) : undefined,
  };
}

export async function getPosts(): Promise<readonly Post[]> {
  // No project configured yet — a fresh clone, before setup. The demo posts are
  // the same shape, so the index is fully rendered rather than empty.
  if (!blogClient) return demoPosts;

  try {
    const documents = await blogClient.fetch<SanityPost[]>(
      POSTS,
      {},
      // Published content on a marketing page: cache it, and let a webhook or a
      // redeploy be what changes it, rather than paying for a query per visit.
      { next: { revalidate: 60, tags: ["post"] } },
    );

    if (documents.length === 0) return demoPosts;

    return documents.map(shape);
  } catch (error) {
    // A dataset that has not been created yet, a misconfigured project ID or a
    // CORS rule that was never added should not take the index down. Log it
    // where the operator will see it and serve the demo posts, which is the
    // same state a fresh clone already renders.
    console.error("[blog] Sanity query failed, using demo posts.", error);
    return demoPosts;
  }
}

/**
 * One post, by slug.
 *
 * Filters the same list rather than running a second query. The set is small
 * and already cached by the fetch above, so a per-slug query would trade a
 * cache hit for a round trip; and it means a post's page and the index can
 * never disagree about what it says.
 */
export async function getPost(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return all.find((post) => post.slug === slug);
}

/**
 * A post's page. The one place the path is built, so the index and any future
 * link cannot disagree about where a post lives.
 */
export function postHref(slug: string): string {
  return `/blogs/${slug}`;
}
