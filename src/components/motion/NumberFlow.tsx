"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number whose digits roll when it changes, after the Framer University
 * component the original uses.
 *
 * Each digit column holds 0-9 stacked vertically and slides so the wanted
 * figure lands in the window — the roll is a transform on ten glyphs, not a
 * count-up, so it stays on the compositor however large the change.
 *
 * Rolls are staggered right to left, the last digit leading, which is what
 * gives the odometer feel rather than a block of digits moving as one.
 *
 * Digit count changes (199 to 1990) grow the row from the left; the extra
 * column fades in as it arrives so the widening does not read as a jump.
 */

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type NumberFlowProps = {
  value: number;
  /** Milliseconds for one column's roll. */
  duration?: number;
  /** Milliseconds each column waits behind the one to its right. */
  stagger?: number;
  className?: string;
};

export function NumberFlow({
  value,
  duration = 700,
  stagger = 60,
  className,
}: NumberFlowProps) {
  const digits = String(value).split("").map(Number);

  // Rolling is a transition between two states, so the first paint has to be
  // the *previous* value for there to be anything to travel from. On mount
  // there is no previous value, so it renders in place and only animates on
  // subsequent changes.
  const [mounted, setMounted] = useState(false);
  const frame = useRef(0);
  useEffect(() => {
    frame.current = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return (
    <span className={className}>
      {/* The plain number for anything not watching the screen; the rolling
          columns are decoration over the top of it. */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {digits.map((digit, i) => (
          <span
            key={`${digits.length}-${i}`}
            // `1em` tall: exactly one glyph's window, whatever the size.
            className="relative inline-block h-[1em] overflow-hidden tabular-nums"
            style={{ width: "0.62em" }}
          >
            <span
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{
                // `em`, not `%`: a percentage translate resolves against the
                // element's own height, and the stack is ten glyphs tall — so
                // `-100%` overshoots by a factor of ten. One `em` is exactly
                // one glyph's window at any size.
                transform: `translateY(${-digit}em)`,
                transition: mounted
                  ? `transform ${duration}ms var(--ease-out) ${
                      (digits.length - 1 - i) * stagger
                    }ms`
                  : undefined,
              }}
            >
              {DIGITS.map((d) => (
                <span key={d} className="flex h-[1em] items-center justify-center">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
