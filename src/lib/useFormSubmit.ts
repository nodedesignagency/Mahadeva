"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { HONEYPOT, type FormStatus } from "@/components/ui/Field";
import { formFeedback } from "@/config/animation";

/**
 * The state machine both forms submit through.
 *
 * Idle, then busy, then sent — and a moment later idle again with the fields
 * cleared, which is the part worth having in one place. The enquiry form and
 * the application form differ in what they collect and where it goes, and in
 * nothing else; they had a copy each of this handler before, identical down to
 * the honeypot comment.
 *
 * What is deliberately *not* here is what the form says about any of it. The
 * labels, the failure notice and the announcement are `FormSubmit`'s, so a
 * form's copy stays in `src/content` with the rest of the site's words.
 */

type Options = {
  /** Where the answers go. Handed the form's own data, untouched. */
  send: (data: FormData) => Promise<void>;
  /** What the console is told if they do not arrive. */
  failureLog: string;
};

export function useFormSubmit({ send, failureLog }: Options) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const clearing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  // A reader who navigates away mid-send leaves both a pending floor and a
  // timer holding a form that is no longer mounted. The flag is set on the way
  // in as well as cleared on the way out, because Strict Mode mounts, unmounts
  // and mounts again in development — set only once, the second mount would
  // come up already marked dead.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (clearing.current) clearTimeout(clearing.current);
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /**
     * Read the element out of the event now rather than when it is wanted.
     * React sets `currentTarget` back to null once the handler returns, and
     * the reset below runs two seconds after that — by then the event has
     * nothing left to point at, and `form.reset()` would throw on null.
     */
    const form = event.currentTarget;
    const data = new FormData(form);

    /**
     * Report it sent, hold that long enough to be read, then hand back an
     * empty form. `reset()` rather than clearing the fields by hand: it is the
     * platform's own, it restores every control to the default it was rendered
     * with — including the budget select, back to its placeholder — and it
     * cannot miss a field somebody adds later.
     */
    const settle = () => {
      setStatus("sent");
      clearing.current = setTimeout(() => {
        form.reset();
        setStatus("idle");
      }, formFeedback.hold);
    };

    // Filled means a bot filled it, since nobody is shown it. Answered with
    // the sent state rather than an error: a bot told its message bounced
    // tries again, and a bot told it worked goes away.
    if (String(data.get(HONEYPOT) ?? "")) {
      settle();
      return;
    }

    setStatus("sending");
    const startedAt = Date.now();
    let failed = false;

    try {
      await send(data);
    } catch (error) {
      console.error(failureLog, error);
      failed = true;
    }

    // Hold the busy state to its floor before reporting either outcome. See
    // `formFeedback.minBusy` — with no endpoint set the send resolves in the
    // same tick, and without this the spinner is never painted at all.
    const elapsed = Date.now() - startedAt;
    if (elapsed < formFeedback.minBusy) {
      await new Promise((resolve) => setTimeout(resolve, formFeedback.minBusy - elapsed));
    }

    if (!alive.current) return;

    // Failure is left on `failed` rather than settled: the fields keep what was
    // typed, so trying again is pressing the button rather than filling it all
    // in a second time.
    if (failed) setStatus("failed");
    else settle();
  }

  return { status, onSubmit };
}
