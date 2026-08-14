"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealBeige } from "@/config/animation";
import type { openingsContent } from "@/content/careers";
import { cn } from "@/lib/cn";

/**
 * Current Openings — the roles, and the four controls that narrow them.
 *
 * Every option in every select is derived from the roles themselves, in the
 * order they first appear. Nothing about the filters is configured: opening a
 * role in a city the company has never hired in adds that city to the list,
 * and closing the last one removes it. A hand-maintained option list is how a
 * filter ends up offering a department with nothing in it.
 *
 * The count above the list is the filtered length rather than a figure in
 * content, for the same reason.
 *
 * A client component: it holds what has been typed and chosen. The list is
 * rendered in full on the server, so it is there before the script is and for
 * anyone who never gets it.
 */

type OpeningsProps = {
  content: typeof openingsContent;
};

type Role = (typeof openingsContent.roles)[number];

/** The three select-driven fields, in the order the row shows them. */
const FACETS = ["location", "type", "department"] as const;
type Facet = (typeof FACETS)[number];

/**
 * One control's shell — white, hairline, the ink of the surface it sits on.
 *
 * 52px, and the same corner as the form fields on the contact page: these are
 * inputs on a light panel and there is no reason for the site to have two
 * kinds.
 */
const field =
  "h-[52px] w-full rounded-(--radius-input) border border-border-on-light bg-bg-white " +
  "font-body text-body-md text-fg-on-light " +
  "placeholder:text-fg-on-light-muted " +
  "transition-colors duration-(--duration-hover) ease-(--ease-out) " +
  "focus:border-fg-on-light focus:outline-none";

export function Openings({ content }: OpeningsProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Record<Facet, string>>({
    location: "",
    type: "",
    department: "",
  });

  /**
   * The options each select offers. First-appearance order rather than
   * alphabetical: the roles are listed in the order the company wants them
   * read, and sorting the facets would put "Austin" above "Remote" while the
   * list below still opens with the remote role.
   */
  const options = useMemo(() => {
    const out = {} as Record<Facet, string[]>;
    for (const facet of FACETS) {
      out[facet] = [...new Set(content.roles.map((role) => role[facet]))];
    }
    return out;
  }, [content.roles]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return content.roles.filter((role) => {
      if (needle && !role.title.toLowerCase().includes(needle)) return false;
      return FACETS.every((facet) => !chosen[facet] || role[facet] === chosen[facet]);
    });
  }, [content.roles, query, chosen]);

  // One string with a placeholder rather than a number glued to a word: the
  // plural belongs in content, and so does the space between them.
  const count = (matches.length === 1 ? content.count.one : content.count.many).replace(
    "{n}",
    String(matches.length),
  );

  return (
    <section
      id={content.id}
      data-bg="beige"
      className="bg-bg-light py-20 text-fg-on-light tablet:py-25"
    >
      <Container>
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealBeige}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />

        <p className="mx-auto mt-8 max-w-[52ch] text-center font-body text-body-md text-fg-on-light">
          {content.subheading}
        </p>

        {/* Four abreast from desktop, two-by-two on a tablet, stacked on a
            phone. A select narrowed to a third of a phone's width cannot show
            "Marketing Department". */}
        <div className="mt-15 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          <div className="relative">
            <label htmlFor={`${id}-search`} className="sr-only">
              {content.filters.search.label}
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-fg-on-light-muted"
            />
            <input
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.filters.search.placeholder}
              className={cn(field, "ps-11 pe-4")}
            />
          </div>

          {FACETS.map((facet) => (
            // The native select, restyled rather than rebuilt — the same call
            // the contact form makes. A custom listbox is a keyboard and
            // screen-reader surface to maintain for a handful of options, and
            // on a phone the platform picker beats anything a page can draw.
            <div key={facet} className="relative">
              <select
                aria-label={content.filters[facet]}
                value={chosen[facet]}
                onChange={(event) =>
                  setChosen((prev) => ({ ...prev, [facet]: event.target.value }))
                }
                className={cn(field, "appearance-none ps-4 pe-11")}
              >
                {/* The resting option is the category itself, which is what
                    the design shows: an unset filter is not "All locations",
                    it is the control not yet used. */}
                <option value="">{content.filters[facet]}</option>
                {options[facet].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-fg-on-light-muted"
              />
            </div>
          ))}
        </div>

        {/* `aria-live` because the figure is the only confirmation that a
            filter did anything — a reader who cannot see the list shorten is
            otherwise told nothing. */}
        <p className="mt-12 flex flex-wrap items-center gap-3 font-body text-body-md text-fg-on-light">
          {content.count.label}
          <span aria-live="polite" className="bg-yellow px-3 py-1 font-ui text-body-md">
            {count}
          </span>
        </p>

        {matches.length === 0 ? (
          <p className="mt-10 font-body text-body-md text-fg-on-light-muted">
            {content.empty}
          </p>
        ) : (
          <ul className="mt-8">
            {matches.map((role) => (
              <li key={role.title} className="border-b border-border-on-light last:border-b-0">
                <RoleRow role={role} applyLabel={content.applyLabel} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}

/**
 * One role.
 *
 * The whole row is the link — a title that navigates with an arrow beside it
 * that does the same thing is two targets for one destination, and a keyboard
 * has to pass through both. The arrow is decorative here and says so; the
 * label it would have carried is on the link instead.
 */
function RoleRow({ role, applyLabel }: { role: Role; applyLabel: string }) {
  const meta = [role.location, role.type, role.department];

  return (
    <Link
      href={role.href}
      aria-label={`${applyLabel}: ${role.title}`}
      className="group flex items-center justify-between gap-6 py-8 transition-opacity duration-(--duration-hover) ease-(--ease-out) hover:opacity-70"
    >
      <span className="flex flex-col gap-3">
        <span className="font-body text-heading-lg leading-(--leading-heading)">
          {role.title}
        </span>

        {/* Bullet-separated, and the separators are their own elements rather
            than characters inside the values: a value that wraps then takes
            its bullet with it instead of leaving one hanging at the end of a
            line. */}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-body-lg text-fg-on-light-muted">
          {meta.map((value) => (
            <span key={value} className="flex items-center gap-x-3">
              {value}
              <span aria-hidden="true" className="text-fg-on-light-muted/60">
                •
              </span>
            </span>
          ))}

          {/* Geist for both, as for every figure on the site. */}
          <span className="flex items-center gap-x-3">
            <span className="font-ui">{role.experience}</span>
            <span aria-hidden="true" className="text-fg-on-light-muted/60">
              •
            </span>
          </span>
          <span className="font-ui">{role.salary}</span>
        </span>
      </span>

      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-(--radius-icon) bg-icon-box text-fg-on-light"
      >
        <ArrowUpRight className="size-5" />
      </span>
    </Link>
  );
}
