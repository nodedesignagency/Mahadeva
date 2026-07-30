/**
 * Font configuration — the single place to swap typefaces.
 *
 * These are the three families the original Mahadeva template uses, all
 * available on Google Fonts, so no licensing or self-hosting is required:
 *
 *  - Almarai — display face for headings. Weight 400 with -0.02em tracking and
 *    line-height 1 is the original's exact heading treatment.
 *  - Geist   — UI face for buttons, labels and navigation.
 *  - Inter   — body copy.
 *
 * To swap a family: change the import and the call below, keeping the same
 * `variable` name. Nothing outside this file needs to change.
 *
 * next/font self-hosts these at build time (no request to Google at runtime)
 * and generates size-adjust fallback metrics, so there is no layout shift when
 * the webfont loads.
 */

import { Almarai, Geist, Inter } from "next/font/google";

/** Headings and display type. */
export const displayFont = Almarai({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-display-family",
  weight: ["400", "700"],
});

/** Body copy. */
export const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-family",
  weight: ["400", "500"],
});

/** Buttons, labels, navigation. */
export const uiFont = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui-family",
  weight: ["400", "500"],
});

export const fontVariables = [displayFont.variable, bodyFont.variable, uiFont.variable].join(" ");
