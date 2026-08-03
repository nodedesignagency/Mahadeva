"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, navCta } from "@/config/navigation";
import { siteConfig } from "@/config/site.config";
import { mobileNav } from "@/config/animation";
import { Button } from "@/components/ui/Button";
import { Container } from "./Container";
import { cn } from "@/lib/cn";

/** Where the header flips from its dark surface to its light one. */
const SCROLL_THRESHOLD = 350;

/**
 * Site header.
 *
 * Opaque at every scroll position — the hero's pattern field animates directly
 * behind this strip, and bars passing under the wordmark made both hard to
 * read — but which surface it wears depends on scroll. Dark over the hero,
 * light once past the threshold, with everything inside inverting to match.
 *
 * The mobile overlay implements the accessibility the original omits — focus is
 * trapped while open, Escape closes it, background scroll is locked, and the
 * toggle exposes aria-expanded/aria-controls.
 */

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // `passive` keeps this off the scrolling critical path. The initial read is
  // deferred a frame rather than run in the effect body, so a restored scroll
  // position is already settled and the state change cannot cascade a render
  // before first paint.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the overlay on navigation, otherwise it stays open over the new page.
  //
  // This is React's "adjust state when a prop changes" pattern rather than an
  // effect: it runs during render, so the overlay is already closed in the same
  // commit as the new route instead of flashing open for a frame.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move focus into the panel when it opens so keyboard users land inside it.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // Keep Tab within the open panel.
  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (!focusables || focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-header border-b",
        // The whole strip crossfades as one, on the original's own curve: the
        // surface, the hairline, the wordmark and CTA (`text-current`), and
        // both endpoints the links mix between. Everything is listed because
        // anything left out lands on a different frame from the rest, which is
        // what made the labels vanish mid-flip when only the surface eased.
        "transition-[background-color,border-color,color,--mh-nav-ink,--mh-nav-accent]",
        "duration-(--duration-nav-flip) ease-(--ease-nav-flip)",
        // Each surface carries its own hairline and its own pair of link
        // colours, which the links mix between on hover.
        scrolled
          ? "border-border-on-light bg-bg-white text-fg-on-light [--mh-nav-accent:var(--color-fg-on-light-hover)] [--mh-nav-ink:var(--color-fg-on-light)]"
          : "border-border bg-bg text-fg [--mh-nav-accent:var(--color-accent)] [--mh-nav-ink:var(--color-fg)]",
      )}
    >
      <Container className="flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-heading-md tracking-(--tracking-display) text-current"
        >
          {siteConfig.shortName}
        </Link>

        {/* Desktop only. Tablet is narrow enough that six labels plus the CTA
            crowd the strip, so it takes the overlay too. */}
        <nav aria-label="Main" className="hidden desktop:block">
          <ul className="flex items-center gap-4">
            {mainNav.map((item, i) => {
              const active = pathname === item.href;
              return (
                <li key={item.href} className="flex items-center gap-4">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    // Every link takes the header's colour, active or not. The
                    // current page is still conveyed by aria-current, which is
                    // what actually carries that meaning.
                    //
                    // Colour and rule are both in `.mh-nav-link`; the header
                    // supplies the two endpoints it mixes between.
                    className="mh-nav-link font-ui text-body-sm uppercase tracking-[0.04em]"
                  >
                    {item.label}
                  </Link>
                  {/* Decorative separator — a 2px square with square corners,
                      not a middot, so it holds its shape at every size.
                      aria-hidden so it is not announced between every link. */}
                  {i < mainNav.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="size-0.5 shrink-0 rounded-none bg-current"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Present at every width, including alongside the hamburger and while
            the overlay is open — the original keeps it on screen throughout.
            The pair sits 6px apart, tighter than the header's own gap. */}
        <div className="ml-auto flex items-center gap-1.5 desktop:ml-0">
          {/* Outlined, not solid: a filled white CTA up here reads as a second
              primary action competing with the hero's own. The variant's
              `border-strong` is an opaque dark green that disappears against
              this surface, so the hairline comes from whichever surface the
              header is wearing.
              Hover is a straight fade to 50%, on both surfaces. The variant's
              own hover fills the button with the dark elevated surface, which
              on the white header swallowed the label entirely. */}
          <Button
            href={navCta.href}
            size="nav"
            variant="outline"
            className={cn(
              "text-current hover:bg-transparent hover:opacity-50",
              // Opacity only — the hairline swaps with the surface it belongs
              // to, so easing it would leave it a step behind the flip.
              "transition-opacity duration-(--duration-hover) ease-(--ease-out)",
              scrolled ? "border-border-on-light" : "border-border",
            )}
          >
            {navCta.label}
          </Button>

          {/* Two bars rather than three, as in the original, folding into the
              close mark. Drawn here instead of taken from the icon set so the
              same two elements can become the X — an icon swap cannot animate
              between two separate glyphs. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "desktop:hidden inline-flex size-[33px] shrink-0 items-center justify-center",
              "rounded-(--radius-button) border text-current",
              "transition-opacity duration-(--duration-hover) ease-(--ease-out) hover:opacity-50",
              scrolled ? "border-border-on-light" : "border-border",
            )}
          >
            <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
              <span className="mh-burger-bar" />
              <span className="mh-burger-bar" />
            </span>
          </button>
        </div>
      </Container>

      {/* The panel stays mounted and is hidden by state rather than unmounted.
          Its links and rules animate from CSS, and CSS needs both ends of a
          transition to be in the document — mounting on open would put every
          element straight into its finished state with nothing to move from.
          `inert` keeps the hidden copy out of the tab order and off the
          accessibility tree, which is what unmounting was doing for us. */}
      <div
        id="mobile-nav"
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        data-open={open}
        inert={!open}
        style={
          { "--mh-nav-fill-duration": `${mobileNav.fillDuration}ms` } as CSSProperties
        }
        className="mh-nav-panel desktop:hidden fixed inset-x-0 top-header bottom-0 bg-bg outline-none"
      >
        <Container className="h-full overflow-y-auto py-8">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {mainNav.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  {/* The travelling element is the label itself, sized to its
                      own text — in the Framer file each link layer is width-
                      fit, so its offset is one label's width, not one row's.
                      Moving the row instead started ABOUT some 390px out and
                      the panel sat empty while it caught up. */}
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="mh-nav-item inline-block py-5 font-display text-heading-lg uppercase text-fg"
                    style={
                      {
                        "--mh-nav-item-from": mobileNav.linkOffset,
                        "--mh-nav-item-duration": `${mobileNav.linkDuration}ms`,
                        "--mh-nav-item-delay": `${i * mobileNav.linkStagger}ms`,
                      } as CSSProperties
                    }
                  >
                    {item.label}
                  </Link>

                  {i < mainNav.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="mh-nav-rule"
                      style={
                        {
                          "--mh-nav-rule-duration": `${mobileNav.rule.duration}ms`,
                          "--mh-nav-rule-delay": `${mobileNav.rule.delay}ms`,
                          "--mh-nav-rule-exit-duration": `${mobileNav.rule.exitDuration}ms`,
                        } as CSSProperties
                      }
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
    </header>
  );
}
