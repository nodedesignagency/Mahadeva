"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Field,
  FormSent,
  formControl,
  formLine,
  type FormStatus,
} from "@/components/ui/Field";
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
 * The shell, the label, the sent panel and the four states are shared with the
 * application form on a role's page — see components/ui/Field. The two panels
 * are the same object on two pages and should not drift apart.
 *
 * What it collects is here; where it goes is `src/lib/contact.ts`. The split
 * matters — connecting this to a provider should never mean opening a
 * component.
 */

type ContactFormProps = {
  content: typeof contactContent.form;
};

export function ContactForm({ content }: ContactFormProps) {
  const id = useId();
  const [status, setStatus] = useState<FormStatus>("idle");

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

  if (status === "sent") {
    return <FormSent title={content.sent.title} body={content.sent.body} />;
  }

  return (
    <form
      aria-label={content.label}
      onSubmit={onSubmit}
      noValidate={false}
      // The owner's measurements, shared with the application form: 32 top and
      // bottom, 20 either side, and 20 between one field and the next.
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

      {/* Email and company share a row from tablet up, as in the design, and
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
          htmlFor={`${id}-company`}
          label={content.fields.company.label}
          className="flex-1"
        >
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            placeholder={content.fields.company.placeholder}
            className={cn(formControl, formLine)}
          />
        </Field>
      </div>

      <Field htmlFor={`${id}-budget`} label={content.fields.budget.label}>
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
            className={cn(formControl, formLine, "appearance-none pe-11")}
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
      </Field>

      <Field htmlFor={`${id}-message`} label={content.fields.message.label}>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={4}
          placeholder={content.fields.message.placeholder}
          // 100 to the owner. `py-3` because a text area, unlike an input,
          // sets its first line hard against the top edge.
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
