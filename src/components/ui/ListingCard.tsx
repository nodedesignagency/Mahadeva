import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseTone } from "@/content/case-studies";
import { cn } from "@/lib/cn";

/**
 * One row in a listing — a role, or an article.
 *
 * Careers and blogs are the same object at this size: a label, a title, a
 * sentence, and two or three facts. Giving them one card is what keeps the two
 * indexes reading as one site rather than as two templates that happen to
 * share a header.
 *
 * The case study card is deliberately not reused. That one is an argument with
 * artwork and four figures in a 2x2 grid, and a job opening has neither.
 *
 * A server component: the hover is CSS, so nothing here ships as JavaScript.
 */

/** Fills come from theme.css; the card never names a colour itself. */
const tones: Record<CaseTone, string> = {
  sky: "bg-case-sky",
  lavender: "bg-case-lavender",
  peach: "bg-case-peach",
  mint: "bg-case-mint",
  periwinkle: "bg-case-periwinkle",
};

export type ListingMeta = {
  label: string;
  value: string;
  /**
   * Numbers are set in Geist wherever they appear on this site — see
   * config/fonts.ts. A date read as words is not a number; a duration is.
   */
  numeric?: boolean;
};

type ListingCardProps = {
  href: string;
  /** The small label above the title: a department, or a category. */
  eyebrow: string;
  title: string;
  summary: string;
  meta: ListingMeta[];
  tone: CaseTone;
  className?: string;
};

export function ListingCard({
  href,
  eyebrow,
  title,
  summary,
  meta,
  tone,
  className,
}: ListingCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-clip transition-colors duration-300",
        tones[tone],
        className,
      )}
    >
      {/* The whole card is one link. It carries the accessible name, and the
          heading inside stays plain text so a screen reader announces one link
          rather than two. */}
      <Link href={href} className="absolute inset-0 z-20" aria-label={title} />

      <div className="grid gap-8 p-8 tablet:p-10 desktop:grid-cols-[7fr_4fr] desktop:items-center desktop:gap-16">
        <div className="flex flex-col gap-4">
          <p className="font-body text-body-sm uppercase text-fg-on-light/70">{eyebrow}</p>
          <h2 className="font-display text-heading-lg leading-(--leading-heading) tracking-(--tracking-heading) font-normal text-fg-on-light">
            {title}
          </h2>
          <p className="max-w-[62ch] font-body text-body-md text-fg-on-light/80">{summary}</p>
        </div>

        <div className="flex items-end justify-between gap-8">
          <dl className="flex flex-wrap gap-x-10 gap-y-5">
            {meta.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <dt className="font-ui text-body-sm font-light text-fg-on-light/70">
                  {item.label}
                </dt>
                <dd
                  className={cn(
                    "text-body-md text-fg-on-light",
                    item.numeric ? "font-ui font-light" : "font-body",
                  )}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Square, dark, and the only thing on the card that moves: it lifts
              a little towards its own corner on hover, which is the same
              gesture the site's buttons make. */}
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center bg-bg text-fg transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:translate-x-1"
          >
            <ArrowUpRight className="size-5" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </article>
  );
}
