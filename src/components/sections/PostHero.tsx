import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { Post, blogIndexContent, postDetailContent } from "@/content/blog";

/**
 * A post's opening: what it is on the left, the photograph on the right.
 *
 * ── The two paddings, and why the picture sits where it does ───────────────
 *
 * The header is fixed, so the page begins underneath it and every measurement
 * here is from the top of the document rather than from the top of what can be
 * seen. That is what the design's two 80s are for, and they are not the same
 * 80:
 *
 *   the row's       puts the picture at 80, so it clears the 72px header by a
 *                   sliver rather than running under it
 *   the column's    puts the words at 160 — the row's 80 and then its own —
 *                   which is a proper gap below the header on a phone, where
 *                   the words come first and the picture is underneath
 *
 * With the picture 720 tall the row comes to 800, which is what the file says.
 *
 * ── And why nothing bleeds ─────────────────────────────────────────────────
 *
 * The row is capped at the container's width, so the picture reaches the row's
 * right edge and stops there — on a window wider than 1200 it does not run on
 * to the glass. Below that cap the row is the whole window, so the same rule
 * puts the picture edge to edge on a tablet and a phone without a second one
 * being written for them.
 *
 * A server component; only the title's reveal reaches the browser.
 */

type PostHeroProps = {
  content: typeof postDetailContent;
  index: typeof blogIndexContent;
  post: Post;
};

/** Category and date. Two labels of the same kind, so one treatment. */
const chip =
  "bg-chip px-3 py-1.5 font-ui text-body-sm uppercase text-fg-on-light";

export function PostHero({ content, index, post }: PostHeroProps) {
  return (
    <section data-bg="white" className="bg-bg-white text-fg-on-light">
      {/* 53/47 rather than an even split, to the design: the title's column is
          the wider of the two, and at even halves a 60px heading has nowhere
          to break. The row carries the container's cap and no gutter of its
          own — the gutter belongs to the words, so the picture can reach the
          edge. */}
      <div className="mx-auto grid max-w-(--container-max) pt-20 desktop:grid-cols-[53fr_47fr]">
        <div className="flex flex-col justify-between gap-10 px-gutter py-20 desktop:pe-10">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className={chip}>{post.category}</span>
              {/* A real `<time>`, so the date is machine-readable — the
                  attribute carries the ISO form and the label stays the one
                  the design writes. */}
              <time dateTime={post.published} className={chip}>
                {post.date}
              </time>
            </div>

            {/* `wraps` because a post's title is prose and nobody writes line
                breaks into it: the bars become a band per row, so a title that
                runs to three lines keeps the gutter between them instead of
                one bar covering the lot.

                `display-xl`, the site's largest — measured off the design,
                where the title's two lines sit 65px apart and this leading
                makes that a 60px face. */}
            <TextReveal
              as="h1"
              wraps
              lines={[post.title]}
              settings={sectionTextReveal}
              className="flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-[calc(1em+var(--space-heading-line))] tracking-(--tracking-display) font-normal"
            />

            <p className="max-w-[52ch] font-body text-body-md leading-(--leading-prose) text-fg-on-light-muted">
              {post.summary}
            </p>
          </div>

          {/* The byline, set as text. A post carries one picture — the cover
              in the column beside this one, which is also the card's frame on
              the index — and a portrait here would be a second one for an
              editor to find, crop and keep current for the sake of a 48px
              square. The label above the name is what marks it as a byline
              now that nothing sits beside it. */}
          <div className="flex flex-col">
            <span className="font-body text-body-sm text-fg-on-light-muted">
              {content.authorLabel}
            </span>
            <span className="font-body text-body-lg text-fg-on-light">
              {post.author.name}
            </span>
          </div>
        </div>

        {/* 47/60 is the design's 564 by 720. Given as a proportion rather than
            that fixed height, and it comes to the same thing where the design
            specifies it: above the container's cap the picture's width cannot
            change, so the height is 720 at every one of those widths. Below the
            cap it scales, which is what a phone needs and a fixed 720 would
            not give it. */}
        <div className="aspect-[47/60] w-full overflow-clip bg-placeholder">
          {post.image?.url ? (
            // Not next/image: the URL will already be sized and
            // format-negotiated by Sanity's pipeline.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image.url}
              alt={post.image.alt}
              className="size-full object-cover object-center"
            />
          ) : (
            <p className="flex size-full items-center justify-center p-7 text-center font-body text-body-sm text-fg-on-light/40">
              {index.imagePending}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
