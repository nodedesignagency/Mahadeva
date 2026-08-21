import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { hasSanity } from "@/lib/sanity/env";

/**
 * The Studio, mounted inside the site.
 *
 * Dynamic rather than prerendered: it is an editing application, and there is
 * nothing about it worth putting in a static build.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  // Before setup there is no project to open. Say so plainly and point at the
  // instructions, rather than rendering a Studio that fails on every request
  // with an error about a missing project ID.
  if (!hasSanity) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[40rem] flex-col justify-center gap-4 px-6 py-24">
        <h1 className="font-display text-heading-lg">The CMS is not connected yet</h1>
        <p className="font-body text-body-md text-fg-muted">
          The site is running on its demo case studies and posts. To edit
          content here, add your Sanity project ID to <code>.env.local</code>{" "}
          and restart.
        </p>
        <p className="font-body text-body-md text-fg-muted">
          The steps are in <code>SETUP.md</code> at the root of the project.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
