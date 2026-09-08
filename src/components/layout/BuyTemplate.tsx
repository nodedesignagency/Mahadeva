import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";

/**
 * The template's own badge, floating in the bottom right corner.
 *
 * Not part of the design the site is a build of — it is the seller's, laid
 * over every page. It is built out of the site's own parts all the same: the
 * white surface, the grey label of a pricing column head, and the plans' own
 * dark button with its accent sweep. A badge assembled from anything else
 * reads as something pasted on top of the page rather than something the page
 * came with.
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
 * A server component — it holds nothing and moves on its own only on hover,
 * which is the button's.
 */

/** Small, grey, letter-spaced: the pricing columns' own head, one step down. */
const LABEL =
  "text-center font-ui text-[0.6875rem] font-light uppercase tracking-[0.08em] text-fg-label";

/** No arrow and nothing to sit opposite one, so the label takes the middle. */
const ACTION = "w-full justify-center normal-case";

export function BuyTemplate() {
  const { show, label, action, href } = siteConfig.template;
  if (!show) return null;

  return (
    <div className="fixed right-5 bottom-5 z-40 print:hidden">
      {/* 12 around, 8 between the two — the label reads as the button's
          heading rather than as a line of its own. */}
      <div className="flex flex-col gap-2 rounded-(--radius-sm) bg-bg-white p-3 shadow-lg">
        <p className={LABEL}>{label}</p>

        {href ? (
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
        )}
      </div>
    </div>
  );
}
