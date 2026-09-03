"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Field,
  FormSent,
  formControl,
  formLine,
  type FormStatus,
} from "@/components/ui/Field";
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
 * It is built from the same parts as that form — see components/ui/Field.
 * These are inputs on a light panel and there is no reason for the site to
 * have two kinds.
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

export function ApplyForm({ content, role }: ApplyFormProps) {
  const id = useId();
  const [status, setStatus] = useState<FormStatus>("idle");

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

  if (status === "sent") {
    return <FormSent title={content.sent.title} body={content.sent.body} />;
  }

  return (
    <form
      aria-label={content.label}
      onSubmit={onSubmit}
      // The owner's measurements: 32 top and bottom, 20 either side, and 20
      // between one field and the next. Flat rather than growing at the tablet
      // breakpoint — the fields are what should get the width, and the panel
      // beside it carries the generous padding instead.
      className="flex h-full flex-col gap-5 px-5 py-8"
    >
      <Field htmlFor={`${id}-name`} label={content.fields.name.label}>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder={content.fields.name.placeholder}
          className={cn(formControl, formLine)}
        />
      </Field>

      {/* Email and phone share a row from tablet up, as in the design, and
          stack below it — two half-width fields on a phone are unusable. */}
      <div className="flex flex-col gap-6 tablet:flex-row tablet:gap-5">
        <Field
          htmlFor={`${id}-email`}
          label={content.fields.email.label}
          className="flex-1"
        >
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={content.fields.email.placeholder}
            className={cn(formControl, formLine)}
          />
        </Field>

        <Field
          htmlFor={`${id}-phone`}
          label={content.fields.phone.label}
          className="flex-1"
        >
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={content.fields.phone.placeholder}
            className={cn(formControl, formLine)}
          />
        </Field>
      </div>

      <Field htmlFor={`${id}-resume`} label={content.fields.resume.label}>
        {/* A link rather than an upload. A file input needs somewhere to put
            the file, and this form posts JSON to an endpoint the owner
            chooses — a URL is the one thing every provider can take. */}
        <input
          id={`${id}-resume`}
          name="resume"
          type="url"
          required
          placeholder={content.fields.resume.placeholder}
          className={cn(formControl, formLine)}
        />
      </Field>

      <Field htmlFor={`${id}-why`} label={content.fields.why.label}>
        <textarea
          id={`${id}-why`}
          name="why"
          required
          rows={4}
          placeholder={content.fields.why.placeholder}
          // `py-3` because a text area, unlike an input, sets its first line
          // hard against the top edge.
          className={cn(formControl, "h-[100px] resize-y px-4 py-3")}
        />
      </Field>

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
