/**
 * How long an entrance should wait for the preloader.
 *
 * The hero's heading reveals itself once, when it comes into view — and behind
 * a full-screen cover it is in view immediately. Left alone it plays out and
 * settles while nobody can see it, and the cover lifts on a heading that has
 * already arrived, which loses the one animation the home page is built around.
 *
 * So anything that plays once on arrival asks here first. The answer is the
 * milliseconds still left on the preloader's run, and zero whenever nothing is
 * covering the page — which is every page but the home page, every navigation
 * after the first, and every reader who asked for less motion.
 *
 * The deadline is stamped on `window` by the preloader's blocking script
 * rather than passed through React, for the same reason the wipe's flag is:
 * hydration reconciles `<html>` against what the server rendered and takes
 * anything else on it away, and this has to survive that.
 */

/** Key on `window` holding the timestamp, in `performance.now()` terms, that the cover lifts. */
export const PRELOAD_UNTIL = "mh-preload-until";

type Flagged = Window & { [PRELOAD_UNTIL]?: number };

/**
 * Milliseconds before an entrance should start. Zero when nothing is holding it.
 *
 * `lead` is how much of its own run an entrance wants already behind it by the
 * time the cover lifts. Waiting out the whole hold means the sheet goes and
 * *then* the heading begins, which reads as two events with a seam between
 * them; starting `lead` early means the sheet lifts on a heading already in
 * motion, and the two are one arrival. The first stretch happens behind the
 * cover, where it is meant to be unseen.
 *
 * Clamped at zero, so an entrance whose lead is longer than what is left of
 * the preloader simply starts now rather than in the past.
 */
export function preloadHold(lead = 0): number {
  if (typeof window === "undefined") return 0;
  const until = (window as Flagged)[PRELOAD_UNTIL];
  if (typeof until !== "number") return 0;
  return Math.max(0, until - performance.now() - lead);
}
