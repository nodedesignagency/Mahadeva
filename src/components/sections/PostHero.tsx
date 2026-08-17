import type { CSSProperties } from "react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextReveal } from "@/config/animation";
import type { Post, blogIndexContent, postDetailContent } from "@/content/blog";

/**
 * A post's opening: what it is on the left, the photograph on the right.
 *
 * The photograph runs to the window's edge rather than stopping at the
 * container's gutter, which is the design's one asymmetry. Both halves are a
 * real Container all the same — see `bleedRight` for which of the two carries
 * the escape, and why it has to be that one.
 *
 * `justify-between` is what puts the author at the foot: the title group sits
 * at the top, the byline at the bottom, and the gap between them absorbs
 * whatever height the photograph leaves over.
 *
 * A server component; only the title's reveal reaches the browser.
 */

type PostHeroProps = {
  content: typeof postDetailContent;
  index: typeof blogIndexContent;
  post: Post;
};

/**
 * How far the picture runs past its column to reach the window's edge: the
 * column's own width plus whatever the container leaves to the right of it.
 *
 * Note which element carries this. Aligning the *text* by restating the
 * container's inset is the obvious way round and it is wrong: `100vw` includes
 * the scrollbar, so on any platform with a classic one the calculation
 * over-reports by half its width and the title lands seven pixels right of the
 * body copy underneath it — a misalignment between two things that plainly
 * ought to line up.
 *
 * Put on the picture instead, the same error is harmless. It can only ever
 * overshoot, never fall short, and the section clips what hangs over. So the
 * text sits in a real Container and is exact, and the picture is approximately
 * too wide inside something that hides the difference.
 */
const bleedRight: CSSProperties = {
  "--mh-bleed":
    "calc(100% + max(var(--container-gutter), calc((100vw - var(--container-max)) / 2 + var(--container-gutter))))",
} as CSSProperties;

/** Category and date. Two labels of the same kind, so one treatment. */
const chip =
  "bg-chip px-3 py-1.5 font-ui text-body-sm uppercase text-fg-on-light";

export function PostHero({ content, index, post }: PostHeroProps) {
  return (
    // `overflow-clip` is what lets the picture overshoot the window's edge
    // rather than having to land on it exactly. See `bleedRight`.
    <section data-bg="white" className="overflow-clip bg-bg-white text-fg-on-light">
      {/* 53/47 rather than an even split, to the design: the title's column is
          the wider of the two, and at even halves a 60px heading has nowhere
          to break. */}
      <Container className="grid items-stretch desktop:grid-cols-[53fr_47fr]">
        <div className="flex flex-col justify-between gap-16 py-20 desktop:pe-15">
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
                one bar covering the lot. */}
            <TextReveal
              as="h1"
              wraps
              lines={[post.title]}
              settings={sectionTextReveal}
              // `display-xl`, the site's largest — measured off the design,
              // where the title's two lines sit 65px apart and this leading
              // makes that a 60px face.
              className="flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-[calc(1em+var(--space-heading-line))] tracking-(--tracking-display) font-normal"
            />

            <p className="max-w-[52ch] font-body text-body-md leading-(--leading-prose) text-fg-on-light-muted">
              {post.summary}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {post.author.avatar?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar.url}
                alt={post.author.avatar.alt}
                className="size-12 shrink-0 object-cover"
              />
            ) : (
              // The portrait's slot at its real size, so the row's rhythm is
              // right before the photograph arrives.
              <span aria-hidden="true" className="block size-12 shrink-0 bg-placeholder" />
            )}

            <span className="flex flex-col">
              <span className="font-body text-body-sm text-fg-on-light-muted">
                {content.authorLabel}
              </span>
              <span className="font-body text-body-lg text-fg-on-light">
                {post.author.name}
              </span>
            </span>
          </div>
        </div>

        {/* The picture. The cell's proportion drives the row's height — which
            is what lets the column beside it push the byline to the foot —
            while the picture itself is laid over the cell and runs wider, out
            to the window's edge. */}
        <div className="relative aspect-[562/720]">
          <div
            style={bleedRight}
            className="absolute inset-y-0 start-0 w-full overflow-clip bg-placeholder desktop:w-(--mh-bleed)"
          >
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
      </Container>
    </section>
  );
}
