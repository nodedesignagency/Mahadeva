"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ctaFringe } from "@/config/animation";

/**
 * The closing panel and its pixel fringe.
 *
 * The original holds both states in one component and scrolls between them:
 * bare as the panel comes up the screen, fully fringed by the time it is
 * settled. Here that is one scroll progress driving all seven moving cells —
 * from the panel's top entering the viewport to the panel being centred, which
 * is a range it always completes, unlike anything measured against the top of
 * a page that ends a few hundred pixels later.
 *
 * The cells that grow are the panel's own green, so at rest — flush with the
 * edge, or scaled down to a tenth — they are invisible against it. Nothing is
 * hidden and then shown; they emerge from the panel.
 *
 * A client component, and the only one in the footer: it reads scroll.
 */

/**
 * A cell's box. `w`/`h` are the config's names for them, and spreading those
 * into a style does nothing at all — they are not CSS properties, and a cell
 * given no size is a cell that renders as nothing.
 */
function box(cell: {
  w: number;
  h: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}) {
  const { w, h, ...edges } = cell;
  return { width: w, height: h, ...edges };
}

type CtaPanelProps = {
  /** The panel's contents, rendered on the server and passed through. */
  children: ReactNode;
  className: string;
};

export function CtaPanel({ children, className }: CtaPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: panel,
    offset: ["start end", "center center"],
  });

  // Reduced motion gets the finished arrangement rather than a bare panel:
  // the fringe is part of the design, only its arrival is motion.
  const settled = useMotionValue(1);
  const progress = reduced ? settled : scrollYProgress;

  const width = useTransform(progress, [0, 1], [0, ctaFringe.grown[0].w]);
  const scale = useTransform(progress, [0, 1], [ctaFringe.restScale, 1]);
  // One transform per distance, since a hook cannot be called in a loop.
  const dropShort = useTransform(progress, [0, 1], [0, 40]);
  const dropLong = useTransform(progress, [0, 1], [0, 80]);

  return (
    <div ref={panel} className="relative">
      <div className={className}>{children}</div>

      {/* Over the panel, so the dark cells read as bites out of it. Drawn at
          every width: the panel keeps the page's gutters on a phone, so the
          cells still have ground to stand on either side of it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {ctaFringe.fixed.map((cell, i) => (
          <span
            key={`fixed-${i}`}
            className="absolute bg-bg"
            style={box(cell)}
          />
        ))}

        {ctaFringe.grown.map((cell, i) => (
          <motion.span
            key={`grown-${i}`}
            className="absolute bg-cta"
            style={
              cell.grow === "width"
                ? { ...box(cell), width }
                : { ...box(cell), scale }
            }
          />
        ))}

        {ctaFringe.dropped.map((cell, i) => (
          <motion.span
            key={`dropped-${i}`}
            className="absolute bg-cta"
            style={{ ...box(cell), y: cell.drop === 80 ? dropLong : dropShort }}
          />
        ))}
      </div>
    </div>
  );
}
