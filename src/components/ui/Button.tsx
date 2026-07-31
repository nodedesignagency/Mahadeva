import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Button / link primitive.
 *
 * Renders a `next/link`, a plain anchor or a real `<button>` depending on the
 * props, so navigation is always a link and actions are always buttons — the
 * accessibility distinction Framer exports lose.
 *
 * The design pairs a rectangular body with an inset square icon box whose
 * colours invert against the button, so the arrow reads as a cut-out. Hover
 * motion is CSS, keeping this a server component with no client bundle cost.
 */

const base =
  "group relative inline-flex items-center justify-between gap-3 rounded-[--radius-button] " +
  // Same face and size as body copy, set in caps — the original's button style.
  "font-body uppercase whitespace-nowrap " +
  "transition-colors duration-[--duration-hover] ease-[--ease-out] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants = {
  /** White body, dark label, dark icon box. */
  primary: "bg-fg text-fg-inverse hover:bg-fg/90",
  /** Dark body with a hairline border, light label, light icon box. */
  secondary: "bg-surface text-fg border border-border hover:bg-surface-hover",
  outline: "border border-border-strong text-fg hover:bg-surface",
  ghost: "text-fg-muted hover:text-fg px-0",
} as const;

/** Icon box colours, inverted against each variant's body. */
const iconBoxes = {
  primary: "bg-fg-inverse text-fg",
  secondary: "bg-fg text-fg-inverse",
  outline: "bg-fg text-fg-inverse",
  ghost: "bg-transparent text-current",
} as const;

/**
 * Sizes follow the original's measurements: a 44px body with 12px of padding
 * on the label side and 4px on the other three, which is exactly the margin
 * around the 36px icon box.
 */
const sizes = {
  sm: "h-9 text-body-sm ps-3 pe-1",
  md: "h-11 text-body-md ps-3 pe-1",
} as const;

const iconSizes = {
  sm: "size-7",
  md: "size-9",
} as const;

type BaseProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Renders the inset square icon box with a diagonal arrow. */
  withArrow?: boolean;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: never };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Inner({
  children,
  withArrow,
  variant,
  size,
}: Required<Pick<BaseProps, "children" | "variant" | "size">> & Pick<BaseProps, "withArrow">) {
  return (
    <>
      <span>{children}</span>
      {withArrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-[calc(var(--radius-button)-2px)]",
            iconSizes[size],
            iconBoxes[variant],
          )}
        >
          <ArrowUpRight className="size-4 transition-transform duration-[--duration-hover] ease-[--ease-out] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
        </span>
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", withArrow, className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  // Strip presentational props so only real DOM attributes are spread.
  const { children: _, variant: __, size: ___, withArrow: ____, className: _____, ...domProps } =
    props;

  const inner = (
    <Inner withArrow={withArrow} variant={variant} size={size}>
      {children}
    </Inner>
  );

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
          {inner}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={classes} {...(domProps as ComponentPropsWithoutRef<"button">)}>
      {inner}
    </button>
  );
}
