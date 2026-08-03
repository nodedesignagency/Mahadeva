/**
 * Font configuration — the single place to swap typefaces.
 *
 * The original uses two families, both on Google Fonts, so there is no
 * licensing or self-hosting to arrange:
 *
 *  - Almarai carries almost everything: headings *and* body copy. Its presets
 *    account for forty of the site's text styles.
 *  - Geist covers the remaining UI details, nine styles in all.
 *
 * Inter appears in the original's CSS only as Framer's fallback and is never a
 * primary family, so it is not loaded here — shipping it would cost a font
 * download for text that never uses it.
 *
 * To swap a family: change the import and the call below, keeping the same
 * `variable` name. Nothing outside this file needs to change.
 *
 * next/font self-hosts these at build time (no runtime request to Google) and
 * generates size-adjust fallback metrics, so there is no layout shift when the
 * webfont loads.
 */

import { Almarai, Geist } from "next/font/google";

/**
 * Headings and body copy. One instance serves both roles — `theme.css` points
 * the display and body tokens at it — so the family is downloaded once.
 */
export const displayFont = Almarai({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-family",
  // 300 carries the feature-card body copy, the one place the original sets
  // Almarai lighter than regular.
  weight: ["300", "400", "700"],
});

/**
 * Buttons, labels, navigation — and every number on the site. Figures are set
 * in Geist throughout, at whatever weight and size the context calls for.
 *
 * 300 is the case study year chip.
 */
export const uiFont = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui-family",
  weight: ["300", "400", "500"],
});

export const fontVariables = [displayFont.variable, uiFont.variable].join(" ");
