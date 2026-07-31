"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { patternField } from "@/config/animation";
import { generateColumns } from "@/lib/patternField";
import { cn } from "@/lib/cn";

/**
 * The signature background: columns of pastel cells that open and close.
 *
 * Structure mirrors the Framer component. A field is seven vertical columns
 * (`1st`..`7th`) flush against each other, each stacking five to seven cells
 * (`1`..`7`) with no gap. Every cell holds one bar that grows within its own
 * slot, so bars in a column share an x position and width.
 *
 * Geometry is fixed; only which cells are open changes between states, and each
 * cell toggles between 0 and a single target height. The layout and the rules
 * that govern it live in lib/patternField.
 */

type PatternFieldProps = {
  /** Which edge of the viewport this field occupies. */
  side: "left" | "right";
  className?: string;
};

export function PatternField({ side, className }: PatternFieldProps) {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState(0);

  const { stateCount, stateInterval, transition } = patternField;
  const columns = useMemo(() => generateColumns(patternField.seeds[side]), [side]);

  // Cycle through the arrangements. Held still under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setState((s) => (s + 1) % stateCount), stateInterval);
    return () => clearInterval(id);
  }, [reduced, stateCount, stateInterval]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 flex overflow-hidden", className)}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="mh-col flex h-full shrink-0 flex-col"
          style={{ width: `${column.width}px` }}
        >
          {column.cells.map((cell, cellIndex) => {
            // The spacing rules leave some cells closed in every state. They
            // still have to occupy their slot — the slots are what give the
            // column its proportions — but rendering them as motion elements
            // would animate around a third of the field for no visible effect.
            const animates = cell.open.some(Boolean);

            return (
              <div
                key={cellIndex}
                // The slot holds its height regardless of the bar's scale, so
                // the stack never reflows as cells open and close.
                className="w-full"
                style={{ flex: `${cell.weight} 1 0%` }}
              >
                {animates ? (
                  <motion.span
                    className="block h-full w-full will-change-transform"
                    style={{ background: cell.color, transformOrigin: cell.origin }}
                    initial={{ scaleY: cell.open[0] ? cell.target : 0 }}
                    animate={{ scaleY: cell.open[state] ? cell.target : 0 }}
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
