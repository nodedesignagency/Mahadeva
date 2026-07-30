import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The single source of truth for content width and horizontal gutters.
 *
 * Sections must not add their own horizontal padding — that is how a codebase
 * drifts into inconsistent edges. Wrap content in a Container instead.
 */

type ContainerProps = {
  children: ReactNode;
  /** `wide` for full-bleed-ish showcase rows; `narrow` for prose. */
  width?: "default" | "wide" | "narrow";
  as?: ElementType;
  className?: string;
};

const widths = {
  default: "max-w-[var(--container-max)]",
  wide: "max-w-[var(--container-max-wide)]",
  narrow: "max-w-[48rem]",
} as const;

export function Container({
  children,
  width = "default",
  as: Tag = "div",
  className,
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-gutter", widths[width], className)}>{children}</Tag>
  );
}
