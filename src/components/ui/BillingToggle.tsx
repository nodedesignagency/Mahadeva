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
 * the site's dark green, and the mark in the empty half switches from ring to
 * bar with it.
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
        {/* The mark the original shows in the track's empty half — the point
            the knob is travelling toward. It is the power pair: a ring while
            off, a bar once on.
            Two elements rather than one that changes shape. Animating a single
            span between them narrows the ring into the bar, and a circle
            collapsing sideways reads as a square mid-way. Each simply fades
            in its own half of the track instead. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 right-3 size-3 -translate-y-1/2 rounded-full border-2 border-bg-white transition-opacity duration-(--duration-base) ease-(--ease-in-out)"
          style={{ opacity: yearly ? 0 : 1 }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-[1.0625rem] h-3 w-0.5 -translate-y-1/2 bg-bg-white transition-opacity duration-(--duration-base) ease-(--ease-in-out)"
          style={{ opacity: yearly ? 1 : 0 }}
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
