import { notFound } from "next/navigation";

import { PageSurface } from "@/components/layout/PageSurface";
import { MorePosts } from "@/components/sections/MorePosts";
import { PostBody } from "@/components/sections/PostBody";
import { PostHero } from "@/components/sections/PostHero";
import { buildMetadata } from "@/config/seo";
import { blogIndexContent, postDetailContent } from "@/content/blog";
import { getPost, getPosts, postHref } from "@/lib/blog";
import { hashString, pickSeeded } from "@/lib/random";

/**
 * One post.
 *
 * What it is and who wrote it, then the post, then three others.
 *
 * White from the header down, and it says so rather than leaving the strip to
 * the default — the two look identical and only one of them is a decision.
 * There is no dark opening here and so no scroll stack: the site's handover is
 * for a page that changes surface, and this one never does.
 */

/** Prerender every post; the set is small and the index is static. */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.summary,
    path: postHref(post.slug),
    image: post.image?.url,
    type: "article",
    publishedTime: post.published,
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const posts = await getPosts();
  const more = pickSeeded(
    posts.filter((other) => other.slug !== post.slug),
    postDetailContent.more.count,
    hashString(post.slug),
  );

  return (
    <>
      <PageSurface value="light" />

      <PostHero content={postDetailContent} index={blogIndexContent} post={post} />
      <PostBody post={post} />
      <MorePosts
        content={postDetailContent}
        index={blogIndexContent}
        posts={more}
      />
    </>
  );
}
