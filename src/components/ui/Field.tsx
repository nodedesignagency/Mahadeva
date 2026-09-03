import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The parts every form on the site is built from.
 *
 * There are three places a reader types something — the enquiry form on the
 * contact page, the application form on a role's page, and the filter row over
 * the job list — and all three had their own copy of the same control shell,
 * two of them with a comment saying it was deliberately the other's. A copy
 * with a note explaining that it is a copy is still a copy: change the focus
 * ring and you have to remember all three.
 */

/**
 * One control's shell: white, hairline, and the ink of the surface it sits on.
 *
 * No height and no horizontal padding, because those are the two things that
 * actually differ. A form field is 41 tall and evenly padded; the filter row's
 * is 40 and padded around an icon on one side. Both are the owner's, and both
 * belong at the point of use rather than in a default that every caller then
 * has to override.
 */
export const formControl =
  "w-full rounded-(--radius-input) border border-border-on-light bg-bg-white " +
  "font-body text-body-md text-fg-on-light " +
  "placeholder:text-fg-on-light-muted " +
  "transition-colors duration-(--duration-hover) ease-(--ease-out) " +
  "focus:border-fg-on-light focus:outline-none";

/**
 * A single-line field: 41px including its borders, evenly padded. An input
 * centres its own text within that, so there is no vertical padding to set.
 */
export const formLine = "h-[41px] px-4";

const formLabel = "font-body text-body-md text-fg-on-light";

/** Where a submission has got to. Both forms move through the same four. */
export type FormStatus = "idle" | "sending" | "sent" | "failed";

type FieldProps = {
  /** The control's id — this is what the label points at. */
  htmlFor: string;
  label: string;
  /** `flex-1` where the field shares a row. */
  className?: string;
  children: ReactNode;
};

/** A label over its control, 8 apart. */
export function Field({ htmlFor, label, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className={formLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * What stands where the form was once it has been sent.
 *
 * It replaces the form rather than covering it: leaving the fields on screen
 * behind a message invites a second submission of the same thing.
 */
export function FormSent({ title, body }: { title: string; body: string }) {
  return (
    // Announced without stealing focus — the reader is told it worked whether
    // or not they can see the panel change.
    <div role="status" className="flex h-full flex-col justify-center gap-4 px-5 py-8">
      <p className="text-display-md leading-(--leading-display) tracking-(--tracking-display) font-normal text-fg-on-light">
        {title}
      </p>
      <p className="max-w-[38ch] font-body text-body-md text-fg-on-light-muted">
        {body}
      </p>
    </div>
  );
}
