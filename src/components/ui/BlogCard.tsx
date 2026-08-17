import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

import { postHover } from "@/config/animation";
import type { Post, PostTone } from "@/content/blog";
import { postHref } from "@/lib/blog";
import { cn } from "@/lib/cn";
import { hoverRectBox, hoverRectFrom } from "@/lib/hoverRect";

/**
 * One post.
 *
 * A tinted head carrying the category, the title and a line of summary, with
 * the photograph filling the card beneath it. The hover is the case cards'
 * gesture at a smaller size: blocks in the card's own tint slide in over the
 * picture while it grows behind them, so the motion happens against the
 * artwork rather than across the reading matter.
 *
 * The tint does two jobs and is set once, on the article: it is the head's
 * fill, and — through `--mh-case-shape` — the colour of every block that
 * slides in. A card whose blocks were a different colour from its head would
 * read as two cards.
 *
 * A server component. The hover is CSS, so nothing here ships as JavaScript.
 */

/** Fills come from theme.css; the card never names a colour itself. */
const tones: Record<PostTone, string> = {
  sky: "bg-post-sky",
  lavender: "bg-post-lavender",
  rose: "bg-post-rose",
  mint: "bg-post-mint",
  peach: "bg-post-peach",
  magenta: "bg-post-magenta",
};

/** And the same tint again, for the blocks. */
const shapes: Record<PostTone, string> = {
  sky: "var(--color-post-sky)",
  lavender: "var(--color-post-lavender)",
  rose: "var(--color-post-rose)",
  mint: "var(--color-post-mint)",
  peach: "var(--color-post-peach)",
  magenta: "var(--color-post-magenta)",
};

type BlogCardProps = {
  post: Post;
  /** Announced with the link, which is the card. */
  readLabel: string;
  imagePending: string;
  className?: string;
};

export function BlogCard({ post, readLabel, imagePending, className }: BlogCardProps) {
  return (
    <article
      style={{ "--mh-case-shape": shapes[post.tone] } as CSSProperties}
      className={cn(
        "group relative flex flex-col overflow-clip",
        tones[post.tone],
        className,
      )}
    >
      {/* The whole card is one link. It carries the accessible name, and the
          heading inside stays plain text so a screen reader announces one link
          rather than two. */}
      <Link
        href={postHref(post.slug)}
        className="absolute inset-0 z-20"
        aria-label={`${readLabel}: ${post.title}`}
      />

      <div className="flex flex-col items-start gap-5 p-7">
        {/* White on the tint rather than a border: the chip is a label sitting
            on the card's colour, and an outline here would be a third edge in
            a card that already has two. */}
        <span className="bg-bg-white px-3 py-1.5 font-ui text-body-sm uppercase text-fg-on-light">
          {post.category}
        </span>

        {/* `text-wrap` overrides the `balance` the base stylesheet puts on
            every heading. Balancing evens the lines out by pulling words down
            early, which is exactly what stops the title reaching the card's
            edge. */}
        <h3 className="font-display text-heading-lg leading-(--leading-heading) text-wrap text-fg-on-light">
          {post.title}
        </h3>

        <p className="font-body text-body-md leading-(--leading-prose) text-fg-on-light/80">
          {post.summary}
        </p>
      </div>

      {/* The picture, and the whole of the hover.

          720x695 is the frame's proportion in the design — very slightly wider
          than tall, not the square it reads as. It matters: at this ratio a
          359 card gives a 346 picture, which is the exact height at which the
          hover's left bar and its square meet. See `postHover.rects`.

          `mt-auto` so a card whose title runs to three lines keeps its picture
          flush with the foot instead of leaving a band of tint under it — the
          grid stretches every card to the tallest, and without this they would
          not agree on where the artwork starts. */}
      <div
        className="relative mt-auto aspect-[720/695] overflow-clip"
        style={
          {
            "--mh-case-duration": `${postHover.duration}ms`,
            "--mh-case-scale": postHover.imageScale,
          } as CSSProperties
        }
      >
        {post.image?.url ? (
          // Not next/image: the URL will already be sized and format-negotiated
          // by Sanity's pipeline, so routing it through the optimiser would be
          // a second transform of an image that has had one.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image.url}
            alt={post.image.alt}
            className="mh-case-cover size-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          // Named rather than blank: an empty grey block reads as a layout bug,
          // and this reads as a slot waiting for its picture.
          <div className="mh-case-cover flex size-full items-center justify-center bg-placeholder p-6">
            <p className="text-center font-body text-body-sm text-fg-on-light/40">
              {imagePending}
            </p>
          </div>
        )}

        {/* Decorative, and confined to the picture — the rectangles belong to
            the artwork, not to the reading matter above it. Above the link
            surface so nothing clips them. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
          {postHover.rects.map((rect, i) => (
            <span
              key={i}
              className="mh-case-block"
              style={
                {
                  ...hoverRectBox(rect),
                  "--mh-case-from": hoverRectFrom(rect),
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/* Part of the hover, not of the card: the owner's base variant has no
            arrow at all, so this waits off the right edge and arrives with the
            blocks. It is one of them — same class, same tint, same curve —
            that happens to hold a mark, which is why it carries no rules of
            its own.

            Nothing is lost where there is no pointer to hover with: the whole
            card is a link and announces itself as one. */}
        <span
          aria-hidden="true"
          className="mh-case-block right-0 bottom-0 z-30 flex items-center justify-center text-fg-on-light"
          style={
            {
              width: postHover.arrow.size,
              height: postHover.arrow.size,
              "--mh-case-from": postHover.arrow.from,
            } as CSSProperties
          }
        >
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </article>
  );
}
