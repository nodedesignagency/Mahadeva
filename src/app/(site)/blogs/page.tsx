import { PageSurface } from "@/components/layout/PageSurface";
import { BlogHero } from "@/components/sections/BlogHero";
import { BlogList } from "@/components/sections/BlogList";
import { buildMetadata } from "@/config/seo";
import { blogCategories, blogIndexContent } from "@/content/blog";
import { getPosts } from "@/lib/blog";

/**
 * The blog index.
 *
 * A dark band with the title, then every post as a card with the two controls
 * that narrow them.
 *
 * The page's shape is the site's handover: a dark opening with white under it,
 * so the opening and the list share one scroll stack and the list rides up
 * over the title rather than pushing it off. `hero` as the surface, so the
 * header's strip flips once as the reader passes the title.
 *
 * Structure first — the posts come from `src/lib/blog.ts`, which reads a
 * content file today and will hold a GROQ projection once the Sanity documents
 * land. Nothing on this page changes when it does.
 */

export const metadata = buildMetadata({
  title: "Blog",
  description:
    "Notes on AI, automation and the systems that make them work for a team.",
  path: "/blogs",
});

export default async function BlogsPage() {
  const posts = await getPosts();

  return (
    <>
      <PageSurface value="hero" />

      <div data-scroll-stack>
        <BlogHero content={blogIndexContent} />
        <BlogList
          content={blogIndexContent}
          categories={blogCategories}
          posts={posts}
        />
      </div>
    </>
  );
}
