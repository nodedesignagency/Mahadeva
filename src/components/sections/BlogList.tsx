"use client";

import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { BlogCard } from "@/components/ui/BlogCard";
import type { BlogCategory, Post, blogIndexContent } from "@/content/blog";
import { cn } from "@/lib/cn";

/**
 * The posts, and the two controls that narrow them.
 *
 * A row of category chips with a search beside it, then the grid. The chips
 * are a single choice — one category or none — so they are real buttons in a
 * group rather than a select: five options that fit on one line are quicker to
 * read than a menu that has to be opened, and the current one stays visible.
 *
 * This is the section that rides up over the pinned opening, so it keeps its
 * own white fill — transparent, the dark band would show through it for the
 * whole climb.
 *
 * A client component: it holds what has been typed and chosen. Every post is
 * rendered on the server, so the grid is there before the script is and for
 * anyone who never gets it.
 */

type BlogListProps = {
  content: typeof blogIndexContent;
  categories: readonly BlogCategory[];
  posts: readonly Post[];
};

/** The chip, in both states. One shape, two fills. */
const chip =
  "shrink-0 rounded-(--radius-button) border px-4 py-2.5 font-ui text-body-sm uppercase " +
  "transition-colors duration-(--duration-hover) ease-(--ease-out)";

export function BlogList({ content, categories, posts }: BlogListProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  /** Empty is "All" — no category chosen, rather than a category called All. */
  const [chosen, setChosen] = useState<BlogCategory | "">("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (chosen && post.category !== chosen) return false;
      if (!needle) return true;
      // Title and summary both: someone searching "conversions" is looking for
      // what a post is about, and that is as likely to be in the line under
      // the title as in the title.
      return (
        post.title.toLowerCase().includes(needle) ||
        post.summary.toLowerCase().includes(needle)
      );
    });
  }, [posts, query, chosen]);

  const options: readonly (BlogCategory | "")[] = ["", ...categories];

  return (
    <section
      data-bg="white"
      data-bg-keep=""
      // `relative z-10` and an opaque fill are what make it ride over the
      // pinned opening rather than under it.
      className="relative z-10 bg-bg-white py-20 text-fg-on-light tablet:py-25"
    >
      <Container>
        <div className="flex flex-col gap-6 desktop:flex-row desktop:items-center desktop:justify-between">
          {/* A single choice, so the group is announced as one and each chip
              says whether it is the current one. Scrolls rather than wraps
              below desktop: five chips wrapped to three lines pushes the grid
              off the screen. */}
          <div
            role="group"
            aria-label={content.filters.label}
            className="mh-rail -mx-gutter flex gap-3 overflow-x-auto px-gutter desktop:mx-0 desktop:flex-wrap desktop:px-0"
          >
            {options.map((option) => {
              const active = chosen === option;

              return (
                <button
                  key={option || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setChosen(option)}
                  className={cn(
                    chip,
                    active
                      ? "border-fg-on-light bg-fg-on-light text-fg"
                      : "border-border-on-light bg-bg-white text-fg-on-light hover:border-fg-on-light",
                  )}
                >
                  {option || content.filters.all}
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0 desktop:w-[240px]">
            <label htmlFor={`${id}-search`} className="sr-only">
              {content.filters.search.label}
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-fg-on-light-muted"
            />
            <input
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.filters.search.placeholder}
              className="h-[44px] w-full rounded-(--radius-button) border border-border-on-light bg-bg-white ps-10 pe-4 font-body text-body-md text-fg-on-light transition-colors duration-(--duration-hover) ease-(--ease-out) placeholder:text-fg-on-light-muted focus:border-fg-on-light focus:outline-none"
            />
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="mt-15 font-body text-body-md text-fg-on-light-muted">
            {content.empty}
          </p>
        ) : (
          // `items-stretch` is the default and is what the card's `mt-auto`
          // relies on: every card fills its row's height, so the pictures line
          // up however long the titles above them run.
          <ul className="mt-10 grid grid-cols-1 gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
            {matches.map((post) => (
              <li key={post.slug} className="flex">
                <BlogCard
                  post={post}
                  readLabel={content.readLabel}
                  imagePending={content.imagePending}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
