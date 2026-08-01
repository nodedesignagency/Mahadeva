"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { mainNav, navCta } from "@/config/navigation";
import { siteConfig } from "@/config/site.config";
import { durations, easings, stagger } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { Container } from "./Container";
import { cn } from "@/lib/cn";

/**
 * Site header.
 *
 * Opaque at every scroll position. The original fades a background in on
 * scroll, but the hero's pattern field animates directly behind this strip and
 * bars passing under the wordmark and links made both hard to read, so the
 * header keeps its own surface throughout.
 *
 * The mobile overlay implements the accessibility the original omits — focus is
 * trapped while open, Escape closes it, background scroll is locked, and the
 * toggle exposes aria-expanded/aria-controls.
 */

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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
      // Opaque at every scroll position, not transparent over the hero: the
      // pattern field animates directly behind this strip, and bars sliding
      // under the wordmark and nav links made both hard to read. The fill gives
      // the nav its own surface and clips the field at the header's edge.
      // `--color-border` is white at 10%, the hairline that separates them.
      className="fixed inset-x-0 top-0 z-50 h-header border-b border-border bg-bg"
    >
      <Container className="flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-heading-md tracking-(--tracking-display) text-fg"
        >
          {siteConfig.shortName}
        </Link>

        {/* The original shows the full horizontal nav from the tablet
            breakpoint (810px) up; the overlay is mobile-only. */}
        <nav aria-label="Main" className="hidden tablet:block">
          <ul className="flex items-center gap-4">
            {mainNav.map((item, i) => {
              const active = pathname === item.href;
              return (
                <li key={item.href} className="flex items-center gap-4">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "font-ui text-body-sm uppercase tracking-[0.04em] transition-colors duration-(--duration-hover) ease-(--ease-out)",
                      active ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                  {/* Decorative separator — aria-hidden so it is not announced
                      between every link. */}
                  {i < mainNav.length - 1 ? (
                    <span aria-hidden="true" className="text-fg-subtle">
                      ·
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden tablet:block">
          {/* Outlined, not solid: over the hero the header is transparent, and a
              filled white CTA reads as a second primary action competing with
              the hero's own.
              The variant's own `border-strong` is an opaque dark green, which
              disappears against the hero. Over a dark ground the visible
              hairline is the white-alpha border. */}
          <Button
            href={navCta.href}
            size="nav"
            variant="outline"
            className="border-border"
          >
            {navCta.label}
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="tablet:hidden inline-flex size-10 items-center justify-center rounded-pill text-fg"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            tabIndex={-1}
            onKeyDown={onPanelKeyDown}
            initial={{ opacity: 0, y: reduced ? 0 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -12 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: durations.hover, ease: easings.reveal }
            }
            className="tablet:hidden absolute inset-x-0 top-header border-b border-border bg-bg outline-none"
          >
            <Container className="py-8">
              <nav aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {mainNav.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : {
                              duration: durations.hover,
                              ease: easings.reveal,
                              delay: i * stagger.tight,
                            }
                      }
                    >
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className="block py-3 font-display text-heading-lg text-fg"
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <Button href={navCta.href} variant="outline" className="mt-6 w-full">
                {navCta.label}
              </Button>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
