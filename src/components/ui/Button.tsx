import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Button / link primitive.
 *
 * Renders a `next/link`, a plain anchor or a real `<button>` depending on the
 * props, so navigation is always a link and actions are always buttons — the
 * accessibility distinction Framer exports usually lose.
 *
 * Hover motion is CSS, not Framer Motion, so this stays a server component and
 * contributes nothing to the client bundle. Hover effects are gated behind
 * `@media (hover: hover)` via Tailwind's `hover:` on touch-capable devices
 * being sticky — see the `group-hover` usage below paired with `motion-safe`.
 */

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-pill font-body " +
  "text-body-sm font-medium whitespace-nowrap transition-colors duration-[--duration-hover] " +
  "ease-[--ease-out] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-accent text-accent-fg hover:bg-accent/90",
  secondary: "bg-surface text-fg border border-border hover:bg-surface-hover",
  outline: "border border-border-strong text-fg hover:bg-surface",
  ghost: "text-fg-muted hover:text-fg",
} as const;

const sizes = {
  sm: "h-9 px-4",
  md: "h-11 px-5",
  lg: "h-13 px-7 text-body-md",
} as const;

type BaseProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Appends a trailing arrow that nudges on hover. */
  withArrow?: boolean;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: never };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Inner({ children, withArrow }: Pick<BaseProps, "children" | "withArrow">) {
  return (
    <>
      {children}
      {withArrow ? (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-[--duration-hover] ease-[--ease-out] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        />
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", withArrow, className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  // Strip the presentational props so only real DOM attributes are spread.
  const { children: _, variant: __, size: ___, withArrow: ____, className: _____, ...domProps } =
    props;

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = domProps as { href: string } & Record<string, unknown>;
    const isExternal = /^(https?:|mailto:|tel:)/.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          rel="noopener noreferrer"
          target={href.startsWith("http") ? "_blank" : undefined}
          {...rest}
        >
          <Inner withArrow={withArrow}>{children}</Inner>
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...rest}>
        <Inner withArrow={withArrow}>{children}</Inner>
      </Link>
    );
  }

  return (
    <button className={classes} {...(domProps as ComponentPropsWithoutRef<"button">)}>
      <Inner withArrow={withArrow}>{children}</Inner>
    </button>
  );
}
