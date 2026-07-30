import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

/**
 * A page section: semantic landmark, consistent vertical rhythm, optional
 * anchor id, and an accessible name derived from its heading.
 *
 * Vertical spacing comes only from the `spacing` token — never ad-hoc margins —
 * so the page's rhythm stays even as sections are reordered or removed.
 */

type SectionProps = {
  children: ReactNode;
  /** Anchor target for in-page navigation. */
  id?: string;
  spacing?: "sm" | "md" | "lg" | "none";
  width?: "default" | "wide" | "narrow";
  /** Set false to opt out of the Container, e.g. for a full-bleed marquee. */
  contained?: boolean;
  /**
   * Points at the id of the section's heading element. Gives the landmark an
   * accessible name so screen-reader users can navigate between sections.
   */
  labelledBy?: string;
  className?: string;
};

const spacings = {
  sm: "py-section-sm",
  md: "py-section-md",
  lg: "py-section-lg",
  none: "",
} as const;

export function Section({
  children,
  id,
  spacing = "md",
  width = "default",
  contained = true,
  labelledBy,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative", spacings[spacing], className)}
    >
      {contained ? <Container width={width}>{children}</Container> : children}
    </section>
  );
}
