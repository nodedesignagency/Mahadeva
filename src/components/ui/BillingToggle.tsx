"use client";

/**
 * Billed monthly / yearly switch.
 *
 * A real checkbox-role button, so it announces its state and answers Space
 * and Enter — the original is a Framer variant swap that a keyboard cannot
 * reach. The labels either side are part of the control's accessible name
 * rather than separate text, so a screen reader hears what is being switched.
 *
 * The depth is the design: the track is carved into the surface and the knob
 * sits proudly on it. Both are shadow pairs in globals.css — a border would
 * draw a line where the original has a lip. Off the track is grey; on it is
 * the site's dark green.
 */

type BillingToggleProps = {
  yearly: boolean;
  onChange: (yearly: boolean) => void;
  labels: { monthly: string; yearly: string };
};

export function BillingToggle({ yearly, onChange, labels }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        aria-hidden="true"
        className="font-body text-body-md transition-colors duration-(--duration-hover) ease-(--ease-out)"
        style={{ color: yearly ? "var(--color-fg-label)" : "var(--color-fg-on-light)" }}
      >
        {labels.monthly}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={yearly}
        aria-label={`Billing period: ${yearly ? labels.yearly : labels.monthly}`}
        onClick={() => onChange(!yearly)}
        className="mh-toggle-track relative h-9 w-[4.25rem] shrink-0 rounded-[5px] transition-colors duration-(--duration-base) ease-(--ease-in-out)"
        style={{
          backgroundColor: yearly ? "var(--color-bg)" : "var(--color-track)",
        }}
      >
        {/* The ring the original shows in the track's empty half — the mark
            the knob is travelling toward. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 transition-all duration-(--duration-base) ease-(--ease-in-out)"
          style={{
            left: yearly ? "0.75rem" : "auto",
            right: yearly ? "auto" : "0.75rem",
            borderColor: yearly
              ? "color-mix(in srgb, var(--color-fg) 60%, transparent)"
              : "var(--color-bg-white)",
          }}
        />

        <span
          aria-hidden="true"
          className="mh-toggle-knob absolute top-1/2 size-7 -translate-y-1/2 rounded-[4px] bg-bg-white transition-[left] duration-(--duration-base) ease-(--ease-in-out)"
          style={{ left: yearly ? "calc(100% - 2rem)" : "0.25rem" }}
        />
      </button>

      <span
        aria-hidden="true"
        className="font-body text-body-md transition-colors duration-(--duration-hover) ease-(--ease-out)"
        style={{ color: yearly ? "var(--color-fg-on-light)" : "var(--color-fg-label)" }}
      >
        {labels.yearly}
      </span>
    </div>
  );
}
