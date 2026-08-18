"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { TextRevealSettings } from "@/config/animation";
import { cn } from "@/lib/cn";

/**
 * Two-bar heading wipe — a port of the template's Framer `TextRevealVariable`
 * component, preserving its exact animation sequence.
 *
 * Per line:
 *
 *   1. Two overlay bars cover the text, both scaleX(0), origin on the leading
 *      edge.
 *   2. Bar 1 sweeps across (scaleX 0 -> 1).
 *   3. Bar 2 sweeps across behind it.
 *   4. With the text fully covered, every word's colour flips from `before` to
 *      `after` at once — invisible to the viewer.
 *   5. Both origins flip to the opposite edge.
 *   6. After `pause`, bar 2 sweeps back off (scaleX 1 -> 0), then bar 1.
 *
 * Total per line ≈ 4 × duration + pause + delay.
 *
 * Each line is its own reveal block with its own bar pair, matching how the
 * original is composed — the Framer file uses a separate component instance per
 * line rather than one block spanning the whole heading.
 *
 * The 250ms colour transition is hardcoded here exactly as in the original,
 * including its own easing curve, which is deliberately different from the
 * overlay easing supplied via settings.
 *
 * Differences from the Framer original, all deliberate:
 *  - `prefers-reduced-motion` skips the wipe and paints the final text.
 *  - The lines sit inside a single heading element carrying the full text as
 *    its accessible name, with the visual pieces `aria-hidden`. The original
 *    marks every line an H1, which would give the page multiple H1s and read as
 *    a stream of fragments to a screen reader.
 *  - Word text is rendered directly rather than through `dangerouslySetInnerHTML`.
 *  - Animations and timers are cancelled on unmount so a fast route change
 *    cannot leave a callback writing to a detached node.
 */

type TextRevealProps = {
  /**
   * One entry per visual line. Each gets its own bar pair.
   *
   * Readonly so `as const` content objects can be passed without a copy.
   */
  lines: readonly string[];
  /**
   * Optional alternative break for mobile, where a long first line may not fit.
   * Both sets render and CSS shows one: measuring the viewport during render
   * would differ between server and client and break hydration.
   */
  mobileLines?: readonly string[];
  settings: TextRevealSettings;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  /**
   * Set where a line is expected to wrap rather than break where it is
   * written — a CMS title, say.
   *
   * The bars are one box per line, so a wrapped line gets one bar over both of
   * its rows and the gap between them disappears under it. This draws them as
   * a repeating band instead, one per row with the line's own gutter between,
   * which is what a pair of authored lines already looks like.
   */
  wraps?: boolean;
  /** Extra milliseconds between consecutive lines starting. */
  lineStagger?: number;
  id?: string;
  className?: string;
  lineClassName?: string;
};

export function TextReveal({
  lines,
  mobileLines,
  settings,
  as: Tag = "h2",
  wraps = false,
  lineStagger = 0,
  id,
  className,
  lineClassName,
}: TextRevealProps) {
  const reduced = useReducedMotion() ?? false;

  const renderLines = (source: readonly string[]) =>
    source.map((line, i) => (
      <RevealLine
        key={`${line}-${i}`}
        text={line}
        settings={settings}
        reduced={reduced}
        extraDelay={i * lineStagger}
        wraps={wraps}
        className={lineClassName}
      />
    ));

  // The accessible name comes from `lines`, so the alternative break never
  // reaches assistive tech — both sets are visual arrangements of one heading.
  return (
    <Tag id={id} aria-label={lines.join(" ")} className={cn("font-display", className)}>
      {mobileLines ? (
        <>
          {/* `contents`, so the lines are the heading's own children and take
              its alignment and its gap. These wrappers used to be flex boxes
              with `items-center` baked in — written when the hero was the only
              caller, and centre is what the hero wants. Every left-aligned
              heading that passed a phone break silently became centred. */}
          <span className="hidden tablet:contents">
            {renderLines(lines)}
          </span>
          <span className="contents tablet:hidden">
            {renderLines(mobileLines)}
          </span>
        </>
      ) : (
        renderLines(lines)
      )}
    </Tag>
  );
}

type RevealLineProps = {
  text: string;
  settings: TextRevealSettings;
  reduced: boolean;
  extraDelay: number;
  wraps?: boolean;
  className?: string;
};

/**
 * A bar's fill.
 *
 * Flat, unless the line may wrap: then a band the height of one row, repeating
 * on the line box, so every row gets its own bar and the gutter between rows
 * stays open. `1em` is the row and the block's own line-height is the period —
 * both read from the element the bar sits in, so nothing has to be measured
 * and any number of rows works.
 */
function barFill(color: string, wraps: boolean) {
  if (!wraps) return color;
  return (
    `repeating-linear-gradient(to bottom, ${color} 0 1em, ` +
    `transparent 1em calc(1em + var(--space-heading-line)))`
  );
}

function RevealLine({ text, settings, reduced, extraDelay, wraps = false, className }: RevealLineProps) {
  const blockRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const overlay2Ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reduced || hasAnimated.current) return;

    const block = blockRef.current;
    const overlay = overlayRef.current;
    const overlay2 = overlay2Ref.current;
    if (!block || !overlay || !overlay2) return;

    const {
      duration,
      pause,
      delay,
      easeIn,
      easeOut,
      direction,
      afterColor,
      overlayVerticalPadding: vPad,
      trigger,
    } = settings;

    const easing = `cubic-bezier(${easeIn},0,${easeOut},1)`;
    const isLeft = direction === "left";

    // Everything started here is tracked so unmount can cancel all of it.
    const animations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    /**
     * The rendered rows of this block, in its own coordinates.
     *
     * Each word reports its own rect, so they are merged by their top edge to
     * give one rect per line. This is the only way to learn where a line
     * actually broke: the block itself only knows the column it was given.
     */
    const rows = () => {
      const origin = block.getBoundingClientRect();
      const merged = new Map<number, { left: number; right: number; top: number; bottom: number }>();

      // The words themselves, not a Range over the block: the bars live inside
      // this block too, and a Range would measure them as well — an extra rect
      // the width of the whole box, which is the very thing being avoided.
      const rects = [...block.querySelectorAll<HTMLElement>("[data-reveal-word]")].flatMap(
        (word) => [...word.getClientRects()],
      );

      for (const rect of rects) {
        if (rect.width < 1 || rect.height < 1) continue;
        // Rounded, because sub-pixel tops differ between spans on one line.
        const key = Math.round(rect.top);
        const row = merged.get(key);
        if (row) {
          row.left = Math.min(row.left, rect.left);
          row.right = Math.max(row.right, rect.right);
          row.top = Math.min(row.top, rect.top);
          row.bottom = Math.max(row.bottom, rect.bottom);
        } else {
          merged.set(key, { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
        }
      }

      return [...merged.values()].map((row) => ({
        left: row.left - origin.left,
        top: row.top - origin.top,
        width: row.right - row.left,
        height: row.bottom - row.top,
      }));
    };

    /**
     * Give an overlay one bar per rendered row, each the width of its own row.
     *
     * The alternative — one box with a repeating gradient — bands the rows
     * vertically but is still as wide as the block, so every row gets a bar
     * the width of the column and bare colour runs past the end of a short
     * line. Only the wrapping path needs this: a heading with authored lines
     * is one row per block already, and its single box is exactly right.
     */
    const fillRows = (container: HTMLElement, color: string) => {
      container.textContent = "";
      container.style.background = "none";
      // The container starts collapsed — that inline `scaleX(0)` is the resting
      // state for the single-box path. Left on, it scales the row bars inside
      // it to nothing and the whole reveal is invisible. Here the bars carry
      // their own transform and the container only positions them.
      container.style.transform = "none";

      /*
       * The gutter between rows is the site's own `--space-heading-line`, the
       * same 4px a pair of authored lines sits apart — so a wrapped heading and
       * a broken one have the same rhythm.
       *
       * Height comes from the pitch between rows rather than the word rect: a
       * word's box carries its leading and overlaps the row beneath it, which
       * closes the gutter and then some. Pitch minus the gutter is exact, and
       * the last row has no next row to measure against, so it borrows the one
       * above it.
       */
      const gutter =
        parseFloat(getComputedStyle(block).getPropertyValue("--space-heading-line")) || 0;
      const list = rows();

      list.forEach((row, i) => {
        const next = list[i + 1];
        const previous = list[i - 1];
        const pitch = next
          ? next.top - row.top
          : previous
            ? row.top - previous.top
            : row.height + gutter;
        const height = Math.max(0, pitch - gutter);

        const bar = document.createElement("span");
        bar.style.cssText =
          `position:absolute;left:${row.left}px;top:${row.top - vPad}px;` +
          `width:${row.width}px;height:${height + vPad * 2}px;` +
          `background:${color};transform:scaleX(0);` +
          `transform-origin:${isLeft ? "left center" : "right center"}`;
        container.append(bar);
      });
    };

    /** Every bar inside an overlay, or the overlay itself when it has none. */
    const barsOf = (el: HTMLElement) =>
      el.children.length ? ([...el.children] as HTMLElement[]) : [el];

    const sweep = (el: HTMLElement, from: number, to: number) => {
      // One animation per bar, on one clock. The first is returned for
      // chaining: they share a duration and an easing, so they land together.
      const started = barsOf(el).map((bar) => {
        const animation = bar.animate(
          [{ transform: `scaleX(${from})` }, { transform: `scaleX(${to})` }],
          { duration, fill: "forwards", easing },
        );
        animations.push(animation);
        return animation;
      });
      return started[0];
    };

    const run = () => {
      if (cancelled) return;
      hasAnimated.current = true;

      // Size the bars to the text box plus vertical padding, matching the
      // original's measure-then-position approach.
      if (wraps) {
        fillRows(overlay, settings.revealColor);
        fillRows(overlay2, settings.revealColor2);
      } else {
        const { offsetWidth: width, offsetHeight: height } = block;
        for (const el of [overlay, overlay2]) {
          el.style.left = "0px";
          el.style.top = `-${vPad}px`;
          el.style.width = `${width}px`;
          el.style.height = `${height + vPad * 2}px`;
          el.style.transform = "scaleX(0)";
          el.style.transformOrigin = isLeft ? "left center" : "right center";
        }
      }

      // Flush the reset so the first animated frame starts from scaleX(0).
      void overlay.getBoundingClientRect();

      sweep(overlay, 0, 1).onfinish = () => {
        if (cancelled) return;

        sweep(overlay2, 0, 1).onfinish = () => {
          if (cancelled) return;

          // Text is fully covered — swap every word's colour at once.
          block.querySelectorAll<HTMLElement>("[data-reveal-word]").forEach((word) => {
            word.style.color = afterColor;
          });

          const exitOrigin = isLeft ? "right center" : "left center";
          for (const el of [overlay, overlay2]) {
            for (const bar of barsOf(el)) bar.style.transformOrigin = exitOrigin;
          }

          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              sweep(overlay2, 1, 0).onfinish = () => {
                if (cancelled) return;
                sweep(overlay, 1, 0);
              };
            }, pause),
          );
        };
      };
    };

    const start = () => timers.push(setTimeout(run, delay + extraDelay));
    let observer: IntersectionObserver | undefined;

    if (trigger === "inView") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              observer?.disconnect();
              start();
            }
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(block);
    } else {
      // Defer a frame so layout has settled and the measure above is accurate.
      requestAnimationFrame(start);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
    };
  }, [reduced, settings, extraDelay, wraps]);

  // Reduced motion paints the final state immediately.
  const initialColor = reduced ? settings.afterColor : settings.beforeColor;

  // The edge the bars grow from, matched to the resting state below so the
  // first animated frame does not jump.
  const leadingEdge = settings.direction === "left" ? "left center" : "right center";

  return (
    <span
      ref={blockRef}
      aria-hidden="true"
      className={cn("relative inline-block align-top", className)}
    >
      {text.split(" ").map((word, i, all) => (
        <span
          key={`${word}-${i}`}
          data-reveal-word=""
          style={{ color: initialColor, transition: "color 0.25s cubic-bezier(0.7,0,0.3,1)" }}
        >
          {word}
          {i < all.length - 1 ? " " : ""}
        </span>
      ))}

      {/* Decorative bars, sized and positioned at runtime.
       *
       * The collapsed start state is an inline `transform`, deliberately not
       * Tailwind's `scale-x-0`. In v4 that utility compiles to the standalone
       * `scale` property, which multiplies with `transform` rather than being
       * overridden by it — so the bars stayed pinned at zero width for the
       * whole sequence, the animation ran against a permanently invisible
       * element, and the heading appeared to jump straight from hidden to
       * revealed with no wipe. Whatever sets the resting state has to be the
       * same property the animation drives. */}
      {!reduced ? (
        <>
          <span
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              background: barFill(settings.revealColor, wraps),
              transform: "scaleX(0)",
              transformOrigin: leadingEdge,
            }}
          />
          <span
            ref={overlay2Ref}
            className="pointer-events-none absolute inset-0 z-[6]"
            style={{
              background: barFill(settings.revealColor2, wraps),
              transform: "scaleX(0)",
              transformOrigin: leadingEdge,
            }}
          />
        </>
      ) : null}
    </span>
  );
}
