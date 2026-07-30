import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Typography primitives.
 *
 * Visual size is decoupled from semantic level: a section heading can be an
 * <h2> for document structure while looking like the display scale. This
 * prevents the usual template failure of choosing heading tags for their looks
 * and ending up with a broken outline.
 */

const headingSizes = {
  "display-2xl": "text-display-2xl text-balance-display font-medium",
  "display-xl": "text-display-xl text-balance-display font-medium",
  "display-lg": "text-display-lg text-balance-display font-medium",
  "heading-lg": "text-heading-lg font-medium",
  "heading-md": "text-heading-md font-medium",
  "heading-sm": "text-heading-sm font-medium",
} as const;

type HeadingProps = {
  children: ReactNode;
  /** Semantic level — pick for document outline, not for size. */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  /** Visual scale — pick for looks. */
  size?: keyof typeof headingSizes;
  id?: string;
  className?: string;
};

export function Heading({
  children,
  as: Tag = "h2",
  size = "heading-lg",
  id,
  className,
}: HeadingProps) {
  return (
    <Tag id={id} className={cn("font-display text-fg", headingSizes[size], className)}>
      {children}
    </Tag>
  );
}

const textSizes = {
  lg: "text-body-lg",
  md: "text-body-md",
  sm: "text-body-sm",
} as const;

const textTones = {
  default: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
} as const;

type TextProps = {
  children: ReactNode;
  as?: ElementType;
  size?: keyof typeof textSizes;
  tone?: keyof typeof textTones;
  className?: string;
};

export function Text({
  children,
  as: Tag = "p",
  size = "md",
  tone = "muted",
  className,
}: TextProps) {
  return (
    <Tag className={cn("font-body", textSizes[size], textTones[tone], className)}>{children}</Tag>
  );
}

/** Small uppercase kicker that sits above most section headings. */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("eyebrow font-mono", className)}>{children}</Tag>;
}
