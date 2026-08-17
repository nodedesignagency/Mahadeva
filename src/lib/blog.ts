import { posts, type Post } from "@/content/blog";

/**
 * The one place the rest of the app asks for posts.
 *
 * Components never learn where a post came from. That is the whole point of
 * the split, and it is why this file exists before there is a CMS behind it:
 * when the Sanity documents land, this grows a GROQ projection the way
 * `lib/case-studies` has one, and the index that renders `Post[]` does not
 * change a line.
 *
 * Async already, for the same reason — a synchronous accessor would have to
 * become async the day it fetches, and that is a change to every caller.
 */

export async function getPosts(): Promise<readonly Post[]> {
  return posts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return posts.find((post) => post.slug === slug);
}

/**
 * A post's page. The one place the path is built, so the index and any future
 * link cannot disagree about where a post lives.
 *
 * The pages themselves are still to come — see the note in the index.
 */
export function postHref(slug: string): string {
  return `/blogs/${slug}`;
}
