"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { generateTracks, type Orientation } from "@/lib/patternField";
import { cn } from "@/lib/cn";

/**
 * The signature background: flush tracks of pastel cells that open and close.
 *
 * The arrangement turns ninety degrees at the mobile breakpoint. From tablet up
 * a field is seven vertical columns down a side edge — the `1st`..`7th` groups
 * in the Framer component — with bars growing up or down. On mobile it becomes
 * a band of three horizontal rows across the top or bottom, with bars growing
 * left or right, because a narrow screen has no room for a side field.
 *
 * Only the axis changes: the same generator produces both, and the same rules
 * govern spacing, rotation and colour. See lib/patternField.
 */

type PatternFieldProps = {
  /** Which field this is — the key its seed is stored under. */
  side: keyof typeof patternField.seeds;
  orientation: Orientation;
  /** Tracks to build, where the breakpoint's own count is not wanted. */
  tracks?: number;
  className?: string;
};

export function PatternField({
  side,
  orientation,
  tracks: trackCount,
  className,
}: PatternFieldProps) {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState(0);

  const { stateCount, stateInterval, transition } = patternField;
  const tracks = useMemo(
    () => generateTracks(patternField.seeds[side], orientation, trackCount),
    [side, orientation, trackCount],
  );

  // Cycle through the arrangements. Held still under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(
      () => setState((s) => (s + 1) % stateCount),
      stateInterval,
    );
    return () => clearInterval(id);
  }, [reduced, stateCount, stateInterval]);

  const isVertical = orientation === "vertical";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute flex overflow-hidden",
        // Vertical fields run the full height of a side edge; horizontal ones
        // span the full width of a top or bottom band.
        isVertical ? "inset-y-0 flex-row" : "inset-x-0 flex-col",
        className,
      )}
    >
      {tracks.map((track, trackIndex) => (
        <div
          key={trackIndex}
          className={cn(
            "mh-track flex",
            isVertical ? "h-full flex-col" : "w-full shrink-0 flex-row",
          )}
          // Vertical columns divide the field proportionally rather than taking
          // fixed pixel widths, so a field set to a percentage of the viewport
          // narrows its columns with it instead of holding its size and
          // crowding the centred content on a smaller screen. `thickness` is
          // read as a ratio here; at a desktop width the result lands within a
          // few pixels of the original fixed values.
          //
          // Horizontal rows keep fixed heights — vertical space is not what
          // runs out on a narrow screen.
          style={
            isVertical
              ? { flex: `${track.thickness} 1 0%` }
              : { height: track.thickness }
          }
        >
          {track.cells.map((cell, cellIndex) => {
            // The spacing rules leave some cells closed in every state. They
            // still occupy their slot — slots are what give the track its
            // proportions — but rendering them as motion elements would animate
            // a third of the field with nothing to show.
            const animates = cell.open.some(Boolean);
            const scale = cell.open[state] ? cell.target : 0;

            return (
              <div
                key={cellIndex}
                // The slot holds its size regardless of the bar's scale, so the
                // track never reflows as cells open and close.
                className={isVertical ? "w-full" : "h-full"}
                style={{ flex: `${cell.weight} 1 0%` }}
              >
                {animates ? (
                  <motion.span
                    className="block h-full w-full will-change-transform"
                    style={{
                      background: cell.color,
                      transformOrigin: isVertical
                        ? cell.origin === "start"
                          ? "top"
                          : "bottom"
                        : cell.origin === "start"
                          ? "left"
                          : "right",
                    }}
                    // `initial` renders inline during SSR, so the first paint
                    // already shows state 0 and nothing snaps on hydration.
                    initial={
                      isVertical
                        ? { scaleY: cell.open[0] ? cell.target : 0 }
                        : { scaleX: cell.open[0] ? cell.target : 0 }
                    }
                    animate={isVertical ? { scaleY: scale } : { scaleX: scale }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { ...transition, delay: cell.stagger / 1000 }
                    }
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
