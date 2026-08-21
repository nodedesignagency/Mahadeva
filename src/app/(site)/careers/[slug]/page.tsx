import { notFound } from "next/navigation";

import { PageSurface } from "@/components/layout/PageSurface";
import { JobApply } from "@/components/sections/JobApply";
import { JobDescription } from "@/components/sections/JobDescription";
import { JobHero } from "@/components/sections/JobHero";
import { buildMetadata } from "@/config/seo";
import { jobDetailContent } from "@/content/careers";
import { getRole, getRoles, roleHref } from "@/lib/careers";

/**
 * One open role.
 *
 * A dark band with the title, then the facts and the description, then the
 * form. Not a CMS page — see the note in src/lib/careers.ts for why the roles
 * are in the repo rather than in Sanity.
 *
 * The page's shape is the legal documents': a dark opening with white under
 * it is the site's handover, so the opening and the section below it share one
 * scroll stack and the description rides up over the title rather than pushing
 * it off. `hero` as the surface, so the header's strip flips once as the
 * reader passes the title.
 *
 * Everything below the opening keeps its own white fill. The site's habit is
 * to let the page's background crossfade between sections, but this is a dark
 * block with white under it and a hard edge between — crossfading that edge
 * drags a wash of green across the top of the reading matter.
 */

/** Prerender every open role; the set is small and changes rarely. */
export function generateStaticParams() {
  return getRoles().map((role) => ({ slug: role.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) return {};

  return buildMetadata({
    title: role.title,
    // The role's own paragraph rather than the agency's: this is what a search
    // result for the job should say, and every posting shares the other one.
    description: role.about,
    path: roleHref(role.slug),
  });
}

export default async function JobPage({ params }: PageProps) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) notFound();

  return (
    <>
      <PageSurface value="hero" />

      <div data-scroll-stack>
        <JobHero content={jobDetailContent} title={role.title} />
        <JobDescription content={jobDetailContent} role={role} />
      </div>

      <JobApply content={jobDetailContent} role={role.title} />
    </>
  );
}
