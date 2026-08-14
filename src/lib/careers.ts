import { openingsContent, type Role } from "@/content/careers";

/**
 * The one place the rest of the app asks about open roles.
 *
 * Deliberately not the CMS. Sanity's free tier carries two datasets and the
 * case studies already hold one; the second is being kept for the blog, which
 * is the thing on this site that will actually be written to weekly. A role
 * opens a handful of times a year and closing one is a commit — see the note
 * in src/content/careers.ts.
 *
 * The shape here is the same as `lib/case-studies` presents, so if a role ever
 * does move into a CMS this file changes and no component does.
 */

/** Every role, in the order the openings list shows them. */
export function getRoles(): readonly Role[] {
  return openingsContent.roles;
}

export function getRole(slug: string): Role | undefined {
  return openingsContent.roles.find((role) => role.slug === slug);
}

/**
 * A role's page. The one place the path is built, so the list, the metadata
 * and any future link cannot disagree about where a role lives.
 */
export function roleHref(slug: string): string {
  return `/careers/${slug}`;
}

export type Application = {
  role: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  why: string;
};

/**
 * Where an application goes.
 *
 * The same arrangement as `lib/contact`, and the same deliberate trade: set
 * `NEXT_PUBLIC_CAREERS_ENDPOINT` to any URL that accepts a JSON POST and this
 * works with no code change; without one the form validates, shows its sent
 * state and discards the application.
 *
 * That fallback is worth stating plainly, and more plainly here than for an
 * enquiry: an unconfigured form looks like it worked, and someone who applies
 * for a job and hears nothing has been failed rather than merely missed. The
 * console warns in development. Set the endpoint before this page is live.
 *
 * `role` rides along with the answers so one endpoint can serve every posting
 * — the form is the same on all six, and which one it was is otherwise only
 * recoverable from the referrer.
 */
export async function sendApplication(application: Application): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CAREERS_ENDPOINT;

  if (!endpoint) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[careers] NEXT_PUBLIC_CAREERS_ENDPOINT is not set — the application " +
          "was not sent anywhere. See SETUP.md.",
      );
    }
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(application),
  });

  // Thrown rather than returned: the form has one failure state and no use for
  // the difference between a 500 and a 422, but the console should carry it.
  if (!response.ok) {
    throw new Error(`Careers endpoint returned ${response.status}`);
  }
}
