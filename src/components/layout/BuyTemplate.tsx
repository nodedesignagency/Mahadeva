import type { CSSProperties } from "react";

import { Button } from "@/components/ui/Button";
import { buyBadgeShimmer } from "@/config/animation";
import { siteConfig } from "@/config/site.config";

/**
 * The template's own badge, floating in the bottom right corner.
 *
 * Not part of the design the site is a build of — it is the seller's, laid
 * over every page — but built to the owner's file all the same, which gives
 * the numbers below: a 160-wide card at radius 5, 4 of padding, the label in
 * Geist at 14 with a hair of negative tracking, and the dark button filling
 * what is left.
 *
 * ── Where it sits in the stack ─────────────────────────────────────────────
 *
 * `z-40`, which is deliberate on both sides. Above every section (the highest
 * any of them reaches is 30), so it is never buried by the page. Below the
 * header at 50, so the mobile menu — which grows the header to the whole
 * screen — covers it rather than leaving a badge floating over the open
 * overlay. Below the wipe and the preloader too, at 9999 and 10000, so a
 * navigation covers it like everything else on the page.
 *
 * ── Why it is not always a link ────────────────────────────────────────────
 *
 * The purchase URL is `siteConfig.template.href` and starts empty. Empty, this
 * draws a real button that does nothing, which is what "not wired up yet"
 * honestly looks like. The obvious alternative, `href="#"`, is worse than
 * nothing: it is a live link that scrolls the reader to the top of the page,
 * so the one thing it does is the one thing it should not.
 *
 * A server component: the label's sweep is CSS, so none of this ships as
 * JavaScript.
 */

/**
 * The label, to the owner's text panel: Geist regular at 14, tracking -0.01em,
 * line height 110%.
 *
 * Not uppercase-and-letter-spaced like the site's own small labels — this one
 * is set as the file sets it, and the two are not the same object. The colour
 * comes from the sweep rather than from here; see `.mh-shimmer`.
 */
const LABEL =
  "mh-shimmer block text-center font-ui text-[0.875rem] font-normal " +
  "tracking-[-0.01em] leading-[1.1] uppercase";

/** No arrow and nothing to sit opposite one, so the label takes the middle. */
const ACTION = "h-[38px] w-full justify-center normal-case";

export function BuyTemplate() {
  const { show, label, action, href } = siteConfig.template;
  if (!show) return null;

  const button = href ? (
    <Button
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      variant="plan"
      size="nav"
      className={ACTION}
    >
      {action}
    </Button>
  ) : (
    <Button type="button" variant="plan" size="nav" className={ACTION}>
      {action}
    </Button>
  );

  return (
    <div className="fixed right-5 bottom-5 z-40 print:hidden">
      {/*
        160 wide at radius 5 with 4 of padding, per the file. `overflow-hidden`
        is the file's too and is load-bearing here rather than tidiness: the
        label's sweep is a gradient wider than the card, and the corners would
        otherwise show it running past them.

        The top is 8 against the other three sides' 4. The file has 2 there,
        and 2 is what looks wrong: the label's own line box carries its
        descender space below the words, so an even inset reads as tight above
        them and loose below. The extra 4 is optical, and it is the only number
        here chosen by eye rather than read off a panel.

        The gap is 8, which is not a number in the file — the file's 10 sits
        between two children this build does not have. What it reproduces is
        the one measurement that decides the look: the 23px band the label
        stands in, and through it the card's 69 of height. 4 + label + 8 +
        button + 4 lands on it.
      */}
      <div
        style={
          {
            "--mh-shimmer-duration": `${buyBadgeShimmer.duration}ms`,
            // Dark at rest with a lighter band passing through, which is
            // the way round the file has it: its text colour is the near-black
            // 201F32, and the grey it shows on the canvas is that colour with
            // the sweep over it. Base and highlight the other way round gives
            // a dark band crossing grey text, which reads as the words
            // smudging rather than catching a light.
            "--mh-shimmer-base": "var(--color-fg-on-light)",
            "--mh-shimmer-light": "var(--color-fg-label)",
          } as CSSProperties
        }
        className="flex w-40 flex-col gap-2 overflow-hidden rounded-[5px] bg-bg-white p-1 pt-2 shadow-lg"
      >
        <p className={LABEL}>{label}</p>
        {button}
      </div>
    </div>
  );
}
