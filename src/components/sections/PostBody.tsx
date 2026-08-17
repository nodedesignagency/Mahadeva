import { Container } from "@/components/layout/Container";
import type { Post } from "@/content/blog";

/**
 * The post itself: a run of titled blocks.
 *
 * Headings are plain rather than revealed. The title upstairs gets the site's
 * entrance; four more of them down a page someone is reading would be noise —
 * the same call the legal documents make.
 *
 * The measure is wider than the site's usual prose column because the design
 * runs this to the container's full width, and at `--leading-prose` that still
 * reads. `max-w` is left off deliberately: a limit here would put a ragged
 * right edge against a heading that has none.
 *
 * A server component; nothing here moves.
 */

type PostBodyProps = {
  post: Post;
};

export function PostBody({ post }: PostBodyProps) {
  return (
    <section data-bg="white" className="bg-bg-white py-20 text-fg-on-light tablet:py-25">
      <Container>
        <div className="flex flex-col gap-12">
          {post.body.map((block) => (
            <section key={block.heading}>
              <h2 className="font-display text-display-md leading-(--leading-heading) tracking-(--tracking-display) font-normal text-fg-on-light">
                {block.heading}
              </h2>

              <div className="mt-5 flex flex-col gap-5">
                {block.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="font-body text-body-md leading-(--leading-prose) text-fg-on-light"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}
