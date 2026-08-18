import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { BlogCard } from "@/components/ui/BlogCard";
import { sectionTextReveal } from "@/config/animation";
import type { Post, blogIndexContent, postDetailContent } from "@/content/blog";

/**
 * Keep Reading Further — three other posts, never this one.
 *
 * Which three is decided by this post's own slug, exactly as the case study
 * page picks its neighbours. That is the whole point of seeding from the
 * content: the same post shows the same three every time, two different posts
 * almost certainly show different ones, and nothing has to be stored to keep
 * it that way. `Math.random()` would give the server and the client two
 * different answers and a hydration error — and on a statically built page it
 * would roll once at build time and then never change again.
 *
 * The cards are the index's, unchanged. A recommendation is the same object as
 * a listing, and a second card that merely looked like the first is how the
 * two drift apart.
 *
 * A server component.
 */

type MorePostsProps = {
  content: typeof postDetailContent;
  index: typeof blogIndexContent;
  posts: readonly Post[];
};

export function MorePosts({ content, index, posts }: MorePostsProps) {
  if (posts.length === 0) return null;

  return (
    <section data-bg="white" className="bg-bg-white pb-20 text-fg-on-light tablet:pb-25">
      <Container>
        <TextReveal
          as="h2"
          lines={content.more.headingLines}
          settings={sectionTextReveal}
          className="flex flex-col items-start gap-(--space-heading-line) text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        <ul className="mt-15 grid grid-cols-1 gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="flex">
              <BlogCard
                post={post}
                readLabel={index.readLabel}
                imagePending={index.imagePending}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
