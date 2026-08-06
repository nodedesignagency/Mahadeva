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
 * The surface each route holds, where it is not the default white.
 *
 * `dark` is a page that is dark the whole way down, so the strip is too — it
 * never flips. `hero` is dark over the opening and light past it, which is the
 * home page: an intro on the dark surface, then white and beige wrappers under
 * it. `beige` is the light strip in the page's own beige, so the header reads
 * as the top of the surface rather than a white band laid over it. Everything
 * else about the light strip — ink, hairline, link colours — is the same
 * whichever light it wears.
 *
 * Listed by route rather than measured: the header renders before the page it
 * sits over, and reading the surface out of the DOM would mean painting one
 * strip and correcting it a frame later.
 */
const ROUTE_SURFACE: Record<string, "dark" | "hero" | "beige"> = {
  "/": "hero",
  "/case-study": "dark",
  "/pricing": "beige",
};

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

  // Which surface the strip wears. Only a `hero` page trades one for the
  // other, and only at the threshold; a dark page keeps the dark strip however
  // far down it you are, and everything else is light from the top.
  //
  // Everything the header draws reads this, not `scrolled` — the CTA's border
  // followed the scroll alone once, and sat invisible on a page that was light
  // from the top.
  const surface = ROUTE_SURFACE[pathname];
  const light =
    surface === "dark" ? false : surface === "hero" ? scrolled : true;

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
      style={
        { "--mh-nav-open-duration": `${mobileNav.openDuration}ms` } as CSSProperties
      }
      className={cn(
        "mh-nav-shell fixed inset-x-0 top-0 z-50 border-b",
        // Opening grows the strip itself into the screen rather than sliding a
        // panel over it. The bottom hairline travels down with it, which is
        // why the line under the wordmark is simply gone once open — it is at
        // the foot of the viewport, not under the row.
        // The hairline is dropped once open: it has travelled to the foot of
        // the viewport, where it reads as a stray line rather than an edge.
        open ? "h-[100dvh] border-transparent" : "h-header",
        // The strip crossfades as one — surface, hairline, wordmark and CTA
        // (`text-current`), and both endpoints the links mix between. That
        // list lives in `.mh-nav-shell` alongside the open/close height, not
        // here: an unlayered `transition` there beats a utility here, so
        // splitting them across the two meant one quietly deleted the other.
        //
        // Each surface carries its own hairline and its own pair of link
        // colours, which the links mix between on hover.
        light
          ? "border-border-on-light text-fg-on-light [--mh-nav-accent:var(--color-fg-on-light-hover)] [--mh-nav-ink:var(--color-fg-on-light)] [--mh-nav-rule-color:var(--color-border-nav-on-light)]"
          : "border-border bg-bg text-fg [--mh-nav-accent:var(--color-accent)] [--mh-nav-ink:var(--color-fg)] [--mh-nav-rule-color:var(--color-fg)]",
        // The light strip's fill is the only thing a beige page changes: it
        // takes the page's own surface, so the header reads as the top of it
        // rather than a white band laid over it.
        light && (surface === "beige" ? "bg-bg-light" : "bg-bg-white"),
      )}
    >
      <Container className="flex h-header items-center justify-between gap-6">
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
              light ? "border-border-on-light" : "border-border",
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
              light ? "border-border-on-light" : "border-border",
            )}
          >
            <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
              <span className="mh-burger-bar" />
              <span className="mh-burger-bar" />
            </span>
          </button>
        </div>
      </Container>

      {/* An ordinary child of the header, not an overlay: it is already in
          place below the row and the growing strip uncovers it.

          It stays mounted rather than being rendered on open — CSS needs both
          ends of a transition in the document, and mounting on open would put
          every link straight into its finished state with nothing to move
          from. `inert` keeps the hidden copy out of the tab order and off the
          accessibility tree, which is what unmounting was doing for us. */}
      <div
        id="mobile-nav"
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        data-open={open}
        inert={!open}
        className="desktop:hidden outline-none"
      >
        <Container className="py-8">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {mainNav.map((item, i) => (
                // No clipping on the row: a link arriving from the left is
                // meant to be seen crossing the margin, and the header clips
                // it at the screen edge instead.
                <li key={item.href}>
                  {/* The travelling element is the label itself, sized to its
                      own text — in the Framer file each link layer is width-
                      fit, so its offset is one label's width, not one row's.
                      Moving the row instead started ABOUT some 390px out and
                      the panel sat empty while it caught up. */}
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    // `text-current`, not a fixed colour: the overlay lives
                    // inside the header, so it wears whichever surface the
                    // header is on when it opens.
                    className="mh-nav-item inline-block py-5 font-display text-nav-mobile uppercase text-current"
                    style={
                      {
                        "--mh-nav-item-from": `${
                          mobileNav.linkOffsetStart + i * mobileNav.linkOffsetStep
                        }px`,
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
