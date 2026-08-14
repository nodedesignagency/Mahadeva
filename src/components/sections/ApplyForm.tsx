"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { jobDetailContent } from "@/content/careers";
import { sendApplication } from "@/lib/careers";
import { cn } from "@/lib/cn";

/**
 * The application form — the white half of the apply panel.
 *
 * A real `<form>` with real labels and a real submit, like the enquiry form on
 * the contact page: the browser's own validation does the work, so an empty
 * required field is caught and announced without a line of JavaScript.
 *
 * What it collects is here; where it goes is `src/lib/careers.ts`, which also
 * carries the warning about an unconfigured endpoint. The split matters —
 * connecting this to an applicant tracker should never mean opening a
 * component.
 *
 * The role travels with the answers, so one endpoint serves all six postings.
 */

type ApplyFormProps = {
  content: typeof jobDetailContent.apply.form;
  /** Which posting this is. Submitted alongside the answers. */
  role: string;
};

type Status = "idle" | "sending" | "sent" | "failed";

/**
 * One field's shell: white, hairline, and the ink of the surface it sits on.
 * The contact form's, deliberately — these are inputs on a light panel and
 * there is no reason for the site to have two kinds.
 *
 * No height here: a single-line field is 41 and a text area taller, and both
 * are set where they are used rather than overridden from a shared default.
 */
const field =
  "w-full rounded-(--radius-input) border border-border-on-light bg-bg-white " +
  "px-4 font-body text-body-md text-fg-on-light " +
  "placeholder:text-fg-on-light-muted " +
  "transition-colors duration-(--duration-hover) ease-(--ease-out) " +
  "focus:border-fg-on-light focus:outline-none";

/** 41px, borders included. An input centres its own text, so no padding. */
const line = "h-[41px]";

const label = "font-body text-body-md text-fg-on-light";

export function ApplyForm({ content, role }: ApplyFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setStatus("sending");
    try {
      await sendApplication({
        role,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        resume: String(data.get("resume") ?? ""),
        why: String(data.get("why") ?? ""),
      });
      setStatus("sent");
    } catch (error) {
      console.error("[careers] application failed to send.", error);
      setStatus("failed");
    }
  }

  // The form is replaced rather than covered: leaving the fields on screen
  // behind a message invites a second application for the same role.
  if (status === "sent") {
    return (
      <div
        // Announced without stealing focus — the reader is told it worked
        // whether or not they can see the panel change.
        role="status"
        className="flex h-full flex-col justify-center gap-4 p-8 tablet:p-12"
      >
        <p className="text-display-md leading-(--leading-display) tracking-(--tracking-display) font-normal text-fg-on-light">
          {content.sent.title}
        </p>
        <p className="max-w-[38ch] font-body text-body-md text-fg-on-light-muted">
          {content.sent.body}
        </p>
      </div>
    );
  }

  return (
    <form
      aria-label={content.label}
      onSubmit={onSubmit}
      className="flex h-full flex-col gap-6 p-8 tablet:p-12"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-name`} className={label}>
          {content.fields.name.label}
        </label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder={content.fields.name.placeholder}
          className={cn(field, line)}
        />
      </div>

      {/* Email and phone share a row from tablet up, as in the design, and
          stack below it — two half-width fields on a phone are unusable. */}
      <div className="flex flex-col gap-6 tablet:flex-row tablet:gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor={`${id}-email`} className={label}>
            {content.fields.email.label}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={content.fields.email.placeholder}
            className={cn(field, line)}
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor={`${id}-phone`} className={label}>
            {content.fields.phone.label}
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={content.fields.phone.placeholder}
            className={cn(field, line)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-resume`} className={label}>
          {content.fields.resume.label}
        </label>
        {/* A link rather than an upload. A file input needs somewhere to put
            the file, and this form posts JSON to an endpoint the owner
            chooses — a URL is the one thing every provider can take. */}
        <input
          id={`${id}-resume`}
          name="resume"
          type="url"
          required
          placeholder={content.fields.resume.placeholder}
          className={cn(field, line)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-why`} className={label}>
          {content.fields.why.label}
        </label>
        <textarea
          id={`${id}-why`}
          name="why"
          required
          rows={4}
          placeholder={content.fields.why.placeholder}
          // `py-3` because a text area, unlike an input, sets its first line
          // hard against the top edge.
          className={cn(field, "h-[100px] resize-y py-3")}
        />
      </div>

      {status === "failed" ? (
        <p role="alert" className="font-body text-body-sm text-danger">
          {content.failed}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="plan"
        withArrow
        disabled={status === "sending"}
        className="w-full justify-between"
      >
        {status === "sending" ? content.sending : content.submit}
      </Button>
    </form>
  );
}
