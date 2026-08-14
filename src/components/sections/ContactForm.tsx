"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { contactContent } from "@/content/contact";
import { sendEnquiry } from "@/lib/contact";
import { cn } from "@/lib/cn";

/**
 * The enquiry form — the white half of the contact panel.
 *
 * A real `<form>` with real labels and a real submit: the browser's own
 * validation does the work, so an empty required field is caught and announced
 * without a line of JavaScript, and the page still submits sensibly if the
 * script never runs.
 *
 * What it collects is here; where it goes is `src/lib/contact.ts`. The split
 * matters — connecting this to a provider should never mean opening a
 * component.
 */

type ContactFormProps = {
  content: typeof contactContent.form;
};

type Status = "idle" | "sending" | "sent" | "failed";

/** One field's shell: white, hairline, and the ink of the surface it sits on. */
const field =
  "w-full rounded-(--radius-input) border border-border-on-light bg-bg-white " +
  "px-4 py-3 font-body text-body-md text-fg-on-light " +
  "placeholder:text-fg-on-light-muted " +
  "transition-colors duration-(--duration-hover) ease-(--ease-out) " +
  "focus:border-fg-on-light focus:outline-none";

const label = "font-body text-body-md text-fg-on-light";

export function ContactForm({ content }: ContactFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setStatus("sending");
    try {
      await sendEnquiry({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        company: String(data.get("company") ?? ""),
        budget: String(data.get("budget") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setStatus("sent");
    } catch (error) {
      console.error("[contact] enquiry failed to send.", error);
      setStatus("failed");
    }
  }

  // The form is replaced rather than covered: leaving the fields on screen
  // behind a message invites a second submission of the same enquiry.
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
      noValidate={false}
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
          className={field}
        />
      </div>

      {/* Email and company share a row from tablet up, as in the design, and
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
            className={field}
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor={`${id}-company`} className={label}>
            {content.fields.company.label}
          </label>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            placeholder={content.fields.company.placeholder}
            className={field}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-budget`} className={label}>
          {content.fields.budget.label}
        </label>
        {/* The native select, restyled rather than rebuilt. A custom listbox
            here would be a keyboard and screen-reader surface to maintain for
            five options, and on a phone the platform picker is better than
            anything a page can draw. */}
        <div className="relative">
          <select
            id={`${id}-budget`}
            name="budget"
            required
            defaultValue=""
            className={cn(field, "appearance-none pe-11")}
          >
            <option value="" disabled>
              {content.fields.budget.placeholder}
            </option>
            {content.budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-fg-on-light-muted"
          />
        </div>
      </div>

      {/* Grows with the panel rather than taking a fixed height: it is the last
          field, so the room the rest of the form leaves is the room it gets. */}
      <div className="flex flex-1 flex-col gap-2">
        <label htmlFor={`${id}-message`} className={label}>
          {content.fields.message.label}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={4}
          placeholder={content.fields.message.placeholder}
          className={cn(field, "min-h-[120px] flex-1 resize-y")}
        />
      </div>

      {status === "failed" ? (
        <p role="alert" className="font-body text-body-sm text-danger">
          {content.failed}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        withArrow
        disabled={status === "sending"}
        className="w-full justify-between"
      >
        {status === "sending" ? content.sending : content.submit}
      </Button>
    </form>
  );
}
