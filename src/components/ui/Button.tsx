import Link from "next/link";
import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from "react";
import { ButtonArrow } from "@/components/ui/SiteIcons";
import { cn } from "@/lib/cn";
import { buttonSweep } from "@/config/animation";

/**
 * Button / link primitive.
 *
 * Renders a `next/link`, a plain anchor or a real `<button>` depending on the
 * props, so navigation is always a link and actions are always buttons — the
 * accessibility distinction Framer exports lose.
 *
 * The design pairs a rectangular body with an inset square icon box whose
 * colours invert against the button, so the arrow reads as a cut-out. Hover
 * motion is CSS, keeping this a server component with no client bundle cost —
 * including the sweep, whose spring is baked into a `linear()` easing rather
 * than run by a JS animation loop. See `buttonSweep` in src/config/animation.ts.
 */

const base =
  // `mh-arrow-swap` is the hover trigger for the icon box's two arrows — see
  // `.mh-cta-arrow-*` in globals.css, which the FAQ's strategy-call card
  // already used. The class sits on the button rather than on the box because
  // the swap answers the whole button, not the corner of it.
  "mh-arrow-swap group relative inline-flex items-center justify-between gap-3 rounded-(--radius-button) " +
  // Same face and size as body copy, set in caps — the original's button style.
  "font-body uppercase whitespace-nowrap " +
  "transition-colors duration-(--duration-hover) ease-(--ease-out) " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants = {
  /**
   * White body, dark label, dark icon box. No hover colour of its own — the
   * accent sweep supplies the whole hover state, and the label is already dark
   * so it stays put as the fill arrives.
   */
  primary: "bg-fg text-fg-inverse",
  /** Solid dark body, no border, light label, light icon box. */
  secondary: "bg-button-secondary text-fg",
  /**
   * The pricing plans' call to action: the site's dark green body with a white
   * label, and — unlike `secondary` — a white icon box holding a dark green
   * arrow. Hovering fills it with the accent, where the label turns dark while
   * the box stays white, so the arrow never changes.
   */
  plan: "bg-bg text-fg",
  /**
   * The comparison table's call to action. `primary`'s white body, but the
   * arrow rides a quiet grey frame rather than a dark one — three of them sit
   * side by side on the tinted column heads, where three dark blocks read as
   * the loudest thing in the table.
   */
  compare: "bg-fg text-fg-inverse",
  outline: "border border-border-strong text-fg hover:bg-surface",
  ghost: "text-fg-muted hover:text-fg px-0",
} as const;

/**
 * Which variants get the accent sweep. The two solid-bodied ones do; `outline`
 * and `ghost` are transparent, so bars sliding behind them would read as a
 * floating block rather than a fill.
 */
const sweeps: Record<keyof typeof variants, boolean> = {
  primary: true,
  secondary: true,
  plan: true,
  compare: true,
  outline: false,
  ghost: false,
};

/**
 * Label colour once the accent is underneath. Only `secondary` changes: its
 * label is light against the dark body and would vanish on the accent.
 */
const sweptLabels: Partial<Record<keyof typeof variants, string>> = {
  secondary: "group-hover:text-fg-inverse group-focus-visible:text-fg-inverse",
  plan: "group-hover:text-fg-inverse group-focus-visible:text-fg-inverse",
};

/** Icon box colours, inverted against each variant's body. */
const iconBoxes = {
  primary: "bg-fg-inverse text-fg",
  compare: "bg-icon-box-quiet text-fg-inverse",
  secondary: "bg-fg text-fg-inverse",
  plan: "bg-fg text-fg-inverse",
  outline: "bg-fg text-fg-inverse",
  ghost: "bg-transparent text-current",
} as const;

/**
 * Sizes follow the original's measurements: a 44px body with 12px of padding
 * on the label side and 4px on the other three, which is exactly the margin
 * around the 36px icon box.
 */
const sizes = {
  /**
   * The header CTA: 33px tall with 12px of padding on the sides and 8px top
   * and bottom, to the owner's measurement. Symmetric, unlike the hero sizes —
   * it carries no icon box, so there is no narrow side to trim for.
   */
  nav: "h-[33px] text-body-sm px-3 py-2",
  sm: "h-9 text-body-sm ps-3 pe-1",
  md: "h-11 text-body-md ps-3 pe-1",
} as const;

const iconSizes = {
  nav: "size-6",
  sm: "size-7",
  md: "size-9",
} as const;

/**
 * How far each arrow travels, in pixels, per size of box.
 *
 * Half the box plus the arrow's own width, which is the distance at which a
 * 16px arrow is fully outside a box of that size — the whole point of clipping
 * it. Short of that, a corner of the arriving arrow sits in the box at rest and
 * the button shows two. The card that this gesture comes from has a 32px box
 * and travels 24; these are the same sum for 24, 28 and 36.
 */
const arrowTravels = {
  nav: 20,
  sm: 22,
  md: 26,
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

type ButtonProps = ButtonAsButton | ButtonAsLink;

function Inner({
  children,
  withArrow,
  variant,
  size,
}: Required<Pick<BaseProps, "children" | "variant" | "size">> & Pick<BaseProps, "withArrow">) {
  return (
    <>
      {sweeps[variant] ? <Sweep /> : null}
      <span
        className={cn(
          sweeps[variant] && "mh-sweep-label",
          sweptLabels[variant],
        )}
        style={
          sweeps[variant]
            ? ({
                "--mh-label-duration": `${buttonSweep.label.duration}ms`,
                "--mh-label-delay-in": `${buttonSweep.label.delayIn}ms`,
                "--mh-label-delay-out": `${buttonSweep.label.delayOut}ms`,
              } as CSSProperties)
            : undefined
        }
      >
        {children}
      </span>
      {withArrow ? (
        <span
          aria-hidden="true"
          className={cn(
            // `relative` lifts the icon box out of the sweep's stacking order,
            // so the bars pass behind it rather than over it.
            //
            // `overflow-hidden` is what makes the pair below read as a swap
            // rather than as two arrows sliding about: the box clips them, so
            // one leaves through its top right corner as the other arrives
            // from the bottom left, and the box is never empty and never
            // shows the same mark twice.
            "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-(--radius-icon)",
            iconSizes[size],
            iconBoxes[variant],
          )}
          // Only the throw. The swap's own timing is `--duration-arrow-swap`
          // and `--ease-arrow-swap`, which are the design file's and the same
          // wherever this gesture appears, so they are not passed in per use.
          style={{ "--mh-cta-travel": `${arrowTravels[size]}px` } as CSSProperties}
        >
          <ButtonArrow className="mh-cta-arrow-out absolute size-4" />
          <ButtonArrow className="mh-cta-arrow-in absolute size-4" />
        </span>
      ) : null}
    </>
  );
}

/**
 * The four accent bars behind the label.
 *
 * Clipping lives on this wrapper rather than on the button so the focus ring —
 * which the base layer draws with a 3px offset, outside the button's box — is
 * not cut off by it.
 *
 * Decorative, so it is hidden from assistive tech; the hover state carries no
 * information that the label does not.
 */
function Sweep() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-(--radius-button)"
    >
      {buttonSweep.bars.map((bar, i) => (
        <span
          key={i}
          className="mh-sweep"
          style={
            {
              // Equal bands filling the button: quarters, matching the
              // original's four 11px rectangles in a 44px body.
              top: `${i * (100 / buttonSweep.bars.length)}%`,
              height: `${100 / buttonSweep.bars.length}%`,
              // Past the button's own width, so the bar clears any width.
              "--mh-sweep-from": `calc(-100% - ${bar.overhang}px)`,
              "--mh-sweep-delay-in": `${bar.delayIn}ms`,
              "--mh-sweep-delay-out": `${bar.delayOut}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
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
