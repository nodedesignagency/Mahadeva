import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
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
 * The field name a bot fills and a person never sees.
 *
 * Exported so the form can read it back off its own `FormData` — the check and
 * the field cannot disagree about the name if there is only one of them.
 */
export const HONEYPOT = "website";

/**
 * A field for bots.
 *
 * The oldest trick there is: an input no reader is shown, whose only job is to
 * be empty. A script that parses the form and fills every input it finds fills
 * this one too, and anything arriving with it filled is discarded.
 *
 * ── What this is and is not worth ──────────────────────────────────────────
 *
 * It catches the cheap kind of bot, which is most of them, and costs nothing.
 * It is not a wall. The endpoint these forms post to is public — it has to be,
 * since the post happens in the reader's browser — so anything determined
 * enough to skip the form and POST straight to the endpoint never sees this.
 * The real filtering is the form service's own, which every free one has;
 * this is the free layer in front of it.
 *
 * `hidden` rather than moved off-screen with a negative offset: an element
 * parked at -9999px is still laid out, and the page has no horizontal
 * overflow at any width today, which is a thing worth not breaking for a trap.
 *
 * `aria-hidden` and out of the tab order, so nothing announces it and nobody
 * tabs into a field they cannot see. `autoComplete="off"` so a browser does
 * not helpfully fill it and lock a real person out of their own form.
 */
export function Honeypot() {
  return (
    <div hidden aria-hidden="true">
      <label htmlFor={HONEYPOT}>Leave this field empty</label>
      <input
        id={HONEYPOT}
        type="text"
        name={HONEYPOT}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

/**
 * The copy a form's tail needs. Both forms already carry exactly this, so both
 * pass their `content` straight in.
 */
export type FormCopy = {
  submit: string;
  sending: string;
  submitted: string;
  failed: string;
  sent: { title: string; body: string };
};

/**
 * Everything below the last field: the failure notice, the submit button, and
 * the announcement that the thing was sent.
 *
 * ── Why the button reports this and not a panel ────────────────────────────
 *
 * The form used to be replaced on success by a panel of thanks. That reads
 * well once and badly after: the reader who wants to send a second enquiry has
 * to reload the page to get the fields back, and on the contact page the panel
 * displaced the half of the layout they were looking at.
 *
 * So the state lives in the button — busy, then sent — and the fields clear
 * underneath it a moment later. The panel is still a form, and it is ready for
 * the next one without anybody reloading anything.
 *
 * ── What that costs, and what pays it back ─────────────────────────────────
 *
 * A word in a button holds less than a panel did, and the sighted reader no
 * longer gets the sentence about when we reply. The live region below still
 * carries it in full, so assistive tech is told everything it was told before;
 * anything a reader must act on does not belong here in either case.
 *
 * The region is in the DOM from the first render with nothing in it. A live
 * region added to the page at the moment it has something to say is announced
 * unreliably or not at all — what gets read is the change of its contents, so
 * the element has to already be there to change.
 */
export function FormSubmit({ status, content }: { status: FormStatus; content: FormCopy }) {
  const busy = status === "sending";
  const sent = status === "sent";

  return (
    <>
      {status === "failed" ? (
        <p role="alert" className="font-body text-body-sm text-danger">
          {content.failed}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="plan"
        withArrow
        mark={busy ? "spinner" : sent ? "tick" : undefined}
        // Genuinely disabled, so neither a second click nor a second Enter can
        // send the same thing twice while the first is in flight or being
        // reported.
        disabled={busy || sent}
        // The base layer dims a disabled button to half, which is right for one
        // that cannot be used yet and wrong for both of these: the button is
        // reporting, not unavailable, and a greyed-out "Submitted" reads as a
        // button that failed rather than one that worked.
        className="w-full justify-between disabled:opacity-100"
      >
        {busy ? content.sending : sent ? content.submitted : content.submit}
      </Button>

      <p role="status" aria-live="polite" className="sr-only">
        {sent ? `${content.sent.title} ${content.sent.body}` : ""}
      </p>
    </>
  );
}
