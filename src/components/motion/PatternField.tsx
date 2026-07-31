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
  /** Which edge of the hero this field sits against. */
  side: "left" | "right" | "top" | "bottom";
  orientation: Orientation;
  className?: string;
};

export function PatternField({ side, orientation, className }: PatternFieldProps) {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState(0);

  const { stateCount, stateInterval, transition } = patternField;
  const tracks = useMemo(
    () => generateTracks(patternField.seeds[side], orientation),
    [side, orientation],
  );

  // Cycle through the arrangements. Held still under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setState((s) => (s + 1) % stateCount), stateInterval);
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
            "mh-track flex shrink-0",
            isVertical ? "h-full flex-col" : "w-full flex-row",
          )}
          style={isVertical ? { width: track.thickness } : { height: track.thickness }}
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
